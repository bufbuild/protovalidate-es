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
import {
  createStandardSchema,
  type StandardSchemaV1,
} from "@bufbuild/protovalidate";
import { MoneyTransferSchema } from "./gen/banking/v1/money_transfer_pb.js";

async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<T>>> {
  const result = schema["~standard"].validate(input);
  // Handle both sync and async results
  return Promise.resolve(result);
}

async function validate() {
  const schema = createStandardSchema(MoneyTransferSchema);

  const transfer = create(MoneyTransferSchema, {
    toAccountId: "550e8400-e29b-41d4-a716-446655440000",
    fromAccountId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  });

  const result = await standardValidate(schema, transfer);

  if ("issues" in result) {
    console.log("❌ Invalid! Found", result.issues?.length || 0, "issues:");
    result.issues?.forEach((issue, i) => {
      // Issues have a message and optional path
      const path = issue.path ? issue.path.join(".") : "root";
      console.log(`  ${i + 1}. [${path}] ${issue.message}`);
    });
  } else {
    console.log("✅ Valid! The validated value is:", result.value);
  }
}

validate();
