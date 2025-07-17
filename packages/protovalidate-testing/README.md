# Protovalidate conformance tests

This private package runs the [protovalidate conformance tests](https://github.com/bufbuild/protovalidate/blob/v0.9.0/docs/conformance.md).

Scripts:

- `generate`: Generates [buf.build/bufbuild/protovalidate-testing](https://buf.build/bufbuild/protovalidate-testing) - Protobuf messages required for the conformance tests.
- `test`: Runs the conformance tests with [src/executor.ts](src/executor.ts).

The upstream protovalidate version is specified in the internal package `upstream`.

Known failures are listed in [expected-failures.yaml](expected-failures.yaml).
