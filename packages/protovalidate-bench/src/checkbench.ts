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
  };
  byName: Map<string, Task>;
};

type Task = {
  name: string;
  meanLatencyNs: number;
  p99LatencyNs: number;
  throughputOpsPerSec: number;
  rmePercent: number;
  samples: number;
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
  `          ${baseline.meta.timestamp}  node ${baseline.meta.node}  ${baseline.meta.platform}`,
);
console.log(`current:  ${current.meta.path}`);
console.log(
  `          ${current.meta.timestamp}  node ${current.meta.node}  ${current.meta.platform}`,
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

const names = new Set([...baseline.byName.keys(), ...current.byName.keys()]);
let regressions = 0;
let improvements = 0;

const rows = [];
for (const name of [...names].sort()) {
  const b = baseline.byName.get(name);
  const c = current.byName.get(name);
  if (!b) {
    rows.push({
      name,
      kind: "new",
      text: color("NEW", "36"),
      bMean: undefined,
      cMean: c ? c.meanLatencyNs : undefined,
      delta: undefined,
    });
    continue;
  }
  if (!c) {
    rows.push({
      name,
      kind: "gone",
      text: color("GONE", "90"),
      bMean: b.meanLatencyNs,
      cMean: undefined,
      delta: undefined,
    });
    continue;
  }
  const deltaPct =
    ((c.meanLatencyNs - b.meanLatencyNs) / b.meanLatencyNs) * 100;
  // Combined relative margin of error; deltas inside this are noise.
  const noiseFloor = (b.rmePercent ?? 0) + (c.rmePercent ?? 0);
  let kind = "ok";
  let text = `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(2)}%`;
  if (deltaPct > args.threshold && Math.abs(deltaPct) > noiseFloor) {
    kind = "regress";
    text = color(`${text}  REGRESS`, "31");
    regressions++;
  } else if (deltaPct < -args.threshold && Math.abs(deltaPct) > noiseFloor) {
    kind = "improve";
    text = color(`${text}  faster`, "32");
    improvements++;
  } else if (Math.abs(deltaPct) <= noiseFloor) {
    text = color(`${text}  (noise)`, "90");
  }
  rows.push({
    name,
    kind,
    text,
    bMean: b.meanLatencyNs,
    cMean: c.meanLatencyNs,
    delta: deltaPct,
  });
}

if (!args.quiet) {
  const nameW = Math.max(4, ...rows.map((r) => r.name.length));
  console.log(
    `${pad("task", nameW)}  ${pad("baseline", 12)}  ${pad("current", 12)}  delta`,
  );
  console.log(
    `${"-".repeat(nameW)}  ${"-".repeat(12)}  ${"-".repeat(12)}  ${"-".repeat(20)}`,
  );
  for (const r of rows) {
    const b = r.bMean !== undefined ? fmtNs(r.bMean) : "—";
    const c = r.cMean !== undefined ? fmtNs(r.cMean) : "—";
    console.log(
      `${pad(r.name, nameW)}  ${pad(b, 12)}  ${pad(c, 12)}  ${r.text}`,
    );
  }
  console.log("");
}

console.log(
  `summary: ${regressions} regression(s), ${improvements} improvement(s), threshold ${args.threshold}%`,
);
process.exit(regressions > 0 ? 1 : 0);
