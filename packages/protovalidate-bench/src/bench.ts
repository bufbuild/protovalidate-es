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

import { measure } from "mitata";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { register as registerCompile } from "./suites/compile.bench.js";
import { getSpecs } from "./suites/registry.js";
import { register as registerStandardSchema } from "./suites/standard-schema.bench.js";
import { register as registerValidate } from "./suites/validate.bench.js";

// Bumped to 2 when the schema added schemaVersion / runs / crossRunRsdPercent
// and changed minLatencyNs from mitata's trimmed min (3rd-lowest sample) to
// the actual raw minimum sample. Old files without schemaVersion are still
// readable by checkbench (treated as v1).
const SCHEMA_VERSION = 2;
const DEFAULT_RUNS = 5;

interface CliOptions {
  filter: string | undefined;
  outDir: string;
  runs: number;
  worker: boolean;
}

function parseArgs(argv: readonly string[]): CliOptions {
  let filter: string | undefined;
  let outDir = ".tmp/bench";
  let runs = DEFAULT_RUNS;
  let worker = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--filter":
        filter = argv[++i];
        break;
      case "--out":
        outDir = String(argv[++i]);
        break;
      case "--runs": {
        const raw = argv[++i];
        const n = Number(raw);
        if (!Number.isInteger(n) || n < 1) {
          console.error(`--runs must be a positive integer: ${raw}`);
          process.exit(2);
        }
        runs = n;
        break;
      }
      case "--worker":
        // Internal: marks this process as a child worker. The coordinator
        // spawns one Node process per run with this flag, and reads the
        // worker's JSON payload from stdout.
        worker = true;
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
  return { filter, outDir, runs, worker };
}

function printUsage(): void {
  process.stdout.write(
    [
      "Usage: tsx src/bench.ts [options]",
      "",
      "Options:",
      "  --filter <substr>     Only run benchmarks whose name contains <substr>",
      "  --out <dir>           Output directory for JSON results (default: .tmp/bench)",
      `  --runs <N>            Run N independent Node processes and aggregate (default: ${DEFAULT_RUNS}).`,
      "                        N=1 runs inline with no aggregation.",
      "",
    ].join("\n"),
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Subset of mitata's stats shape we read. Mitata declares these inline; we
// restate the fields we touch.
interface MitataStats {
  avg: number;
  min: number;
  p50: number;
  p99: number;
  samples: number[];
  gc?: { total: number };
  heap?: { avg: number };
}

// The shape a worker prints to stdout (or that runs=1 builds inline). One
// entry per bench. Latency stats are computed by us from the raw, untrimmed
// samples mitata returns when samples_threshold is set to a very large value.
interface WorkerTask {
  name: string;
  meanLatencyNs: number;
  minLatencyNs: number;
  medianLatencyNs: number;
  p99LatencyNs: number;
  rmePercent: number;
  samples: number;
  gcTotalNs?: number;
  heapAvgBytes?: number;
}

interface WorkerPayload {
  schemaVersion: number;
  node: string;
  platform: string;
  timestamp: string;
  tasks: WorkerTask[];
}

// What the coordinator writes to disk. When runs=1, this is just the worker
// stats with no cross-run fields. When runs>1, fields are aggregated across
// runs and crossRunRsdPercent / perRunMeanLatencyNs are populated.
interface AggregatedTask {
  name: string;
  meanLatencyNs: number;
  minLatencyNs: number;
  medianLatencyNs: number;
  p99LatencyNs: number;
  throughputOpsPerSec: number;
  rmePercent: number;
  crossRunRsdPercent?: number;
  samples: number;
  runs: number;
  perRunMeanLatencyNs?: number[];
  gcTotalNs?: number;
  heapAvgBytes?: number;
}

interface AggregatedPayload {
  schemaVersion: number;
  node: string;
  platform: string;
  timestamp: string;
  runs: number;
  tasks: AggregatedTask[];
}

// ---- Stats helpers ----

function median(sorted: readonly number[]): number {
  if (sorted.length === 0) return 0;
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function medianOf(arr: readonly number[]): number {
  if (arr.length === 0) return 0;
  return median([...arr].sort((a, b) => a - b));
}

// Sample stddev / mean. Returns a fraction (multiply by 100 for percent).
function rsdFraction(arr: readonly number[]): number {
  if (arr.length < 2) return 0;
  let sum = 0;
  for (const v of arr) sum += v;
  const m = sum / arr.length;
  if (m === 0) return 0;
  let sumSq = 0;
  for (const v of arr) {
    const d = v - m;
    sumSq += d * d;
  }
  return Math.sqrt(sumSq / (arr.length - 1)) / m;
}

// Mean over samples with the lowest 2 and highest 2 dropped. Mirrors the
// trimming mitata used to do by default, but applied by us so we can keep
// the raw samples accessible too.
function trimmedMean(sortedSamples: readonly number[]): number {
  if (sortedSamples.length === 0) return 0;
  const slice =
    sortedSamples.length > 4 ? sortedSamples.slice(2, -2) : sortedSamples;
  let sum = 0;
  for (const v of slice) sum += v;
  return sum / slice.length;
}

function trimmedRsdPercent(sortedSamples: readonly number[]): number {
  const slice =
    sortedSamples.length > 4 ? sortedSamples.slice(2, -2) : sortedSamples;
  return rsdFraction(slice) * 100;
}

function fmtNs(n: number): string {
  if (n < 1000) return `${n.toFixed(0)} ns`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(2)} µs`;
  return `${(n / 1_000_000).toFixed(2)} ms`;
}

// ---- Worker (single-process bench run) ----

async function makeHeapFn(): Promise<(() => number) | undefined> {
  try {
    const v8 = await import("node:v8");
    v8.getHeapStatistics();
    return () => {
      const m = v8.getHeapStatistics();
      return m.used_heap_size + m.malloced_memory;
    };
  } catch {
    return undefined;
  }
}

async function collectWorkerTasks(
  filterRe: RegExp | undefined,
): Promise<WorkerTask[]> {
  registerValidate();
  registerCompile();
  registerStandardSchema();

  const specs = getSpecs(filterRe);
  if (specs.length === 0) {
    process.stderr.write("no tasks matched filter\n");
    process.exit(2);
  }

  const heapFn = await makeHeapFn();
  const tasks: WorkerTask[] = [];
  for (const spec of specs) {
    process.stderr.write(`  ${spec.name} ...`);
    const t0 = performance.now();
    // gc is left undefined so mitata uses its default gc function (which
    // calls globalThis.gc() under --expose-gc). Passing `gc: true` makes
    // mitata try to call `true()` as the gc function.
    const stats = (await measure(spec.fn, {
      inner_gc: spec.gc === "inner",
      heap: heapFn,
      // Disable mitata's built-in symmetric trim so we can see the raw min
      // and compute our own trimmed mean. Any positive number larger than the
      // sample count works; MAX_SAFE_INTEGER is the cleanest.
      samples_threshold: Number.MAX_SAFE_INTEGER,
    })) as MitataStats;
    const t1 = performance.now();
    const samples = stats.samples;
    const meanNs = trimmedMean(samples);
    const task: WorkerTask = {
      name: spec.name,
      meanLatencyNs: meanNs,
      minLatencyNs: stats.min,
      medianLatencyNs: stats.p50,
      p99LatencyNs: stats.p99,
      rmePercent: trimmedRsdPercent(samples),
      samples: samples.length,
    };
    if (stats.gc !== undefined) task.gcTotalNs = stats.gc.total;
    if (stats.heap !== undefined) task.heapAvgBytes = stats.heap.avg;
    tasks.push(task);
    process.stderr.write(
      ` ${fmtNs(meanNs)} (rsd ${task.rmePercent.toFixed(1)}%, n=${samples.length}, ${(t1 - t0).toFixed(0)}ms)\n`,
    );
  }
  return tasks;
}

async function runWorker(filterRe: RegExp | undefined): Promise<void> {
  const tasks = await collectWorkerTasks(filterRe);
  const payload: WorkerPayload = {
    schemaVersion: SCHEMA_VERSION,
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    timestamp: new Date().toISOString(),
    tasks,
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

// ---- Coordinator (multi-process aggregation) ----

function spawnWorker(filter: string | undefined): Promise<WorkerPayload> {
  // Re-invoke the same script in a fresh Node process. process.execArgv
  // carries the original flags (--expose-gc, any tsx loader hooks), so the
  // child runs in the same environment as the parent.
  const args = [...process.execArgv, process.argv[1], "--worker"];
  if (filter !== undefined) args.push("--filter", filter);

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: ["ignore", "pipe", "inherit"],
    });
    let stdout = "";
    child.stdout.setEncoding("utf-8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`worker exited with code ${code}`));
        return;
      }
      try {
        const payload = JSON.parse(stdout.trim()) as WorkerPayload;
        resolve(payload);
      } catch (e) {
        reject(
          new Error(
            `failed to parse worker output: ${(e as Error).message}\n--- stdout ---\n${stdout}`,
          ),
        );
      }
    });
  });
}

function aggregate(workers: WorkerPayload[]): AggregatedPayload {
  if (workers.length === 0) {
    throw new Error("aggregate: no worker payloads");
  }
  const first = workers[0];
  const multiRun = workers.length > 1;

  // Group per-task across workers, preserving the order the first worker saw.
  const byName = new Map<string, WorkerTask[]>();
  const order: string[] = [];
  for (const w of workers) {
    for (const t of w.tasks) {
      let arr = byName.get(t.name);
      if (arr === undefined) {
        arr = [];
        byName.set(t.name, arr);
        order.push(t.name);
      }
      arr.push(t);
    }
  }

  const aggTasks: AggregatedTask[] = [];
  for (const name of order) {
    const ts = byName.get(name);
    if (ts === undefined) continue; // unreachable: name was pushed when arr was created
    const meanArr = ts.map((t) => t.meanLatencyNs);
    const meanLatencyNs = multiRun ? medianOf(meanArr) : meanArr[0];
    const minLatencyNs = Math.min(...ts.map((t) => t.minLatencyNs));
    const medianLatencyNs = multiRun
      ? medianOf(ts.map((t) => t.medianLatencyNs))
      : ts[0].medianLatencyNs;
    const p99LatencyNs = multiRun
      ? medianOf(ts.map((t) => t.p99LatencyNs))
      : ts[0].p99LatencyNs;
    const rmePercent = multiRun
      ? medianOf(ts.map((t) => t.rmePercent))
      : ts[0].rmePercent;
    const samples = ts.reduce((a, t) => a + t.samples, 0);

    const agg: AggregatedTask = {
      name,
      meanLatencyNs,
      minLatencyNs,
      medianLatencyNs,
      p99LatencyNs,
      throughputOpsPerSec: meanLatencyNs > 0 ? 1e9 / meanLatencyNs : 0,
      rmePercent,
      samples,
      runs: ts.length,
    };
    if (multiRun) {
      agg.crossRunRsdPercent = rsdFraction(meanArr) * 100;
      agg.perRunMeanLatencyNs = meanArr;
    }
    const gcArr = ts
      .map((t) => t.gcTotalNs)
      .filter((v): v is number => v !== undefined);
    if (gcArr.length === ts.length && gcArr.length > 0) {
      agg.gcTotalNs = medianOf(gcArr);
    }
    const heapArr = ts
      .map((t) => t.heapAvgBytes)
      .filter((v): v is number => v !== undefined);
    if (heapArr.length === ts.length && heapArr.length > 0) {
      agg.heapAvgBytes = medianOf(heapArr);
    }
    aggTasks.push(agg);
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    node: first.node,
    platform: first.platform,
    timestamp: new Date().toISOString(),
    runs: workers.length,
    tasks: aggTasks,
  };
}

function printSummary(payload: AggregatedPayload): void {
  const nameW = Math.max(4, ...payload.tasks.map((t) => t.name.length));
  console.log("");
  console.log(
    `${"task".padEnd(nameW)}  ${"mean".padEnd(12)}  ${"min".padEnd(12)}  rsd      ${
      payload.runs > 1 ? "cross-run" : ""
    }`,
  );
  for (const t of payload.tasks) {
    const cross =
      payload.runs > 1 && t.crossRunRsdPercent !== undefined
        ? `${t.crossRunRsdPercent.toFixed(2)}%`
        : "";
    console.log(
      `${t.name.padEnd(nameW)}  ${fmtNs(t.meanLatencyNs).padEnd(12)}  ${fmtNs(t.minLatencyNs).padEnd(12)}  ${t.rmePercent.toFixed(2).padStart(5)}%   ${cross}`,
    );
  }
  console.log("");
}

async function runCoordinator(opts: CliOptions): Promise<void> {
  const filterRe =
    opts.filter !== undefined
      ? new RegExp(escapeRegExp(opts.filter))
      : undefined;

  console.log(`# protovalidate-es bench`);
  console.log(`# node ${process.version} ${process.platform}/${process.arch}`);
  console.log(`# runs ${opts.runs}`);

  let payload: AggregatedPayload;
  if (opts.runs === 1) {
    const tasks = await collectWorkerTasks(filterRe);
    payload = aggregate([
      {
        schemaVersion: SCHEMA_VERSION,
        node: process.version,
        platform: `${process.platform}/${process.arch}`,
        timestamp: new Date().toISOString(),
        tasks,
      },
    ]);
  } else {
    const workers: WorkerPayload[] = [];
    for (let i = 0; i < opts.runs; i++) {
      console.log(`run ${i + 1}/${opts.runs} ...`);
      workers.push(await spawnWorker(opts.filter));
    }
    payload = aggregate(workers);
  }

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace(/T/, "_")
    .replace(/Z$/, "");
  mkdirSync(opts.outDir, { recursive: true });
  const outPath = join(opts.outDir, `${stamp}.json`);
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`wrote ${outPath}`);
  printSummary(payload);
}

// ---- Entry ----

const opts = parseArgs(process.argv.slice(2));

if (opts.worker) {
  const filterRe =
    opts.filter !== undefined
      ? new RegExp(escapeRegExp(opts.filter))
      : undefined;
  await runWorker(filterRe);
} else {
  await runCoordinator(opts);
}
