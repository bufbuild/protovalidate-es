# ![The Buf logo](.github/buf-logo.svg) protovalidate-es

`protovalidate-es` is the ECMAScript implementation of [`protovalidate`](https://github.com/bufbuild/protovalidate)
designed to validate Protobuf messages at runtime based on user-defined validation constraints.
Powered by Google's Common Expression Language ([CEL](https://github.com/google/cel-spec)),
it provides a flexible and efficient foundation for defining and evaluating
custom validation rules.

The primary goal of `protovalidate` is to help developers ensure data
consistency and integrity across the network without requiring generated code.

## Packages

- [@bufbuild/protovalidate](https://www.npmjs.com/package/@bufbuild/protovalidate):
  Validates Protobuf messages at runtime based on user-defined validation rules.
- [@bufbuild/cel](https://www.npmjs.com/package/@bufbuild/cel):
  Provides a [CEL](https://github.com/google/cel-spec) evaluator for ECMAScript.
- [@bufbuild/cel-spec](https://www.npmjs.com/package/@bufbuild/cel-spec):
  Provides [CEL](https://github.com/google/cel-spec) definitions and test data.

## Ecosystem

- [`protovalidate`](https://github.com/bufbuild/protovalidate) core repository
- [Buf][buf]
- [CEL Spec][cel-spec]

## Legal

Offered under the [Apache 2 license][license].

[license]: LICENSE
[buf]: https://buf.build
[cel-spec]: https://github.com/google/cel-spec
