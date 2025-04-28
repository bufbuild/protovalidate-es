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

import type {
  ReflectList,
  ReflectMap,
  ReflectMessage,
  ReflectMessageGet,
  ScalarValue,
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
import type { PathBuilder } from "./path.js";

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
          FieldRulesSchema.field.required,
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
