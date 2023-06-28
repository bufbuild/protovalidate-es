import { describe, test, expect } from "vitest";
import {
  STRINGS_EXT_TEST,
  STRINGS_FORMAT_TEST_CASES,
} from "@bufbuild/cel-es-conformance";
import { newCelEnv } from "./index";
import {
  CelError,
  CelUnknown,
  makeStringExtFuncRegistry,
  ObjectActivation,
  CEL_ADAPTER,
  EXPR_VAL_ADAPTER,
  NATIVE_ADAPTER,
} from "@bufbuild/cel-es";

describe("Strings Ext Test", () => {
  const STRINGS_EXT_FUNCS = makeStringExtFuncRegistry();
  describe(STRINGS_EXT_TEST.name, () => {
    STRINGS_EXT_TEST.section.forEach((section) => {
      describe(section.name, () => {
        section.test.forEach((tc) => {
          test(tc.name === "" ? tc.expr : tc.name, () => {
            const env = newCelEnv(tc.container);
            env.addFuncs(STRINGS_EXT_FUNCS);
            const parsed = env.parse(tc.expr);
            const plan = env.plan(parsed);
            const ctx = new ObjectActivation(tc.bindings, EXPR_VAL_ADAPTER);
            const result = plan.eval(ctx);
            switch (tc.resultMatcher.case) {
              case "value":
                if (
                  result instanceof CelError ||
                  result instanceof CelUnknown
                ) {
                  expect(result).toStrictEqual(tc.resultMatcher.value);
                } else {
                  const expected = EXPR_VAL_ADAPTER.valToCel(
                    tc.resultMatcher.value
                  );
                  if (!CEL_ADAPTER.equals(result, expected)) {
                    const actual = EXPR_VAL_ADAPTER.celToValue(result);
                    expect(actual).toStrictEqual(tc.resultMatcher.value);
                  }
                }
                break;
              case "evalError":
              case "anyEvalErrors":
                expect(result).toBeInstanceOf(CelError);
                break;
              case undefined:
                expect(result).toStrictEqual(true);
                break;
              default:
                throw new Error(
                  `Unsupported result case: ${tc.resultMatcher.case}`
                );
            }
          });
        });
      });
    });
  });
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
