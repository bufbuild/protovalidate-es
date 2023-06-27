import { describe, test } from "node:test";
import { STRINGS_FORMAT_TEST_CASES } from "@bufbuild/cel-es-conformance";
import { loadCelParser } from "@bufbuild/cel-es-parse-web";

loadCelParser("tree-sitter-cel.wasm").then((parser) => {
  describe("strings_format", () => {
    STRINGS_FORMAT_TEST_CASES.forEach((tc) => {
      test(tc.name, () => {
        const parsed = parser.parse("hi");
        console.log(parsed);
      });
    });
  });
});
