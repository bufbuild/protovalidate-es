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
} from "@bufbuild/protobuf/reflect";
import type { FieldRules } from "../gen/buf/validate/validate_pb.js";
import type { Eval } from "../eval.js";
import type { RegexMatcher } from "../func.js";

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
 * Inputs to the native rule dispatcher.
 *
 * Future phases add per-field-type evaluators here. Phase 0 wires the seam
 * but always returns `{ kind: "none" }`.
 */
export type NativeDispatchInput = {
  rules: Exclude<FieldRules["type"]["value"], undefined>;
  rulePath: PathBuilder;
  forMapKey: boolean;
  regexMatch: RegexMatcher | undefined;
};

/**
 * Decide whether the given rules submessage can be evaluated natively, and
 * return an `Eval` for the handled subset plus the set of rule fields that
 * have been claimed (so the planner skips them on the CEL path).
 *
 * Phase 0: stub. Returns `{ kind: "none" }` so the CEL path handles every
 * rule exactly as before.
 */
export function tryBuildNative(
  _input: NativeDispatchInput,
): NativeDispatchResult {
  return { kind: "none" };
}
