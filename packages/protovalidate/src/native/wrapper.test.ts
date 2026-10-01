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
import { create } from "@bufbuild/protobuf";
import { assertRuleIdOrder, compile, diff } from "./testing.js";

// Wrapper fields run field-level cel/cel_expression rules against the
// unwrapped value. Each must run once, alongside any standard rule.
void suite("native wrapper rules", () => {
  const custom = `cel: { id: "custom" message: "must be greater than 100" expression: "this > 100" }`;

  void test("standard and custom rules each report once", () => {
    const s = compile(
      `message M {
        google.protobuf.Int32Value v = 1 [(buf.validate.field) = { int32: {gt: 10} ${custom} }];
      }`,
    );
    // Singular wrapper fields are unboxed in protobuf-es.
    diff(s, create(s, { v: 5 }));
    assertRuleIdOrder(s, create(s, { v: 5 }), ["custom", "int32.gt"]);
    assertRuleIdOrder(s, create(s, { v: 50 }), ["custom"]);
  });

  void test("custom rule alone reports once", () => {
    const s = compile(
      `message M {
        google.protobuf.Int32Value v = 1 [(buf.validate.field) = { ${custom} }];
      }`,
    );
    assertRuleIdOrder(s, create(s, { v: 5 }), ["custom"]);
  });

  void test("cel_expression and standard rule each report once", () => {
    const expr = "this > 100 ? '' : 'must be greater than 100'";
    const s = compile(
      `message M {
        google.protobuf.Int32Value v = 1 [(buf.validate.field) = {
          int32: {gt: 10} cel_expression: "${expr}"
        }];
      }`,
    );
    assertRuleIdOrder(s, create(s, { v: 5 }), [expr, "int32.gt"]);
  });

  void test("repeated items: standard and custom rules each report once", () => {
    const s = compile(
      `message M {
        repeated google.protobuf.Int32Value vs = 1 [(buf.validate.field).repeated.items = {
          int32: {gt: 10} ${custom}
        }];
      }`,
    );
    diff(s, create(s, { vs: [{ value: 5 }] }));
    assertRuleIdOrder(s, create(s, { vs: [{ value: 5 }] }), [
      "custom",
      "int32.gt",
    ]);
  });
});
