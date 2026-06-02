// Copyright 2024-2026 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { DescMessage, Message } from "@bufbuild/protobuf";
import {
  BenchComplexSchemaSchema,
  BenchMapSchema,
  BenchRepeatedBytesUniqueSchema,
  BenchRepeatedMessageSchema,
  BenchRepeatedScalarSchema,
  BenchRepeatedScalarUniqueSchema,
  BenchScalarSchema,
} from "./gen/bench/v1/bench_pb.js";
import {
  BenchGTSchema,
  MultiRuleSchema,
  StringMatchingSchema,
  TestByteMatchingSchema,
  WrapperTestingSchema,
} from "./gen/bench/v1/native_pb.js";
import {
  benchComplexSchema,
  benchGT,
  benchMap,
  benchRepeatedBytesUnique,
  benchRepeatedMessage,
  benchRepeatedScalar,
  benchRepeatedScalarUnique,
  benchScalar,
  multiRuleError,
  multiRuleNoError,
  stringMatching,
  testByteMatching,
  wrapperTesting,
} from "./fixtures.js";

/**
 * One bench case: a schema, a fixture, and the name to record under.
 */
export type BenchCase = {
  name: string;
  schema: DescMessage;
  fixture: Message;
};

/**
 * Every (schema, fixture) pair used by the validate-time benches.
 *
 * To add a benchmark, add the fixture to fixtures.ts and append a row here.
 * `validate.bench.ts` iterates this list; `compile.bench.ts` and
 * `standard-schema.bench.ts` reference individual entries by name.
 */
export const cases: readonly BenchCase[] = [
  { name: "Scalar", schema: BenchScalarSchema, fixture: benchScalar },
  {
    name: "Repeated/Scalar",
    schema: BenchRepeatedScalarSchema,
    fixture: benchRepeatedScalar,
  },
  {
    name: "Repeated/Message",
    schema: BenchRepeatedMessageSchema,
    fixture: benchRepeatedMessage,
  },
  {
    name: "Repeated/Unique/Scalar",
    schema: BenchRepeatedScalarUniqueSchema,
    fixture: benchRepeatedScalarUnique,
  },
  {
    name: "Repeated/Unique/Bytes",
    schema: BenchRepeatedBytesUniqueSchema,
    fixture: benchRepeatedBytesUnique,
  },
  { name: "Map", schema: BenchMapSchema, fixture: benchMap },
  {
    name: "ComplexSchema",
    schema: BenchComplexSchemaSchema,
    fixture: benchComplexSchema,
  },
  { name: "Int32GT", schema: BenchGTSchema, fixture: benchGT },
  {
    name: "TestByteMatching",
    schema: TestByteMatchingSchema,
    fixture: testByteMatching,
  },
  {
    name: "StringMatching",
    schema: StringMatchingSchema,
    fixture: stringMatching,
  },
  {
    name: "WrapperTesting",
    schema: WrapperTestingSchema,
    fixture: wrapperTesting,
  },
  {
    name: "MultiRule/Error",
    schema: MultiRuleSchema,
    fixture: multiRuleError,
  },
  {
    name: "MultiRule/NoError",
    schema: MultiRuleSchema,
    fixture: multiRuleNoError,
  },
];

/**
 * Look up a single case by name. Throws if no case matches — used by suites
 * that pick a curated subset (e.g. compile, standard-schema benches).
 */
export function caseByName(name: string): BenchCase {
  const c = cases.find((c) => c.name === name);
  if (!c) {
    throw new Error(`no bench case named "${name}"`);
  }
  return c;
}
