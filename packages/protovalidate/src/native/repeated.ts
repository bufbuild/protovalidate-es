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

import { type DescField, isFieldSet, ScalarType } from "@bufbuild/protobuf";
import type {
  Path,
  PathBuilder,
  ReflectList,
} from "@bufbuild/protobuf/reflect";
import type { Cursor } from "../cursor.js";
import type { Eval } from "../eval.js";
import {
  type RepeatedRules,
  RepeatedRulesSchema,
} from "../gen/buf/validate/validate_pb.js";
import { bytesEqual } from "./bytes.js";

const F = RepeatedRulesSchema.field;

/**
 * Internal dispatch result for list-shaped native handlers.
 *
 * @internal
 */
export type ListNativeResult = {
  eval: Eval<ReflectList>;
  handledFields: ReadonlySet<DescField>;
};

type UniqueKind = "scalar" | "float" | "bytes" | "enum";

type SizeRule = { readonly val: bigint; readonly path: Path };
type UniqueRule = { readonly kind: UniqueKind; readonly path: Path };

class EvalNativeRepeatedRules implements Eval<ReflectList> {
  constructor(
    private readonly minItemsRule: SizeRule | undefined,
    private readonly maxItemsRule: SizeRule | undefined,
    private readonly uniqueRule: UniqueRule | undefined,
  ) {}

  eval(val: ReflectList, cursor: Cursor): void {
    const size = BigInt(val.size);

    if (this.minItemsRule !== undefined && size < this.minItemsRule.val) {
      cursor.violate(
        `must contain at least ${this.minItemsRule.val} item(s)`,
        "repeated.min_items",
        this.minItemsRule.path,
      );
    }

    if (this.maxItemsRule !== undefined && size > this.maxItemsRule.val) {
      cursor.violate(
        `must contain no more than ${this.maxItemsRule.val} item(s)`,
        "repeated.max_items",
        this.maxItemsRule.path,
      );
    }

    if (this.uniqueRule !== undefined && !isUnique(val, this.uniqueRule.kind)) {
      cursor.violate(
        "repeated value must contain unique items",
        "repeated.unique",
        this.uniqueRule.path,
      );
    }
  }

  prune(): boolean {
    return false;
  }
}

// At and below this length, uniqueness is checked with an O(n^2) scan over a
// plain array rather than a Set. For short lists the scan wins: it skips
// allocating the Set and hashing every element, and for bytes it skips
// building a string key per element. Mirrors protovalidate-go's
// uniqueLinearThreshold.
const uniqueLinearThreshold = 16;

function isUnique(list: ReflectList, kind: UniqueKind): boolean {
  const n = list.size;
  if (n <= 1) {
    return true;
  }
  if (kind === "bytes") {
    if (n <= uniqueLinearThreshold) {
      const seen: Uint8Array[] = [];
      for (let i = 0; i < n; i++) {
        const v = list.get(i) as Uint8Array;
        for (let j = 0; j < i; j++) {
          if (bytesEqual(seen[j] as Uint8Array, v)) {
            return false;
          }
        }
        seen[i] = v;
      }
      return true;
    }
    const seen = new Set<string>();
    for (let i = 0; i < n; i++) {
      seen.add(bytesKey(list.get(i) as Uint8Array));
      if (seen.size !== i + 1) {
        return false;
      }
    }
    return true;
  }
  if (n <= uniqueLinearThreshold) {
    // `===` needs no float special-casing: NaN never equals itself, so every
    // NaN counts as distinct, and `-0 === 0`, so signed zeros collide. That
    // is exactly what protovalidate-go and protovalidate-java produce.
    const seen: unknown[] = [];
    for (let i = 0; i < n; i++) {
      const v = list.get(i);
      for (let j = 0; j < i; j++) {
        if (seen[j] === v) {
          return false;
        }
      }
      seen[i] = v;
    }
    return true;
  }
  if (kind === "float") {
    const seen = new Set<number>();
    let added = 0;
    for (let i = 0; i < n; i++) {
      const v = list.get(i) as number;
      // A Set compares with SameValueZero, under which NaN equals itself.
      // Skip NaN so this path agrees with the linear scan above.
      if (Number.isNaN(v)) continue;
      seen.add(v);
      if (seen.size !== ++added) return false;
    }
    return true;
  }
  // scalar (number/bigint/string/boolean) and enum (number) — a strict-equal
  // Set works; none of these kinds can hold NaN.
  const seen = new Set<unknown>();
  for (let i = 0; i < n; i++) {
    seen.add(list.get(i));
    if (seen.size !== i + 1) return false;
  }
  return true;
}

/**
 * Build a deterministic string key for a Uint8Array. Each byte becomes one
 * UTF-16 code unit so equal byte sequences hash to equal keys.
 */
function bytesKey(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

/**
 * Decide whether the list element type supports native unique handling.
 *
 * Message-typed elements (including WKT scalar wrappers) need protobuf-level
 * equality, which the CEL path covers. Returning undefined here signals the
 * caller to fall back to CEL for `unique`.
 */
function uniqueKindForListField(
  field: DescField & { fieldKind: "list" },
): UniqueKind | undefined {
  switch (field.listKind) {
    case "message":
      return undefined;
    case "enum":
      return "enum";
    case "scalar":
      switch (field.scalar) {
        case ScalarType.BYTES:
          return "bytes";
        case ScalarType.FLOAT:
        case ScalarType.DOUBLE:
          return "float";
        default:
          return "scalar";
      }
  }
}

/**
 * Try to build a native evaluator for RepeatedRules (list-level rules:
 * min_items, max_items, unique). Returns `undefined` if no native handler
 * applies.
 */
export function tryBuildNativeRepeatedRules(
  rules: RepeatedRules,
  rulePath: PathBuilder,
  forMapKey: boolean,
  listField: (DescField & { fieldKind: "list" }) | undefined,
): ListNativeResult | undefined {
  if (rules.$unknown && rules.$unknown.length > 0) {
    return undefined;
  }
  // Type-level invariant: the planner only routes RepeatedRules from
  // planList(), which always passes forMapKey=false. Kept as a tripwire.
  if (forMapKey) return undefined;

  const handled = new Set<DescField>();

  let minItemsRule: SizeRule | undefined;
  if (isFieldSet(rules, F.minItems)) {
    minItemsRule = {
      val: rules.minItems,
      path: rulePath.clone().field(F.minItems).toPath(),
    };
    handled.add(F.minItems);
  }

  let maxItemsRule: SizeRule | undefined;
  if (isFieldSet(rules, F.maxItems)) {
    maxItemsRule = {
      val: rules.maxItems,
      path: rulePath.clone().field(F.maxItems).toPath(),
    };
    handled.add(F.maxItems);
  }

  let uniqueRule: UniqueRule | undefined;
  if (isFieldSet(rules, F.unique)) {
    if (!rules.unique) {
      // Explicit `unique: false` is a no-op rule. Claim the field so CEL
      // doesn't bother re-evaluating it. Matches numeric.ts's treatment of
      // `finite: false`.
      handled.add(F.unique);
    } else if (listField !== undefined) {
      const kind = uniqueKindForListField(listField);
      if (kind !== undefined) {
        uniqueRule = {
          kind,
          path: rulePath.clone().field(F.unique).toPath(),
        };
        handled.add(F.unique);
      } else {
        // if we can't handle unique, don't partially handle repeated rules
        return undefined;
      }
    } else {
      // This case is not reachable (listField should never be undefined),
      // but if it is reached, we can't handle unique and shouldn't have
      // partially handled rules because they will be evaluated in a
      // different order than only CEL rules or only native rules.
      return undefined;
    }
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeRepeatedRules(minItemsRule, maxItemsRule, uniqueRule),
    handledFields: handled,
  };
}
