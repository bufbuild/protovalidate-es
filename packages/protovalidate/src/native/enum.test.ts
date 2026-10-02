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
import { create, type DescMessage } from "@bufbuild/protobuf";
import {
  assertRuleIdOrder,
  compile as compileWithPreamble,
  diff,
} from "./testing.js";

const COLOR_PREAMBLE = `
  enum Color {
    COLOR_UNSPECIFIED = 0;
    COLOR_RED = 1;
    COLOR_GREEN = 2;
    COLOR_BLUE = 3;
  }
`;

function compile(definition: string): DescMessage {
  return compileWithPreamble(definition, { preamble: COLOR_PREAMBLE });
}

void suite("native enum rules", () => {
  void test("enum.const passes and fails", () => {
    const s = compile(
      `message M { Color c = 1 [(buf.validate.field).enum.const = 1]; }`,
    );
    diff(s, create(s, { c: 1 }));
    diff(s, create(s, { c: 2 }));
  });

  void test("enum.in passes and fails", () => {
    const s = compile(
      `message M { Color c = 1 [(buf.validate.field).enum = { in: [1, 3] }]; }`,
    );
    diff(s, create(s, { c: 1 }));
    diff(s, create(s, { c: 3 }));
    diff(s, create(s, { c: 2 }));
  });

  void test("enum.in with default-zero field violates", () => {
    // Proto3 default enum value is 0. With `in: [1, 3]`, an unset field
    // (which validates as 0) must produce a violation. Diff confirms native
    // and CEL agree on this realistic scenario.
    const s = compile(
      `message M { Color c = 1 [(buf.validate.field).enum = { in: [1, 3] }]; }`,
    );
    diff(s, create(s, {})); // c defaults to 0
    diff(s, create(s, { c: 0 })); // explicit zero
  });

  void test("enum.not_in passes and fails", () => {
    const s = compile(
      `message M { Color c = 1 [(buf.validate.field).enum = { not_in: [0] }]; }`,
    );
    diff(s, create(s, { c: 1 }));
    diff(s, create(s, { c: 0 }));
  });

  void test("enum.const + in together both report violations", () => {
    const s = compile(
      `message M {
        Color c = 1 [(buf.validate.field).enum = { const: 1, in: [1, 2] }];
      }`,
    );
    diff(s, create(s, { c: 3 })); // violates const + in
    diff(s, create(s, { c: 2 })); // violates const only
  });

  void test("enum.defined_only still works (handled by EvalEnumDefinedOnly)", () => {
    const s = compile(
      `message M { Color c = 1 [(buf.validate.field).enum.defined_only = true]; }`,
    );
    diff(s, create(s, { c: 1 }));
    diff(s, create(s, { c: 99 })); // undefined
  });

  void test("enum.defined_only + const both fire when applicable", () => {
    const s = compile(
      `message M {
        Color c = 1 [(buf.validate.field).enum = { defined_only: true, const: 1 }];
      }`,
    );
    // Defined but not const
    diff(s, create(s, { c: 2 }));
    // Undefined: should fire defined_only and const
    diff(s, create(s, { c: 99 }));
  });

  void test("violations follow validate.proto order: const, defined_only, in, not_in", () => {
    const s = compile(
      `message M {
        Color c = 1 [(buf.validate.field).enum = {
          not_in: [99], in: [1], defined_only: true, const: 1
        }];
      }`,
    );
    assertRuleIdOrder(s, create(s, { c: 99 }), [
      "enum.const",
      "enum.defined_only",
      "enum.in",
      "enum.not_in",
    ]);
  });

  void test("defined_only precedes in and not_in without const", () => {
    const s = compile(
      `message M {
        Color c = 1 [(buf.validate.field).enum = {
          defined_only: true, in: [1], not_in: [99]
        }];
      }`,
    );
    assertRuleIdOrder(s, create(s, { c: 99 }), [
      "enum.defined_only",
      "enum.in",
      "enum.not_in",
    ]);
  });

  void test("const + defined_only on repeated items and map values", () => {
    const s = compile(
      `message M {
        repeated Color cs = 1 [(buf.validate.field).repeated.items.enum = {
          const: 1, defined_only: true
        }];
        map<string, Color> cm = 2 [(buf.validate.field).map.values.enum = {
          const: 1, defined_only: true
        }];
      }`,
    );
    const msg = create(s, { cs: [1, 99], cm: { k: 99 } });
    diff(s, msg);
    assertRuleIdOrder(s, msg, [
      "enum.const",
      "enum.defined_only",
      "enum.const",
      "enum.defined_only",
    ]);
  });
});
