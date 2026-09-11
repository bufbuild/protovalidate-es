# Protovalidate benchmarks

Performance benchmarks for `@bufbuild/protovalidate`. This package is private and
mirrors the suite in [`protovalidate-go/validator_bench_test.go`](https://github.com/bufbuild/protovalidate-go/blob/main/validator_bench_test.go)
so that runtime cost can be tracked across changes and compared cross-language.

## Running

With turborepo:

```shell
npx turbo run bench --filter=@bufbuild/protovalidate-bench -- [regex]
```

This command will rebuild the `protovalidate` package and run the benchmarks. This is preferred to make sure
the latest changes are reflected in the results.

You can also run the benchmarks directly from the `protovalidate-bench` package:

```shell
npm run bench
```

The runner prints a table of results and writes a JSON file to `.tmp/bench/`
(gitignored) named after the current timestamp. See type `OutputJson` for the
file contents.

### Arguments and options

| Argument / flag | Default      | Description                        |
|-----------------|--------------|------------------------------------|
| `[regex]`       | `.*`         | Run tasks matching this regex.     |
| `--dir <dir>`   | `.tmp/bench` | Output directory for JSON results. |
| `--help`, `-h`  |              | Print usage information.           |

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
