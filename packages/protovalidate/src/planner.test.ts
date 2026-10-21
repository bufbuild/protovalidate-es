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
import { createValidator } from "./validator.js";

const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

function compileMessages(source: string): Map<string, DescMessage> {
  const file = compileFile(source, bufCompileOptions);
  return new Map(file.messages.map((m) => [m.name, m]));
}

function violationCount(
  result: ReturnType<ReturnType<typeof createValidator>["validate"]>,
): number {
  return result.kind === "invalid" ? result.violations.length : -1;
}

// Counts reads of a message field, to tell whether validation visited it.
function countReads(message: object, localName: string): () => number {
  let reads = 0;
  const value: unknown = (message as Record<string, unknown>)[localName];
  Object.defineProperty(message, localName, {
    get() {
      reads++;
      return value;
    },
  });
  return () => reads;
}

// The planner caches an empty plan for the type it visits first, then plans
// the other while the first is still being built.
void suite("mutually recursive plans", () => {
  const types = compileMessages(
    `syntax = "proto3";
     import "buf/validate/validate.proto";
     message A { B b = 1; }
     message B { A a = 1; int32 v = 2 [(buf.validate.field).int32.gt = 100]; }`,
  );
  const a = types.get("A") as DescMessage;
  const b = types.get("B") as DescMessage;

  void test("validate the back-reference at every depth (root A)", () => {
    // Every `v` is 5, which fails int32.gt(100). Each depth must be reported.
    const depth2 = create(a, { b: { v: 5, a: { b: { v: 5 } } } });
    assert.strictEqual(
      violationCount(createValidator().validate(a, depth2)),
      2,
    );
    const depth3 = create(a, {
      b: { v: 5, a: { b: { v: 5, a: { b: { v: 5 } } } } },
    });
    assert.strictEqual(
      violationCount(createValidator().validate(a, depth3)),
      3,
    );
  });

  void test("validate the back-reference regardless of which type is the root", () => {
    const message = create(b, { v: 5, a: { b: { v: 5 } } });
    assert.strictEqual(
      violationCount(createValidator().validate(b, message)),
      2,
    );
  });

  void test("do not report a violation when the recursive values are valid", () => {
    const message = create(a, { b: { v: 101, a: { b: { v: 101 } } } });
    assert.strictEqual(createValidator().validate(a, message).kind, "valid");
  });
});

void suite("pruning message fields", () => {
  void test("skip a field whose message type has no rules", () => {
    const types = compileMessages(
      `syntax = "proto3";
       import "buf/validate/validate.proto";
       message Root {
         string name = 1 [(buf.validate.field).string.min_len = 1];
         Mid mid = 2;
       }
       message Mid { Leaf leaf = 1; string s = 2; }
       message Leaf { int32 v = 1; }`,
    );
    const root = types.get("Root") as DescMessage;
    const message = create(root, { name: "n", mid: { leaf: { v: 1 } } });
    const reads = countReads(message, "mid");
    assert.strictEqual(createValidator().validate(root, message).kind, "valid");
    assert.strictEqual(reads(), 0);
  });

  void test("keep a field whose message type is a rule-free cycle", () => {
    const types = compileMessages(
      `syntax = "proto3";
       import "buf/validate/validate.proto";
       message Root {
         string name = 1 [(buf.validate.field).string.min_len = 1];
         Node node = 2;
       }
       message Node { Node next = 1; }`,
    );
    const root = types.get("Root") as DescMessage;
    const message = create(root, { name: "", node: { next: { next: {} } } });
    const reads = countReads(message, "node");
    assert.strictEqual(
      violationCount(createValidator().validate(root, message)),
      1,
    );
    assert.ok(reads() > 0);
  });

  void test("skip rule-free Struct, Value and ListValue fields", () => {
    const types = compileMessages(
      `syntax = "proto3";
       import "buf/validate/validate.proto";
       import "google/protobuf/struct.proto";
       message Root {
         string name = 1 [(buf.validate.field).string.min_len = 1];
         google.protobuf.Struct struct = 2;
         google.protobuf.Value value = 3;
         google.protobuf.ListValue list = 4;
       }`,
    );
    const root = types.get("Root") as DescMessage;
    const message = create(root, {
      name: "",
      struct: { a: { b: [1, "x"] } },
      value: { kind: { case: "stringValue", value: "x" } },
      list: { values: [{ kind: { case: "boolValue", value: true } }] },
    } as never);
    const reads = ["struct", "value", "list"].map((f) =>
      countReads(message, f),
    );
    assert.strictEqual(
      violationCount(createValidator().validate(root, message)),
      1,
    );
    assert.deepStrictEqual(
      reads.map((r) => r()),
      [0, 0, 0],
    );
  });

  void test("validate a non-standard ListValue that declares rules", () => {
    const types = compileMessages(
      `syntax = "proto3";
       package google.protobuf;
       import "buf/validate/validate.proto";
       message Struct { map<string, Value> fields = 1; }
       message Value {
         oneof kind {
           string string_value = 3;
           Struct struct_value = 5;
           ListValue list_value = 6;
         }
       }
       message ListValue {
         repeated Value values = 1 [(buf.validate.field).repeated.max_items = 1];
       }
       message Root { ListValue list = 1; }`,
    );
    const root = types.get("Root") as DescMessage;
    const item = { kind: { case: "stringValue", value: "x" } };
    const message = create(root, { list: { values: [item, item] } } as never);
    assert.strictEqual(
      violationCount(createValidator().validate(root, message)),
      1,
    );
  });

  void test(
    "plan a shared chain of message types in linear time",
    { timeout: 15_000 },
    () => {
      // Each M{i} has two required fields of type M{i+1}, so a prune that
      // descended into shared plans would do 2^n work.
      const n = 26;
      let src = `syntax = "proto3"; import "buf/validate/validate.proto";\n`;
      for (let i = 0; i < n; i++) {
        src += `message M${i} {
          M${i + 1} a = 1 [(buf.validate.field).required = true];
          M${i + 1} b = 2 [(buf.validate.field).required = true];
        }\n`;
      }
      src += `message M${n} {}\n`;
      const m0 = compileMessages(src).get("M0") as DescMessage;
      const start = performance.now();
      const result = createValidator().validate(m0, create(m0));
      assert.ok(performance.now() - start < 3_000, "planning was not linear");
      assert.strictEqual(violationCount(result), 2);
    },
  );
});
