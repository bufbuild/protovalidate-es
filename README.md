[![The Buf logo](.github/buf-logo.svg)][buf]

# protovalidate-es

[Protovalidate][protovalidate] provides standard annotations to validate common constraints on messages and fields, as well as the ability to use [CEL][cel] to write custom constraints. It's the next generation of [protoc-gen-validate][protoc-gen-validate], the only widely used validation library for Protobuf.

With Protovalidate, you can annotate your Protobuf messages with both standard and custom validation rules:

```protobuf
syntax = "proto3";

package banking.v1;

import "buf/validate/validate.proto";

message MoneyTransfer {
  string to_account_id = 1 [
    // Standard rule: `to_account_id` must be a UUID.
    (buf.validate.field).string.uuid = true
  ];

  string from_account_id = 2 [
    // Standard rule: `from_account_id` must be a UUID.
    (buf.validate.field).string.uuid = true
  ];

  // Custom rule: `to_account_id` and `from_account_id` can't be the same.
  option (buf.validate.message).cel = {
    id: "to_account_id.not.from_account_id"
    message: "to_account_id and from_account_id should not be the same value"
    expression: "this.to_account_id != this.from_account_id"
  };
}
```

Once you've added `@bufbuild/protovalidate` to your project, validation is simple:

```ts
import { create } from "@bufbuild/protobuf";
import { createValidator } from "@bufbuild/protovalidate";
import { MoneyTransferSchema } from "./gen/banking_pb";

const transfer = create(MoneyTransferSchema);

const v = createValidator();

try {
  v.validate(MoneyTransferSchema, transfer);
} catch (e) {
  // Handle failure.
}
```

## Packages

- [@bufbuild/protovalidate](https://www.npmjs.com/package/@bufbuild/protovalidate):
  Validates Protobuf messages at runtime based on user-defined validation rules.
- [@bufbuild/cel](https://www.npmjs.com/package/@bufbuild/cel):
  Provides a [CEL](https://github.com/google/cel-spec) evaluator for ECMAScript.
- [@bufbuild/cel-spec](https://www.npmjs.com/package/@bufbuild/cel-spec):
  Provides [CEL](https://github.com/google/cel-spec) definitions and test data.

## Additional Languages and Repositories

Protovalidate isn't just for ECMAScript! You might be interested in sibling repositories for other languages:

- [`protovalidate-go`][pv-go] (Go)
- [`protovalidate-java`][pv-java] (Java)
- [`protovalidate-python`][pv-python] (Python)
- [`protovalidate-cc`][pv-cc] (C++)

Additionally, [protovalidate's core repository](https://github.com/bufbuild/protovalidate) provides:

- [Protovalidate's Protobuf API][validate-proto]
- [Example][examples] `.proto` files using `protovalidate`
- [Conformance testing utilities][conformance] for acceptance testing of `protovalidate` implementations

## Contribution

We genuinely appreciate any help! If you'd like to contribute, check out these resources:

- [Contributing Guidelines][contributing]: Guidelines to make your contribution process straightforward and meaningful
- [Conformance testing utilities](https://github.com/bufbuild/protovalidate/tree/main/docs/conformance.md): Utilities providing acceptance testing of `protovalidate` implementations
- [Protovalidate-ES conformance executor][conformance-executable]: Conformance testing executor

## Related Sites

- [Buf][buf]: Enterprise-grade Kafka and gRPC for the modern age
- [Common Expression Language (CEL)][cel]: The open-source technology at the core of Protovalidate

## Legal

Offered under the [Apache 2 license][license].

[buf]: https://buf.build
[cel]: https://cel.dev
[pv-go]: https://github.com/bufbuild/protovalidate-go
[pv-java]: https://github.com/bufbuild/protovalidate-java
[pv-python]: https://github.com/bufbuild/protovalidate-python
[pv-cc]: https://github.com/bufbuild/protovalidate-cc
[license]: LICENSE
[contributing]: .github/CONTRIBUTING.md
[protoc-gen-validate]: https://github.com/bufbuild/protoc-gen-validate
[protovalidate]: https://buf.build/docs/protovalidate/overview/
[quickstart]: https://buf.build/docs/protovalidate/quickstart/
[conformance-executable]: ./packages/protovalidate-testing/README.md
[validate-proto]: https://buf.build/bufbuild/protovalidate/docs/main:buf.validate
[conformance]: https://github.com/bufbuild/protovalidate/blob/main/docs/conformance.md
[examples]: https://github.com/bufbuild/protovalidate/tree/main/examples
