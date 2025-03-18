// Copyright 2024-2025 Buf Technologies, Inc.
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

import * as assert from "node:assert/strict";
import { suite, test } from "node:test";
import {
  toDebugString,
  KindAdorner,
} from "@bufbuild/cel-spec/testdata/to-debug-string.js";
import { parserTests } from "@bufbuild/cel-spec/testdata/parser-comprehensions.js";
import { parse } from "./parser.js";

const skip: string[] = [];

void suite("parser comprehensions tests", () => {
  for (const t of parserTests) {
    void test(t.expr, { skip: skip.includes(t.expr) }, () => {
      if ("ast" in t && t.ast !== undefined) {
        const actual = toDebugString(parse(t.expr), KindAdorner.singleton);
        const expected = t.ast;
        assert.deepStrictEqual(actual, expected);
      } else {
        assert.throws(() => parse(t.expr));
      }
    });
  }
});
