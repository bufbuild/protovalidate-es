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

import { isCelUint } from "@bufbuild/cel";
import { bytesEqual } from "./native/bytes.js";

// At and below this length, uniqueness is checked with an O(n^2) scan over a
// cached copy of the list rather than a Set. For short lists the scan wins: it
// skips allocating the Set and hashing every element, and for bytes it skips
// building a string key per element. Mirrors protovalidate-go's
// uniqueLinearThreshold.
const uniqueLinearThreshold = 16;

// Sentinel key for NaN. It is skipped rather than inserted, so every NaN counts
// as distinct even though a Set's SameValueZero would treat NaN as equal.
const nan = Symbol("nan");

/**
 * A list that can be read by index. Both `@bufbuild/protobuf/reflect`'s
 * `ReflectList` and `@bufbuild/cel`'s `CelList` satisfy this shape.
 */
export interface IndexedList {
  readonly size: number;
  get(index: number): unknown;
}

/**
 * Returns true if every element of the list is distinct, in O(n) for large
 * lists. Shared by the native `repeated.unique` evaluator and the CEL
 * `unique()` function so both decide uniqueness identically.
 *
 * Every value space either path produces is handled: numbers (every NaN is
 * distinct, and `-0`/`0` collide), bigint, string, boolean, CEL uint wrappers
 * (compared by value), and byte arrays (compared by contents). Object elements
 * fall back to identity. This matches protovalidate-go and protovalidate-java.
 */
export function isUnique(list: IndexedList): boolean {
  const n = list.size;
  if (n <= 1) {
    return true;
  }
  if (n <= uniqueLinearThreshold) {
    // A proto repeated field is homogeneous, so the first element decides the
    // comparison for the whole list. Byte lists compare by contents and get a
    // dedicated loop; everything else compares with uniqueEquals.
    const first = list.get(0);
    if (first instanceof Uint8Array) {
      const seen: Uint8Array[] = [first];
      for (let i = 1; i < n; i++) {
        const a = list.get(i) as Uint8Array;
        for (let j = 0; j < i; j++) {
          if (bytesEqual(seen[j], a)) {
            return false;
          }
        }
        seen[i] = a;
      }
      return true;
    }
    const seen: unknown[] = [first];
    for (let i = 1; i < n; i++) {
      const a = list.get(i);
      for (let j = 0; j < i; j++) {
        if (uniqueEquals(a, seen[j])) {
          return false;
        }
      }
      seen[i] = a;
    }
    return true;
  }
  const seen = new Set<unknown>();
  let added = 0;
  for (let i = 0; i < n; i++) {
    const key = uniqueKey(list.get(i));
    if (key === nan) {
      continue;
    }
    seen.add(key);
    // If the Set did not grow, this key was already present.
    if (seen.size !== ++added) {
      return false;
    }
  }
  return true;
}

function uniqueKey(value: unknown): unknown {
  switch (typeof value) {
    case "number":
      return Number.isNaN(value) ? nan : value;
    case "object":
      if (value instanceof Uint8Array) {
        return bytesKey(value);
      }
      if (isCelUint(value)) {
        return value.value;
      }
      return value;
    default:
      // bigint, string, boolean
      return value;
  }
}

function uniqueEquals(a: unknown, b: unknown): boolean {
  // Only object values need the structural comparisons; numbers (NaN never
  // equals itself, so every NaN is distinct; `-0 === 0`, so signed zeros
  // collide), bigint, string, and boolean compare strictly.
  if (typeof a === "object" && a !== null) {
    if (a instanceof Uint8Array) {
      return b instanceof Uint8Array && bytesEqual(a, b);
    }
    if (isCelUint(a)) {
      return isCelUint(b) && a.value === b.value;
    }
  }
  return a === b;
}

// A deterministic string key for a Uint8Array: each byte becomes one UTF-16
// code unit, so equal byte sequences produce equal keys.
function bytesKey(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}
