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

/**
 * Number of Unicode code points in a string.
 *
 * Matches CEL's `size(string)` semantics — counting code points rather than
 * UTF-16 code units. A surrogate pair like "𝑎" counts as 1.
 */
export function codepointLength(s: string): number {
  // String iteration yields one element per code point.
  let n = 0;
  for (const _ of s) {
    n++;
  }
  return n;
}

/**
 * Format a number for inclusion in a violation message.
 *
 * Mirrors protovalidate-go's `printFloat` so error messages match the CEL
 * implementation byte-for-byte.
 */
export function printFloat(n: number): string {
  if (Number.isNaN(n)) {
    return "NaN";
  }
  if (n === Number.POSITIVE_INFINITY) {
    return "Infinity";
  }
  if (n === Number.NEGATIVE_INFINITY) {
    return "-Infinity";
  }
  return n.toString();
}
