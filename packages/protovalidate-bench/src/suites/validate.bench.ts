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

import { createValidator } from "@bufbuild/protovalidate";
import { cases } from "./cases.js";
import { registerSpec } from "./registry.js";

// Validate-time benches: a single validator is warmed once per case and then
// reused across iterations, matching Go's BenchmarkValidate*. The set of
// cases lives in cases.ts — add a row there to add a benchmark.
//
// gc: "once" — these benches are short-lived and reuse the same validator/
// fixture, so forcing a full GC between every batch sample (as gc:"inner"
// would) churns the heap layout enough to add more run-to-run variance than
// it removes. Multi-run aggregation in the driver captures the residual
// noise across processes.

export function register(): void {
  const validator = createValidator();
  for (const c of cases) {
    validator.validate(c.schema, c.fixture); // warm the planner cache
    registerSpec(
      c.name,
      () => {
        validator.validate(c.schema, c.fixture);
      },
      "once",
    );
  }
}
