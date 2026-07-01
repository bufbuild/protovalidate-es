// Copyright 2024-2026 Buf Technologies, Inc.
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
  BenchEnum,
  BenchScalarSchema,
  BenchRepeatedScalarSchema,
  BenchRepeatedMessageSchema,
  BenchRepeatedScalarUniqueSchema,
  BenchRepeatedBytesUniqueSchema,
  BenchMapSchema,
  BenchComplexSchemaSchema,
  type BenchComplexSchema,
} from "./gen/bench/v1/bench_pb.js";
import {
  BenchGTSchema,
  TestByteMatchingSchema,
  StringMatchingSchema,
  WrapperTestingSchema,
  MultiRuleSchema,
} from "./gen/bench/v1/native_pb.js";

// Seeded PRNG (mulberry32). Keeps fixture data deterministic across runs.
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(1);

function int(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pickWord(): string {
  const words = [
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "golf",
    "hotel",
    "india",
    "juliet",
  ];
  return words[int(0, words.length - 1)] ?? "alpha";
}

function bytes(n: number, salt: number): Uint8Array {
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = (i + salt) & 0xff;
  }
  return out;
}

export const benchScalar = create(BenchScalarSchema, { x: 42 });

export const benchRepeatedScalar = create(BenchRepeatedScalarSchema, {
  x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
});

export const benchRepeatedMessage = create(BenchRepeatedMessageSchema, {
  x: Array.from({ length: 10 }, (_, i) =>
    create(BenchScalarSchema, { x: i + 1 }),
  ),
});

export const benchRepeatedScalarUnique = create(
  BenchRepeatedScalarUniqueSchema,
  {
    x: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8],
  },
);

export const benchRepeatedBytesUnique = create(BenchRepeatedBytesUniqueSchema, {
  x: Array.from({ length: 8 }, (_, i) => bytes(4, i + 1)),
});

export const benchMap = create(BenchMapSchema, {
  entries: {
    k1: "v1",
    k2: "v2",
    k3: "v3",
    k4: "v4",
    k5: "v5",
    k6: "v6",
    k7: "v7",
  },
});

function newComplex(depth: number): BenchComplexSchema {
  const m = create(BenchComplexSchemaSchema, {
    s1: pickWord(),
    s2: pickWord(),
    i32: int(1, 100),
    i64: BigInt(int(1, 999)),
    u32: int(1, 100),
    u64: BigInt(int(1, 1000)),
    si32: int(1, 100),
    si64: BigInt(int(1, 999)),
    f32: int(1, 100),
    f64: BigInt(int(1, 1000)),
    sf32: int(1, 100),
    sf64: BigInt(int(1, 999)),
    fl: int(1, 100),
    db: int(1, 100),
    bl: true,
    by: bytes(8, 7),
    nested: create(BenchScalarSchema, { x: int(1, 100) }),
    repStr: [pickWord(), pickWord(), pickWord()],
    repI32: [int(1, 100), int(1, 100)],
    repBytes: [bytes(3, 1), bytes(3, 2), bytes(3, 3)],
    repMsg: Array.from({ length: 2 }, () =>
      create(BenchScalarSchema, { x: int(1, 100) }),
    ),
    mapStrStr: { a: "1", b: "2", c: "3" },
    mapI32I64: { 1: 10n, 2: 20n, 3: 30n },
    mapU64Bool: { "1": true, "2": false },
    mapStrBytes: { k: bytes(2, 0) },
    mapStrMsg: {
      a: create(BenchScalarSchema, { x: int(1, 100) }),
      b: create(BenchScalarSchema, { x: int(1, 100) }),
    },
    mapI64Msg: {
      "1": create(BenchScalarSchema, { x: int(1, 100) }),
      "2": create(BenchScalarSchema, { x: int(1, 100) }),
    },
    enumField: BenchEnum.ONE,
    choice: { case: "oneofStr", value: pickWord() },
  });
  if (depth > 0) {
    m.selfRef = newComplex(depth - 1);
  }
  return m;
}

export const benchComplexSchema = newComplex(1);

export const benchGT = create(BenchGTSchema, {
  gt: 50,
  gte: 50,
  lt: 50,
  lte: 50,
  gtltin: 50,
  gtltein: 50,
  // gtltex, gtlteex, gteltex, gtelteex have unsatisfiable rules (lt < gt);
  // Go's bench leaves them at zero which is treated as unset for proto3 scalars
  // by the rules engine — protovalidate skips fields with rules.required=false
  // unset zero values. Keeping them at 0 mirrors Go's fixture.
  gteltin: 50,
  gteltein: 50,
  const: 10,
  constgt: 10,
  inTest: 3,
  notInTest: 4,
});

export const testByteMatching = create(TestByteMatchingSchema, {
  // 16-byte buffers; bytes.ip accepts 4 or 16 bytes (v4/v6 raw), bytes.ipv4
  // requires 4 bytes, bytes.ipv6 requires 16, bytes.uuid requires 16.
  ipAddr: bytes(16, 1),
  ipv4Addr: bytes(4, 2),
  ipv6Addr: bytes(16, 3),
  uuid: bytes(16, 4),
});

export const stringMatching = create(StringMatchingSchema, {
  hostname: "example.com",
  hostAndPort: "example.com:8080",
  email: "user@example.com",
  uuid: "00112233-4455-6677-8899-aabbccddeeff",
});

// protobuf-es unboxes google.protobuf.*Value wrapper fields to their scalar
// types, so the field values are assigned directly.
export const wrapperTesting = create(WrapperTestingSchema, {
  i32: 11,
  d: 11,
  f: 11,
  i64: 11n,
  u64: 11n,
  u32: 11,
  b: true,
  s: "hello",
  bs: bytes(5, 0),
});

// MultiRule with many=1 — fails int64.const=10 AND int64.gt=5 (drives the
// violation-accumulation path).
export const multiRuleError = create(MultiRuleSchema, { many: 1n });

// MultiRule with many=10 — satisfies both rules (drives the success path).
export const multiRuleNoError = create(MultiRuleSchema, { many: 10n });
