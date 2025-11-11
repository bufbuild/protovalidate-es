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
import { createStandardSchema } from "@bufbuild/protovalidate";
import { OrderSchema, type OrderValid } from "./gen/store/v1/order_pb.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";

async function main() {
  const order = create(OrderSchema, {
    id: "ed1cb800-75cb-4e4c-95ab-e093a7f23e55",
    // The field `user` is required. Once validation passes, it will always be defined.
    user: {
      name: "John Doe",
      resultOneof: {
        case: "numberField",
        value: 55,
      },
    },
  });

  const schema = createStandardSchema(OrderSchema);
  const result = await standardValidate(schema, order);

  if (result.issues !== undefined) {
    console.error(`invalid order: ${result.issues[0].message}`);
    console.log(result.issues[0].path);
    process.exit(1);
  }

  // If there are no issues, the result is valid.
  const validOrder: OrderValid = result.value;
  // On the Valid type, the `user` property isn't optional, because
  // the field is annotated with the protovalidate required rule.
  console.log(`user ${validOrder.user.name} has ordered something`);
}

void main();

// Placeholder for any framework that support the standard schema.
async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<T>>> {
  const result = schema["~standard"].validate(input);
  // Handle both sync and async results
  return Promise.resolve(result);
}
