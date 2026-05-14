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
import { compileMessage } from "@bufbuild/protocompile";
import { createValidator } from "../validator.js";
import type { Violation } from "../error.js";

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
  return compileMessage(
    `
    syntax="proto3";
    import "buf/validate/validate.proto";
    ${proto}`,
    bufCompileOptions,
  );
}

void suite("native map rules", () => {
  void test("map.min_pairs passes and fails", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map.min_pairs = 2];
      }`,
    );
    diff(s, create(s, { kv: { a: 1, b: 2 } }));
    diff(s, create(s, { kv: { a: 1 } }));
    diff(s, create(s, { kv: {} }));
  });

  void test("map.max_pairs passes and fails", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map.max_pairs = 2];
      }`,
    );
    diff(s, create(s, { kv: { a: 1, b: 2 } }));
    diff(s, create(s, { kv: { a: 1, b: 2, c: 3 } }));
  });

  void test("min + max together", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map = {
          min_pairs: 1, max_pairs: 3
        }];
      }`,
    );
    diff(s, create(s, { kv: { a: 1 } }));
    diff(s, create(s, { kv: { a: 1, b: 2, c: 3 } }));
    diff(s, create(s, { kv: {} }));
    diff(s, create(s, { kv: { a: 1, b: 2, c: 3, d: 4 } }));
  });

  void test("map size rules with key/value rules together", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map = {
          min_pairs: 2,
          values: { int32: { gt: 0 } }
        }];
      }`,
    );
    diff(s, create(s, { kv: { a: 1, b: 2 } }));
    diff(s, create(s, { kv: { a: 1, b: -1 } })); // min ok, value bad
    diff(s, create(s, { kv: { a: -1 } })); // both bad
  });
});
