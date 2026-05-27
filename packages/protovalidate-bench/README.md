# Protovalidate benchmarks

Performance benchmarks for `@bufbuild/protovalidate`. This package is private and
mirrors the suite in [`protovalidate-go/validator_bench_test.go`](https://github.com/bufbuild/protovalidate-go/blob/main/validator_bench_test.go)
so that runtime cost can be tracked across changes and compared cross-language.

The harness is [mitata](https://github.com/evanwashere/mitata), which
auto-tunes warmup and sample counts and reports per-task histograms, p99, and
optimization-elimination warnings. Fixtures are hand-built (no faker
dependency) and seeded with a deterministic PRNG so every run validates the
same messages.

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

| Flag                  | Default     | Description                                                     |
| --------------------- | ----------- | --------------------------------------------------------------- |
| `--filter <substr>`   | _(none)_    | Only run tasks whose name contains `<substr>`                   |
| `--out <dir>`         | `.tmp/bench`| Output directory for JSON results                               |

mitata auto-tunes warmup, sample count, and per-task wall time. To slow the
runner down, run fewer benchmarks via `--filter`.

Example:

```shell
# Only validation benchmarks (skip the Compile/* tasks)
npm run bench -- --filter Scalar
```

### Output schema

Each run writes a JSON file like:

```json
{
  "node": "v22.x.x",
  "platform": "darwin/arm64",
  "timestamp": "2026-05-27T...",
  "tasks": [
    {
      "name": "Scalar",
      "meanLatencyNs": 110.42,
      "minLatencyNs": 104.18,
      "medianLatencyNs": 108.93,
      "p99LatencyNs": 142.07,
      "throughputOpsPerSec": 9056221,
      "rmePercent": 4.71,
      "samples": 128,
      "gcTotalNs": 0,
      "heapAvgBytes": 0
    }
  ]
}
```

`gcTotalNs` and `heapAvgBytes` are only present when mitata can observe them
(Node started with `--expose-gc` for GC stats; `node:v8` heap stats for heap).

## Benchmarks

Each task mirrors the equivalent `Benchmark*` in `protovalidate-go` so deltas
between languages stay meaningful.

| Task                            | What it measures                                                                |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `Scalar`                        | One `int32` with `gt = 0`. Minimum-overhead baseline.                           |
| `Repeated/Scalar`               | `repeated int32` with `max_items`.                                              |
| `Repeated/Message`              | `repeated` of nested messages.                                                  |
| `Repeated/Unique/Scalar`        | `repeated float` with `unique = true` (hash-based dedup path).                  |
| `Repeated/Unique/Bytes`         | `repeated bytes` with `unique = true`.                                          |
| `Map`                           | `map<string, string>` with `min_pairs`.                                         |
| `ComplexSchema`                 | Broad message exercising scalars, repeated, maps, oneof, nested, self-ref.     |
| `Int32GT`                       | Many numeric comparison rules (`gt`/`gte`/`lt`/`lte`/`const`/`in`/`not_in`).    |
| `TestByteMatching`              | `bytes.ip` / `bytes.ipv4` / `bytes.ipv6` / `bytes.uuid`.                        |
| `StringMatching`                | `string.hostname` / `host_and_port` / `email` / `uuid`.                         |
| `WrapperTesting`                | `google.protobuf.*Value` wrapper fields with rules.                             |
| `MultiRule/Error`               | Multi-rule field that fails — drives violation accumulation.                    |
| `MultiRule/NoError`             | Same schema, valid value — success path.                                        |
| `Compile/ComplexSchema`         | `createValidator()` + first validate on each iteration. Plan-build cost.       |
| `Compile/Int32GT`               | Same, simpler schema.                                                           |
| `StandardSchema/Scalar`         | Standard Schema adapter, scalar message. TS-only — no Go analogue.              |
| `StandardSchema/ComplexSchema`  | Standard Schema adapter, complex message.                                       |

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
relative standard deviation of the two runs.

The tool gates on three signals: **mean latency, min latency, and heap
allocation per iteration**. A task fails if any of these deltas exceeds
`--threshold` and falls outside the noise floor.

- **Mean** catches the typical-case slowdown.
- **Min** is the JIT-warm floor — immune to GC pauses, so it surfaces real
  CPU regressions that mean might hide in tail noise.
- **Heap Δ** is bytes allocated per iteration (via `node:v8`
  `getHeapStatistics()`). Catches allocation regressions even when wall-clock
  is flat — those still hurt in production because they amplify GC pressure.
  The heap signal is mostly deterministic for short benches; for long-running
  alloc-heavy benches (`Compile/*`) it can drift with GC scheduling, which
  the noise floor absorbs.
- **GC Δ** is informational only (no gating) and only appears when both runs
  were produced with `--expose-gc` so mitata can observe gc time.

Note on `rmePercent`: it's the relative standard deviation of the
samples (`stddev / mean × 100`).

### Options

| Flag                  | Default | Description                                                      |
| --------------------- | ------- | ---------------------------------------------------------------- |
| `--threshold <pct>`   | `5`     | Regression bar. Slowdowns above this AND outside noise fail.     |
| `--dir <path>`        | `.tmp/bench` | Directory the `latest` / `previous` shortcuts look in.      |
| `--quiet`, `-q`       | _(off)_ | Print summary line only.                                         |

The script exits **1** if any task regresses past `--threshold`, otherwise
**0** — drop it into a pre-commit hook or CI step to gate PRs on performance.

### Typical workflow

```shell
git checkout main
npm run bench                          # produces .tmp/bench/<ts>.json (baseline)

git checkout my-optimization-branch
npm run bench                          # produces .tmp/bench/<ts>.json (current)

node scripts/checkbench.ts latest      # diff vs previous
```

Heads up: bench-to-bench wall-time numbers are sensitive to other load on the
machine. For meaningful comparison, run baseline and current on the same
hardware, close other CPU-heavy apps, and prefer longer runs
(`--time 5000`) when the deltas you care about are within a few percent.

## Regenerating proto code

If the `.proto` files change:

```shell
npm run generate
```

Generated code lives under `src/gen/` and is committed.
