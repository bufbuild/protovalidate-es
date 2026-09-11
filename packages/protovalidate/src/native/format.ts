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
 * Number of bytes in the UTF-8 encoding of a string.
 *
 * Matches CEL's `bytes(string).size()` semantics — i.e. what
 * `new TextEncoder().encode(s).length` returns, including the replacement of
 * unpaired surrogates with U+FFFD (3 bytes) — without allocating the encoded
 * buffer.
 */
export function utf8ByteLength(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) {
      n += 1;
    } else if (c < 0x800) {
      n += 2;
    } else if (c >= 0xd800 && c < 0xdc00 && i + 1 < s.length) {
      const d = s.charCodeAt(i + 1);
      if (d >= 0xdc00 && d < 0xe000) {
        // Surrogate pair: one code point above U+FFFF, 4 bytes.
        n += 4;
        i++;
      } else {
        // Unpaired high surrogate: encoded as U+FFFD, 3 bytes.
        n += 3;
      }
    } else {
      // BMP code point at U+0800 and above, or an unpaired surrogate
      // (encoded as U+FFFD) — 3 bytes either way.
      n += 3;
    }
  }
  return n;
}

/**
 * Format a finite double for inclusion in a violation message.
 *
 * Matches what `@bufbuild/cel`'s `%s` formatter produces for a `number` — i.e.
 * `Number.prototype.toString()` — so the native and CEL evaluators emit
 * byte-identical messages today.
 *
 * NOTE: This diverges from protovalidate-go, which uses
 * `strconv.FormatFloat(v, 'f', -1, 64)` (always fixed-point). For values in
 * the JS scientific-notation zone (outside `[1e-7, 1e21)`) the TS impls
 * produce `1e+21` where Go produces `1000000000000000000000`. Both cel-es and
 * this helper need to change together to close the gap; do not "fix" one in
 * isolation. See protovalidate-es plan and the cel-es `formatFloating` impl.
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

/**
 * Format a list of values as `"[v1, v2, ...]"` for inclusion in a violation
 * message. The per-element formatter is supplied by the caller so each rule
 * family controls its own element formatting (e.g. numeric uses
 * `config.format`, enum uses `String`).
 */
export function formatList<T>(vs: readonly T[], fmt: (v: T) => string): string {
  let out = "[";
  for (let i = 0; i < vs.length; i++) {
    if (i > 0) out += ", ";
    out += fmt(vs[i] as T);
  }
  return `${out}]`;
}
