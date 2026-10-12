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
import { celUint } from "@bufbuild/cel";
import { create, type DescMessage } from "@bufbuild/protobuf";
import { compileMessage } from "@bufbuild/protocompile";
import { isUnique, type IndexedList } from "./unique.js";
import { createValidator } from "./validator.js";

function list(values: readonly unknown[]): IndexedList {
  return { size: values.length, get: (index) => values[index] };
}

// Runs a case through both the small-list scan and the large-list Set path by
// padding past the linear threshold with distinct fillers that never collide
// with the test values, and asserts the two paths agree.
function bothPaths(values: readonly unknown[]): boolean {
  const small = isUnique(list(values));
  const filler = Array.from({ length: 40 }, (_, i) => `__pad_${i}__`);
  const large = isUnique(list([...values, ...filler]));
  assert.strictEqual(small, large, "scan and Set paths disagree");
  return small;
}

void suite("isUnique (shared by native and CEL)", () => {
  void test("distinguishes unique from duplicate scalars", () => {
    assert.strictEqual(isUnique(list([1, 2, 3])), true);
    assert.strictEqual(isUnique(list([1, 2, 1])), false);
    assert.strictEqual(isUnique(list(["a", "b", "c"])), true);
    assert.strictEqual(isUnique(list(["a", "a"])), false);
    assert.strictEqual(isUnique(list([1n, 2n, 3n])), true);
    assert.strictEqual(isUnique(list([2n, 2n])), false);
  });

  void test("every NaN counts as distinct", () => {
    assert.strictEqual(isUnique(list([Number.NaN, Number.NaN, 1])), true);
    assert.strictEqual(bothPaths([Number.NaN, Number.NaN]), true);
  });

  void test("signed zeros collide", () => {
    assert.strictEqual(isUnique(list([-0, 0])), false);
    assert.strictEqual(bothPaths([-0, 0]), false);
  });

  void test("byte arrays compare by contents, not identity", () => {
    assert.strictEqual(
      isUnique(list([new Uint8Array([1, 2]), new Uint8Array([1, 2])])),
      false,
    );
    assert.strictEqual(
      isUnique(list([new Uint8Array([1]), new Uint8Array([2])])),
      true,
    );
    assert.strictEqual(
      bothPaths([new Uint8Array([9, 9]), new Uint8Array([9, 9])]),
      false,
    );
  });

  void test("CEL uint wrappers compare by value", () => {
    assert.strictEqual(isUnique(list([celUint(1n), celUint(1n)])), false);
    assert.strictEqual(isUnique(list([celUint(1n), celUint(2n)])), true);
  });

  void test("handles large lists", () => {
    const distinct = Array.from({ length: 50_000 }, (_, i) => i);
    assert.strictEqual(isUnique(list(distinct)), true);
    assert.strictEqual(isUnique(list([...distinct.slice(0, -1), 0])), false);
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

function uniqueSchema(type: string): DescMessage {
  return compileMessage(
    `syntax = "proto3";
     import "buf/validate/validate.proto";
     message M { repeated ${type} x = 1 [(buf.validate.field).repeated.unique = true]; }`,
    bufCompileOptions,
  );
}

void suite("repeated.unique native and CEL agree", () => {
  const native = createValidator();
  const cel = createValidator({ disableNativeRules: true });
  for (const type of [
    "int32",
    "uint32",
    "int64",
    "string",
    "bytes",
    "double",
  ]) {
    void test(type, () => {
      const schema = uniqueSchema(type);
      const value = (v: number) => {
        switch (type) {
          case "int64":
            return BigInt(v);
          case "bytes":
            return new Uint8Array([v]);
          case "string":
            return String(v);
          default:
            return v;
        }
      };
      const dup = create(schema, { x: [value(1), value(1)] } as never);
      const uniq = create(schema, { x: [value(1), value(2)] } as never);
      assert.strictEqual(native.validate(schema, dup).kind, "invalid");
      assert.strictEqual(cel.validate(schema, dup).kind, "invalid");
      assert.strictEqual(native.validate(schema, uniq).kind, "valid");
      assert.strictEqual(cel.validate(schema, uniq).kind, "valid");
    });
  }

  // Regression guard: the CEL path used to be O(n^2). At this size an O(n^2)
  // scan would not finish within the test timeout.
  void test(
    "CEL path stays linear on a large distinct list",
    { timeout: 10_000 },
    () => {
      const schema = uniqueSchema("int32");
      const message = create(schema, {
        x: Array.from({ length: 200_000 }, (_, i) => i),
      });
      assert.strictEqual(cel.validate(schema, message).kind, "valid");
    },
  );
});
