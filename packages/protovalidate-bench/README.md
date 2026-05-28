# Protovalidate benchmarks

Performance benchmarks for `@bufbuild/protovalidate`. This package is private and
mirrors the suite in [`protovalidate-go/validator_bench_test.go`](https://github.com/bufbuild/protovalidate-go/blob/main/validator_bench_test.go)
so that runtime cost can be tracked across changes and compared cross-language.

The harness is [mitata](https://github.com/evanwashere/mitata), called via
its low-level `measure()` API so we can disable mitata's symmetric sample trim
and observe the raw min. By default, the runner spawns **5 fresh Node
processes** and aggregates per-task stats across them — between-process
variance (thermal state, JIT decisions, scheduling) dominates over within-run 
sample noise, and a single process can't see it.
Fixtures are hand-built (no faker dependency) and seeded with a
deterministic PRNG so every run validates the same messages.

## Running

From the repo root:

```shell
npx turbo run bench --filter=@bufbuild/protovalidate-bench
```

Or from this directory:

```shell
npm run bench
```

The runner prints a table of results and writes a JSON file to `.tmp/bench/`
(gitignored) named after the current timestamp.

### Options

| Flag                | Default      | Description                                                                    |
|---------------------|--------------|--------------------------------------------------------------------------------|
| `--filter <substr>` | _(none)_     | Only run tasks whose name contains `<substr>`                                  |
| `--out <dir>`       | `.tmp/bench` | Output directory for JSON results                                              |
| `--runs <N>`        | `5`          | Number of fresh Node processes to spawn and aggregate. `--runs 1` runs inline. |

A 5-run pass over the full suite takes a few minutes. For
quick iteration, drop to `--runs 1` and accept the wider noise floor, or
combine `--runs 1 --filter <substr>` to only re-measure the tasks you're
changing.

Example:

```shell
# Quick single-process check, validation benchmarks only
npm run bench -- --runs 1 --filter Scalar

# Full 5-run aggregate
npm run bench
```

### Output schema

Each invocation writes a single JSON file. The shape (schemaVersion 2):

```json
{
  "schemaVersion": 2,
  "node": "v22.x.x",
  "platform": "darwin/arm64",
  "timestamp": "2026-05-27T...",
  "runs": 5,
  "tasks": [
    {
      "name": "Scalar",
      "meanLatencyNs": 4099.62,
      "minLatencyNs": 3920.79,
      "medianLatencyNs": 4060.41,
      "p99LatencyNs": 5008.19,
      "throughputOpsPerSec": 243924,
      "rmePercent": 4.10,
      "crossRunRsdPercent": 0.13,
      "samples": 125,
      "runs": 5,
      "perRunMeanLatencyNs": [4108.5, 4099.6, 4098.2, 4101.1, 4099.8],
      "heapAvgBytes": 5315.2,
      "gcTotalNs": 161677084
    }
  ]
}
```

Field notes:

- `meanLatencyNs` — trimmed mean (drops the lowest two and highest two samples) of
  each process's sample set, then median across runs.
- `minLatencyNs` — true raw minimum sample across all runs. Older
  schemaVersion-1 files reported mitata's trimmed min (third-lowest), so
  comparing v1↔v2 will show min deltas that don't reflect real changes;
  checkbench warns about this.
- `rmePercent` — within-run sample RSD (median across runs).
  Informational only — overstates real signal when comparing across
  processes.
- `crossRunRsdPercent` — RSD of per-run means. **This is the noise floor
  checkbench uses for regression detection.** Present only when
  `runs > 1`.
- `perRunMeanLatencyNs` — per-process means in registration order.
  Present only when `runs > 1`. Lets you spot a single outlier process.
- `gcTotalNs` and `heapAvgBytes` are only present when mitata can observe
  them (Node started with `--expose-gc` for GC stats; `node:v8`
  `getHeapStatistics()` for heap). The `npm run bench` script already
  passes `--expose-gc`.

## Benchmarks

Each task mirrors the equivalent `Benchmark*` in `protovalidate-go` so deltas
between languages stay meaningful.

| Task                           | What it measures                                                             |
|--------------------------------|------------------------------------------------------------------------------|
| `Scalar`                       | One `int32` with `gt = 0`. Minimum-overhead baseline.                        |
| `Repeated/Scalar`              | `repeated int32` with `max_items`.                                           |
| `Repeated/Message`             | `repeated` of nested messages.                                               |
| `Repeated/Unique/Scalar`       | `repeated float` with `unique = true` (hash-based dedup path).               |
| `Repeated/Unique/Bytes`        | `repeated bytes` with `unique = true`.                                       |
| `Map`                          | `map<string, string>` with `min_pairs`.                                      |
| `ComplexSchema`                | Broad message exercising scalars, repeated, maps, oneof, nested, self-ref.   |
| `Int32GT`                      | Many numeric comparison rules (`gt`/`gte`/`lt`/`lte`/`const`/`in`/`not_in`). |
| `TestByteMatching`             | `bytes.ip` / `bytes.ipv4` / `bytes.ipv6` / `bytes.uuid`.                     |
| `StringMatching`               | `string.hostname` / `host_and_port` / `email` / `uuid`.                      |
| `WrapperTesting`               | `google.protobuf.*Value` wrapper fields with rules.                          |
| `MultiRule/Error`              | Multi-rule field that fails — drives violation accumulation.                 |
| `MultiRule/NoError`            | Same schema, valid value — success path.                                     |
| `Compile/ComplexSchema`        | `createValidator()` + first validate on each iteration. Plan-build cost.     |
| `Compile/Int32GT`              | Same, simpler schema.                                                        |
| `StandardSchema/Scalar`        | Standard Schema adapter, scalar message. TS-only — no Go analogue.           |
| `StandardSchema/ComplexSchema` | Standard Schema adapter, complex message.                                    |

## Comparing runs

Use `checkbench` to diff two result files and surface regressions:

```shell
# compares the last two JSON files in .tmp/bench/
tsx src/checkbench.ts

# compare the latest JSON file against a specific baseline file in .tmp/bench/:
tsx src/checkbench.ts baseline.json

# Or pass explicit files for baseline and current:
tsx src/checkbench.ts baseline.json current.json
```

Output is per task: baseline mean, current mean, `min Δ`, `heap Δ`
(when available), an optional `gc Δ` (when both runs have GC stats), and
`mean Δ` with a marker — `REGRESS (mean|min|heap|...)`, `faster (...)`, or
`(noise)`. A delta is treated as noise if it falls inside the combined
noise floor of the two files: the sum of each side's `crossRunRsdPercent`
(when present) or `rmePercent` (fallback for schemaVersion-1 files, which
overstates real signal).

The tool gates on three signals: **mean latency, min latency, and heap
allocation per iteration**. A task fails if any of these deltas exceeds
`--threshold` and falls outside the noise floor.

- **Mean** catches the typical-case slowdown.
- **Min** is the raw fastest sample across all runs — sensitive to JIT
  warmth and immune to GC pauses. With multi-run aggregation the min is
  taken across every process's samples, so it's also stable against single-process 
  JIT variance.
- **Heap Δ** is bytes allocated per iteration (via `node:v8`
  `getHeapStatistics()`). Catches allocation regressions even when wall-clock time
  is flat — those still hurt in production because they amplify GC pressure.
  The heap signal is mostly deterministic for short benches; for long-running
  alloc-heavy benches (`Compile/*`) it can drift with GC scheduling, which
  the noise floor absorbs.
- **GC Δ** is informational only (no gating) and only appears when both runs
  were produced with `--expose-gc` so mitata can observe gc time.

### Options

| Flag                | Default      | Description                                                  |
|---------------------|--------------|--------------------------------------------------------------|
| `--threshold <pct>` | `5`          | Regression bar. Slowdowns above this AND outside noise fail. |
| `--dir <path>`      | `.tmp/bench` | Directory the `latest` / `previous` shortcuts look in.       |
| `--quiet`, `-q`     | _(off)_      | Print summary line only.                                     |

Pass a larger `--threshold` if you're working on noisier hardware or want to allow
small regressions through.

The script exits **2** for bad parameter values (invalid threshold, directory, or files), **1** if any task regresses past `--threshold`, otherwise
**0** — drop it into a pre-commit hook or CI step to gate PRs on performance.

### Typical workflow

```shell
git checkout main
npm run bench                          # produces .tmp/bench/<ts>.json (baseline)

git checkout my-optimization-branch
npm run bench                          # produces .tmp/bench/<ts>.json (current)

node scripts/checkbench.ts latest      # diff vs previous
```

Bench-to-bench wall-time numbers are sensitive to other loads on the
machine. For meaningful comparison, run baseline and current on the same
hardware, close other CPU-heavy apps, and bump `--runs` if you need a
tighter noise floor than the default 5 runs gives.

## Regenerating proto code

If the `.proto` files change:

```shell
npm run generate
```

Generated code lives under `src/gen/` and is committed.
