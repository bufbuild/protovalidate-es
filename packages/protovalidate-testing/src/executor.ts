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

import {
  create,
  createFileRegistry,
  fromBinary,
  toBinary,
} from "@bufbuild/protobuf";
import {
  TestConformanceRequestSchema,
  TestConformanceResponseSchema,
  TestResultSchema,
} from "./gen/buf/validate/conformance/harness/harness_pb.js";
import { anyUnpack } from "@bufbuild/protobuf/wkt";
import * as process from "node:process";

const req = fromBinary(TestConformanceRequestSchema, await readStdin());
const res = create(TestConformanceResponseSchema);
if (!req.fdset) {
  throw new Error(`Empty request field "fdset"`);
}
const registry = createFileRegistry(req.fdset);

for (const [name, any] of Object.entries(req.cases)) {
  const unpacked = anyUnpack(any, registry);
  if (!unpacked) {
    res.results[name] = create(TestResultSchema, {
      result: {
        case: "unexpectedError",
        value: `Unable to unpack Any with type_url "${any.typeUrl}"`,
      },
    });
  }
  res.results[name] = create(TestResultSchema, {
    result: {
      case: "runtimeError",
      value: "not implemented",
    },
  });
}

process.stdout.write(toBinary(TestConformanceResponseSchema, res));

async function readStdin(): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Uint8Array);
  }
  return Buffer.concat(chunks);
}
