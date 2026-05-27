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

import { bench } from "mitata";
import { createStandardSchema } from "@bufbuild/protovalidate";
import { caseByName } from "./cases.js";

// Standard Schema adapter overhead — TS-only surface, no Go analogue. Compares
// directly with the matching Scalar/ComplexSchema validate benches to surface
// the cost of the adapter's path→Issue translation and unknown→typed narrowing.

const adapterTargets = ["Scalar", "ComplexSchema"] as const;

export function register(): void {
  for (const name of adapterTargets) {
    const c = caseByName(name);
    const adapter = createStandardSchema(c.schema);
    adapter["~standard"].validate(c.fixture); // warm
    bench(`StandardSchema/${c.name}`, () => {
      adapter["~standard"].validate(c.fixture);
    }).gc('inner');
  }
}
