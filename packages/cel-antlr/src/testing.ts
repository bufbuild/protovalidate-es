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
import type {
  SimpleTest,
  SimpleTestFile,
  SimpleTestSection,
} from "@bufbuild/cel-spec/cel/expr/conformance/test/simple_pb.js";
import type { Registry } from "@bufbuild/protobuf";
import * as assert from "node:assert/strict";
import { test } from "node:test";

const STRINGS_EXT_FUNCS = makeStringExtFuncRegistry();

export async function testSimpleTestFile(
  simpleTestFile: SimpleTestFile,
  registry: Registry,
  shouldSkip?: (
    file: SimpleTestFile,
    section?: SimpleTestSection,
    test?: SimpleTest,
  ) => boolean,
) {
  const skip = shouldSkip?.(simpleTestFile);
  await test(name(simpleTestFile), { skip }, async () => {
    for (const section of simpleTestFile.section) {
      const skip = shouldSkip?.(simpleTestFile, section);
      await test(name(section), { skip }, async (t) => {
        for (const simpleTest of section.test) {
          const skip = shouldSkip?.(simpleTestFile, section, simpleTest);
          await t.test(name(simpleTest), { skip }, () => {
            runSimpleTestCase(CEL_PARSER, simpleTest, registry);
          });
        }
      });
    }
  });
}

type SkipList = (
  | [fileName: string]
  | [fileName: string, sectionName: string]
  | [fileName: string, sectionName: string, testName: string]
)[];

export function createSimpleTestFileSkip(
  files: SimpleTestFile[],
  skipList: SkipList,
) {
  // validate that skip list only contains elements that exist
  for (const l of skipList) {
    const file = files.find((f) => f.name === l[0]);
    if (file === undefined) {
      throw new Error(`Invalid skip list: file "${l[0]}" not found`);
    }
    if (l.length > 1) {
      const section = file.section.find((s) => s.name === l[1]);
      if (section === undefined) {
        throw new Error(
          `Invalid skip list: section "${l[1]}" not found in file "${l[0]}"`,
        );
      }
      if (l.length > 2) {
        const test = section.test.find((t) => t.name === l[2]);
        if (test === undefined) {
          throw new Error(
            `Invalid skip list: test "${l[2]}" not found in section "${l[1]}" of file "${l[0]}"`,
          );
        }
      }
    }
  }
  // validate that skip list does not contain duplicates
  for (const [wantIndex, l] of skipList.entries()) {
    const foundIndex = skipList.findIndex(
      (m) => m.length === l.length && l.every((n, index) => n === m[index]),
    );
    if (wantIndex !== foundIndex) {
      throw new Error(
        `Invalid skip list: duplicate skip: "${l.join(`" / "`)}"`,
      );
    }
  }
  return function shouldSkip(
    file: SimpleTestFile,
    section?: SimpleTestSection,
    test?: SimpleTest,
  ): boolean {
    const got = [file.name];
    if (section !== undefined) {
      got.push(section.name);
      if (test !== undefined) {
        got.push(test.name);
      }
    }
    const found = skipList.find(
      (s) => s.length === got.length && got.every((n, index) => n === s[index]),
    );
    return found !== undefined;
  };
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
  registry: Registry,
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
