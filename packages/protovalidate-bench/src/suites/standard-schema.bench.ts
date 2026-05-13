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
import { createStandardSchema } from "@bufbuild/protovalidate";
import { BenchComplexSchemaSchema } from "../gen/bench/v1/bench_pb.js";
import { BenchScalarSchema } from "../gen/bench/v1/bench_pb.js";
import { benchComplexSchema, benchScalar } from "../fixtures.js";

// Standard Schema adapter overhead — TS-only surface, no Go analogue. Compares
// directly with the Scalar and ComplexSchema benches to surface the cost of
// the adapter's path→Issue translation and unknown→typed narrowing.

export function register(bench: Bench): void {
  const scalarSchema = createStandardSchema(BenchScalarSchema);
  const complexSchema = createStandardSchema(BenchComplexSchemaSchema);

  // Warm planner.
  scalarSchema["~standard"].validate(benchScalar);
  complexSchema["~standard"].validate(benchComplexSchema);

  bench.add("StandardSchema/Scalar", () => {
    scalarSchema["~standard"].validate(benchScalar);
  });
  bench.add("StandardSchema/ComplexSchema", () => {
    complexSchema["~standard"].validate(benchComplexSchema);
  });
}
