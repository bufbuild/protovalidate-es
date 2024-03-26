import {
  CONFORMANCE_TEST_FILES,
  runSimpleTestFile,
} from "@bufbuild/cel-es-conformance";
import { describe } from "vitest";
import { CEL_PARSER } from "./index";

describe("Conformance Tests", () => {
  for (const file of CONFORMANCE_TEST_FILES) {
    runSimpleTestFile(CEL_PARSER, file);
  }
});
