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

import * as assert from "node:assert";
import { readFileSync } from "node:fs";
import { suite, test } from "node:test";
import { create, type DescMessage } from "@bufbuild/protobuf";
import { compileMessage } from "@bufbuild/protocompile";
import { containsBytes } from "./native/bytes.js";
import { createValidator } from "./validator.js";

const enc = new TextEncoder();
const b = (s: string) => enc.encode(s);

void suite("containsBytes (shared by native and CEL)", () => {
  void test("basic containment", () => {
    assert.strictEqual(containsBytes(b("hello world"), b("o w")), true);
    assert.strictEqual(containsBytes(b("hello world"), b("hello")), true); // start
    assert.strictEqual(containsBytes(b("hello world"), b("world")), true); // end
    assert.strictEqual(containsBytes(b("hello world"), b("xyz")), false);
    assert.strictEqual(containsBytes(b("abc"), b("")), true); // empty needle
    assert.strictEqual(containsBytes(b("ab"), b("abc")), false); // needle longer
    assert.strictEqual(containsBytes(b("abcabc"), b("abcabc")), true); // equal
  });

  // Needles longer than the naive threshold take the KMP path; check it finds
  // matches at every position and handles overlapping prefixes correctly.
  void test("long-needle (KMP) path is correct", () => {
    const needle = b(`${"ab".repeat(20)}Z`); // 41 bytes, > 32
    assert.strictEqual(
      containsBytes(b(`xx${"ab".repeat(20)}Z!!`), needle),
      true,
    );
    assert.strictEqual(containsBytes(b("ab".repeat(100)), needle), false); // prefix, never the Z
    assert.strictEqual(containsBytes(needle, needle), true);
    // Overlapping pattern: needle "aaaa...aab" against "aaaa...aab".
    const overlap = b(`${"a".repeat(40)}b`);
    assert.strictEqual(containsBytes(b(`${"a".repeat(50)}b`), overlap), true);
    assert.strictEqual(containsBytes(b("a".repeat(200)), overlap), false);
  });

  // Native and CEL both route through containsBytes; prove it directly for a
  // needle on each side of the threshold.
  void test("agrees for short and long needles", () => {
    for (const n of [5, 40]) {
      const needle = "a".repeat(n);
      assert.strictEqual(containsBytes(b(`z${needle}z`), b(needle)), true);
      assert.strictEqual(containsBytes(b("a".repeat(n - 1)), b(needle)), false);
    }
  });
});

const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

function containsSchema(needle: string): DescMessage {
  return compileMessage(
    `syntax = "proto3";
     import "buf/validate/validate.proto";
     message M { bytes h = 1 [(buf.validate.field).bytes.contains = "${needle}"]; }`,
    bufCompileOptions,
  );
}

void suite("bytes.contains native and CEL", () => {
  const native = createValidator();
  const cel = createValidator({ disableNativeRules: true });

  void test("native and CEL agree", () => {
    const schema = containsSchema("needle");
    const has = create(schema, { h: b("a needle here") });
    const hasNot = create(schema, { h: b("nothing") });
    for (const v of [native, cel]) {
      assert.strictEqual(v.validate(schema, has).kind, "valid");
      assert.strictEqual(v.validate(schema, hasNot).kind, "invalid");
    }
  });

  // Regression guard: a long needle with a long matching prefix and a final
  // mismatch was O(n*m). KMP makes it O(n+m); an O(n*m) scan would not finish
  // within the timeout.
  void test(
    "stays linear for a long needle with matching prefixes",
    { timeout: 10_000 },
    () => {
      const schema = containsSchema("a".repeat(8000) + "b");
      const haystack = create(schema, {
        h: new Uint8Array(2_000_000).fill(0x61),
      }); // "a" * 2e6
      for (const v of [native, cel]) {
        assert.strictEqual(v.validate(schema, haystack).kind, "invalid");
      }
    },
  );
});
