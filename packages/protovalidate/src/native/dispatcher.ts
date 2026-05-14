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
import type { BoolRules, FieldRules } from "../gen/buf/validate/validate_pb.js";
import { BoolRulesSchema } from "../gen/buf/validate/validate_pb.js";
import type { Eval } from "../eval.js";
import { tryBuildNativeBoolRules } from "./bool.js";
import { tryBuildNativeNumericRules } from "./numeric.js";
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
 * Internal dispatch result used by the per-rules-type builders. They produce
 * a scalar-typed eval; {@link tryBuildNative} either lifts it directly into
 * `Eval<ReflectMessageGet>` (the scalar case) or wraps it in a
 * `WrappedValueEval` for WKT wrapper messages.
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
  const inner = buildScalarNative(input);
  if (inner === undefined) return undefined;
  // Eval is invariant in its parameter; the cast is safe because every
  // ScalarValue is also a valid ReflectMessageGet at runtime.
  const lifted =
    input.wrappedValueField === undefined
      ? (inner.eval as unknown as Eval<ReflectMessageGet>)
      : (new WrappedValueEval(
          input.wrappedValueField,
          inner.eval,
        ) as unknown as Eval<ReflectMessageGet>);
  return {
    eval: lifted,
    handledFields: inner.handledFields,
  };
}

function buildScalarNative(
  input: NativeDispatchInput,
): ScalarNativeResult | undefined {
  const { rules, rulePath, forMapKey } = input;
  if (rules.$typeName === BoolRulesSchema.typeName) {
    return tryBuildNativeBoolRules(rules as BoolRules, rulePath, forMapKey);
  }
  return tryBuildNativeNumericRules(rules, rulePath, forMapKey);
}
