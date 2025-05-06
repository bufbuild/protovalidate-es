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
import type { PathBuilder } from "@bufbuild/protobuf/reflect";
import {
  AnyRulesSchema,
  BoolRulesSchema,
  BytesRulesSchema,
  DoubleRulesSchema,
  DurationRulesSchema,
  EnumRulesSchema,
  type FieldRules,
  FieldRulesSchema,
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
  StringRulesSchema,
  TimestampRulesSchema,
  UInt32RulesSchema,
  UInt64RulesSchema,
} from "./gen/buf/validate/validate_pb.js";
import { CompilationError } from "./error.js";

type ruleType = Exclude<FieldRules["type"]["case"], undefined>;
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

const ruleMessageTypeToScalarType = new Map<string, ScalarType>([
  [DoubleRulesSchema.typeName, ScalarType.DOUBLE],
  [FloatRulesSchema.typeName, ScalarType.FLOAT],
  [Int64RulesSchema.typeName, ScalarType.INT64],
  [UInt64RulesSchema.typeName, ScalarType.UINT64],
  [Int32RulesSchema.typeName, ScalarType.INT32],
  [Fixed64RulesSchema.typeName, ScalarType.FIXED64],
  [Fixed32RulesSchema.typeName, ScalarType.FIXED32],
  [BoolRulesSchema.typeName, ScalarType.BOOL],
  [BytesRulesSchema.typeName, ScalarType.BYTES],
  [UInt32RulesSchema.typeName, ScalarType.UINT32],
  [SFixed32RulesSchema.typeName, ScalarType.SFIXED32],
  [SFixed64RulesSchema.typeName, ScalarType.SFIXED64],
  [SInt32RulesSchema.typeName, ScalarType.SINT32],
  [SInt64RulesSchema.typeName, ScalarType.SINT64],
]);

/**
 * Get the ScalarType for one of the buf.validate.*Rules messages.
 */
export function getRuleScalarType(
  rule: Exclude<FieldRules["type"]["value"], undefined>,
): ScalarType | undefined {
  return ruleMessageTypeToScalarType.get(rule.$typeName);
}

/**
 * Get the descriptor for one of the buf.validate.*Rules messages.
 */
export function getRuleDescriptor(
  typeName: Exclude<FieldRules["type"]["value"], undefined>["$typeName"],
): DescMessage {
  for (const d of [
    FloatRulesSchema,
    DoubleRulesSchema,
    Int32RulesSchema,
    Int64RulesSchema,
    UInt32RulesSchema,
    UInt64RulesSchema,
    SInt32RulesSchema,
    SInt64RulesSchema,
    Fixed32RulesSchema,
    Fixed64RulesSchema,
    SFixed32RulesSchema,
    SFixed64RulesSchema,
    BoolRulesSchema,
    StringRulesSchema,
    BytesRulesSchema,
    EnumRulesSchema,
    RepeatedRulesSchema,
    MapRulesSchema,
    AnyRulesSchema,
    DurationRulesSchema,
    TimestampRulesSchema,
  ]) {
    if (typeName == d.typeName) {
      return d;
    }
  }
  throw new Error(`unable to find descriptor for ${typeName}`);
}

/**
 * Get buf.validate.RepeatedRules from FieldRules.
 * Returns a tuple with rules, and path to the rules.
 * Throws an error if the FieldRules has incompatible rules.
 */
export function getListRules(
  rulePath: PathBuilder,
  fieldRules: FieldRules | undefined,
  fieldContext: { toString(): string },
) {
  const listRules = getRulePath(rulePath, "repeated");
  return [
    getRules(fieldRules, "repeated", fieldContext),
    listRules,
    listRules.clone().field(RepeatedRulesSchema.field.items),
  ] as const;
}

/**
 * Get buf.validate.MapRules from FieldRules.
 * Returns a tuple with rules, and path to the rules.
 * Throws an error if the FieldRules has incompatible rules.
 */
export function getMapRules(
  rulePath: PathBuilder,
  fieldRules: FieldRules | undefined,
  fieldContext: { toString(): string },
) {
  const mapRules = getRulePath(rulePath, "map");
  return [
    getRules(fieldRules, "map", fieldContext),
    mapRules,
    mapRules.clone().field(MapRulesSchema.field.keys),
    mapRules.clone().field(MapRulesSchema.field.values),
  ] as const;
}

/**
 * Get buf.validate.EnumRules from FieldRules.
 * Returns a tuple with rules, and path to the rules.
 * Throws an error if the FieldRules has incompatible rules.
 */
export function getEnumRules(
  rulePath: PathBuilder,
  fieldRules: FieldRules | undefined,
  fieldContext: { toString(): string },
) {
  return [
    getRules(fieldRules, "enum", fieldContext),
    getRulePath(rulePath, "enum"),
  ] as const;
}

/**
 * Get buf.validate.*Rules for the given message type from FieldRules.
 * Returns a tuple with rules, and path to the rules.
 * Throws an error if the FieldRules has incompatible rules.
 */
export function getMessageRules(
  descMessage: DescMessage,
  rulePath: PathBuilder,
  fieldRules: FieldRules | undefined,
  fieldContext: { toString(): string },
) {
  const type = messageToRuleType.get(descMessage.typeName);
  return [
    getRules(fieldRules, type, fieldContext),
    getRulePath(rulePath, type),
  ] as const;
}

/**
 * Get buf.validate.*Rules for the given scalar type from FieldRules.
 * Returns a tuple with rules, and path to the rules.
 * Throws an error if the FieldRules has incompatible rules.
 */
export function getScalarRules(
  scalar: ScalarType,
  rulePath: PathBuilder,
  fieldRules: FieldRules | undefined,
  fieldContext: { toString(): string },
) {
  const type = scalarToRuleType.get(scalar);
  return [
    getRules(fieldRules, type, fieldContext),
    getRulePath(rulePath, type),
  ] as const;
}

function getRulePath(base: PathBuilder, type: ruleType | undefined) {
  if (type == undefined) {
    return base;
  }
  const field = FieldRulesSchema.fields.find((f) => f.name === type);
  if (field == undefined) {
    throw new CompilationError(`cannot find rule "${type}"`);
  }
  return base.clone().field(field);
}

function getRules<T extends ruleType>(
  fieldRules: FieldRules | undefined,
  want: T | undefined,
  context: { toString(): string },
) {
  const got = fieldRules?.type.case;
  if (fieldRules == undefined || got == undefined) {
    return undefined;
  }
  if (got != want) {
    throw new CompilationError(
      want == undefined
        ? `rule "${got}" cannot be used on ${context.toString()}`
        : `expected rule "${want}", got "${got}" on ${context.toString()}`,
    );
  }
  return fieldRules.type.value as (FieldRules["type"] & {
    case: T;
  })["value"];
}
