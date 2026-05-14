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
import { readFileSync } from "node:fs";
import { create, type DescMessage } from "@bufbuild/protobuf";
import { compileFile } from "@bufbuild/protocompile";
import { createValidator } from "../validator.js";
import type { Violation } from "../error.js";
import { pathToString } from "@bufbuild/protobuf/reflect";

const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

const native = createValidator();
const cel = createValidator({ disableNativeRules: true });

function diff(schema: DescMessage, msg: object): void {
  // biome-ignore lint/suspicious/noExplicitAny: cross-schema test helper
  const a = native.validate(schema, msg as any);
  // biome-ignore lint/suspicious/noExplicitAny: cross-schema test helper
  const b = cel.validate(schema, msg as any);
  assert.equal(a.kind, b.kind, "kind mismatch");
  const fmt = (v: Violation) => v.toString();
  assert.deepEqual(a.violations?.map(fmt), b.violations?.map(fmt));
}

function compile(proto: string): DescMessage {
  const file = compileFile(
    `
    syntax="proto3";
    import "buf/validate/validate.proto";
    import "google/protobuf/wrappers.proto";
    enum Color { COLOR_UNSPECIFIED = 0; COLOR_RED = 1; COLOR_GREEN = 2; }
    message Inner { int32 x = 1; }
    ${proto}`,
    bufCompileOptions,
  );
  // The test target is always called M; Inner is shared context.
  const m = file.messages.find((m) => m.name === "M");
  if (!m) throw new Error("test schema must define a message M");
  return m;
}

void suite("native repeated rules", () => {
  void test("repeated.min_items passes and fails", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.min_items = 2]; }`,
    );
    diff(s, create(s, { xs: [1, 2] }));
    diff(s, create(s, { xs: [1] }));
    diff(s, create(s, { xs: [] }));
  });

  void test("repeated.max_items passes and fails", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.max_items = 2]; }`,
    );
    diff(s, create(s, { xs: [1, 2] }));
    diff(s, create(s, { xs: [1, 2, 3] }));
  });

  void test("min_items + max_items together", () => {
    const s = compile(
      `message M {
        repeated int32 xs = 1 [(buf.validate.field).repeated = { min_items: 2, max_items: 4 }];
      }`,
    );
    diff(s, create(s, { xs: [1, 2, 3] }));
    diff(s, create(s, { xs: [1] }));
    diff(s, create(s, { xs: [1, 2, 3, 4, 5] }));
  });

  void suite("repeated.unique", () => {
    void test("scalar (int32)", () => {
      const s = compile(
        `message M {
          repeated int32 xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: [1, 2, 3] }));
      diff(s, create(s, { xs: [1, 2, 1] }));
      diff(s, create(s, { xs: [] }));
      diff(s, create(s, { xs: [42] }));
    });

    void test("string", () => {
      const s = compile(
        `message M {
          repeated string xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: ["a", "b", "c"] }));
      diff(s, create(s, { xs: ["a", "b", "a"] }));
    });

    void test("bytes", () => {
      const s = compile(
        `message M {
          repeated bytes xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(
        s,
        create(s, {
          xs: [new Uint8Array([1, 2]), new Uint8Array([3, 4])],
        }),
      );
      diff(
        s,
        create(s, {
          xs: [new Uint8Array([1, 2]), new Uint8Array([1, 2])],
        }),
      );
      // Lookalike sequences that differ only in one byte
      diff(
        s,
        create(s, {
          xs: [new Uint8Array([1, 2]), new Uint8Array([1, 3])],
        }),
      );
    });

    void test("enum", () => {
      const s = compile(
        `message M {
          repeated Color xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: [1, 2] }));
      diff(s, create(s, { xs: [1, 1] }));
    });

    void test("int64 (bigint)", () => {
      const s = compile(
        `message M {
          repeated int64 xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: [1n, 2n] }));
      diff(s, create(s, { xs: [1n, 1n] }));
    });

    void test("bool", () => {
      const s = compile(
        `message M {
          repeated bool xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: [true, false] }));
      diff(s, create(s, { xs: [true, true] }));
    });

    void test("message elements fall through to CEL", () => {
      // For `unique` on message-element lists, the native dispatcher returns
      // undefined for the unique field and CEL handles it. min/max_items still
      // works natively; output must still match CEL byte-for-byte.
      const s = compile(
        `message M {
          repeated Inner xs = 1 [(buf.validate.field).repeated = {
            min_items: 1, unique: true
          }];
        }`,
      );
      diff(s, create(s, { xs: [] }));
      diff(s, create(s, { xs: [{ x: 1 }] }));
    });
  });

  void test("rule path lands at repeated.min_items", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.min_items = 2]; }`,
    );
    const r = native.validate(s, create(s, { xs: [] }));
    assert.equal(r.kind, "invalid");
    assert.equal(r.violations?.length, 1);
    const v = r.violations?.[0];
    assert.ok(v);
    assert.equal(v.ruleId, "repeated.min_items");
    // The rule path is the chain inside FieldRules: repeated → min_items.
    const rulePathStr = pathToString(v.rule);
    assert.ok(
      rulePathStr.includes("min_items") || rulePathStr.includes("minItems"),
      `expected rule path to include min_items leaf, got: ${rulePathStr}`,
    );
  });
});
