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
import type { Path, PathBuilder, ReflectMap } from "@bufbuild/protobuf/reflect";
import type { Cursor } from "../cursor.js";
import type { Eval } from "../eval.js";
import {type MapRules, MapRulesSchema} from "../gen/buf/validate/validate_pb.js";

const F = MapRulesSchema.field;

/**
 * Internal dispatch result for map-shaped native handlers.
 *
 * @internal
 */
export type MapNativeResult = {
  eval: Eval<ReflectMap>;
  handledFields: ReadonlySet<DescField>;
};

type SizeRule = { readonly val: bigint; readonly path: Path };

class EvalNativeMapRules implements Eval<ReflectMap> {
  constructor(
    private readonly minPairsRule: SizeRule | undefined,
    private readonly maxPairsRule: SizeRule | undefined,
  ) {}

  eval(val: ReflectMap, cursor: Cursor): void {
    const size = BigInt(val.size);

    if (this.minPairsRule !== undefined && size < this.minPairsRule.val) {
      cursor.violate(
        `map must be at least ${this.minPairsRule.val} entries`,
        "map.min_pairs",
        this.minPairsRule.path,
      );
    }

    if (this.maxPairsRule !== undefined && size > this.maxPairsRule.val) {
      cursor.violate(
        `map must be at most ${this.maxPairsRule.val} entries`,
        "map.max_pairs",
        this.maxPairsRule.path,
      );
    }
  }

  prune(): boolean {
    return false;
  }
}

/**
 * Try to build a native evaluator for MapRules (min_pairs, max_pairs).
 * Returns `undefined` if no native handler applies.
 */
export function tryBuildNativeMapRules(
  rules: MapRules,
  rulePath: PathBuilder,
): MapNativeResult | undefined {
  if (rules.$unknown && rules.$unknown.length > 0) {
    return undefined;
  }

  const handled = new Set<DescField>();

  let minPairsRule: SizeRule | undefined;
  if (isFieldSet(rules, F.minPairs)) {
    minPairsRule = {
      val: rules.minPairs,
      path: rulePath.clone().field(F.minPairs).toPath(),
    };
    handled.add(F.minPairs);
  }

  let maxPairsRule: SizeRule | undefined;
  if (isFieldSet(rules, F.maxPairs)) {
    maxPairsRule = {
      val: rules.maxPairs,
      path: rulePath.clone().field(F.maxPairs).toPath(),
    };
    handled.add(F.maxPairs);
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeMapRules(minPairsRule, maxPairsRule),
    handledFields: handled,
  };
}
