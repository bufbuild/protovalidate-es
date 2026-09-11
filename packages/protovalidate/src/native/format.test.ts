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

import { suite, test } from "node:test";
import * as assert from "node:assert/strict";
import { codepointLength, printFloat, utf8ByteLength } from "./format.js";

void suite("codepointLength", () => {
  void test("counts ASCII as one per char", () => {
    assert.strictEqual(codepointLength(""), 0);
    assert.strictEqual(codepointLength("a"), 1);
    assert.strictEqual(codepointLength("abc"), 3);
  });

  void test("counts surrogate pair as one code point", () => {
    // U+1D44E MATHEMATICAL ITALIC SMALL A → surrogate pair "𝑎"
    const s = "𝑎";
    assert.strictEqual(s.length, 2);
    assert.strictEqual(codepointLength(s), 1);
  });

  void test("counts combining marks separately", () => {
    // "é" as e + combining acute accent: 2 code points.
    const s = "é";
    assert.strictEqual(codepointLength(s), 2);
  });

  void test("matches CEL size() spread-based count", () => {
    const cases = ["", "x", "𝑎b", "🇺🇸", "héllo"];
    for (const s of cases) {
      assert.strictEqual(codepointLength(s), [...s].length);
    }
  });
});

void suite("utf8ByteLength", () => {
  void test("counts ASCII as one byte per char", () => {
    assert.strictEqual(utf8ByteLength(""), 0);
    assert.strictEqual(utf8ByteLength("a"), 1);
    assert.strictEqual(utf8ByteLength("abc"), 3);
  });

  void test("counts 2-, 3-, and 4-byte sequences", () => {
    assert.strictEqual(utf8ByteLength("é"), 2); // U+00E9
    assert.strictEqual(utf8ByteLength("€"), 3); // U+20AC
    assert.strictEqual(utf8ByteLength("𝑎"), 4); // U+1D44E, surrogate pair
  });

  void test("counts unpaired surrogates as U+FFFD (3 bytes)", () => {
    assert.strictEqual(utf8ByteLength("\ud800"), 3); // lone high surrogate
    assert.strictEqual(utf8ByteLength("\udc00"), 3); // lone low surrogate
    assert.strictEqual(utf8ByteLength("\ud800x"), 4); // high surrogate + ASCII
  });

  void test("matches TextEncoder for mixed inputs", () => {
    const cases = [
      "",
      "x",
      "𝑎b",
      "🇺🇸",
      "héllo",
      "߿ࠀ",
      "\ud800",
      "\udc00😀",
      "a𐀀b",
    ];
    const encoder = new TextEncoder();
    for (const s of cases) {
      assert.strictEqual(utf8ByteLength(s), encoder.encode(s).length);
    }
  });
});

void suite("printFloat", () => {
  void test("formats finite numbers via toString", () => {
    assert.strictEqual(printFloat(0), "0");
    assert.strictEqual(printFloat(1), "1");
    assert.strictEqual(printFloat(-1.5), "-1.5");
    assert.strictEqual(printFloat(1e20), "100000000000000000000");
  });

  void test("formats NaN", () => {
    assert.strictEqual(printFloat(Number.NaN), "NaN");
  });

  void test("formats +Infinity", () => {
    assert.strictEqual(printFloat(Number.POSITIVE_INFINITY), "Infinity");
  });

  void test("formats -Infinity", () => {
    assert.strictEqual(printFloat(Number.NEGATIVE_INFINITY), "-Infinity");
  });
});
