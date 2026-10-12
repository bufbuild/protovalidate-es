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
import { createValidator, defaultMaxViolations } from "./validator.js";

const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

// A repeated field where every item fails its rule, so a list of n items
// produces n violations.
function failingList(n: number): { schema: DescMessage; message: unknown } {
  const schema = compileMessage(
    `syntax = "proto3";
     import "buf/validate/validate.proto";
     message M {
       repeated int32 xs = 1 [(buf.validate.field).repeated.items.int32.gt = 100];
     }`,
    bufCompileOptions,
  );
  const message = create(schema, { xs: new Array(n).fill(0) });
  return { schema, message };
}

function count(
  result: ReturnType<ReturnType<typeof createValidator>["validate"]>,
) {
  return result.kind === "invalid" ? result.violations.length : -1;
}

void suite("maxViolations", () => {
  void test("caps the number of collected violations", () => {
    const { schema, message } = failingList(10_000);
    const result = createValidator({ maxViolations: 5 }).validate(
      schema,
      message,
    );
    assert.strictEqual(result.kind, "invalid");
    assert.strictEqual(count(result), 5);
  });

  void test("applies defaultMaxViolations when unset", () => {
    const { schema, message } = failingList(defaultMaxViolations + 500);
    const result = createValidator().validate(schema, message);
    assert.strictEqual(count(result), defaultMaxViolations);
  });

  void test("collects everything when set to Infinity", () => {
    const { schema, message } = failingList(defaultMaxViolations + 500);
    const result = createValidator({
      maxViolations: Number.POSITIVE_INFINITY,
    }).validate(schema, message);
    assert.strictEqual(count(result), defaultMaxViolations + 500);
  });

  void test("does not affect messages under the limit", () => {
    const { schema, message } = failingList(3);
    const result = createValidator({ maxViolations: 1000 }).validate(
      schema,
      message,
    );
    assert.strictEqual(count(result), 3);
  });

  void test("failFast still stops at the first violation", () => {
    const { schema, message } = failingList(10_000);
    const result = createValidator({
      failFast: true,
      maxViolations: 1000,
    }).validate(schema, message);
    assert.strictEqual(count(result), 1);
  });
});
