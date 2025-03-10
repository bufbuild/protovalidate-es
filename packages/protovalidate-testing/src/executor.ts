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
  type Registry,
  toBinary,
} from "@bufbuild/protobuf";
import {
  TestConformanceRequestSchema,
  TestConformanceResponseSchema,
  type TestResult,
} from "./gen/buf/validate/conformance/harness/harness_pb.js";
import { type Any, anyUnpack } from "@bufbuild/protobuf/wkt";
import * as process from "node:process";
import {
  createValidator,
  CompilationError,
  RuntimeError,
  ValidationError,
  violationsToProto,
} from "@bufbuild/protovalidate";

const request = fromBinary(TestConformanceRequestSchema, await readStdin());
if (!request.fdset) {
  throw new Error(`Empty request field "fdset"`);
}
const registry = createFileRegistry(request.fdset);

for (const [name, any] of Object.entries(request.cases)) {
  let r: TestResult["result"];
  try {
    const unpacked = unpackTest(any, registry);
    if (!unpacked) {
      throw new Error(`Unable to unpack Any with type_url "${any.typeUrl}"`);
    }
    createValidator({ registry }).validate(unpacked.schema, unpacked.message);
    r = { case: "success", value: true };
  } catch (e) {
    if (e instanceof ValidationError) {
      r = {
        case: "validationError",
        value: violationsToProto(e.violations),
      };
    } else if (e instanceof CompilationError) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      r = { case: "compilationError", value: String(e) };
    } else if (e instanceof RuntimeError) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      r = { case: "runtimeError", value: String(e) };
    } else {
      r = { case: "unexpectedError", value: String(e) };
    }
  }
  // Write a TestConformanceResponse with the test results just for this case.
  const response = create(TestConformanceResponseSchema, {
    results: {
      [name]: {
        result: r,
      },
    },
  });
  process.stdout.write(toBinary(TestConformanceResponseSchema, response));
}

function unpackTest(any: Any, registry: Registry) {
  const message = anyUnpack(any, registry);
  if (message) {
    const schema = registry.getMessage(message.$typeName);
    if (schema) {
      return { message, schema };
    }
  }
  return undefined;
}

async function readStdin(): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Uint8Array);
  }
  return Buffer.concat(chunks);
}
