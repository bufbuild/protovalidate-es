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

import { run } from "mitata";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { register as registerValidate } from "./suites/validate.bench.js";
import { register as registerCompile } from "./suites/compile.bench.js";
import { register as registerStandardSchema } from "./suites/standard-schema.bench.js";

interface CliOptions {
  filter: string | undefined;
  outDir: string;
}

function parseArgs(argv: readonly string[]): CliOptions {
  let filter: string | undefined;
  let outDir = ".tmp/bench";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--filter":
        filter = argv[++i];
        break;
      case "--out":
        outDir = String(argv[++i]);
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      default:
        if (a?.startsWith("--")) {
          console.error(`unknown flag: ${a}`);
          process.exit(2);
        }
    }
  }
  return { filter, outDir };
}

function printUsage(): void {
  process.stdout.write(
    [
      "Usage: tsx src/bench.ts [options]",
      "",
      "Options:",
      "  --filter <substr>     Only run benchmarks whose name contains <substr>",
      "  --out <dir>           Output directory for JSON results (default: .tmp/bench)",
      "",
    ].join("\n"),
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Subset of mitata's trial/stats shape that we actually consume. Mitata's
// declarations expose these types as anonymous interfaces, so we restate the
// fields we read.
interface MitataStats {
  avg: number;
  min: number;
  p50: number;
  p99: number;
  samples: number[];
  gc?: { total: number };
  heap?: { avg: number };
}

interface MitataTrial {
  alias: string;
  runs: { stats?: MitataStats; error?: unknown; name: string }[];
}

const opts = parseArgs(process.argv.slice(2));

registerValidate();
registerCompile();
registerStandardSchema();

console.log(`# protovalidate-es bench`);
console.log(`# node ${process.version} ${process.platform}/${process.arch}`);

const result = (await run(
  opts.filter !== undefined
    ? { filter: new RegExp(escapeRegExp(opts.filter)) }
    : {},
)) as { benchmarks: MitataTrial[] };

console.log(`# tasks: ${result.benchmarks.length}`);
if (result.benchmarks.length === 0) {
  console.error("no tasks matched filter");
  process.exit(2);
}

function relativeStddevPercent(samples: number[], mean: number): number {
  if (samples.length === 0 || mean === 0) return 0;
  let sumSq = 0;
  for (const s of samples) {
    const d = s - mean;
    sumSq += d * d;
  }
  return (Math.sqrt(sumSq / samples.length) / mean) * 100;
}

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-")
  .replace(/T/, "_")
  .replace(/Z$/, "");
mkdirSync(opts.outDir, { recursive: true });
const outPath = join(opts.outDir, `${stamp}.json`);

interface TaskPayload {
  name: string;
  meanLatencyNs: number;
  minLatencyNs: number;
  medianLatencyNs: number;
  p99LatencyNs: number;
  throughputOpsPerSec: number;
  rmePercent: number;
  samples: number;
  gcTotalNs?: number;
  heapAvgBytes?: number;
}

const tasks: TaskPayload[] = [];
for (const trial of result.benchmarks) {
  const r = trial.runs[0];
  if (!r || r.error !== undefined || !r.stats) continue;
  const s = r.stats;
  const task: TaskPayload = {
    name: trial.alias,
    meanLatencyNs: s.avg,
    minLatencyNs: s.min,
    medianLatencyNs: s.p50,
    p99LatencyNs: s.p99,
    throughputOpsPerSec: 1e9 / s.avg,
    rmePercent: relativeStddevPercent(s.samples, s.avg),
    samples: s.samples.length,
  };
  if (s.gc !== undefined) task.gcTotalNs = s.gc.total;
  if (s.heap !== undefined) task.heapAvgBytes = s.heap.avg;
  tasks.push(task);
}

const payload = {
  node: process.version,
  platform: `${process.platform}/${process.arch}`,
  timestamp: new Date().toISOString(),
  tasks,
};
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`wrote ${outPath}`);
