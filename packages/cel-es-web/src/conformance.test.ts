import {
  CONFORMANCE_TEST_FILES,
  runSimpleTestFile,
} from "@bufbuild/cel-es-conformance";
import { describe } from "vitest";
import { loadCelParser } from "./index";

describe("Conformance Tests", async () => {
  const CEL_PARSER = await loadCelParser("tree-sitter-cel.wasm");
  for (const file of CONFORMANCE_TEST_FILES) {
    runSimpleTestFile(CEL_PARSER, file);
  }
});
