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
import { compileFile } from "@bufbuild/protocompile";
import { CompilationError } from "./error.js";
import { createValidator } from "./validator.js";

const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

// Outer's oneof rule names a missing field, so planning Outer fails after Inner
// is planned. Inner.outer is required so its back-reference is never pruned.
function compileSchemas(): { outer: DescMessage; inner: DescMessage } {
  const file = compileFile(
    `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      message Outer {
        option (buf.validate.message).oneof = { fields: ["missing"] };
        Inner inner = 1;
      }
      message Inner {
        Outer outer = 1 [(buf.validate.field).required = true];
      }
    `,
    bufCompileOptions,
  );
  return { outer: file.messages[0], inner: file.messages[1] };
}

void suite("compilation error in a recursive message", () => {
  void test("is reported for Inner when Inner is planned first", () => {
    const { outer, inner } = compileSchemas();
    const validator = createValidator();
    const message = create(inner, { outer: create(outer) });
    const result = validator.validate(inner, message);
    assert.strictEqual(result.kind, "error");
    assert.ok(result.error instanceof CompilationError);
  });

  void test("is reported for Inner after Outer failed to plan", () => {
    const { outer, inner } = compileSchemas();
    const validator = createValidator();
    const outerResult = validator.validate(outer, create(outer));
    assert.strictEqual(outerResult.kind, "error");
    assert.ok(outerResult.error instanceof CompilationError);

    const message = create(inner, { outer: create(outer) });
    const result = validator.validate(inner, message);
    assert.strictEqual(result.kind, "error");
    assert.ok(result.error instanceof CompilationError);
  });

  void test("is reported for Outer on every validation", () => {
    const { outer } = compileSchemas();
    const validator = createValidator();
    for (let i = 0; i < 2; i++) {
      const result = validator.validate(outer, create(outer));
      assert.strictEqual(result.kind, "error");
      assert.ok(result.error instanceof CompilationError);
    }
  });
});
