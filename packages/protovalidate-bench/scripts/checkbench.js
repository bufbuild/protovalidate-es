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

// Compare two bench JSON files written by src/bench.ts.
//
// Usage:
//   node scripts/checkbench.js <baseline.json> <current.json> [--threshold 5]
//
// "latest" / "previous" shortcuts pick the most recent files in .tmp/bench/:
//   node scripts/checkbench.js latest
//   node scripts/checkbench.js previous latest
//
// Exits non-zero if any task regresses by more than --threshold percent
// (default 5%). A regression is defined as a slower mean latency where the
// delta exceeds both the threshold AND the combined RME of the two samples
// (so we don't flag noise as a regression).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const BENCH_DIR = ".tmp/bench";
const DEFAULT_THRESHOLD = 5;

function parseArgs(argv) {
  const positional = [];
  let threshold = DEFAULT_THRESHOLD;
  let dir = BENCH_DIR;
  let quiet = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--threshold") {
      threshold = Number(argv[++i]);
    } else if (a === "--dir") {
      dir = argv[++i];
    } else if (a === "--quiet" || a === "-q") {
      quiet = true;
    } else if (a === "-h" || a === "--help") {
      usage();
      process.exit(0);
    } else if (a.startsWith("--")) {
      console.error(`unknown flag: ${a}`);
      process.exit(2);
    } else {
      positional.push(a);
    }
  }
  return { positional, threshold, dir, quiet };
}

function usage() {
  process.stdout.write(
    [
      "Usage: node scripts/checkbench.js <baseline> <current> [options]",
      "",
      "Arguments may be paths to JSON files or one of the shortcuts:",
      "  latest    most recent file in .tmp/bench/",
      "  previous  second-most recent file in .tmp/bench/",
      "",
      "Options:",
      "  --threshold <pct>   regression threshold percent (default: 5)",
      "  --dir <path>        bench results directory (default: .tmp/bench)",
      "  --quiet, -q         only print summary line",
      "",
      "Exit code: 0 if no regressions past threshold, 1 otherwise.",
      "",
    ].join("\n"),
  );
}

function resolveFile(arg, dir) {
  if (arg === "latest" || arg === "previous") {
    const entries = readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({ f, mtime: statSync(join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    const idx = arg === "latest" ? 0 : 1;
    if (entries.length <= idx) {
      throw new Error(`not enough JSON files in ${dir} to resolve "${arg}"`);
    }
    return resolve(dir, entries[idx].f);
  }
  return resolve(arg);
}

function load(path) {
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

function pad(s, n) {
  return String(s).padEnd(n);
}

function fmtNs(n) {
  if (n < 1000) return `${n.toFixed(0)} ns`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(2)} µs`;
  return `${(n / 1_000_000).toFixed(2)} ms`;
}

function color(s, code) {
  if (!process.stdout.isTTY) return s;
  return `\x1b[${code}m${s}\x1b[0m`;
}

const args = parseArgs(process.argv.slice(2));
if (args.positional.length === 0 || args.positional.length > 2) {
  usage();
  process.exit(2);
}

const baselineArg =
  args.positional.length === 2 ? args.positional[0] : "previous";
const currentArg =
  args.positional.length === 2 ? args.positional[1] : args.positional[0];

const baselinePath = resolveFile(baselineArg, args.dir);
const currentPath = resolveFile(currentArg, args.dir);

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
      cMean: c.meanLatencyNs,
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
    `${pad("", nameW).replaceAll(" ", "-")}  ${"-".repeat(12)}  ${"-".repeat(12)}  ${"-".repeat(20)}`,
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
