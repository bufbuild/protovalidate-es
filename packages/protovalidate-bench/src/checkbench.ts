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

function usage() {
  process.stdout.write(
    [
      "Usage: tsx src/new_checkbench.ts [baseline] [current] [options]",
      "",
      "Arguments are paths to JSON files relative to the benchmark directory (default: .tmp/bench/).",
      "If no arguments are given, the two most recent files are used with the older file as baseline.",
      "If one argument is given, it is used as the baseline and the most recent file is used as current.",
      "If two arguments are given, the first is the baseline and the second is the current.",
      "",
      "Options:",
      "  --dir <path>        bench results directory (default: .tmp/bench)",
      "  --help, -h          show this help and exit",
      "",
    ].join("\n"),
  );
}

// Shape of each task in a tinybench-produced JSON file. Only the latency
// fields we read are required; the rest of result.* is ignored.
type TinybenchTask = {
  name: string;
  result?: {
    latency?: {
      mean: number;
      p50: number;
    };
  };
};

type FileInfo = {
  path: string;
  timestamp: string;
  node: string;
  platform: string;
  byName: Map<string, TinybenchTask>;
};

function load(path: string): FileInfo {
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const byName = new Map<string, TinybenchTask>();
  for (const task of data.tasks ?? []) {
    byName.set(task.name, task);
  }
  return {
    path,
    timestamp: data.timestamp ?? "",
    node: data.node ?? "",
    platform: data.platform ?? "",
    byName,
  };
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

// tinybench reports latency in milliseconds. Convert to ns once at the
// boundary so the rest of the code (and fmtNs) works in a single unit.
function msToNs(ms: number): number {
  return ms * 1e6;
}

function fmtNs(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1000) return `${n.toFixed(0)} ns`;
  if (abs < 1_000_000) return `${(n / 1000).toFixed(2)} µs`;
  return `${(n / 1_000_000).toFixed(2)} ms`;
}

function fmtSignedNs(n: number): string {
  const s = fmtNs(n);
  return n >= 0 && !s.startsWith("-") ? `+${s}` : s;
}

function fmtPct(pct: number): string {
  if (!Number.isFinite(pct)) return pct > 0 ? "+∞%" : "-∞%";
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

function pad(s: string, n: number): string {
  return String(s).padEnd(n);
}

type ParsedValues = {
  dir?: string;
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
  return { dir };
}

// Render one row per task name present in either file. Tasks that errored
// (no result.latency) are reported as "—" cells so the row layout stays
// consistent.
type Row = {
  name: string;
  baseMean: string;
  curMean: string;
  meanDeltaNs: string;
  meanDeltaPct: string;
  baseP50: string;
  curP50: string;
  p50DeltaNs: string;
  p50DeltaPct: string;
};

function deltaCells(
  baseMs: number | undefined,
  curMs: number | undefined,
): { base: string; cur: string; deltaNs: string; deltaPct: string } {
  if (baseMs === undefined || curMs === undefined) {
    return {
      base: baseMs === undefined ? "—" : fmtNs(msToNs(baseMs)),
      cur: curMs === undefined ? "—" : fmtNs(msToNs(curMs)),
      deltaNs: "—",
      deltaPct: "—",
    };
  }
  const baseNs = msToNs(baseMs);
  const curNs = msToNs(curMs);
  const deltaNs = curNs - baseNs;
  const deltaPct =
    baseNs === 0 ? Number.POSITIVE_INFINITY : (deltaNs / baseNs) * 100;
  return {
    base: fmtNs(baseNs),
    cur: fmtNs(curNs),
    deltaNs: fmtSignedNs(deltaNs),
    deltaPct: fmtPct(deltaPct),
  };
}

function buildRows(baseline: FileInfo, current: FileInfo): Row[] {
  const rows: Row[] = [];
  const names = new Set([...baseline.byName.keys(), ...current.byName.keys()]);
  for (const name of [...names].sort()) {
    const b = baseline.byName.get(name);
    const c = current.byName.get(name);
    const meanCells = deltaCells(
      b?.result?.latency?.mean,
      c?.result?.latency?.mean,
    );
    const p50Cells = deltaCells(
      b?.result?.latency?.p50,
      c?.result?.latency?.p50,
    );
    rows.push({
      name,
      baseMean: meanCells.base,
      curMean: meanCells.cur,
      meanDeltaNs: meanCells.deltaNs,
      meanDeltaPct: meanCells.deltaPct,
      baseP50: p50Cells.base,
      curP50: p50Cells.cur,
      p50DeltaNs: p50Cells.deltaNs,
      p50DeltaPct: p50Cells.deltaPct,
    });
  }
  return rows;
}

function writeHeader(baseline: FileInfo, current: FileInfo): void {
  console.log(`baseline: ${baseline.path}`);
  console.log(
    `          ${baseline.timestamp}  node ${baseline.node}  ${baseline.platform}`,
  );
  console.log(`current:  ${current.path}`);
  console.log(
    `          ${current.timestamp}  node ${current.node}  ${current.platform}`,
  );
  console.log("");
}

function writeTable(rows: Row[]): void {
  const nameW = Math.max(4, ...rows.map((r) => r.name.length));
  const cellW = 12;
  const deltaW = 12;
  const pctW = 9;
  console.log(
    [
      pad("task", nameW),
      pad("base mean", cellW),
      pad("cur mean", cellW),
      pad("mean Δ", deltaW),
      pad("mean %", pctW),
      pad("base p50", cellW),
      pad("cur p50", cellW),
      pad("p50 Δ", deltaW),
      pad("p50 %", pctW),
    ].join("  "),
  );
  console.log(
    [
      "-".repeat(nameW),
      "-".repeat(cellW),
      "-".repeat(cellW),
      "-".repeat(deltaW),
      "-".repeat(pctW),
      "-".repeat(cellW),
      "-".repeat(cellW),
      "-".repeat(deltaW),
      "-".repeat(pctW),
    ].join("  "),
  );
  for (const r of rows) {
    console.log(
      [
        pad(r.name, nameW),
        pad(r.baseMean, cellW),
        pad(r.curMean, cellW),
        pad(r.meanDeltaNs, deltaW),
        pad(r.meanDeltaPct, pctW),
        pad(r.baseP50, cellW),
        pad(r.curP50, cellW),
        pad(r.p50DeltaNs, deltaW),
        pad(r.p50DeltaPct, pctW),
      ].join("  "),
    );
  }
}

function main(): void {
  const options = {
    dir: {
      type: "string",
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

  writeHeader(baseline, current);

  const rows = buildRows(baseline, current);

  writeTable(rows);
}

main();
