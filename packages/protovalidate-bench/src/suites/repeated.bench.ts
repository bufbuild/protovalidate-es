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

import type { Bench } from "tinybench";
import { createValidator } from "@bufbuild/protovalidate";
import {
  BenchRepeatedBytesUniqueSchema,
  BenchRepeatedMessageSchema,
  BenchRepeatedScalarSchema,
  BenchRepeatedScalarUniqueSchema,
} from "../gen/bench/v1/bench_pb.js";
import {
  benchRepeatedBytesUnique,
  benchRepeatedMessage,
  benchRepeatedScalar,
  benchRepeatedScalarUnique,
} from "../fixtures.js";

export function register(bench: Bench): void {
  const validator = createValidator();
  validator.validate(BenchRepeatedScalarSchema, benchRepeatedScalar);
  validator.validate(BenchRepeatedMessageSchema, benchRepeatedMessage);
  validator.validate(
    BenchRepeatedScalarUniqueSchema,
    benchRepeatedScalarUnique,
  );
  validator.validate(BenchRepeatedBytesUniqueSchema, benchRepeatedBytesUnique);

  bench.add("Repeated/Scalar", () => {
    validator.validate(BenchRepeatedScalarSchema, benchRepeatedScalar);
  });
  bench.add("Repeated/Message", () => {
    validator.validate(BenchRepeatedMessageSchema, benchRepeatedMessage);
  });
  bench.add("Repeated/Unique/Scalar", () => {
    validator.validate(
      BenchRepeatedScalarUniqueSchema,
      benchRepeatedScalarUnique,
    );
  });
  bench.add("Repeated/Unique/Bytes", () => {
    validator.validate(
      BenchRepeatedBytesUniqueSchema,
      benchRepeatedBytesUnique,
    );
  });
}
