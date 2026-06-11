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
import { compile, diff } from "./testing.js";

void suite("native bool rules", () => {
  void suite("bool.const", () => {
    const schema = compile(
      `message M {
        bool b = 1 [(buf.validate.field).bool.const = true];
      }`,
    );
    void test("matches: valid", () => {
      diff(schema, create(schema, { b: true }));
    });
    void test("mismatches: invalid", () => {
      diff(schema, create(schema, { b: false }));
    });
  });

  void suite("BoolValue wrapper", () => {
    const schema = compile(
      `message M {
        google.protobuf.BoolValue b = 1 [(buf.validate.field).bool.const = true];
      }`,
    );
    void test("inner value matches: valid", () => {
      diff(schema, create(schema, { b: true }));
    });
    void test("inner value mismatches: invalid", () => {
      diff(schema, create(schema, { b: false }));
    });
  });
});
