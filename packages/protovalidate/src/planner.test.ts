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

// A and B are mutually recursive. The planner caches an empty plan for the type
// it visits first, then plans the other and (without the fix) prunes it while
// the first is still empty, permanently dropping the back-reference.
function mutualRecursive(): { a: DescMessage; b: DescMessage } {
  const file = compileFile(
    `syntax = "proto3";
     import "buf/validate/validate.proto";
     message A { B b = 1; }
     message B { A a = 1; int32 v = 2 [(buf.validate.field).int32.gt = 100]; }`,
    bufCompileOptions,
  );
  const a = file.messages.find((m) => m.name === "A") as DescMessage;
  const b = file.messages.find((m) => m.name === "B") as DescMessage;
  return { a, b };
}

function violationCount(
  result: ReturnType<ReturnType<typeof createValidator>["validate"]>,
): number {
  return result.kind === "invalid" ? result.violations.length : -1;
}

void suite("mutually recursive plans", () => {
  void test("validate the back-reference at every depth (root A)", () => {
    const { a } = mutualRecursive();
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
    const { b } = mutualRecursive();
    const message = create(b, { v: 5, a: { b: { v: 5 } } });
    assert.strictEqual(
      violationCount(createValidator().validate(b, message)),
      2,
    );
  });

  void test("do not report a violation when the recursive values are valid", () => {
    const { a } = mutualRecursive();
    const message = create(a, { b: { v: 101, a: { b: { v: 101 } } } });
    assert.strictEqual(createValidator().validate(a, message).kind, "valid");
  });
});

void suite("pruning rule-free cycles and dense graphs", () => {
  void test("a rule-free google.protobuf.Struct field is never walked", () => {
    const M = compileFile(
      `syntax = "proto3";
       import "buf/validate/validate.proto";
       import "google/protobuf/struct.proto";
       message M {
         string name = 1 [(buf.validate.field).string.min_len = 1];
         google.protobuf.Struct meta = 2;
       }`,
      bufCompileOptions,
    ).messages.find((m) => m.name === "M") as DescMessage;

    // Struct, Value and ListValue form a rule-free cycle. Its plan must prune to
    // nothing so validation cost is independent of the Struct's size.
    const leaf = () => ({ kind: { case: "stringValue", value: "x" } });
    const nest = (d: number): unknown =>
      d === 0
        ? leaf()
        : {
            kind: {
              case: "structValue",
              value: { fields: { a: nest(d - 1), b: nest(d - 1) } },
            },
          };
    const fields: Record<string, unknown> = {};
    for (let i = 0; i < 2000; i++) {
      fields[`k${i}`] = nest(4);
    }
    const big = create(M, { name: "n", meta: { fields } } as never);

    const v = createValidator();
    v.validate(M, big);
    const start = performance.now();
    for (let i = 0; i < 20; i++) {
      v.validate(M, big);
    }
    // Walking the whole Struct 20 times took seconds; pruned it is ~0ms.
    assert.ok(performance.now() - start < 500, "the Struct field was walked");

    // The live rule still fires and the Struct contributes no violation.
    assert.strictEqual(v.validate(M, big).kind, "valid");
    const bad = create(M, { name: "", meta: { fields } } as never);
    assert.strictEqual(violationCount(v.validate(M, bad)), 1);
  });

  void test(
    "planning stays linear for a densely interconnected graph",
    { timeout: 15_000 },
    () => {
      const n = 6;
      let src = `syntax = "proto3"; import "buf/validate/validate.proto";\n`;
      for (let i = 0; i < n; i++) {
        src += `message M${i} { int32 v = 1 [(buf.validate.field).int32.gt = 0];`;
        for (let j = 0; j < n; j++) {
          src += ` M${j} f${j} = ${j + 2};`;
        }
        src += " }\n";
      }
      const m0 = compileFile(src, bufCompileOptions).messages[0] as DescMessage;
      // The first validate plans and prunes the whole graph; before the fixpoint
      // prune this did not terminate for n >= 5.
      const start = performance.now();
      createValidator().validate(m0, create(m0, { v: 1 }));
      assert.ok(performance.now() - start < 3_000, "planning was not linear");
    },
  );
});
