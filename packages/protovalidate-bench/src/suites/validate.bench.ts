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
import { registerSpec, type SpecOptions } from "./registry.js";

// Validate-time benches: a single validator is warmed once per case and then
// reused across iterations, matching Go's BenchmarkValidate*. The set of
// cases lives in cases.ts — add a row there to add a benchmark.
//
// All cases run with gc: "once". gc: "inner" was tried for the alloc-heavy
// cases (ComplexSchema, Int32GT) to tame their ~15% within-run RSD, but it
// shifts the measured mean ~3× upward (it removes opportunistic concurrent
// GC, which is part of real-world cost) and degraded cross-run stability —
// the metric that actually matters for regression detection. The high
// within-run RSD is informational only: the trimmed mean is robust to the
// in-batch GC outliers, and checkbench gates on cross-run RSD, not rmePercent.

// Slow per-iter benches naturally hit mitata's 12-sample minimum before the
// 642ms time budget runs out, so the within-run stats are computed from very
// few samples. Targeting ~30 samples with a 1.5s budget tightens within-run
// RSD enough that single-process numbers stay informative; cross-run
// aggregation already handles between-process noise.
const slowPerIterOptions: SpecOptions = {
  minSamples: 30,
  minCpuTimeMs: 1500,
};
const slowPerIterCases: ReadonlySet<string> = new Set([
  "Repeated/Message",
  "TestByteMatching",
  "StringMatching",
  "WrapperTesting",
  "MultiRule/Error",
]);

export function register(): void {
  const validator = createValidator();
  for (const c of cases) {
    validator.validate(c.schema, c.fixture); // warm the planner cache
    const options = slowPerIterCases.has(c.name)
      ? slowPerIterOptions
      : undefined;
    registerSpec(
      c.name,
      () => {
        validator.validate(c.schema, c.fixture);
      },
      "once",
      options,
    );
  }
}
