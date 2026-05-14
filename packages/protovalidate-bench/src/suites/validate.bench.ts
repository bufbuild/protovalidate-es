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
import { cases } from "./cases.js";

// Validate-time benches: a single validator is warmed once per case and then
// reused across iterations, matching Go's BenchmarkValidate*. The set of
// cases lives in cases.ts — add a row there to add a benchmark.

export function register(bench: Bench): void {
  const validator = createValidator();
  for (const c of cases) {
    validator.validate(c.schema, c.fixture); // warm the planner cache
    bench.add(c.name, () => {
      validator.validate(c.schema, c.fixture);
    });
  }
}
