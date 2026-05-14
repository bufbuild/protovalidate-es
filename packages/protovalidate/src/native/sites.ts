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

import type { DescField } from "@bufbuild/protobuf";
import {
  BoolRulesSchema,
  DoubleRulesSchema,
  EnumRulesSchema,
  Fixed32RulesSchema,
  Fixed64RulesSchema,
  FloatRulesSchema,
  Int32RulesSchema,
  Int64RulesSchema,
  MapRulesSchema,
  RepeatedRulesSchema,
  SFixed32RulesSchema,
  SFixed64RulesSchema,
  SInt32RulesSchema,
  SInt64RulesSchema,
  UInt32RulesSchema,
  UInt64RulesSchema,
} from "../gen/buf/validate/validate_pb.js";

/**
 * Leaf-field references for the numeric rules schemas.
 *
 * The dispatcher uses these to (a) consult `isFieldSet(rules, descs.const)`
 * for presence and (b) build leaf rule paths via
 * `rulePath.clone().field(descs.const).toPath()` at plan time.
 */
export type NumericRulesDescs = {
  readonly const: DescField;
  readonly gt: DescField;
  readonly gte: DescField;
  readonly lt: DescField;
  readonly lte: DescField;
  readonly in: DescField;
  readonly notIn: DescField;
  /** Only present on FloatRulesSchema and DoubleRulesSchema. */
  readonly finite?: DescField;
};

function descs(
  schema:
    | typeof Int32RulesSchema
    | typeof Int64RulesSchema
    | typeof UInt32RulesSchema
    | typeof UInt64RulesSchema
    | typeof SInt32RulesSchema
    | typeof SInt64RulesSchema
    | typeof Fixed32RulesSchema
    | typeof Fixed64RulesSchema
    | typeof SFixed32RulesSchema
    | typeof SFixed64RulesSchema,
): NumericRulesDescs {
  return {
    const: schema.field.const,
    gt: schema.field.gt,
    gte: schema.field.gte,
    lt: schema.field.lt,
    lte: schema.field.lte,
    in: schema.field.in,
    notIn: schema.field.notIn,
  };
}

export const int32Descs: NumericRulesDescs = descs(Int32RulesSchema);
export const int64Descs: NumericRulesDescs = descs(Int64RulesSchema);
export const uint32Descs: NumericRulesDescs = descs(UInt32RulesSchema);
export const uint64Descs: NumericRulesDescs = descs(UInt64RulesSchema);
export const sint32Descs: NumericRulesDescs = descs(SInt32RulesSchema);
export const sint64Descs: NumericRulesDescs = descs(SInt64RulesSchema);
export const fixed32Descs: NumericRulesDescs = descs(Fixed32RulesSchema);
export const fixed64Descs: NumericRulesDescs = descs(Fixed64RulesSchema);
export const sfixed32Descs: NumericRulesDescs = descs(SFixed32RulesSchema);
export const sfixed64Descs: NumericRulesDescs = descs(SFixed64RulesSchema);

export const floatDescs: NumericRulesDescs = {
  const: FloatRulesSchema.field.const,
  gt: FloatRulesSchema.field.gt,
  gte: FloatRulesSchema.field.gte,
  lt: FloatRulesSchema.field.lt,
  lte: FloatRulesSchema.field.lte,
  in: FloatRulesSchema.field.in,
  notIn: FloatRulesSchema.field.notIn,
  finite: FloatRulesSchema.field.finite,
};

export const doubleDescs: NumericRulesDescs = {
  const: DoubleRulesSchema.field.const,
  gt: DoubleRulesSchema.field.gt,
  gte: DoubleRulesSchema.field.gte,
  lt: DoubleRulesSchema.field.lt,
  lte: DoubleRulesSchema.field.lte,
  in: DoubleRulesSchema.field.in,
  notIn: DoubleRulesSchema.field.notIn,
  finite: DoubleRulesSchema.field.finite,
};

export const boolConstDesc: DescField = BoolRulesSchema.field.const;

/** Leaf-field references for EnumRules. */
export type EnumRulesDescs = {
  readonly const: DescField;
  readonly in: DescField;
  readonly notIn: DescField;
};

export const enumDescs: EnumRulesDescs = {
  const: EnumRulesSchema.field.const,
  in: EnumRulesSchema.field.in,
  notIn: EnumRulesSchema.field.notIn,
};

/** Leaf-field references for RepeatedRules (list-level). */
export type RepeatedRulesDescs = {
  readonly minItems: DescField;
  readonly maxItems: DescField;
  readonly unique: DescField;
};

export const repeatedDescs: RepeatedRulesDescs = {
  minItems: RepeatedRulesSchema.field.minItems,
  maxItems: RepeatedRulesSchema.field.maxItems,
  unique: RepeatedRulesSchema.field.unique,
};

/** Leaf-field references for MapRules. */
export type MapRulesDescs = {
  readonly minPairs: DescField;
  readonly maxPairs: DescField;
};

export const mapDescs: MapRulesDescs = {
  minPairs: MapRulesSchema.field.minPairs,
  maxPairs: MapRulesSchema.field.maxPairs,
};
