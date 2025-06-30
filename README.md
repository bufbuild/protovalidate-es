[![The Buf logo](.github/buf-logo.svg)][buf]

# protovalidate-es

[![License](https://img.shields.io/github/license/bufbuild/cel-es?color=blue)](./LICENSE) [![NPM Version](https://img.shields.io/npm/v/@bufbuild/protovalidate/latest?color=green&label=%40bufbuild%2Fprotovalidate)](https://www.npmjs.com/package/@bufbuild/protovalidate)

[Protovalidate][protovalidate] is the semantic validation library for Protobuf. It provides standard annotations to validate common rules on messages and fields, as well as the ability to use [CEL][cel] to write custom rules. It's the next generation of [protoc-gen-validate][protoc-gen-validate].

With Protovalidate, you can annotate your Protobuf messages with both standard and custom validation rules:

```protobuf
syntax = "proto3";

package acme.user.v1;

import "buf/validate/validate.proto";

message User {
  string id = 1 [(buf.validate.field).string.uuid = true];
  uint32 age = 2 [(buf.validate.field).uint32.lte = 150]; // We can only hope.
  string email = 3 [(buf.validate.field).string.email = true];
  string first_name = 4 [(buf.validate.field).string.max_len = 64];
  string last_name = 5 [(buf.validate.field).string.max_len = 64];

  option (buf.validate.message).cel = {
    id: "first_name_requires_last_name"
    message: "last_name must be present if first_name is present"
    expression: "!has(this.first_name) || has(this.last_name)"
  };
}
```

Once you've added `@bufbuild/protovalidate` to your project, validation is simple:

```ts
import { create } from "@bufbuild/protobuf";
import { createValidator } from "@bufbuild/protovalidate";
import { MoneyTransferSchema } from "./gen/banking_pb";

const transfer = create(MoneyTransferSchema);

const validator = createValidator();
const result = validator.validate(MoneyTransferSchema, transfer);
if (result.kind !== "valid") {
  // Handle failure.
}
```

> [!TIP]
> 
> The `string.pattern` rule supports regular expressions with CEL's standard [RE2 syntax](https://github.com/google/re2/wiki/syntax). 
> 
> Protovalidate translates RE2 to ECMAScript's regular expressions. This works except for some RE2 flags, but it cannot support RE2's most important property: Execution in linear time, which guards against [ReDoS](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS).
>
> If you need full support for RE2, you can bring your own RE2 implementation:
> 
> ```ts
> const validator = createValidator({
>   regexMatch: (pattern: string, against: string): boolean => new RE2(pattern).test(against),
> });
> ```


## Packages

- [@bufbuild/protovalidate](https://www.npmjs.com/package/@bufbuild/protovalidate):
  Validates Protobuf messages at runtime based on user-defined validation rules.

Note that protovalidate-es requires the Protobuf runtime [@bufbuild/protobuf](https://www.npmjs.com/package/@bufbuild/protobuf).


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

## Contributing

We genuinely appreciate any help! If you'd like to contribute, check out these resources:

- [Contributing Guidelines][contributing]: Guidelines to make your contribution process straightforward and meaningful
- [Conformance testing utilities](https://github.com/bufbuild/protovalidate/tree/main/docs/conformance.md): Utilities providing acceptance testing of `protovalidate` implementations
- [Protovalidate-ES conformance executor][conformance-executable]: Conformance testing executor

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
[protovalidate]: https://buf.build/docs/protovalidate
[quickstart]: https://buf.build/docs/protovalidate/quickstart/
[conformance-executable]: ./packages/protovalidate-testing/README.md
[validate-proto]: https://buf.build/bufbuild/protovalidate/docs/main:buf.validate
[conformance]: https://github.com/bufbuild/protovalidate/blob/main/docs/conformance.md
[examples]: https://github.com/bufbuild/protovalidate/tree/main/examples
