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
// signal under test, or when opportunistic GC inside a batch is responsible
// for a high within-run RSD.
export type GcMode = "once" | "inner";

export interface SpecOptions {
  // Override mitata's min_samples default (12). Use when a slow per-iter
  // bench naturally hits min_samples before min_cpu_time and you want
  // tighter within-run stats.
  minSamples?: number;
  // Override mitata's min_cpu_time default (642ms). The runtime budget for
  // the measurement loop; the bench keeps sampling until both
  // (samples >= minSamples) and (elapsed >= minCpuTimeMs) are satisfied.
  minCpuTimeMs?: number;
}

export interface BenchSpec extends SpecOptions {
  name: string;
  fn: () => void;
  gc: GcMode;
}

const specs: BenchSpec[] = [];

export function registerSpec(
  name: string,
  fn: () => void,
  gc: GcMode,
  options?: SpecOptions,
): void {
  specs.push({ name, fn, gc, ...options });
}

export function getSpecs(filter?: RegExp): BenchSpec[] {
  if (filter === undefined) return specs.slice();
  return specs.filter((s) => filter.test(s.name));
}
