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
  BytesRules,
  EnumRules,
  FieldRules,
  MapRules,
  RepeatedRules,
} from "../gen/buf/validate/validate_pb.js";
import {
  BoolRulesSchema,
  BytesRulesSchema,
  EnumRulesSchema,
  MapRulesSchema,
  RepeatedRulesSchema,
} from "../gen/buf/validate/validate_pb.js";
import type { Eval } from "../eval.js";
import type { RegexMatcher } from "../func.js";
import { tryBuildNativeBoolRules } from "./bool.js";
import { tryBuildNativeBytesRules } from "./bytes.js";
import { tryBuildNativeEnumRules } from "./enum.js";
import { tryBuildNativeMapRules } from "./map.js";
import { tryBuildNativeNumericRules } from "./numeric.js";
import { tryBuildNativeRepeatedRules } from "./repeated.js";
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
   * string.pattern). When undefined, handlers use the same ECMAScript regex
   * engine the CEL path falls back to. Phase 4 swaps the default to RE2.
   */
  regexMatch: RegexMatcher | undefined;
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
      const r = tryBuildNativeBoolRules(
        rules as BoolRules,
        rulePath,
        forMapKey,
      );
      return liftScalar(r, wrappedValueField);
    }
    case BytesRulesSchema.typeName: {
      const r = tryBuildNativeBytesRules(
        rules as BytesRules,
        rulePath,
        forMapKey,
        regexMatch,
      );
      return liftScalar(r, wrappedValueField);
    }
    case EnumRulesSchema.typeName: {
      const r = tryBuildNativeEnumRules(
        rules as EnumRules,
        rulePath,
        forMapKey,
      );
      return liftScalar(r, wrappedValueField);
    }
    case RepeatedRulesSchema.typeName: {
      const r = tryBuildNativeRepeatedRules(
        rules as RepeatedRules,
        rulePath,
        forMapKey,
        listField,
      );
      if (r === undefined) return undefined;
      // Eval is invariant in its parameter; ReflectList is a valid runtime
      // ReflectMessageGet at this call site.
      return {
        eval: r.eval as unknown as Eval<ReflectMessageGet>,
        handledFields: r.handledFields,
      };
    }
    case MapRulesSchema.typeName: {
      const r = tryBuildNativeMapRules(rules as MapRules, rulePath);
      if (r === undefined) return undefined;
      // Eval is invariant; ReflectMap is a valid runtime ReflectMessageGet here.
      return {
        eval: r.eval as unknown as Eval<ReflectMessageGet>,
        handledFields: r.handledFields,
      };
    }
    default: {
      // Numeric rule types: int32/int64/uint32/uint64/sint32/sint64/
      // fixed32/fixed64/sfixed32/sfixed64/float/double. Anything else
      // (Duration, Timestamp, Any, FieldMask, custom) returns undefined.
      const r = tryBuildNativeNumericRules(rules, rulePath, forMapKey);
      return liftScalar(r, wrappedValueField);
    }
  }
}

function liftScalar(
  result: ScalarNativeResult | undefined,
  wrappedValueField: DescField | undefined,
): NativeDispatchResult | undefined {
  if (result === undefined) return undefined;
  // Eval is invariant in its parameter; the cast is safe because every
  // ScalarValue is also a valid ReflectMessageGet at runtime.
  const lifted =
    wrappedValueField === undefined
      ? (result.eval as unknown as Eval<ReflectMessageGet>)
      : (new WrappedValueEval(
          wrappedValueField,
          result.eval,
        ) as unknown as Eval<ReflectMessageGet>);
  return {
    eval: lifted,
    handledFields: result.handledFields,
  };
}
