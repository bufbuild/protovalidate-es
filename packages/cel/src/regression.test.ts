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

import { testSimpleTestFile } from "./testing.js";
import { createRegistry, fromJson } from "@bufbuild/protobuf";
import { SimpleTestFileSchema } from "@bufbuild/cel-spec/cel/expr/conformance/test/simple_pb.js";

// TODO was generated. see if this has a source
const REGRESSION_TEST = fromJson(SimpleTestFileSchema, {
  name: "",
  description: "Regression tests",
  section: [
    {
      name: "charAt",
      test: [
        {
          description: "&& should unrwrap the lhs",
          value: { bool_value: false },
          expr: "google.protobuf.BoolValue{} && true",
        },
        {
          expr: "false || google.protobuf.BoolValue{value: true}",
          description: "|| should unrwrap the rhs",
          value: { bool_value: true },
        },
        {
          expr: "google.protobuf.BoolValue{} ? true : false",
          description: "? should unrwrap",
          value: { bool_value: false },
        },
      ],
    },
  ],
});

void testSimpleTestFile(REGRESSION_TEST, createRegistry());
