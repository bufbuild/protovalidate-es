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

import { isFieldSet } from "@bufbuild/protobuf";
import type {
  Path,
  PathBuilder,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import type { Cursor } from "../cursor.js";
import type { Eval } from "../eval.js";
import type { BoolRules } from "../gen/buf/validate/validate_pb.js";
import { boolConstDesc } from "./sites.js";
import type { ScalarNativeResult } from "./dispatcher.js";

/**
 * Native evaluator for `bool.const`.
 *
 * Bool only supports the `const` rule. Anything else on a BoolRules instance
 * falls through to CEL via the dispatcher.
 */
class EvalNativeBoolRules implements Eval<ScalarValue> {
  constructor(
    private readonly forMapKey: boolean,
    private readonly constVal: boolean,
    private readonly rulePath: Path,
  ) {}

  eval(val: ScalarValue, cursor: Cursor): void {
    if ((val as boolean) !== this.constVal) {
      cursor.violate(
        `must equal ${this.constVal}`,
        "bool.const",
        this.rulePath,
        this.forMapKey,
      );
    }
  }

  prune(): boolean {
    return false;
  }
}

/**
 * Try to build a native evaluator for BoolRules. Returns `undefined` if no
 * native handler applies (no const set, or unknown extensions present).
 */
export function tryBuildNativeBoolRules(
  rules: BoolRules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult | undefined {
  if (rules.$unknown && rules.$unknown.length > 0) {
    return undefined;
  }
  if (!isFieldSet(rules, boolConstDesc)) {
    return undefined;
  }
  const path = rulePath.clone().field(boolConstDesc).toPath();
  return {
    eval: new EvalNativeBoolRules(forMapKey, rules.const, path),
    handledFields: new Set([boolConstDesc]),
  };
}
