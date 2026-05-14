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
import type { RepeatedRules } from "../gen/buf/validate/validate_pb.js";
import { repeatedDescs } from "./sites.js";

/**
 * Internal dispatch result for list-shaped native handlers.
 */
export type ListNativeResult = {
  eval: Eval<ReflectList>;
  handledFields: ReadonlySet<DescField>;
};

type UniqueKind = "scalar" | "bytes" | "enum";

class EvalNativeRepeatedRules implements Eval<ReflectList> {
  constructor(
    private readonly minItems: bigint | undefined,
    private readonly minItemsPath: Path | undefined,
    private readonly maxItems: bigint | undefined,
    private readonly maxItemsPath: Path | undefined,
    private readonly uniqueKind: UniqueKind | undefined,
    private readonly uniquePath: Path | undefined,
  ) {}

  eval(val: ReflectList, cursor: Cursor): void {
    const size = BigInt(val.size);

    if (this.minItems !== undefined && size < this.minItems) {
      cursor.violate(
        `must contain at least ${this.minItems} item(s)`,
        "repeated.min_items",
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever minItems is set
        this.minItemsPath!,
      );
    }

    if (this.maxItems !== undefined && size > this.maxItems) {
      cursor.violate(
        `must contain no more than ${this.maxItems} item(s)`,
        "repeated.max_items",
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever maxItems is set
        this.maxItemsPath!,
      );
    }

    if (this.uniqueKind !== undefined && !isUnique(val, this.uniqueKind)) {
      cursor.violate(
        "repeated value must contain unique items",
        "repeated.unique",
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever uniqueKind is set
        this.uniquePath!,
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
    out += String.fromCharCode(bytes[i] as number);
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
 *
 * `unique` is only handled natively for scalar / enum / bytes element kinds.
 * For message-typed elements (including WKT wrapper messages), the dispatcher
 * leaves `unique` on the CEL path while still claiming min_items / max_items.
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
  // Repeated rules don't apply to map keys; the planner only routes a
  // RepeatedRules instance from planList(). Defensive guard:
  if (forMapKey) return undefined;

  const handled = new Set<DescField>();

  let minItems: bigint | undefined;
  let minItemsPath: Path | undefined;
  if (isFieldSet(rules, repeatedDescs.minItems)) {
    minItems = rules.minItems;
    minItemsPath = rulePath.clone().field(repeatedDescs.minItems).toPath();
    handled.add(repeatedDescs.minItems);
  }

  let maxItems: bigint | undefined;
  let maxItemsPath: Path | undefined;
  if (isFieldSet(rules, repeatedDescs.maxItems)) {
    maxItems = rules.maxItems;
    maxItemsPath = rulePath.clone().field(repeatedDescs.maxItems).toPath();
    handled.add(repeatedDescs.maxItems);
  }

  let uniqueKind: UniqueKind | undefined;
  let uniquePath: Path | undefined;
  if (rules.unique && listField !== undefined) {
    uniqueKind = uniqueKindForListField(listField);
    if (uniqueKind !== undefined) {
      uniquePath = rulePath.clone().field(repeatedDescs.unique).toPath();
      handled.add(repeatedDescs.unique);
    }
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeRepeatedRules(
      minItems,
      minItemsPath,
      maxItems,
      maxItemsPath,
      uniqueKind,
      uniquePath,
    ),
    handledFields: handled,
  };
}
