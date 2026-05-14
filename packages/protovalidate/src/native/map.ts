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
import type { MapRules } from "../gen/buf/validate/validate_pb.js";
import { mapDescs } from "./sites.js";

/**
 * Internal dispatch result for map-shaped native handlers.
 */
export type MapNativeResult = {
  eval: Eval<ReflectMap>;
  handledFields: ReadonlySet<DescField>;
};

class EvalNativeMapRules implements Eval<ReflectMap> {
  constructor(
    private readonly minPairs: bigint | undefined,
    private readonly minPairsPath: Path | undefined,
    private readonly maxPairs: bigint | undefined,
    private readonly maxPairsPath: Path | undefined,
  ) {}

  eval(val: ReflectMap, cursor: Cursor): void {
    const size = BigInt(val.size);

    if (this.minPairs !== undefined && size < this.minPairs) {
      cursor.violate(
        `map must be at least ${this.minPairs} entries`,
        "map.min_pairs",
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever minPairs is set
        this.minPairsPath!,
      );
    }

    if (this.maxPairs !== undefined && size > this.maxPairs) {
      cursor.violate(
        `map must be at most ${this.maxPairs} entries`,
        "map.max_pairs",
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever maxPairs is set
        this.maxPairsPath!,
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

  let minPairs: bigint | undefined;
  let minPairsPath: Path | undefined;
  if (isFieldSet(rules, mapDescs.minPairs)) {
    minPairs = rules.minPairs;
    minPairsPath = rulePath.clone().field(mapDescs.minPairs).toPath();
    handled.add(mapDescs.minPairs);
  }

  let maxPairs: bigint | undefined;
  let maxPairsPath: Path | undefined;
  if (isFieldSet(rules, mapDescs.maxPairs)) {
    maxPairs = rules.maxPairs;
    maxPairsPath = rulePath.clone().field(mapDescs.maxPairs).toPath();
    handled.add(mapDescs.maxPairs);
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeMapRules(
      minPairs,
      minPairsPath,
      maxPairs,
      maxPairsPath,
    ),
    handledFields: handled,
  };
}
