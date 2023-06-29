import { describe, test, expect } from "vitest";
import {
  CelEnv,
  CelError,
  CelUnknown,
  makeStringExtFuncRegistry,
  ObjectActivation,
  CEL_ADAPTER,
  EXPR_VAL_ADAPTER,
  type CelParser,
} from "@bufbuild/cel-es";
import {
  SimpleTest,
  SimpleTestFile,
  SimpleTestSection,
} from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/conformance/simple_pb";
import { createRegistry } from "@bufbuild/protobuf";
import * as test_all_types_pb2 from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/conformance/proto2/test_all_types_pb";
import * as test_all_types_pb3 from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/conformance/proto3/test_all_types_pb";

export const TEST_REGISTRY = createRegistry(
  test_all_types_pb2.TestAllTypes,
  test_all_types_pb3.TestAllTypes
);

const STRINGS_EXT_FUNCS = makeStringExtFuncRegistry();

export function runSimpleTestCase(celParser: CelParser, testCase: SimpleTest) {
  const env = new CelEnv(testCase.container, celParser, TEST_REGISTRY);
  env.addFuncs(STRINGS_EXT_FUNCS);
  const parsed = env.parse(testCase.expr);
  const plan = env.plan(parsed);
  const ctx = new ObjectActivation(testCase.bindings, EXPR_VAL_ADAPTER);
  const result = plan.eval(ctx);
  switch (testCase.resultMatcher.case) {
    case "value":
      if (result instanceof CelError || result instanceof CelUnknown) {
        expect(result).toStrictEqual(testCase.resultMatcher.value);
      } else {
        const expected = EXPR_VAL_ADAPTER.valToCel(
          testCase.resultMatcher.value
        );
        if (!CEL_ADAPTER.equals(result, expected)) {
          const actual = EXPR_VAL_ADAPTER.celToValue(result);
          expect(actual).toStrictEqual(testCase.resultMatcher.value);
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
        `Unsupported result case: ${testCase.resultMatcher.case}`
      );
  }
}

export function runSimpleTestSection(
  celParser: CelParser,
  section: SimpleTestSection
) {
  describe(section.name, () => {
    section.test.forEach((tc) => {
      test(tc.name === "" ? tc.expr : tc.name, () => {
        runSimpleTestCase(celParser, tc);
      });
    });
  });
}

export function runSimpleTestFile(
  celParser: CelParser,
  testFile: SimpleTestFile
) {
  if (testFile.section.length === 0) {
    return;
  }
  describe(testFile.name, () => {
    testFile.section.forEach((section) => {
      runSimpleTestSection(celParser, section);
    });
  });
}
