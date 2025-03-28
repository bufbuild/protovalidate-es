# @bufbuild/protovalidate

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

[protovalidate]: https://buf.build/docs/protovalidate/overview/
[cel]: https://cel.dev
[protoc-gen-validate]: https://github.com/bufbuild/protoc-gen-validate
