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
