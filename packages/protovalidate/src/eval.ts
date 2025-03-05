// Copyright 2024-2025 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  isReflectList,
  isReflectMap,
  isReflectMessage,
  type ReflectList,
  type ReflectMap,
  type ReflectMessage,
  type ReflectMessageGet,
  type ScalarValue,
} from "@bufbuild/protobuf/reflect";
import {
  type DescEnum,
  type DescField,
  type DescMessage,
  type DescOneof,
  type Registry,
} from "@bufbuild/protobuf";
import { type Any } from "@bufbuild/protobuf/wkt";
import { CelEnv } from "@bufbuild/cel";
import {
  type AnyRules,
  AnyRulesSchema,
  type Constraint,
  type EnumRules,
  EnumRulesSchema,
  FieldConstraintsSchema,
} from "./gen/buf/validate/validate_pb.js";
import { Cursor } from "./cursor.js";
import {
  celConstraintEval,
  celConstraintPlan,
  createCelEnv,
  createCelRegistry,
  type RuleCelPlan,
} from "./cel.js";
import type { Condition } from "./condition.js";
import type { PathBuilder } from "./path.js";

/**
 * Evaluate constraints for a value.
 */
export type Eval<V> = {
  eval(val: V, cursor: Cursor): void;
  /**
   * Remove any dead code paths.
   * Return true if this is now a no-op.
   */
  prune(): boolean;
};

/**
 * The no-op evaluator.
 */
export class EvalNoop<T> implements Eval<T> {
  private static instance = new EvalNoop();
  static get<T>(): EvalNoop<T> {
    return this.instance;
  }
  eval(): void {
    //
  }
  prune(): boolean {
    return true;
  }
}

/**
 * Evaluate many.
 */
export class EvalMany<T> implements Eval<T> {
  private many: Eval<T>[];
  constructor(...evals: (Eval<T> | Eval<T>[])[]) {
    this.many = evals.flatMap((e) => e);
  }
  add(...evals: Eval<T>[]): this {
    this.many.push(...evals);
    return this;
  }
  eval(val: T, cursor: Cursor): void {
    for (const e of this.many) {
      e.eval(val, cursor);
    }
  }
  prune(): boolean {
    this.many = this.many.filter((e) => !e.prune());
    return this.many.length == 0;
  }
}

/**
 * Evaluated all items in a list.
 */
export class EvalListItems<T extends ReflectMessageGet>
  implements Eval<ReflectList>
{
  constructor(
    private readonly condition: Condition<T>,
    private readonly pass: Eval<T>,
  ) {}
  eval(val: ReflectList, cursor: Cursor): void {
    for (let i = 0; i < val.size; i++) {
      const t = val.get(i) as T;
      if (this.condition.check(t)) {
        this.pass.eval(t, cursor.list(i));
      }
    }
  }
  prune(): boolean {
    return this.pass.prune() || this.condition.never;
  }
}

/**
 * Evaluate key and value of all entries in a map.
 */
export class EvalMapEntries<V extends ReflectMessageGet>
  implements Eval<ReflectMap>
{
  constructor(
    private keyCondition: Condition<ScalarValue>,
    private key: Eval<string | number | bigint | boolean>,
    private valueCondition: Condition<V>,
    private value: Eval<V>,
  ) {}
  eval(val: ReflectMap, cursor: Cursor): void {
    if (this.keyCondition.never && this.valueCondition.never) {
      return;
    }
    for (const [key, value] of val) {
      const c = cursor.mapKey(key as string | number | bigint | boolean);
      if (this.keyCondition.check(key as string | number | bigint | boolean)) {
        this.key.eval(key as string | number | bigint | boolean, c);
      }
      if (this.valueCondition.check(value as V)) {
        this.value.eval(value as V, c);
      }
    }
  }
  prune(): boolean {
    const key = this.key.prune() || this.keyCondition.never;
    const value = this.value.prune() || this.valueCondition.never;
    return key && value;
  }
}

/**
 * Evaluate field. If the condition passes, evaluate the field's value.
 */
export class EvalField<F extends DescField> implements Eval<ReflectMessage> {
  constructor(
    private readonly field: F,
    private readonly condition: Condition<ReflectMessage>,
    private readonly pass: Eval<ReflectMessageGet<F>>,
  ) {}
  eval(val: ReflectMessage, cursor: Cursor): void {
    if (this.condition.check(val)) {
      const fieldVal = val.get(this.field);
      this.pass.eval(fieldVal, cursor.field(this.field));
    }
  }
  prune(): boolean {
    return this.condition.never;
  }
}

export class EvalFieldRequired implements Eval<ReflectMessage> {
  constructor(private readonly field: DescField) {}
  eval(val: ReflectMessage, cursor: Cursor): void {
    if (!val.isSet(this.field)) {
      cursor
        .field(this.field)
        .violate("value is required", "required", [
          FieldConstraintsSchema.field.required,
        ]);
    }
  }
  prune(): boolean {
    return false;
  }
}

export class EvalOneofRequired implements Eval<ReflectMessage> {
  constructor(private readonly oneof: DescOneof) {}

  eval(val: ReflectMessage, cursor: Cursor): void {
    if (this.oneof.fields.some((f) => val.isSet(f))) {
      return;
    }
    cursor
      .oneof(this.oneof)
      // TODO protovalidate-go does not populate Violation.rule for OneofConstraints.required
      .violate("exactly one field is required in oneof", "required", []);
  }
  prune(): boolean {
    return false;
  }
}

export class EvalMessageCel implements Eval<ReflectMessage> {
  private readonly env: CelEnv;
  private readonly plannedConstraints: {
    index: number;
    constraint: Constraint;
    planned: ReturnType<CelEnv["plan"]>;
  }[] = [];
  constructor(
    constraints: readonly Constraint[],
    descMessage: DescMessage,
    userRegistry: Registry,
  ) {
    const namespace = descMessage.typeName.substring(
      0,
      descMessage.typeName.lastIndexOf("."),
    );
    this.env = createCelEnv(
      namespace,
      createCelRegistry(userRegistry, descMessage),
    );
    this.plannedConstraints = constraints.map((constraint, index) => ({
      index,
      constraint,
      planned: celConstraintPlan(this.env, constraint),
    }));
  }

  eval(val: ReflectMessage, cursor: Cursor) {
    this.env.set("this", val.message);
    // TODO protovalidate-go does not populate Violation.rule for FieldConstraints.cel
    // for (const { index, constraint, planned } of this.plannedConstraints) {
    for (const { constraint, planned } of this.plannedConstraints) {
      const vio = celConstraintEval(this.env, constraint, planned);
      if (vio) {
        cursor.violate(vio.message, vio.constraintId, [
          // MessageConstraintsSchema.field.cel,
          // { kind: "list_sub", index },
        ]);
      }
    }
  }
  prune(): boolean {
    return this.plannedConstraints.length == 0;
  }
}

export class EvalFieldCel implements Eval<ReflectMessageGet> {
  private readonly env: CelEnv;
  private readonly plannedConstraints: {
    index: number;
    constraint: Constraint;
    planned: ReturnType<CelEnv["plan"]>;
  }[] = [];
  constructor(
    field: DescField,
    constraints: readonly Constraint[],
    userRegistry: Registry,
  ) {
    const namespace = field.parent.typeName.substring(
      0,
      field.parent.typeName.lastIndexOf("."),
    );
    this.env = createCelEnv(namespace, createCelRegistry(userRegistry, field));
    this.plannedConstraints = constraints.map((constraint, index) => ({
      index,
      constraint,
      planned: celConstraintPlan(this.env, constraint),
    }));
  }

  eval(val: ReflectMessageGet, cursor: Cursor): void {
    // TODO fix this up
    let valVal: unknown = val;
    if (isReflectMessage(val)) {
      valVal = val.message;
    } else if (isReflectList(val)) {
      // @ts-expect-error -- TODO
      valVal = val[Symbol.for("reflect unsafe local")];
    } else if (isReflectMap(val)) {
      // @ts-expect-error -- TODO
      valVal = val[Symbol.for("reflect unsafe local")];
    }
    this.env.set("this", valVal);
    for (const { index, constraint, planned } of this.plannedConstraints) {
      const vio = celConstraintEval(this.env, constraint, planned);
      if (vio) {
        cursor.violate(vio.message, vio.constraintId, [
          FieldConstraintsSchema.field.cel,
          { kind: "list_sub", index },
        ]);
      }
    }
  }
  prune(): boolean {
    return this.plannedConstraints.length == 0;
  }
}

export class EvalScalarRulesCel implements Eval<ScalarValue> {
  constructor(
    private readonly plans: RuleCelPlan[],
    private readonly forMapKey = false,
    private readonly baseRulePath: PathBuilder,
  ) {}
  eval(val: ScalarValue, cursor: Cursor): void {
    for (const plan of this.plans) {
      plan.env.set("this", val);
      plan.env.set("rules", plan.rules);
      const vio = celConstraintEval(plan.env, plan.constraint, plan.planned);
      if (vio) {
        const rulePath = this.baseRulePath.clone().add(plan.rulePath).toPath();
        cursor.violate(vio.message, vio.constraintId, rulePath, this.forMapKey);
      }
    }
  }
  prune(): boolean {
    return this.plans.length == 0;
  }
}

export class EvalMessageRulesCel implements Eval<ReflectMessage> {
  constructor(
    private readonly plans: RuleCelPlan[],
    private readonly baseRulePath: PathBuilder,
  ) {}

  eval(val: ReflectMessage, cursor: Cursor): void {
    // TODO fix this up
    const valVal: unknown = val.message;
    for (const plan of this.plans) {
      plan.env.set("this", valVal);
      plan.env.set("rules", plan.rules);
      const vio = celConstraintEval(plan.env, plan.constraint, plan.planned);
      if (vio) {
        const rulePath = this.baseRulePath.clone().add(plan.rulePath).toPath();
        cursor.violate(vio.message, vio.constraintId, rulePath);
      }
    }
  }
  prune(): boolean {
    return this.plans.length == 0;
  }
}

export class EvalListRulesCel implements Eval<ReflectList> {
  constructor(
    private readonly plans: RuleCelPlan[],
    private readonly baseRulePath: PathBuilder,
  ) {}
  eval(val: ReflectList, cursor: Cursor): void {
    // TODO fix this up
    // @ts-expect-error -- TODO
    const valVal: unknown = val[Symbol.for("reflect unsafe local")];
    for (const plan of this.plans) {
      plan.env.set("this", valVal);
      plan.env.set("rules", plan.rules);
      const vio = celConstraintEval(plan.env, plan.constraint, plan.planned);
      if (vio) {
        const rulePath = this.baseRulePath.clone().add(plan.rulePath).toPath();
        cursor.violate(vio.message, vio.constraintId, rulePath);
      }
    }
  }
  prune(): boolean {
    return this.plans.length == 0;
  }
}

export class EvalMapRulesCel implements Eval<ReflectMap> {
  constructor(
    private readonly plans: RuleCelPlan[],
    private readonly baseRulePath: PathBuilder,
  ) {}
  eval(val: ReflectMap, cursor: Cursor): void {
    // @ts-expect-error -- TODO
    const valVal: unknown = val[Symbol.for("reflect unsafe local")];
    for (const plan of this.plans) {
      plan.env.set("this", valVal);
      plan.env.set("rules", plan.rules);
      const vio = celConstraintEval(plan.env, plan.constraint, plan.planned);
      if (vio) {
        const rulePath = this.baseRulePath.clone().add(plan.rulePath).toPath();
        cursor.violate(vio.message, vio.constraintId, rulePath);
      }
    }
  }
  prune(): boolean {
    return this.plans.length == 0;
  }
}

/**
 * buf.validate.EnumRules.defined_only does not use CEL expressions. This implements custom logic for this field.
 */
export class EvalEnumDefinedOnly implements Eval<number> {
  private readonly definedOnly: ReadonlySet<number> | undefined;

  constructor(
    descEnum: DescEnum,
    private readonly rulePath: PathBuilder,
    rules: EnumRules,
  ) {
    this.definedOnly = rules.definedOnly
      ? new Set<number>(descEnum.values.map((v) => v.number))
      : undefined;
  }
  eval(val: number, cursor: Cursor): void {
    if (this.definedOnly !== undefined && !this.definedOnly.has(val)) {
      // value must be one of the defined enum values [enum.defined_only]
      cursor.violate(
        "value must be one of the defined enum values",
        "enum.defined_only",
        this.rulePath.clone().field(EnumRulesSchema.field.definedOnly).toPath(),
      );
    }
  }
  prune(): boolean {
    return this.definedOnly == undefined;
  }
}

/**
 * buf.validate.AnyRules.in and not_in do not use CEL expressions. This implements custom logic for these fields.
 */
export class EvalAnyRules implements Eval<ReflectMessage> {
  private readonly in: string[];
  private readonly notIn: string[];
  constructor(
    private readonly rulePath: PathBuilder,
    rules: AnyRules,
  ) {
    this.in = rules.in;
    this.notIn = rules.notIn;
  }
  eval(val: ReflectMessage, cursor: Cursor) {
    const any = val.message as Any;
    if (this.in.length > 0 && !this.in.includes(any.typeUrl)) {
      // type URL must be in the allow list [any.in]
      cursor.violate(
        "type URL must be in the allow list",
        "any.in",
        this.rulePath.clone().field(AnyRulesSchema.field.in).toPath(),
      );
    }
    if (this.notIn.length > 0 && this.notIn.includes(any.typeUrl)) {
      // type URL must not be in the block list [any.not_in]
      cursor.violate(
        "type URL must not be in the block list",
        "any.not_in",
        this.rulePath.clone().field(AnyRulesSchema.field.notIn).toPath(),
      );
    }
  }
  prune(): boolean {
    return this.in.length + this.notIn.length == 0;
  }
}
