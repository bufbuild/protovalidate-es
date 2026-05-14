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
import type {
  BoolRules,
  DoubleRules,
  Fixed32Rules,
  Fixed64Rules,
  FieldRules,
  FloatRules,
  Int32Rules,
  Int64Rules,
  SFixed32Rules,
  SFixed64Rules,
  SInt32Rules,
  SInt64Rules,
  UInt32Rules,
  UInt64Rules,
} from "../gen/buf/validate/validate_pb.js";
import {
  BoolRulesSchema,
  DoubleRulesSchema,
  Fixed32RulesSchema,
  Fixed64RulesSchema,
  FloatRulesSchema,
  Int32RulesSchema,
  Int64RulesSchema,
  SFixed32RulesSchema,
  SFixed64RulesSchema,
  SInt32RulesSchema,
  SInt64RulesSchema,
  UInt32RulesSchema,
  UInt64RulesSchema,
} from "../gen/buf/validate/validate_pb.js";
import type { Eval } from "../eval.js";
import type { RegexMatcher } from "../func.js";
import { tryBuildNativeBoolRules } from "./bool.js";
import {
  tryBuildNativeDoubleRules,
  tryBuildNativeFixed32Rules,
  tryBuildNativeFixed64Rules,
  tryBuildNativeFloatRules,
  tryBuildNativeInt32Rules,
  tryBuildNativeInt64Rules,
  tryBuildNativeSfixed32Rules,
  tryBuildNativeSfixed64Rules,
  tryBuildNativeSint32Rules,
  tryBuildNativeSint64Rules,
  tryBuildNativeUint32Rules,
  tryBuildNativeUint64Rules,
} from "./numeric.js";
import { WrappedValueEval, asReflectGet } from "./wrapper.js";

/**
 * Result of {@link tryBuildNative}.
 *
 * - "none": no native handler applies; the planner enrolls every set field in
 *   the CEL evaluator as it does today.
 * - "partial" / "full": at least one field is handled natively. The planner
 *   skips CEL enrollment for fields in `handledFields` and appends `eval` to
 *   the rule's `EvalMany`. "full" indicates every set field on the rules
 *   message was handled natively, so the trailing `EvalStandardRulesCel` will
 *   be empty and pruned.
 */
export type NativeDispatchResult =
  | { kind: "none" }
  | {
      kind: "partial" | "full";
      eval: Eval<ReflectMessageGet>;
      handledFields: ReadonlySet<DescField>;
    };

/**
 * Internal dispatch result used by the per-rules-type builders. They produce
 * a scalar-typed eval; {@link tryBuildNative} either lifts it directly into
 * `Eval<ReflectMessageGet>` (the scalar case) or wraps it in a
 * `WrappedValueEval` for WKT wrapper messages.
 */
export type ScalarNativeResult =
  | { kind: "none" }
  | {
      kind: "partial" | "full";
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
  regexMatch: RegexMatcher | undefined;
  /**
   * When the rules are being applied to a `google.protobuf.*Value` wrapper
   * field, this is the descriptor of the wrapper's inner `value` field. The
   * dispatcher wraps the native scalar evaluator in an unwrap adapter so the
   * runtime can read the inner scalar before delegating. Undefined for
   * direct scalar fields.
   */
  wrappedValueField: DescField | undefined;
};

/**
 * Decide whether the given rules submessage can be evaluated natively, and
 * return an `Eval` for the handled subset plus the set of rule fields that
 * have been claimed (so the planner skips them on the CEL path).
 */
export function tryBuildNative(
  input: NativeDispatchInput,
): NativeDispatchResult {
  const inner = buildScalarNative(input);
  if (inner.kind === "none") return inner;
  if (input.wrappedValueField === undefined) {
    return {
      kind: inner.kind,
      eval: asReflectGet(inner.eval),
      handledFields: inner.handledFields,
    };
  }
  return {
    kind: inner.kind,
    eval: asReflectGet(
      new WrappedValueEval(input.wrappedValueField, inner.eval),
    ),
    handledFields: inner.handledFields,
  };
}

function buildScalarNative(input: NativeDispatchInput): ScalarNativeResult {
  const { rules, rulePath, forMapKey } = input;
  switch (rules.$typeName) {
    case BoolRulesSchema.typeName:
      return tryBuildNativeBoolRules(rules as BoolRules, rulePath, forMapKey);
    case Int32RulesSchema.typeName:
      return tryBuildNativeInt32Rules(rules as Int32Rules, rulePath, forMapKey);
    case Int64RulesSchema.typeName:
      return tryBuildNativeInt64Rules(rules as Int64Rules, rulePath, forMapKey);
    case UInt32RulesSchema.typeName:
      return tryBuildNativeUint32Rules(
        rules as UInt32Rules,
        rulePath,
        forMapKey,
      );
    case UInt64RulesSchema.typeName:
      return tryBuildNativeUint64Rules(
        rules as UInt64Rules,
        rulePath,
        forMapKey,
      );
    case SInt32RulesSchema.typeName:
      return tryBuildNativeSint32Rules(
        rules as SInt32Rules,
        rulePath,
        forMapKey,
      );
    case SInt64RulesSchema.typeName:
      return tryBuildNativeSint64Rules(
        rules as SInt64Rules,
        rulePath,
        forMapKey,
      );
    case Fixed32RulesSchema.typeName:
      return tryBuildNativeFixed32Rules(
        rules as Fixed32Rules,
        rulePath,
        forMapKey,
      );
    case Fixed64RulesSchema.typeName:
      return tryBuildNativeFixed64Rules(
        rules as Fixed64Rules,
        rulePath,
        forMapKey,
      );
    case SFixed32RulesSchema.typeName:
      return tryBuildNativeSfixed32Rules(
        rules as SFixed32Rules,
        rulePath,
        forMapKey,
      );
    case SFixed64RulesSchema.typeName:
      return tryBuildNativeSfixed64Rules(
        rules as SFixed64Rules,
        rulePath,
        forMapKey,
      );
    case FloatRulesSchema.typeName:
      return tryBuildNativeFloatRules(rules as FloatRules, rulePath, forMapKey);
    case DoubleRulesSchema.typeName:
      return tryBuildNativeDoubleRules(
        rules as DoubleRules,
        rulePath,
        forMapKey,
      );
    default:
      return { kind: "none" };
  }
}
