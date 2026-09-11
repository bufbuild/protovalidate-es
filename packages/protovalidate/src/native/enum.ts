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

import { type DescField, isFieldSet } from "@bufbuild/protobuf";
import type {
  Path,
  PathBuilder,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import type { Cursor } from "../cursor.js";
import type { Eval } from "../eval.js";
import {
  type EnumRules,
  EnumRulesSchema,
} from "../gen/buf/validate/validate_pb.js";
import type { ScalarNativeResult } from "./dispatcher.js";
import { formatList } from "./format.js";

const F = EnumRulesSchema.field;

type ConstRule = { readonly val: number; readonly path: Path };
type ListRule = { readonly vals: readonly number[]; readonly path: Path };

/**
 * Native evaluator for the `enum.const`, `enum.in`, and `enum.not_in` rules.
 *
 * `enum.defined_only` keeps its existing dedicated evaluator (`EvalEnumDefinedOnly`).
 */
class EvalNativeEnumRules implements Eval<ScalarValue> {
  constructor(
    private readonly forMapKey: boolean,
    private readonly constRule: ConstRule | undefined,
    private readonly inRule: ListRule | undefined,
    private readonly notInRule: ListRule | undefined,
  ) {}

  eval(val: ScalarValue, cursor: Cursor): void {
    const v = val as number;

    if (this.constRule !== undefined && v !== this.constRule.val) {
      cursor.violate(
        `must equal ${this.constRule.val}`,
        "enum.const",
        this.constRule.path,
        this.forMapKey,
      );
    }

    if (this.inRule !== undefined && !contains(this.inRule.vals, v)) {
      cursor.violate(
        `must be in list ${formatList(this.inRule.vals, String)}`,
        "enum.in",
        this.inRule.path,
        this.forMapKey,
      );
    }

    if (this.notInRule !== undefined && contains(this.notInRule.vals, v)) {
      cursor.violate(
        `must not be in list ${formatList(this.notInRule.vals, String)}`,
        "enum.not_in",
        this.notInRule.path,
        this.forMapKey,
      );
    }
  }

  prune(): boolean {
    return false;
  }
}

function contains(arr: readonly number[], v: number): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === v) return true;
  }
  return false;
}

/**
 * Try to build a native evaluator for EnumRules. Returns `undefined` if no
 * native handler applies (no const/in/not_in set, or unknown extensions).
 *
 * `defined_only` is intentionally not handled here — `EvalEnumDefinedOnly`
 * keeps that path.
 */
export function tryBuildNativeEnumRules(
  rules: EnumRules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult | undefined {
  if (rules.$unknown && rules.$unknown.length > 0) {
    return undefined;
  }

  const handled = new Set<DescField>();

  let constRule: ConstRule | undefined;
  if (isFieldSet(rules, F.const)) {
    constRule = {
      val: rules.const,
      path: rulePath.clone().field(F.const).toPath(),
    };
    handled.add(F.const);
  }

  let inRule: ListRule | undefined;
  if (rules.in.length > 0) {
    inRule = {
      vals: rules.in,
      path: rulePath.clone().field(F.in).toPath(),
    };
    handled.add(F.in);
  }

  let notInRule: ListRule | undefined;
  if (rules.notIn.length > 0) {
    notInRule = {
      vals: rules.notIn,
      path: rulePath.clone().field(F.notIn).toPath(),
    };
    handled.add(F.notIn);
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeEnumRules(forMapKey, constRule, inRule, notInRule),
    handledFields: handled,
  };
}
