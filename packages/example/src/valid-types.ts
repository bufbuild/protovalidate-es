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
import { OrderSchema, type OrderValid } from "./gen/store/v1/order_pb";

const validator = createValidator({
  // This option enables validation of the proto2 `required` label.
  legacyRequired: true,
});

const order = create(OrderSchema, {
  id: "ed1cb800-75cb-4e4c-95ab-e093a7f23e55",
  // The field `user` is required. Once validation passes, it will always be defined.
  user: {
    name: "John Doe",
  },
});

const result = validator.validate(OrderSchema, order);

switch (result.kind) {
  case "valid":
    const validOrder: OrderValid = result.message;
    // On the Valid type, the `user` property isn't optional, because
    // the field is annotated with the protovalidate required rule.
    console.log(`user ${validOrder.user.name} has ordered something`);
    break;
  default:
    throw result.error;
}
