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

/**
 * Validate a fixture under both the native and CEL paths and assert their
 * Violation arrays are byte-identical (message + ruleId + rule path + field
 * path, via Violation.toString()).
 */
function diff(schema: DescMessage, msg: object): void {
  // biome-ignore lint/suspicious/noExplicitAny: cross-schema test helper
  const a = native.validate(schema, msg as any);
  // biome-ignore lint/suspicious/noExplicitAny: cross-schema test helper
  const b = cel.validate(schema, msg as any);
  assert.equal(a.kind, b.kind, "kind mismatch");
  const fmt = (v: Violation) => v.toString();
  assert.deepEqual(a.violations?.map(fmt), b.violations?.map(fmt));
}

void suite("native bool rules", () => {
  void suite("bool.const", () => {
    const schema = compileMessage(
      `
      syntax="proto3";
      import "buf/validate/validate.proto";
      message M {
        bool b = 1 [(buf.validate.field).bool.const = true];
      }`,
      bufCompileOptions,
    );
    void test("matches: valid", () => {
      diff(schema, create(schema, { b: true }));
    });
    void test("mismatches: invalid", () => {
      diff(schema, create(schema, { b: false }));
    });
  });

  void suite("BoolValue wrapper", () => {
    const schema = compileMessage(
      `
      syntax="proto3";
      import "buf/validate/validate.proto";
      import "google/protobuf/wrappers.proto";
      message M {
        google.protobuf.BoolValue b = 1 [(buf.validate.field).bool.const = true];
      }`,
      bufCompileOptions,
    );
    void test("inner value matches: valid", () => {
      diff(schema, create(schema, { b: true }));
    });
    void test("inner value mismatches: invalid", () => {
      diff(schema, create(schema, { b: false }));
    });
  });
});
