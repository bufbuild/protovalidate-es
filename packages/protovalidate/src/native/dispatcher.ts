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
import type {
  PathBuilder,
  ReflectMessageGet,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import type { FieldRules } from "../gen/buf/validate/validate_pb.js";
import {
  AnyRulesSchema,
  BoolRulesSchema,
  BytesRulesSchema,
  DoubleRulesSchema,
  DurationRulesSchema,
  EnumRulesSchema,
  FieldMaskRulesSchema,
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
} from "../gen/buf/validate/validate_pb.js";
import type { Eval } from "../eval.js";
import type { RegexMatcher } from "../func.js";
import { tryBuildNativeBoolRules } from "./bool.js";
import { tryBuildNativeBytesRules } from "./bytes.js";
import { tryBuildNativeEnumRules } from "./enum.js";
import { tryBuildNativeMapRules } from "./map.js";
import { tryBuildNativeNumericRules } from "./numeric.js";
import { tryBuildNativeRepeatedRules } from "./repeated.js";
import { tryBuildNativeStringRules } from "./string.js";
import { WrappedValueEval } from "./wrapper.js";

/**
 * A successful native dispatch result. The planner skips CEL enrollment for
 * the fields in `handledFields` and appends `eval` to the rule's `EvalMany`.
 *
 * `tryBuildNative` returns `undefined` to mean "no native handler applies" —
 * the planner enrolls every set field in the CEL evaluator as before.
 */
export type NativeDispatchResult = {
  eval: Eval<ReflectMessageGet>;
  handledFields: ReadonlySet<DescField>;
};

/**
 * Internal dispatch result used by the scalar/enum/bool per-rules-type
 * builders. They produce a `Eval<ScalarValue>`; {@link tryBuildNative} either
 * lifts it directly into `Eval<ReflectMessageGet>` (the scalar case) or wraps
 * it in a `WrappedValueEval` for WKT wrapper messages.
 */
export type ScalarNativeResult = {
  eval: Eval<ScalarValue>;
  handledFields: ReadonlySet<DescField>;
};

/**
 * Inputs to the native rule dispatcher.
 */
export type NativeDispatchInput = {
  rules: Exclude<FieldRules["type"]["value"], undefined>;
  rulePath: PathBuilder;
  forMapKey: boolean;
  /**
   * When the rules are being applied to a `google.protobuf.*Value` wrapper
   * field, this is the descriptor of the wrapper's inner `value` field. The
   * dispatcher wraps the native scalar evaluator in an unwrap adapter so the
   * runtime can read the inner scalar before delegating. Undefined for
   * direct scalar fields.
   */
  wrappedValueField: DescField | undefined;
  /**
   * For RepeatedRules dispatch (from `Planner.planList`), the list field
   * descriptor. The repeated builder uses it to decide whether the `unique`
   * rule is native-handleable for the element kind. Undefined for non-list
   * call sites.
   */
  listField: (DescField & { fieldKind: "list" }) | undefined;
  /**
   * Regex matcher to use for rules that compile a pattern (bytes.pattern,
   * string.pattern).
   */
  regexMatch: RegexMatcher;
};

/**
 * Decide whether the given rules submessage can be evaluated natively, and
 * return an `Eval` for the handled subset plus the set of rule fields that
 * have been claimed (so the planner skips them on the CEL path).
 *
 * Returns `undefined` if no native handler applies.
 */
export function tryBuildNative(
  input: NativeDispatchInput,
): NativeDispatchResult | undefined {
  const {
    rules,
    rulePath,
    forMapKey,
    wrappedValueField,
    listField,
    regexMatch,
  } = input;
  switch (rules.$typeName) {
    case BoolRulesSchema.typeName: {
      const r = tryBuildNativeBoolRules(rules, rulePath, forMapKey);
      return liftScalar(r, wrappedValueField);
    }
    case StringRulesSchema.typeName: {
      const r = tryBuildNativeStringRules(
        rules,
        rulePath,
        forMapKey,
        regexMatch,
      );
      return liftScalar(r, wrappedValueField);
    }
    case BytesRulesSchema.typeName: {
      const r = tryBuildNativeBytesRules(
        rules,
        rulePath,
        forMapKey,
        regexMatch,
      );
      return liftScalar(r, wrappedValueField);
    }
    case EnumRulesSchema.typeName: {
      const r = tryBuildNativeEnumRules(rules, rulePath, forMapKey);
      return liftScalar(r, wrappedValueField);
    }
    case RepeatedRulesSchema.typeName:
      return tryBuildNativeRepeatedRules(rules, rulePath, forMapKey, listField);
    case MapRulesSchema.typeName:
      return tryBuildNativeMapRules(rules, rulePath);
    case Int32RulesSchema.typeName:
    case Int64RulesSchema.typeName:
    case UInt32RulesSchema.typeName:
    case UInt64RulesSchema.typeName:
    case SInt32RulesSchema.typeName:
    case SInt64RulesSchema.typeName:
    case Fixed32RulesSchema.typeName:
    case Fixed64RulesSchema.typeName:
    case SFixed32RulesSchema.typeName:
    case SFixed64RulesSchema.typeName:
    case FloatRulesSchema.typeName:
    case DoubleRulesSchema.typeName: {
      const r = tryBuildNativeNumericRules(rules, rulePath, forMapKey);
      return liftScalar(r, wrappedValueField);
    }
    case AnyRulesSchema.typeName:
    case DurationRulesSchema.typeName:
    case FieldMaskRulesSchema.typeName:
    case TimestampRulesSchema.typeName:
      // No native handler for these yet; CEL evaluates them. Listed rather
      // than lumped into a `default` so the gap is visible, and so that a
      // rules message added to FieldRules upstream fails to compile here
      // (`noImplicitReturns`) instead of silently landing in whichever arm
      // happened to catch the rest.
      return undefined;
  }
}

function liftScalar(
  result: ScalarNativeResult | undefined,
  wrappedValueField: DescField | undefined,
): NativeDispatchResult | undefined {
  if (result === undefined) return undefined;
  const lifted =
    wrappedValueField === undefined
      ? result.eval
      : new WrappedValueEval(wrappedValueField, result.eval);
  return {
    eval: lifted,
    handledFields: result.handledFields,
  };
}
