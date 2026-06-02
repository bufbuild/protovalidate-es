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
import { caseByName } from "../cases.js";
import { registerSpec } from "./registry.js";

// Compile-time benchmarks: build a fresh validator on each iteration and run
// one validate() call so the plan is forced. Mirrors Go's BenchmarkCompile,
// which calls New() in the hot loop.
//
// gc: "inner" — allocation cost is the signal here. Forcing a full GC
// between batch samples keeps each sample's heap state comparable and stops
// background gc from inflating individual samples.

const compileTargets = ["ComplexSchema", "Int32GT"] as const;

export function register(): void {
  for (const name of compileTargets) {
    const c = caseByName(name);
    registerSpec(
      `Compile/${c.name}`,
      () => {
        const v = createValidator();
        v.validate(c.schema, c.fixture);
      },
      "inner",
    );
  }
}
