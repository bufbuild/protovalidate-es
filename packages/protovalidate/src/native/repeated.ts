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
import {type RepeatedRules, RepeatedRulesSchema} from "../gen/buf/validate/validate_pb.js";

/**
 * Internal dispatch result for list-shaped native handlers.
 *
 * @internal
 */
export type ListNativeResult = {
  eval: Eval<ReflectList>;
  handledFields: ReadonlySet<DescField>;
};

type UniqueKind = "scalar" | "bytes" | "enum";

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

function isUnique(list: ReflectList, kind: UniqueKind): boolean {
  if (list.size <= 1) return true;
  if (kind === "bytes") {
    const seen = new Set<string>();
    for (const item of list) {
      const key = bytesKey(item as Uint8Array);
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  }
  // scalar (number/bigint/string/boolean) and enum (number) — strict-equal Set works.
  const seen = new Set<unknown>();
  for (const item of list) {
    if (seen.has(item)) return false;
    seen.add(item);
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
      return field.scalar === ScalarType.BYTES ? "bytes" : "scalar";
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
  if (isFieldSet(rules, RepeatedRulesSchema.field.minItems)) {
    minItemsRule = {
      val: rules.minItems,
      path: rulePath.clone().field(RepeatedRulesSchema.field.minItems).toPath(),
    };
    handled.add(RepeatedRulesSchema.field.minItems);
  }

  let maxItemsRule: SizeRule | undefined;
  if (isFieldSet(rules, RepeatedRulesSchema.field.maxItems)) {
    maxItemsRule = {
      val: rules.maxItems,
      path: rulePath.clone().field(RepeatedRulesSchema.field.maxItems).toPath(),
    };
    handled.add(RepeatedRulesSchema.field.maxItems);
  }

  let uniqueRule: UniqueRule | undefined;
  if (isFieldSet(rules, RepeatedRulesSchema.field.unique)) {
    if (!rules.unique) {
      // Explicit `unique: false` is a no-op rule. Claim the field so CEL
      // doesn't bother re-evaluating it. Matches numeric.ts's treatment of
      // `finite: false`.
      handled.add(RepeatedRulesSchema.field.unique);
    } else if (listField !== undefined) {
      const kind = uniqueKindForListField(listField);
      if (kind !== undefined) {
        uniqueRule = {
          kind,
          path: rulePath.clone().field(RepeatedRulesSchema.field.unique).toPath(),
        };
        handled.add(RepeatedRulesSchema.field.unique);
      }
      // When `kind === undefined` (message-element list with unique:true) we
      // deliberately do NOT claim the unique field; CEL handles it.
      //
      // protovalidate-go bails the entire RepeatedRules handler in this case
      // — releasing min/max_items back to CEL too — to keep ownership
      // all-or-nothing. We split ownership instead because in TS the
      // partial-claim cost is zero and unique on message elements is
      // uncommon. Conformance with the CEL path holds in both shapes.
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
