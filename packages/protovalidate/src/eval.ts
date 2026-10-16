// Copyright 2024-2026 Buf Technologies, Inc.
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

import type {
  ReflectList,
  ReflectMap,
  ReflectMessage,
  ReflectMessageGet,
  ScalarValue,
  PathBuilder,
} from "@bufbuild/protobuf/reflect";
import type { DescEnum, DescField, DescOneof } from "@bufbuild/protobuf";
import type { Any } from "@bufbuild/protobuf/wkt";
import {
  type AnyRules,
  AnyRulesSchema,
  type EnumRules,
  EnumRulesSchema,
  FieldRulesSchema,
} from "./gen/buf/validate/validate_pb.js";
import type { Cursor } from "./cursor.js";
import type { Condition } from "./condition.js";

/**
 * Evaluate rules for a value.
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
 * Context for the two-phase prune. The cached per-message plan nodes are the
 * only cycle boundaries: `isPlan` identifies them and `live` reports a plan's
 * computed liveness, so traversal stops there instead of recursing forever.
 */
export interface PruneContext {
  readonly isPlan: (e: Eval<unknown>) => boolean;
  readonly live: (e: Eval<unknown>) => boolean;
}

/**
 * The result of inspecting a subtree without crossing plan boundaries:
 * `localLive` is whether it can produce a violation on its own, and `edges` are
 * the plan nodes it reaches, whose liveness the caller folds in.
 */
export interface Liveness {
  localLive: boolean;
  edges: Eval<unknown>[];
}

// Implemented by the container nodes that can hold plan references (EvalMany,
// EvalField, EvalListItems, EvalMapEntries). collectLiveness is the Phase 1
// per-node rule and pruneCyclic the Phase 2 rule; both mirror the node's own
// prune(). See the two tables in PRUNING.md.
interface CyclicEval {
  collectLiveness(ctx: PruneContext): Liveness;
  pruneCyclic(ctx: PruneContext): boolean;
}

function asCyclic(e: Eval<unknown>): CyclicEval | undefined {
  return typeof (e as Partial<CyclicEval>).pruneCyclic === "function"
    ? (e as unknown as CyclicEval)
    : undefined;
}

// childLiveness and childPrune are the plan-boundary cut (PRUNING.md "The
// algorithm"): a plan node reached as a child is treated as an edge, not
// recursed into, so cycles terminate. Other containers recurse; leaves answer
// from their own prune().
function childLiveness(e: Eval<unknown>, ctx: PruneContext): Liveness {
  if (ctx.isPlan(e)) {
    return { localLive: false, edges: [e] };
  }
  return (
    asCyclic(e)?.collectLiveness(ctx) ?? { localLive: !e.prune(), edges: [] }
  );
}

function childPrune(e: Eval<unknown>, ctx: PruneContext): boolean {
  if (ctx.isPlan(e)) {
    return !ctx.live(e);
  }
  return asCyclic(e)?.pruneCyclic(ctx) ?? e.prune();
}

/**
 * collectPlanLiveness inspects a plan node's own contents, descending into it
 * rather than treating it as a boundary (the planner calls it on each plan).
 */
export function collectPlanLiveness(
  plan: Eval<unknown>,
  ctx: PruneContext,
): Liveness {
  return (
    asCyclic(plan)?.collectLiveness(ctx) ?? {
      localLive: !plan.prune(),
      edges: [],
    }
  );
}

/**
 * prunePlan removes a plan node's dead children and its dead references to other
 * plans, using the liveness already decided in `ctx`.
 */
export function prunePlan(plan: Eval<unknown>, ctx: PruneContext): void {
  asCyclic(plan)?.pruneCyclic(ctx);
}

/**
 * The no-op evaluator.
 */
export class EvalNoop<T> implements Eval<T> {
  private static instance = new EvalNoop();
  static get<T>(): EvalNoop<T> {
    return EvalNoop.instance;
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
    this.many = evals.flat();
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
  collectLiveness(ctx: PruneContext): Liveness {
    let localLive = false;
    const edges: Eval<unknown>[] = [];
    for (const e of this.many) {
      const r = childLiveness(e, ctx);
      localLive ||= r.localLive;
      edges.push(...r.edges);
    }
    return { localLive, edges };
  }
  pruneCyclic(ctx: PruneContext): boolean {
    this.many = this.many.filter((e) => !childPrune(e, ctx));
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
  collectLiveness(ctx: PruneContext): Liveness {
    if (this.condition.never) {
      return { localLive: false, edges: [] };
    }
    return childLiveness(this.pass, ctx);
  }
  pruneCyclic(ctx: PruneContext): boolean {
    return childPrune(this.pass, ctx) || this.condition.never;
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
  collectLiveness(ctx: PruneContext): Liveness {
    const key = this.keyCondition.never
      ? { localLive: false, edges: [] }
      : childLiveness(this.key, ctx);
    const value = this.valueCondition.never
      ? { localLive: false, edges: [] }
      : childLiveness(this.value, ctx);
    return {
      localLive: key.localLive || value.localLive,
      edges: [...key.edges, ...value.edges],
    };
  }
  pruneCyclic(ctx: PruneContext): boolean {
    const key = childPrune(this.key, ctx) || this.keyCondition.never;
    const value = childPrune(this.value, ctx) || this.valueCondition.never;
    return key && value;
  }
}

/**
 * Evaluate field. If the condition passes, evaluate the field's value.
 */
export class EvalField<F extends DescField> implements Eval<ReflectMessage> {
  constructor(
    private readonly field: F,
    private readonly required: boolean,
    private readonly legacyRequired: boolean,
    private readonly condition: Condition<ReflectMessage>,
    private readonly pass: Eval<ReflectMessageGet<F>>,
  ) {}
  eval(val: ReflectMessage, cursor: Cursor): void {
    if (this.required || this.legacyRequired) {
      if (!val.isSet(this.field)) {
        if (this.required) {
          cursor
            .field(this.field)
            .violate("value is required", "required", [
              FieldRulesSchema.field.required,
            ]);
        } else {
          cursor
            .field(this.field)
            .violate("value is required", "legacy_required", []);
        }
        // Stop evaluation of field rules if the `required` rule is violated.
        return;
      }
    }
    if (this.condition.check(val)) {
      const fieldVal = val.get(this.field);
      this.pass.eval(fieldVal, cursor.field(this.field));
    }
  }
  private pruning = false;
  prune(): boolean {
    let passDead = false;
    // Plans for recursive message types are cyclic; don't recurse twice.
    if (!this.pruning) {
      this.pruning = true;
      passDead = this.pass.prune();
      this.pruning = false;
    }
    return (
      (this.condition.never || passDead) &&
      !this.required &&
      !this.legacyRequired
    );
  }
  collectLiveness(ctx: PruneContext): Liveness {
    // A required field can always report its own violation, so it is live
    // regardless of what its value evaluator reaches.
    if (this.required || this.legacyRequired) {
      return { localLive: true, edges: [] };
    }
    if (this.condition.never) {
      return { localLive: false, edges: [] };
    }
    return childLiveness(this.pass, ctx);
  }
  pruneCyclic(ctx: PruneContext): boolean {
    const passDead = childPrune(this.pass, ctx);
    return (
      (this.condition.never || passDead) &&
      !this.required &&
      !this.legacyRequired
    );
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

/**
 * buf.validate.MessageOneofRule does not use CEL expressions. This implements custom logic for this rule.
 */
export class EvalMessageOneofRule implements Eval<ReflectMessage> {
  constructor(
    private readonly fields: DescField[],
    private readonly required: boolean,
  ) {}
  eval(val: ReflectMessage, cursor: Cursor) {
    const setFields = this.fields.filter((field) => val.isSet(field));
    if (setFields.length > 1) {
      const oneofNames = this.fields.map((f) => f.name).join(", ");
      cursor.violate(
        `only one of ${oneofNames} can be set`,
        "message.oneof",
        [],
      );
    }
    if (this.required && setFields.length == 0) {
      const oneofNames = this.fields.map((f) => f.name).join(", ");
      cursor.violate(`one of ${oneofNames} must be set`, "message.oneof", []);
    }
  }
  prune(): boolean {
    return this.fields.length == 0;
  }
}
