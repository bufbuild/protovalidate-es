// Copyright 2024-2025 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { create } from "@bufbuild/protobuf";
import { createValidator } from "@bufbuild/protovalidate";
import { MoneyTransferSchema } from "./gen/banking/v1/money_transfer_pb.js";

const validator = createValidator();

const transfer = create(MoneyTransferSchema, {
  toAccountId: "ed1cb800-75cb-4e4c-95ab-e093a7f23e55",
  fromAccountId: "52bb94ed-1f34-4f86-a934-0836171484a4",
});

// Invalid example:
// const transfer = create(MoneyTransferSchema, {
//   toAccountId: "bad-uuid",
//   fromAccountId: "bad-uuid",
// });

const result = validator.validate(MoneyTransferSchema, transfer);

switch (result.kind) {
  case "valid":
    // Handle valid transfer.
    console.log("Transfer is valid!");
    break;
  case "invalid":
    // Handle failure.
    console.log("Transfer is invalid:");
    for (const vio of result.violations) {
      console.log(vio.toString());
    }
    break;
  case "error":
    // Handle compilation error or runtime error.
    throw result.error;
}
