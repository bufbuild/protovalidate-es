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

import { Bench } from "tinybench";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { register as registerScalar } from "./suites/scalar.bench.js";
import { register as registerRepeated } from "./suites/repeated.bench.js";
import { register as registerMap } from "./suites/map.bench.js";
import { register as registerComplex } from "./suites/complex.bench.js";
import { register as registerInt32GT } from "./suites/int32-gt.bench.js";
import { register as registerByteMatching } from "./suites/byte-matching.bench.js";
import { register as registerStringMatching } from "./suites/string-matching.bench.js";
import { register as registerWrapper } from "./suites/wrapper.bench.js";
import { register as registerMultiRule } from "./suites/multirule.bench.js";
import { register as registerCompile } from "./suites/compile.bench.js";
import { register as registerStandardSchema } from "./suites/standard-schema.bench.js";

interface CliOptions {
  filter: string | undefined;
  iterations: number;
  warmupIterations: number;
  time: number;
  outDir: string;
}

function parseArgs(argv: readonly string[]): CliOptions {
  let filter: string | undefined;
  let iterations = 0;
  let warmupIterations = 16;
  let time = 1000;
  let outDir = ".tmp/bench";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--filter":
        filter = argv[++i];
        break;
      case "--iterations":
        iterations = Number(argv[++i]);
        break;
      case "--warmup":
        warmupIterations = Number(argv[++i]);
        break;
      case "--time":
        time = Number(argv[++i]);
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
  return { filter, iterations, warmupIterations, time, outDir };
}

function printUsage(): void {
  process.stdout.write(
    [
      "Usage: tsx src/bench.ts [options]",
      "",
      "Options:",
      "  --filter <substr>     Only run benchmarks whose name contains <substr>",
      "  --time <ms>           Per-task wall time budget (default: 1000)",
      "  --iterations <n>      Force fixed iteration count instead of time budget",
      "  --warmup <n>          Warmup iterations per task (default: 16)",
      "  --out <dir>           Output directory for JSON results (default: .tmp/bench)",
      "",
    ].join("\n"),
  );
}

const opts = parseArgs(process.argv.slice(2));

const bench = new Bench({
  name: "protovalidate-es",
  time: opts.iterations > 0 ? 0 : opts.time,
  iterations: opts.iterations > 0 ? opts.iterations : 10,
  warmupIterations: opts.warmupIterations,
});

registerScalar(bench);
registerRepeated(bench);
registerMap(bench);
registerComplex(bench);
registerInt32GT(bench);
registerByteMatching(bench);
registerStringMatching(bench);
registerWrapper(bench);
registerMultiRule(bench);
registerCompile(bench);
registerStandardSchema(bench);

if (opts.filter !== undefined) {
  const f = opts.filter;
  for (const t of bench.tasks.slice()) {
    if (!t.name.includes(f)) {
      bench.remove(t.name);
    }
  }
}

console.log(`# protovalidate-es bench`);
console.log(`# node ${process.version} ${process.platform}/${process.arch}`);
console.log(`# tasks: ${bench.tasks.length}`);
if (bench.tasks.length === 0) {
  console.error("no tasks matched filter");
  process.exit(2);
}

await bench.run();

const tableRows = bench.table((task) => {
  const r = task.result;
  if (!r) {
    return { Task: task.name };
  }
  return {
    Task: task.name,
    "ops/sec": Math.round(r.throughput.mean).toLocaleString(),
    "avg (ns)": (r.latency.mean * 1e6).toFixed(0),
    "p99 (ns)": ((r.latency.p99 ?? 0) * 1e6).toFixed(0),
    rme: `±${r.latency.rme.toFixed(2)}%`,
    samples: r.latency.samples.length,
  };
});
console.table(tableRows);

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-")
  .replace(/T/, "_")
  .replace(/Z$/, "");
mkdirSync(opts.outDir, { recursive: true });
const outPath = join(opts.outDir, `${stamp}.json`);
const payload = {
  node: process.version,
  platform: `${process.platform}/${process.arch}`,
  timestamp: new Date().toISOString(),
  tasks: bench.tasks
    .filter((t) => t.result !== undefined)
    .map((t) => ({
      name: t.name,
      meanLatencyNs: (t.result?.latency.mean ?? 0) * 1e6,
      p99LatencyNs: (t.result?.latency.p99 ?? 0) * 1e6,
      throughputOpsPerSec: t.result?.throughput.mean ?? 0,
      rmePercent: t.result?.latency.rme ?? 0,
      samples: t.result?.latency.samples.length ?? 0,
    })),
};
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`wrote ${outPath}`);
