import { describe, test, expect } from "vitest";
import {
  STRINGS_EXT_TEST,
  STRINGS_FORMAT_TEST_CASES,
} from "@bufbuild/cel-es-conformance";
import { CEL_PARSER, newCelEnv } from "./index";
import {
  CelError,
  makeStringExtFuncRegistry,
  ObjectActivation,
  NATIVE_ADAPTER,
} from "@bufbuild/cel-es";
import { runSimpleTestFile } from "@bufbuild/cel-es-conformance";

describe("Strings Ext Test", () => {
  runSimpleTestFile(CEL_PARSER, STRINGS_EXT_TEST);
});

describe("string.format", () => {
  STRINGS_FORMAT_TEST_CASES.forEach((tc) => {
    describe(tc.name, () => {
      const STRINGS_EXT_FUNCS = makeStringExtFuncRegistry(tc.locale);
      const env = newCelEnv();
      env.addFuncs(STRINGS_EXT_FUNCS);
      // Create the input expression from 'format'.format([formatArgs])
      const input =
        "'" + tc.format + "'.format([" + (tc.formatArgs ?? "") + "])";
      test(`${input}`, () => {
        const parsed = env.parse(input);
        const plan = env.plan(parsed);
        const ctx = new ObjectActivation(
          tc.dynArgs === undefined ? {} : tc.dynArgs,
          NATIVE_ADAPTER
        );
        const result = plan.eval(ctx);
        if (tc.err) {
          expect(result).toBeInstanceOf(CelError);
        } else {
          expect(result).toStrictEqual(tc.expectedOutput);
        }
      });
    });
  });
});
