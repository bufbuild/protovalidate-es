# Protovalidate benchmarks

Performance benchmarks for `@bufbuild/protovalidate`. This package is private and
mirrors the suite in [`protovalidate-go/validator_bench_test.go`](https://github.com/bufbuild/protovalidate-go/blob/main/validator_bench_test.go)
so that runtime cost can be tracked across changes and compared cross-language.

## Running

From the repo root:

```shell
npx turbo run bench [regex] --dir <dir>
```

Or from this directory:

```shell
npm run bench
```

The runner prints a table of results and writes a JSON file to `.tmp/bench/`
(gitignored) named after the current timestamp.

### Arguments and options

| Argument / flag | Default      | Description                        |
|-----------------|--------------|------------------------------------|
| `[regex]`       | `.*`         | Run tasks matching this regex.     |
| `--dir <dir>`   | `.tmp/bench` | Output directory for JSON results. |
| `--help`, `-h`  |              | Print usage information.           |

### Output schema

Each invocation writes a single JSON file named after the current timestamp,
containing a `tasks` array of objects with the following fields:

```json
{
  "timestamp": "2026-06-02T17-30-42-845Z",
  "node": "v24.15.0",
  "platform": "darwin/arm64",
  "tasks": [
    {
      "name": "Scalar",
      "result": {
        "state": "completed",
        "latency": {
          "aad": 0.000023186290713732412,
          "critical": 1.96,
          "df": 217917,
          "mad": 9.99999883788405e-7,
          "max": 0.10383299999989504,
          "mean": 0.0004588884259220391,
          "min": 0.00033300000018243736,
          "moe": 0.000001330994271845705,
          "p50": 0.00045799999998052954,
          "p75": 0.00045899999986431794,
          "p99": 0.0005840000001171575,
          "p995": 0.0007499999999254214,
          "p999": 0.0014590000000680448,
          "rme": 0.2900474705090576,
          "samplesCount": 217918,
          "sd": 0.0003170054051330531,
          "sem": 6.790787101253597e-7,
          "variance": 1.0049242688357114e-7
        },
        "period": 0.0004588884259220385,
        "throughput": {
          "aad": 97984.76021053715,
          "critical": 1.96,
          "df": 217917,
          "mad": 4756.875513155013,
          "max": 3003003.001357778,
          "mean": 2215598.5707707237,
          "min": 9630.849537247415,
          "moe": 672.4829553507935,
          "p50": 2183406.1136299386,
          "p75": 2398081.533635069,
          "p99": 2403846.154659788,
          "p995": 2403846.154659788,
          "p999": 2403846.154659788,
          "rme": 0.030352202074081583,
          "samplesCount": 217918,
          "sd": 160166.5282980001,
          "sem": 343.10354864836404,
          "variance": 25653316787.034073
        },
        "totalTime": 100.00004800007878,
        "runtime": "node",
        "runtimeVersion": "24.15.0",
        "timestampProviderName": "performanceNow"
      }
    }
  ]
}
```

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
| `StandardSchema/Scalar`        | Standard Schema adapter, scalar message. TS-only — no Go analogue.           |
| `StandardSchema/ComplexSchema` | Standard Schema adapter, complex message.                                    |

## Regenerating proto code

If the `.proto` files change:

```shell
npm run generate
```

Generated code lives under `src/gen/` and is committed.
