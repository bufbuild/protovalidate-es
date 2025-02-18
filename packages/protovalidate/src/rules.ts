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

import { type DescMessage, ScalarType } from "@bufbuild/protobuf";
import {
  type EnumRules,
  type FieldConstraints,
  type MapRules,
  type RepeatedRules,
} from "./gen/buf/validate/validate_pb.js";
import { CompilationError } from "./error.js";
import {
  AnySchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  DurationSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  StringValueSchema,
  TimestampSchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
} from "@bufbuild/protobuf/wkt";

/**
 * MessageRules is a union of all buf.validate.*Rules message types that are
 * applicable to messages.
 */
export type MessageRules = (FieldConstraints["type"] & {
  case: ruleTypeMessage;
})["value"];

/**
 * MessageRules is a union of all buf.validate.*Rules message types that are
 * applicable to scalar values.
 */
export type ScalarRules = (FieldConstraints["type"] & {
  case: ruleTypeScalar;
})["value"];

type ruleType = Exclude<FieldConstraints["type"]["case"], undefined>;
type ruleTypeMessage =
  | "any"
  | "duration"
  | "timestamp"
  | "float"
  | "double"
  | "int32"
  | "int64"
  | "uint32"
  | "uint64"
  | "sint32"
  | "bool"
  | "string"
  | "bytes";

type ruleTypeScalar =
  | "float"
  | "double"
  | "int32"
  | "int64"
  | "uint32"
  | "uint64"
  | "sint32"
  | "sint64"
  | "fixed32"
  | "fixed64"
  | "sfixed32"
  | "sfixed64"
  | "bool"
  | "string"
  | "bytes";

const messageToRuleType = new Map<string, ruleTypeMessage>([
  [AnySchema.typeName, "any"],
  [DurationSchema.typeName, "duration"],
  [TimestampSchema.typeName, "timestamp"],
  [FloatValueSchema.typeName, "float"],
  [DoubleValueSchema.typeName, "double"],
  [Int32ValueSchema.typeName, "int32"],
  [Int64ValueSchema.typeName, "int64"],
  [UInt32ValueSchema.typeName, "uint32"],
  [UInt64ValueSchema.typeName, "uint64"],
  [BoolValueSchema.typeName, "bool"],
  [StringValueSchema.typeName, "string"],
  [BytesValueSchema.typeName, "bytes"],
]);

const scalarToRuleType = new Map<ScalarType, ruleTypeScalar>([
  [ScalarType.FLOAT, "float"],
  [ScalarType.DOUBLE, "double"],
  [ScalarType.INT32, "int32"],
  [ScalarType.INT64, "int64"],
  [ScalarType.UINT32, "uint32"],
  [ScalarType.UINT64, "uint64"],
  [ScalarType.SINT32, "sint32"],
  [ScalarType.SINT64, "sint64"],
  [ScalarType.FIXED32, "fixed32"],
  [ScalarType.FIXED64, "fixed64"],
  [ScalarType.SFIXED32, "sfixed32"],
  [ScalarType.SFIXED64, "sfixed64"],
  [ScalarType.BOOL, "bool"],
  [ScalarType.STRING, "string"],
  [ScalarType.BYTES, "bytes"],
]);

/**
 * Get buf.validate.RepeatedRules from the oneof buf.validate.FieldConstraints.type.
 * Returns undefined if constraints is undefined, or if the oneof is unset.
 * Throws an error if the oneof is set to incompatible rules.
 */
export function getListRules(
  constraints: FieldConstraints | undefined,
  field: { toString(): string },
) {
  return getRules(constraints, "repeated", field) as RepeatedRules | undefined;
}

/**
 * Get buf.validate.MapRules from the oneof buf.validate.FieldConstraints.type.
 * Returns undefined if constraints is undefined, or if the oneof is unset.
 * Throws an error if the oneof is set to incompatible rules.
 */
export function getMapRules(
  constraints: FieldConstraints | undefined,
  field: { toString(): string },
): MapRules | undefined {
  return getRules(constraints, "map", field) as MapRules | undefined;
}

/**
 * Get buf.validate.EnumRules from the oneof buf.validate.FieldConstraints.type.
 * Returns undefined if constraints is undefined, or if the oneof is unset.
 * Throws an error if the oneof is set to incompatible rules.
 */
export function getEnumRules(
  constraints: FieldConstraints | undefined,
  field: { toString(): string },
): EnumRules | undefined {
  return getRules(constraints, "enum", field) as EnumRules | undefined;
}

/**
 * Get buf.validate.*Rules applicable to messages from the oneof buf.validate.FieldConstraints.type.
 * Returns undefined if constraints is undefined, or if the oneof is unset.
 * Throws an error if the oneof is set to incompatible rules.
 */
export function getMessageRules(
  constraints: FieldConstraints | undefined,
  descMessage: DescMessage,
  field: { toString(): string },
): MessageRules | undefined {
  return getRules(
    constraints,
    messageToRuleType.get(descMessage.typeName),
    field,
  ) as MessageRules | undefined;
}

/**
 * Get buf.validate.*Rules applicable to scalar values from the oneof buf.validate.FieldConstraints.type.
 * Returns undefined if constraints is undefined, or if the oneof is unset.
 * Throws an error if the oneof is set to incompatible rules.
 */
export function getScalarRules(
  constraints: FieldConstraints | undefined,
  scalar: ScalarType,
  field: { toString(): string },
): ScalarRules | undefined {
  return getRules(constraints, scalarToRuleType.get(scalar), field) as
    | ScalarRules
    | undefined;
}

function getRules(
  constraints: FieldConstraints | undefined,
  want: ruleType | undefined,
  field: { toString(): string },
) {
  const got = constraints?.type.case;
  if (!constraints || got === undefined) {
    return undefined;
  }
  if (got === want) {
    return constraints.type.value;
  }
  throw new CompilationError(
    want == undefined
      ? `constraint "${got}" cannot be used on ${field.toString()}`
      : `expected constraint "${want}", got "${got}" on ${field.toString()}`,
  );
}
