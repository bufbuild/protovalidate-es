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

import { testdataJson } from "../testdata-json.js";
import { fromJson } from "@bufbuild/protobuf";
import { SimpleTestFileSchema } from "../gen/cel/expr/conformance/test/simple_pb.js";
import type { SimpleTestFile } from "../gen/cel/expr/conformance/test/simple_pb.js";
import { getTestRegistry } from "./registry.js";

/**
 * Conformance test data from github.com/google/cel-spec
 * Includes tests/simple/testdata/*.textproto
 */
export function getSimpleTestFiles(): SimpleTestFile[] {
  const files: SimpleTestFile[] = [];
  const registry = getTestRegistry();
  for (const json of testdataJson) {
    files.push(fromJson(SimpleTestFileSchema, json, { registry }));
  }
  return files;
}
