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
import { compile as compileWithPreamble, diff } from "./testing.js";

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
});
