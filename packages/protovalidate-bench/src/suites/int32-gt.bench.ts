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
import { BenchGTSchema } from "../gen/bench/v1/native_pb.js";
import { benchGT } from "../fixtures.js";

export function register(bench: Bench): void {
  const validator = createValidator();
  validator.validate(BenchGTSchema, benchGT);
  bench.add("Int32GT", () => {
    validator.validate(BenchGTSchema, benchGT);
  });
}
