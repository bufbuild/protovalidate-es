#!/usr/bin/env node

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

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const BENCH_DIR = ".tmp/bench";
const DEFAULT_THRESHOLD = 5;

function usage() {
  process.stdout.write(
    [
      "Usage: tsx src/checkbench.ts <baseline> <current> [options]",
      "",
      "Arguments are paths to JSON files relative to the benchmark directory (default: .tmp/bench/).",
      "If neither argument is present, the two most recent files are used, with the older file being the baseline.",
      "If one argument is present, the named file in the benchmark directory is used as the baseline and the most recent file is used as the current.",
      "",
      "Options:",
      "  --threshold <pct>   regression threshold percent (default: 5)",
      "  --dir <path>        bench results directory (default: .tmp/bench)",
      "  --quiet, -q         only print summary line",
      "  --help, -h          show this help and exit",
      "",
      "Exit code: 0 if no regressions past threshold, 1 for regressions, 2 for other errors.",
      "",
    ].join("\n"),
  );
}

type FileInfo = {
  meta: {
    node: string;
    platform: string;
    timestamp: string;
    path: string;
    runs: number;
    schemaVersion: number;
  };
  byName: Map<string, Task>;
};

type Task = {
  name: string;
  meanLatencyNs: number;
  minLatencyNs: number;
  medianLatencyNs: number;
  p99LatencyNs: number;
  throughputOpsPerSec: number;
  rmePercent: number;
  // Present only for files written with schemaVersion >= 2 from a multi-run
  // invocation. When present this is the relative stddev across per-run means
  // — i.e. the actual run-to-run noise — and should be used as the noise
  // floor in preference to rmePercent (which is within-run sample spread).
  crossRunRsdPercent?: number;
  samples: number;
  runs?: number;
  gcTotalNs?: number;
  heapAvgBytes?: number;
};

function load(path: string): FileInfo {
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const byName = new Map();
  for (const task of data.tasks) {
    byName.set(task.name, task);
  }
  return {
    meta: {
      node: data.node,
      platform: data.platform,
      timestamp: data.timestamp,
      path,
      // Older files (schemaVersion absent or 1) don't have a runs field at
      // the top level, but they also lack crossRunRsdPercent on tasks, so
      // checkbench falls back to rmePercent for them.
      runs: typeof data.runs === "number" ? data.runs : 1,
      schemaVersion:
        typeof data.schemaVersion === "number" ? data.schemaVersion : 1,
    },
    byName,
  };
}

function pad(s: string, n: number): string {
  return String(s).padEnd(n);
}

function fmtNs(n: number): string {
  if (n < 1000) return `${n.toFixed(0)} ns`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(2)} µs`;
  return `${(n / 1_000_000).toFixed(2)} ms`;
}

function color(s: string, code: string): string {
  if (!process.stdout.isTTY) return s;
  return `\x1b[${code}m${s}\x1b[0m`;
}

function getFile(dir: string, arg: string): string {
  const path = resolve(dir, arg);
  try {
    if (!statSync(path).isFile()) {
      console.error(`not a file: ${path}`);
      process.exit(2);
    }
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      console.error(`file does not exist: ${path}`);
      process.exit(2);
    }
    throw err;
  }
  return path;
}

type DirEntry = { f: string; mtime: number };

function getSortedDirEntries(dir: string): DirEntry[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ f, mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
}

function getNewestFile(dir: string): string {
  const entries = getSortedDirEntries(dir);
  if (entries.length === 0) {
    console.error(`no JSON files in ${dir}`);
    process.exit(2);
  }
  return getFile(dir, entries[0].f);
}

function getSecondNewestFile(dir: string): string {
  const entries = getSortedDirEntries(dir);
  if (entries.length < 2) {
    console.error(`not enough JSON files in ${dir} to resolve previous file`);
    process.exit(2);
  }
  return getFile(dir, entries[1].f);
}

type ParsedValues = {
  threshold?: string;
  dir?: string;
  quiet?: boolean;
  help?: boolean;
};

function buildArgs(values: ParsedValues) {
  const dir = values.dir ?? BENCH_DIR;
  try {
    if (!statSync(dir).isDirectory()) {
      console.error(`--dir is not a directory: ${dir}`);
      process.exit(2);
    }
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      console.error(`--dir does not exist: ${dir}`);
      process.exit(2);
    }
    throw err;
  }
  let threshold = DEFAULT_THRESHOLD;
  if (values.threshold !== undefined) {
    const raw = values.threshold.trim();
    const n = Number(raw);
    if (raw === "" || !Number.isFinite(n) || n < 0) {
      console.error(
        `--threshold must be a non-negative number: ${values.threshold}`,
      );
      process.exit(2);
    }
    threshold = n;
  }
  return { threshold, dir, quiet: values.quiet ?? false };
}

const options = {
  threshold: {
    type: "string",
  },
  dir: {
    type: "string",
  },
  quiet: {
    type: "boolean",
    short: "q",
  },
  help: {
    type: "boolean",
    short: "h",
  },
} as const;
const { values, positionals } = parseArgs({
  options,
  allowPositionals: true,
});
if (values.help) {
  usage();
  process.exit(0);
}
if (positionals.length > 2) {
  usage();
  process.exit(2);
}

const args = buildArgs(values);

const baselinePath =
  positionals.length > 0
    ? getFile(args.dir, positionals[0])
    : getSecondNewestFile(args.dir);
const currentPath =
  positionals.length === 2
    ? getFile(args.dir, positionals[1])
    : getNewestFile(args.dir);

if (baselinePath === currentPath) {
  console.error(
    `baseline and current resolve to the same file: ${baselinePath}`,
  );
  process.exit(2);
}

const baseline = load(baselinePath);
const current = load(currentPath);

console.log(`baseline: ${baseline.meta.path}`);
console.log(
  `          ${baseline.meta.timestamp}  node ${baseline.meta.node}  ${baseline.meta.platform}  runs=${baseline.meta.runs}`,
);
console.log(`current:  ${current.meta.path}`);
console.log(
  `          ${current.meta.timestamp}  node ${current.meta.node}  ${current.meta.platform}  runs=${current.meta.runs}`,
);
console.log("");

if (baseline.meta.platform !== current.meta.platform) {
  console.log(
    color(
      `! platform differs (${baseline.meta.platform} vs ${current.meta.platform}) — numbers may not be comparable`,
      "33",
    ),
  );
}
if (baseline.meta.node !== current.meta.node) {
  console.log(
    color(
      `! node version differs (${baseline.meta.node} vs ${current.meta.node})`,
      "33",
    ),
  );
}
if (baseline.meta.runs !== current.meta.runs) {
  console.log(
    color(
      `! runs count differs (${baseline.meta.runs} vs ${current.meta.runs}) — noise floor uses the looser of the two`,
      "33",
    ),
  );
}
if (baseline.meta.schemaVersion < 2 || current.meta.schemaVersion < 2) {
  console.log(
    color(
      `! one or both files use schemaVersion 1 — falling back to within-run rmePercent as the noise floor (overstates real signal)`,
      "33",
    ),
  );
}

const names = new Set([...baseline.byName.keys(), ...current.byName.keys()]);
let regressions = 0;
let improvements = 0;

type SignalVerdict = "regress" | "improve" | "noise" | "ok";

function classify(
  deltaPct: number,
  noiseFloor: number,
  threshold: number,
): SignalVerdict {
  if (Math.abs(deltaPct) <= noiseFloor) return "noise";
  if (deltaPct > threshold) return "regress";
  if (deltaPct < -threshold) return "improve";
  return "ok";
}

function fmtDelta(deltaPct: number, verdict: SignalVerdict): string {
  let base: string;
  if (!Number.isFinite(deltaPct)) {
    base = deltaPct > 0 ? "+∞%" : "-∞%";
  } else {
    base = `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(2)}%`;
  }
  switch (verdict) {
    case "regress":
      return color(base, "31");
    case "improve":
      return color(base, "32");
    case "noise":
      return color(base, "90");
    default:
      return base;
  }
}

type Row = {
  name: string;
  kind: "new" | "gone" | "regress" | "improve" | "ok";
  bMean: number | undefined;
  cMean: number | undefined;
  meanText: string;
  minText: string;
  heapText: string;
  gcText: string;
};

const rows: Row[] = [];
// Track whether any row has heap/gc info so we can skip those columns entirely
// when neither file has them (e.g. comparing against a pre-mitata JSON).
let anyHeap = false;
let anyGc = false;

for (const name of [...names].sort()) {
  const b = baseline.byName.get(name);
  const c = current.byName.get(name);
  if (!b) {
    rows.push({
      name,
      kind: "new",
      bMean: undefined,
      cMean: c?.meanLatencyNs,
      meanText: color("NEW", "36"),
      minText: "",
      heapText: "",
      gcText: "",
    });
    continue;
  }
  if (!c) {
    rows.push({
      name,
      kind: "gone",
      bMean: b.meanLatencyNs,
      cMean: undefined,
      meanText: color("GONE", "90"),
      minText: "",
      heapText: "",
      gcText: "",
    });
    continue;
  }
  const meanDelta =
    ((c.meanLatencyNs - b.meanLatencyNs) / b.meanLatencyNs) * 100;
  const minDelta = ((c.minLatencyNs - b.minLatencyNs) / b.minLatencyNs) * 100;
  // Prefer the cross-run RSD when both files have it (schemaVersion >= 2,
  // runs > 1). That measures actual between-process variance and is the
  // honest noise floor for comparing two separate bench invocations. Within
  // -run rmePercent describes sample spread inside a single process; using
  // it as a noise floor across processes systematically under-estimates the
  // noise, which is what produced spurious "regress" markers on unchanged
  // code. Falling back to rmePercent for v1 files keeps old comparisons
  // working at the cost of accuracy.
  const bNoise = b.crossRunRsdPercent ?? b.rmePercent ?? 0;
  const cNoise = c.crossRunRsdPercent ?? c.rmePercent ?? 0;
  const noiseFloor = bNoise + cNoise;
  const meanV = classify(meanDelta, noiseFloor, args.threshold);
  const minV = classify(minDelta, noiseFloor, args.threshold);

  // Heap is mostly deterministic per code+fixture, but for long-running
  // alloc-heavy benches (Compile/*) the GC scheduler can fire mid-iteration
  // and make `getHeapStatistics()` snapshots noisy. Reuse the timing noise
  // floor (combined rmePercent) as a soft upper bound on measurement noise —
  // not exact, but it suppresses the same kind of jitter that timing sees.
  let heapDelta: number | undefined;
  let heapV: SignalVerdict = "ok";
  if (b.heapAvgBytes !== undefined && c.heapAvgBytes !== undefined) {
    anyHeap = true;
    const heapAbsDelta = c.heapAvgBytes - b.heapAvgBytes;
    if (b.heapAvgBytes === 0) {
      heapDelta = c.heapAvgBytes === 0 ? 0 : Number.POSITIVE_INFINITY;
    } else {
      heapDelta = (heapAbsDelta / b.heapAvgBytes) * 100;
    }
    if (Math.abs(heapAbsDelta) < 1) {
      heapV = "ok";
    } else {
      heapV = classify(heapDelta, noiseFloor, args.threshold);
    }
  }

  // GC time is reported only when the runtime exposes gc(). Informational
  // only — we don't gate on it because per-iter GC cost is noisy and already
  // captured (in a noisier form) by heap allocation.
  let gcDelta: number | undefined;
  if (b.gcTotalNs !== undefined && c.gcTotalNs !== undefined) {
    anyGc = true;
    if (b.gcTotalNs === 0) {
      gcDelta = c.gcTotalNs === 0 ? 0 : Number.POSITIVE_INFINITY;
    } else {
      gcDelta = ((c.gcTotalNs - b.gcTotalNs) / b.gcTotalNs) * 100;
    }
  }

  const tags: string[] = [];
  if (meanV === "regress") tags.push("mean");
  if (minV === "regress") tags.push("min");
  if (heapV === "regress") tags.push("heap");
  const fasterTags: string[] = [];
  if (meanV === "improve") fasterTags.push("mean");
  if (minV === "improve") fasterTags.push("min");
  if (heapV === "improve") fasterTags.push("heap");

  let kind: Row["kind"] = "ok";
  let meanText = fmtDelta(meanDelta, meanV);
  const minText = fmtDelta(minDelta, minV);
  const heapText = heapDelta === undefined ? "" : fmtDelta(heapDelta, heapV);
  const gcText =
    gcDelta === undefined
      ? ""
      : Number.isFinite(gcDelta)
        ? `${gcDelta >= 0 ? "+" : ""}${gcDelta.toFixed(2)}%`
        : "∞";

  if (tags.length > 0) {
    kind = "regress";
    regressions++;
    const marker = color(`REGRESS (${tags.join("+")})`, "31");
    meanText = `${meanText}  ${marker}`;
  } else if (fasterTags.length > 0) {
    kind = "improve";
    improvements++;
    const marker = color(`faster (${fasterTags.join("+")})`, "32");
    meanText = `${meanText}  ${marker}`;
  } else if (meanV === "noise" || minV === "noise") {
    meanText = `${meanText}  ${color("(noise)", "90")}`;
  }

  rows.push({
    name,
    kind,
    bMean: b.meanLatencyNs,
    cMean: c.meanLatencyNs,
    meanText,
    minText,
    heapText,
    gcText,
  });
}

// padVisible pads s to width n based on its visible (ANSI-stripped) length.
const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
function padVisible(s: string, n: number): string {
  const visible = s.replace(ansiPattern, "");
  const padding = Math.max(0, n - visible.length);
  return s + " ".repeat(padding);
}

if (!args.quiet) {
  const nameW = Math.max(4, ...rows.map((r) => r.name.length));
  const cols = [
    `${pad("task", nameW)}`,
    pad("baseline", 12),
    pad("current", 12),
    pad("min Δ", 10),
  ];
  const seps = [
    "-".repeat(nameW),
    "-".repeat(12),
    "-".repeat(12),
    "-".repeat(10),
  ];
  if (anyHeap) {
    cols.push(pad("heap Δ", 10));
    seps.push("-".repeat(10));
  }
  if (anyGc) {
    cols.push(pad("gc Δ", 10));
    seps.push("-".repeat(10));
  }
  cols.push("mean Δ");
  seps.push("-".repeat(28));
  console.log(cols.join("  "));
  console.log(seps.join("  "));
  for (const r of rows) {
    const b = r.bMean !== undefined ? fmtNs(r.bMean) : "—";
    const c = r.cMean !== undefined ? fmtNs(r.cMean) : "—";
    const minCell = padVisible(r.minText, 10);
    const cells = [pad(r.name, nameW), pad(b, 12), pad(c, 12), minCell];
    if (anyHeap) cells.push(padVisible(r.heapText || "—", 10));
    if (anyGc) cells.push(padVisible(r.gcText || "—", 10));
    cells.push(r.meanText);
    console.log(cells.join("  "));
  }
  console.log("");
}

console.log(
  `summary: ${regressions} regression(s), ${improvements} improvement(s), threshold ${args.threshold}%`,
);
process.exit(regressions > 0 ? 1 : 0);
