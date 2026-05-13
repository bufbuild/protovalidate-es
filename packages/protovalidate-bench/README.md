# Protovalidate benchmarks

Performance benchmarks for `@bufbuild/protovalidate`. This package is private and
mirrors the suite in [`protovalidate-go/validator_bench_test.go`](https://github.com/bufbuild/protovalidate-go/blob/main/validator_bench_test.go)
so that runtime cost can be tracked across changes and compared cross-language.

The harness is [tinybench](https://github.com/tinylibs/tinybench). Fixtures are
hand-built (no faker dependency) and seeded with a deterministic PRNG so every
run validates the same messages.

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
| `--time <ms>`         | `1000`      | Per-task wall-time budget                                       |
| `--iterations <n>`    | _(time)_    | Force fixed iteration count instead of the time budget          |
| `--warmup <n>`        | `16`        | Warmup iterations per task                                      |
| `--out <dir>`         | `.tmp/bench`| Output directory for JSON results                               |

Examples:

```shell
# Quick smoke run
npm run bench -- --time 200 --warmup 5

# Only validation benchmarks (skip the Compile/* tasks)
npm run bench -- --filter Scalar

# Long, stable run
npm run bench -- --time 5000 --warmup 32
```

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
# After running on main, then on your branch:
node scripts/checkbench.js previous latest

# Or pass explicit paths:
node scripts/checkbench.js .tmp/bench/baseline.json .tmp/bench/current.json
```

The shortcuts `latest` and `previous` resolve to the newest and second-newest
JSON files in `.tmp/bench/` (by mtime). Calling with only one argument
defaults the baseline to `previous`.

Output is per task: baseline mean, current mean, `±%` delta, and a marker —
`REGRESS`, `faster`, or `(noise)`. A delta is treated as noise if it falls
inside the combined RME of the two runs, so jitter in low-RME benchmarks does
not trigger false alarms.

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

node scripts/checkbench.js latest      # diff vs previous
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
