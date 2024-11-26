import { testdataJson } from "../testdata-json.js";
import { SimpleTestFile } from "../gen/cel/expr/conformance/test/simple_pb.js";
import { getTestRegistry } from "./registry.js";

/**
 * Conformance test data from github.com/google/cel-spec
 * Includes tests/simple/testdata/*.textproto
 */
export function getSimpleTestFiles(): SimpleTestFile[] {
  const files: SimpleTestFile[] = [];
  const registry = getTestRegistry();
  for (const json of testdataJson) {
    files.push(SimpleTestFile.fromJson(json, { typeRegistry: registry }));
  }
  return files;
}
