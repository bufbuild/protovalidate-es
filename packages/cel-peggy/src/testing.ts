import {
  CEL_ADAPTER,
  CEL_PARSER,
  CelError,
  type CelParser,
  CelPlanner,
  CelUnknown,
  EXPR_VAL_ADAPTER,
  makeStringExtFuncRegistry,
  ObjectActivation,
} from "./index.js";
import {
  SimpleTest,
  type SimpleTestFile,
} from "./pb/cel/expr/conformance/simple_pb.js";
import { type IMessageTypeRegistry } from "@bufbuild/protobuf";
import * as assert from "node:assert/strict";
import { test } from "node:test";

const STRINGS_EXT_FUNCS = makeStringExtFuncRegistry();

export async function testSimpleTestFile(
  simpleTestFile: SimpleTestFile,
  registry: IMessageTypeRegistry,
) {
  await test(name(simpleTestFile), async () => {
    for (const section of simpleTestFile.section) {
      await test(name(section), async (t) => {
        for (const simpleTest of section.test) {
          await t.test(name(simpleTest), () => {
            runSimpleTestCase(CEL_PARSER, simpleTest, registry);
          });
        }
      });
    }
  });
}

function name(obj: { name: string; description: string }): string {
  if (obj.name.length > 0) {
    return obj.name;
  }
  return obj.description;
}

function runSimpleTestCase(
  celParser: CelParser,
  testCase: SimpleTest,
  registry: IMessageTypeRegistry,
) {
  const planner = new CelPlanner(testCase.container, registry);
  planner.addFuncs(STRINGS_EXT_FUNCS);
  const parsed = celParser.parse(testCase.expr);
  const plan = planner.plan(parsed);
  const ctx = new ObjectActivation(testCase.bindings, EXPR_VAL_ADAPTER);
  const result = plan.eval(ctx);
  switch (testCase.resultMatcher.case) {
    case "value":
      if (result instanceof CelError || result instanceof CelUnknown) {
        assert.deepEqual(result, testCase.resultMatcher.value);
      } else {
        const expected = EXPR_VAL_ADAPTER.valToCel(
          testCase.resultMatcher.value,
        );
        if (!CEL_ADAPTER.equals(result, expected)) {
          const actual = EXPR_VAL_ADAPTER.celToValue(result);
          assert.deepEqual(actual, testCase.resultMatcher.value);
        }
      }
      break;
    case "evalError":
    case "anyEvalErrors":
      assert.ok(result instanceof CelError);
      break;
    case undefined:
      assert.equal(result, true);
      break;
    default:
      throw new Error(
        `Unsupported result case: ${testCase.resultMatcher.case}`,
      );
  }
}
