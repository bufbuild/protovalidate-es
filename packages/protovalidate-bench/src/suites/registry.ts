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

// "once": one GC before measurement starts. Use for fast benches where forcing
// a full GC between batches would add more variance than it removes.
// "inner": GC between every batch sample. Use when allocation cost is the
// signal under test (e.g. Compile/*) — pays for itself in stability.
export type GcMode = "once" | "inner";

export interface BenchSpec {
  name: string;
  fn: () => void;
  gc: GcMode;
}

const specs: BenchSpec[] = [];

export function registerSpec(name: string, fn: () => void, gc: GcMode): void {
  specs.push({ name, fn, gc });
}

export function getSpecs(filter?: RegExp): BenchSpec[] {
  if (filter === undefined) return specs.slice();
  return specs.filter((s) => filter.test(s.name));
}
