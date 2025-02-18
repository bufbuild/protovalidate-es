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
  scalarEquals,
  type ScalarValue,
  scalarZeroValue,
} from "@bufbuild/protobuf/reflect";
import {
  type DescEnum,
  type DescField,
  type DescMessage,
  type DescOneof,
  type Registry,
  ScalarType,
} from "@bufbuild/protobuf";
import { type Any, FeatureSet_FieldPresence } from "@bufbuild/protobuf/wkt";
import { CelEnv } from "@bufbuild/cel";
import {
  type AnyRules,
  type Constraint,
  type EnumRules,
  Ignore,
} from "./gen/buf/validate/validate_pb.js";
import { Cursor } from "./cursor.js";
import {
  celConstraintEval,
  celConstraintPlan,
  createCelEnv,
  createCelRegistry,
  type RuleCelPlan,
} from "./cel.js";

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
  constructor(private _eval: Eval<T>) {}
  eval(val: ReflectList, cursor: Cursor): void {
    for (let i = 0; i < val.size; i++) {
      this._eval.eval(val.get(i) as T, cursor.list(i));
    }
  }
  prune(): boolean {
    return this._eval.prune();
  }
}

/**
 * Evaluate key and value of all entries in a map.
 */
export class EvalMapEntries<V extends ReflectMessageGet>
  implements Eval<ReflectMap>
{
  constructor(
    private key: Eval<string | number | bigint | boolean>,
    private value: Eval<V>,
  ) {}
  eval(val: ReflectMap, cursor: Cursor): void {
    for (const [key, value] of val) {
      const c = cursor.mapKey(key as string | number | bigint | boolean);
      this.key.eval(key as string | number | bigint | boolean, c);
      this.value.eval(value as V, c);
    }
  }
  prune(): boolean {
    const key = this.key.prune();
    const value = this.value.prune();
    return key && value;
  }
}

/**
 * Evaluate conditionally.
 */
export class EvalIgnoreCondition<F extends DescField>
  implements Eval<ReflectMessage>
{
  constructor(
    private readonly field: F,
    private readonly condition: IgnoreCondition<F>,
    private readonly pass: Eval<ReflectMessageGet<F>>,
  ) {}
  eval(val: ReflectMessage, cursor: Cursor): void {
    if (this.condition.check(val)) {
      const fieldVal = val.get(this.field);
      this.pass.eval(fieldVal, cursor.field(this.field));
    }
  }
  prune(): boolean {
    return this.condition.isNever();
  }
}

abstract class IgnoreCondition<F extends DescField> {
  constructor(
    protected readonly field: F,
    protected readonly ignore: Ignore,
  ) {}
  abstract check(val: ReflectMessage): boolean;
  isNever(): boolean {
    return this.ignore == Ignore.ALWAYS;
  }
}

export class IgnoreConditionMessage extends IgnoreCondition<
  DescField & { fieldKind: "message" }
> {
  override check(val: ReflectMessage): boolean {
    switch (this.ignore) {
      case Ignore.ALWAYS:
        // > The field's rules will always be ignored, including any validation's on value's fields.
        return false;
      case Ignore.UNSPECIFIED:
      case Ignore.IF_UNPOPULATED:
        // > The custom CEL rule applies only if the field is set, including if
        // > it's the "zero" value of that message.
        // > IGNORE_IF_UNPOPULATED is equivalent to IGNORE_UNSPECIFIED in this case [...]
        return val.isSet(this.field);
      case Ignore.IF_DEFAULT_VALUE:
        // > The custom CEL rule only applies if the field is set to a value other
        // > than an empty message (i.e., fields are unpopulated).
        return (
          val.isSet(this.field) && !this.isDefaultValue(val.get(this.field))
        );
    }
  }
  private isDefaultValue(fieldVal: ReflectMessage): boolean {
    return !fieldVal.fields.some((f) => fieldVal.isSet(f));
  }
}

export class IgnoreConditionScalarOrEnum extends IgnoreCondition<
  DescField & { fieldKind: "scalar" | "enum" }
> {
  private readonly defaultValue: ScalarValue;
  private readonly scalar: ScalarType;
  constructor(
    field: DescField & { fieldKind: "scalar" | "enum" },
    ignore: Ignore,
  ) {
    super(field, ignore);
    switch (field.fieldKind) {
      case "scalar":
        this.scalar = field.scalar;
        this.defaultValue =
          field.getDefaultValue() ?? scalarZeroValue(field.scalar, false);
        break;
      case "enum":
        this.scalar = ScalarType.INT32;
        this.defaultValue =
          field.getDefaultValue() ?? field.enum.values[0].number;
        break;
    }
  }
  override check(val: ReflectMessage): boolean {
    // buf.validate.Ignore.IGNORE_ALWAYS:
    // The field's rules will always be ignored, including any validation's
    // on value's fields.
    if (this.ignore == Ignore.ALWAYS) {
      return false;
    }
    if (this.field.presence == FeatureSet_FieldPresence.IMPLICIT) {
      switch (this.ignore) {
        case Ignore.UNSPECIFIED:
          // The uri rule applies to any value, including the empty string.
          return true;
        case Ignore.IF_UNPOPULATED:
        case Ignore.IF_DEFAULT_VALUE:
          // the uri rule applies only if the value is not the empty string.
          return val.isSet(this.field);
        // case Ignore.ALWAYS:
        // The field's rules will always be ignored, including any validation's
        // on value's fields.
        // break;
      }
    } else {
      // field presence EXPLICIT or LEGACY_REQUIRED
      switch (this.ignore) {
        case Ignore.UNSPECIFIED:
        // The uri rule only applies if the field is set, including if it's set to the empty string.
        // eslint-disable-next-line no-fallthrough
        case Ignore.IF_UNPOPULATED:
          // IGNORE_IF_UNPOPULATED is equivalent to IGNORE_UNSPECIFIED in this case [...]
          return val.isSet(this.field);
        case Ignore.IF_DEFAULT_VALUE:
          // proto3 optional:
          // The uri rule only applies if the field is set to a value other than
          // the empty string.
          // proto2 custom default values:
          // The rule even applies if the field is set to zero since the default
          // value differs.
          return (
            val.isSet(this.field) && !this.isDefaultValue(val.get(this.field))
          );
        // case Ignore.ALWAYS:
        // The field's rules will always be ignored, including any validation's
        // on value's fields.
        // break;
      }
    }
  }
  private isDefaultValue(fieldVal: ScalarValue): boolean {
    return scalarEquals(this.scalar, this.defaultValue, fieldVal);
  }
}

export class IgnoreConditionListOrMap extends IgnoreCondition<
  DescField & { fieldKind: "map" | "list" }
> {
  override check(val: ReflectMessage): boolean {
    switch (this.ignore) {
      case Ignore.ALWAYS:
        // The field's rules will always be ignored, including any validation's on value's fields.
        return false;
      case Ignore.UNSPECIFIED:
        // The min_items rule always applies, even if the list is empty.
        return true;
      case Ignore.IF_UNPOPULATED:
      case Ignore.IF_DEFAULT_VALUE:
        // The min_items rule only applies if the list has at least one item.
        // IGNORE_IF_DEFAULT_VALUE is equivalent to IGNORE_IF_UNPOPULATED in
        // this case; the min_items rule only applies if the list has at least
        // one item.
        return val.isSet(this.field);
    }
  }
}

export class EvalFieldRequired implements Eval<ReflectMessage> {
  constructor(private readonly field: DescField) {}
  eval(val: ReflectMessage, cursor: Cursor): void {
    if (!val.isSet(this.field)) {
      cursor.field(this.field).violate("value is required", "required", []);
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
      .violate("exactly one field is required in oneof", "required", []);
  }
  prune(): boolean {
    return false;
  }
}

export class EvalMessageCel implements Eval<ReflectMessage> {
  private readonly env: CelEnv;
  private readonly plannedConstraints: {
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
    this.plannedConstraints = constraints.map((constraint) => ({
      constraint,
      planned: celConstraintPlan(this.env, constraint),
    }));
  }

  eval(val: ReflectMessage, cursor: Cursor) {
    this.env.set("this", val.message);
    for (const { constraint, planned } of this.plannedConstraints) {
      const vio = celConstraintEval(this.env, constraint, planned);
      if (vio) {
        cursor.violate(vio.message, vio.constraintId, []);
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
    this.plannedConstraints = constraints.map((constraint) => ({
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
    for (const { constraint, planned } of this.plannedConstraints) {
      const vio = celConstraintEval(this.env, constraint, planned);
      if (vio) {
        cursor.violate(vio.message, vio.constraintId, []);
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
  ) {}
  eval(val: ScalarValue, cursor: Cursor): void {
    for (const plan of this.plans) {
      plan.env.set("this", val);
      plan.env.set("rules", plan.rules);
      const vio = celConstraintEval(plan.env, plan.constraint, plan.planned);
      if (vio) {
        cursor.violate(
          vio.message,
          vio.constraintId,
          plan.rulePath,
          this.forMapKey,
        );
      }
    }
  }
  prune(): boolean {
    return this.plans.length == 0;
  }
}

export class EvalMessageRulesCel implements Eval<ReflectMessage> {
  constructor(private readonly plans: RuleCelPlan[]) {}

  eval(val: ReflectMessage, cursor: Cursor): void {
    // TODO fix this up
    const valVal: unknown = val.message;
    for (const plan of this.plans) {
      plan.env.set("this", valVal);
      plan.env.set("rules", plan.rules);
      const vio = celConstraintEval(plan.env, plan.constraint, plan.planned);
      if (vio) {
        cursor.violate(vio.message, vio.constraintId, plan.rulePath);
      }
    }
  }
  prune(): boolean {
    return this.plans.length == 0;
  }
}

export class EvalListRulesCel implements Eval<ReflectList> {
  constructor(private readonly plans: RuleCelPlan[]) {}
  eval(val: ReflectList, cursor: Cursor): void {
    // TODO fix this up
    // @ts-expect-error -- TODO
    const valVal: unknown = val[Symbol.for("reflect unsafe local")];
    for (const plan of this.plans) {
      plan.env.set("this", valVal);
      plan.env.set("rules", plan.rules);
      const vio = celConstraintEval(plan.env, plan.constraint, plan.planned);
      if (vio) {
        cursor.violate(vio.message, vio.constraintId, plan.rulePath);
      }
    }
  }
  prune(): boolean {
    return this.plans.length == 0;
  }
}

export class EvalMapRulesCel implements Eval<ReflectMap> {
  constructor(private readonly plans: RuleCelPlan[]) {}
  eval(val: ReflectMap, cursor: Cursor): void {
    // @ts-expect-error -- TODO
    const valVal: unknown = val[Symbol.for("reflect unsafe local")];
    for (const plan of this.plans) {
      plan.env.set("this", valVal);
      plan.env.set("rules", plan.rules);
      const vio = celConstraintEval(plan.env, plan.constraint, plan.planned);
      if (vio) {
        cursor.violate(vio.message, vio.constraintId, plan.rulePath);
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
  constructor(descEnum: DescEnum, rules: EnumRules) {
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
        [],
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
  constructor(rules: AnyRules) {
    this.in = rules.in;
    this.notIn = rules.notIn;
  }
  eval(val: ReflectMessage, cursor: Cursor) {
    const any = val.message as Any;
    if (this.in.length > 0 && !this.in.includes(any.typeUrl)) {
      // type URL must be in the allow list [any.in]
      cursor.violate("type URL must be in the allow list", "any.in", []);
    }
    if (this.notIn.length > 0 && this.notIn.includes(any.typeUrl)) {
      // type URL must not be in the block list [any.not_in]
      cursor.violate(
        "type URL must not be in the block list",
        "any.not_in",
        [],
      );
    }
  }
  prune(): boolean {
    return this.in.length + this.notIn.length == 0;
  }
}
