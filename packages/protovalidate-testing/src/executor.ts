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
