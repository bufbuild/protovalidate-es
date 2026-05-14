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

import { suite, test } from "node:test";
import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { create, type DescMessage } from "@bufbuild/protobuf";
import { compileMessage } from "@bufbuild/protocompile";
import { createValidator } from "../validator.js";
import type { Violation } from "../error.js";

const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

const native = createValidator();
const cel = createValidator({ disableNativeRules: true });

function diff(schema: DescMessage, msg: object): void {
  // biome-ignore lint/suspicious/noExplicitAny: cross-schema test helper
  const a = native.validate(schema, msg as any);
  // biome-ignore lint/suspicious/noExplicitAny: cross-schema test helper
  const b = cel.validate(schema, msg as any);
  assert.equal(a.kind, b.kind, "kind mismatch");
  const fmt = (v: Violation) => v.toString();
  assert.deepEqual(a.violations?.map(fmt), b.violations?.map(fmt));
}

function compile(proto: string): DescMessage {
  return compileMessage(
    `
    syntax="proto3";
    import "buf/validate/validate.proto";
    import "google/protobuf/wrappers.proto";
    ${proto}`,
    bufCompileOptions,
  );
}

void suite("native numeric rules", () => {
  void suite("int32", () => {
    void test("const passes and fails", () => {
      const s = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32.const = 42]; }`,
      );
      diff(s, create(s, { n: 42 }));
      diff(s, create(s, { n: 41 }));
    });

    void test("gt passes and fails", () => {
      const s = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32.gt = 5]; }`,
      );
      diff(s, create(s, { n: 6 }));
      diff(s, create(s, { n: 5 }));
      diff(s, create(s, { n: 4 }));
    });

    void test("gte boundary", () => {
      const s = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32.gte = 5]; }`,
      );
      diff(s, create(s, { n: 5 }));
      diff(s, create(s, { n: 4 }));
    });

    void test("lt and lte", () => {
      const lt = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32.lt = 10]; }`,
      );
      diff(lt, create(lt, { n: 9 }));
      diff(lt, create(lt, { n: 10 }));
      const lte = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32.lte = 10]; }`,
      );
      diff(lte, create(lte, { n: 10 }));
      diff(lte, create(lte, { n: 11 }));
    });

    void test("gt + lt normal range", () => {
      const s = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32 = { gt: 0, lt: 10 }]; }`,
      );
      diff(s, create(s, { n: 5 }));
      diff(s, create(s, { n: 0 }));
      diff(s, create(s, { n: 10 }));
      diff(s, create(s, { n: -1 }));
    });

    void test("gt + lt exclusive range (lt < gt)", () => {
      const s = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32 = { gt: 10, lt: 5 }]; }`,
      );
      // Inside the gap [5..10] is the rejected zone for exclusive ranges
      diff(s, create(s, { n: 7 }));
      // Outside: passes
      diff(s, create(s, { n: 4 }));
      diff(s, create(s, { n: 11 }));
    });

    void test("gte + lte normal range", () => {
      const s = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32 = { gte: 1, lte: 3 }]; }`,
      );
      diff(s, create(s, { n: 0 }));
      diff(s, create(s, { n: 1 }));
      diff(s, create(s, { n: 4 }));
    });

    void test("in and not_in", () => {
      const s = compile(
        `message M { int32 n = 1 [(buf.validate.field).int32 = { in: [1, 2, 3], not_in: [4, 5] }]; }`,
      );
      diff(s, create(s, { n: 2 }));
      diff(s, create(s, { n: 4 }));
      diff(s, create(s, { n: 9 }));
    });
  });

  void suite("uint32 / sint32 / fixed32 / sfixed32", () => {
    void test("uint32.gt", () => {
      const s = compile(
        `message M { uint32 n = 1 [(buf.validate.field).uint32.gt = 5]; }`,
      );
      diff(s, create(s, { n: 6 }));
      diff(s, create(s, { n: 5 }));
    });
    void test("sint32.const", () => {
      const s = compile(
        `message M { sint32 n = 1 [(buf.validate.field).sint32.const = -7]; }`,
      );
      diff(s, create(s, { n: -7 }));
      diff(s, create(s, { n: -8 }));
    });
    void test("fixed32.lte", () => {
      const s = compile(
        `message M { fixed32 n = 1 [(buf.validate.field).fixed32.lte = 100]; }`,
      );
      diff(s, create(s, { n: 100 }));
      diff(s, create(s, { n: 101 }));
    });
    void test("sfixed32.in", () => {
      const s = compile(
        `message M { sfixed32 n = 1 [(buf.validate.field).sfixed32 = { in: [-1, 0, 1] }]; }`,
      );
      diff(s, create(s, { n: 0 }));
      diff(s, create(s, { n: 2 }));
    });
  });

  void suite("int64 / uint64 / sint64 / fixed64 / sfixed64 (bigint)", () => {
    void test("int64.gt", () => {
      const s = compile(
        `message M { int64 n = 1 [(buf.validate.field).int64.gt = 5]; }`,
      );
      diff(s, create(s, { n: 6n }));
      diff(s, create(s, { n: 5n }));
    });
    void test("uint64.const", () => {
      const s = compile(
        `message M { uint64 n = 1 [(buf.validate.field).uint64.const = 42]; }`,
      );
      diff(s, create(s, { n: 42n }));
      diff(s, create(s, { n: 41n }));
    });
    void test("sint64.lt", () => {
      const s = compile(
        `message M { sint64 n = 1 [(buf.validate.field).sint64.lt = 0]; }`,
      );
      diff(s, create(s, { n: -1n }));
      diff(s, create(s, { n: 0n }));
    });
    void test("fixed64.not_in", () => {
      const s = compile(
        `message M { fixed64 n = 1 [(buf.validate.field).fixed64 = { not_in: [1, 2] }]; }`,
      );
      diff(s, create(s, { n: 3n }));
      diff(s, create(s, { n: 1n }));
    });
    void test("sfixed64 range", () => {
      const s = compile(
        `message M { sfixed64 n = 1 [(buf.validate.field).sfixed64 = { gt: -10, lt: 10 }]; }`,
      );
      diff(s, create(s, { n: 0n }));
      diff(s, create(s, { n: -10n }));
      diff(s, create(s, { n: 10n }));
    });
  });

  void suite("float / double", () => {
    void test("float.const", () => {
      const s = compile(
        `message M { float x = 1 [(buf.validate.field).float.const = 1.5]; }`,
      );
      diff(s, create(s, { x: 1.5 }));
      diff(s, create(s, { x: 1.25 }));
    });
    void test("double.gt", () => {
      const s = compile(
        `message M { double x = 1 [(buf.validate.field).double.gt = 0.5]; }`,
      );
      diff(s, create(s, { x: 1 }));
      diff(s, create(s, { x: 0.5 }));
    });
    void test("float.finite passes finite", () => {
      const s = compile(
        `message M { float x = 1 [(buf.validate.field).float.finite = true]; }`,
      );
      diff(s, create(s, { x: 1.5 }));
    });
    void test("float.finite fails NaN", () => {
      const s = compile(
        `message M { float x = 1 [(buf.validate.field).float.finite = true]; }`,
      );
      diff(s, create(s, { x: Number.NaN }));
    });
    void test("float.finite fails Infinity", () => {
      const s = compile(
        `message M { float x = 1 [(buf.validate.field).float.finite = true]; }`,
      );
      diff(s, create(s, { x: Number.POSITIVE_INFINITY }));
      diff(s, create(s, { x: Number.NEGATIVE_INFINITY }));
    });
    void test("double.lte NaN fails range (nanFailsRange)", () => {
      const s = compile(
        `message M { double x = 1 [(buf.validate.field).double.lte = 10]; }`,
      );
      diff(s, create(s, { x: Number.NaN }));
    });
    void test("double range NaN fails", () => {
      const s = compile(
        `message M { double x = 1 [(buf.validate.field).double = { gt: 0, lt: 10 }]; }`,
      );
      diff(s, create(s, { x: Number.NaN }));
    });
  });

  void suite("wrapper types", () => {
    void test("Int32Value with int32.gte", () => {
      const s = compile(
        `message M {
          google.protobuf.Int32Value n = 1 [(buf.validate.field).int32.gte = 5];
        }`,
      );
      diff(s, create(s, { n: 5 }));
      diff(s, create(s, { n: 4 }));
    });
    void test("Int64Value with int64.const", () => {
      const s = compile(
        `message M {
          google.protobuf.Int64Value n = 1 [(buf.validate.field).int64.const = 42];
        }`,
      );
      diff(s, create(s, { n: 42n }));
      diff(s, create(s, { n: 41n }));
    });
    void test("UInt32Value with uint32.lt", () => {
      const s = compile(
        `message M {
          google.protobuf.UInt32Value n = 1 [(buf.validate.field).uint32.lt = 100];
        }`,
      );
      diff(s, create(s, { n: 50 }));
      diff(s, create(s, { n: 100 }));
    });
    void test("UInt64Value with uint64.in", () => {
      const s = compile(
        `message M {
          google.protobuf.UInt64Value n = 1 [(buf.validate.field).uint64 = { in: [1, 2, 3] }];
        }`,
      );
      diff(s, create(s, { n: 2n }));
      diff(s, create(s, { n: 4n }));
    });
    void test("FloatValue with float.finite", () => {
      const s = compile(
        `message M {
          google.protobuf.FloatValue n = 1 [(buf.validate.field).float.finite = true];
        }`,
      );
      diff(s, create(s, { n: 1.5 }));
      diff(s, create(s, { n: Number.NaN }));
    });
    void test("DoubleValue with double range", () => {
      const s = compile(
        `message M {
          google.protobuf.DoubleValue n = 1 [(buf.validate.field).double = { gte: 0, lte: 1 }];
        }`,
      );
      diff(s, create(s, { n: 0.5 }));
      diff(s, create(s, { n: 1.5 }));
    });
  });

  void suite("repeated scalar items", () => {
    void test("repeated int32 with item rules", () => {
      const s = compile(
        `message M {
          repeated int32 n = 1 [(buf.validate.field).repeated.items.int32.gt = 0];
        }`,
      );
      diff(s, create(s, { n: [1, 2, 3] }));
      diff(s, create(s, { n: [1, 0, 3] }));
      diff(s, create(s, { n: [-1, -2] }));
    });
  });

  void suite("fallthrough cases", () => {
    void test("NaN gt bound on float falls through to CEL with same error", () => {
      // Compile-time CEL would normally throw. To exercise the fallthrough path
      // we'd need a NaN-bound rule message — protovalidate-conformance covers
      // this; here we just confirm the native+CEL paths produce the same
      // result on a non-NaN rule with NaN input value.
      const s = compile(
        `message M { float x = 1 [(buf.validate.field).float.gt = 0]; }`,
      );
      diff(s, create(s, { x: Number.NaN }));
    });
  });

  // Review follow-up: gaps surfaced by the code review.
  void suite("review gap coverage", () => {
    void test("T1: NaN value with float.in list", () => {
      // NaN is never === to any list element, so the violation must fire.
      const s = compile(
        `message M { float x = 1 [(buf.validate.field).float = { in: [1.0, 2.0] }]; }`,
      );
      diff(s, create(s, { x: Number.NaN }));
    });

    void test("T2: const and range together both report violations", () => {
      const s = compile(
        `message M {
          int32 n = 1 [(buf.validate.field).int32 = { const: 5, gt: 3, lt: 100 }];
        }`,
      );
      // 4 satisfies the range (gt 3, lt 100) but violates const = 5.
      diff(s, create(s, { n: 4 }));
      // 200 violates both const and the range.
      diff(s, create(s, { n: 200 }));
    });

    void test("T3: BoolValue wrapper unset on parent", () => {
      const s = compile(
        `message M {
          google.protobuf.BoolValue b = 1 [(buf.validate.field).bool.const = true];
        }`,
      );
      // Wrapper field absent — EvalField's presence check skips validation.
      diff(s, create(s, {}));
    });

    void test("T4: int64 max-boundary values", () => {
      // 9_223_372_036_854_775_807 is max int64. Validate const at and around it.
      const s = compile(
        `message M {
          int64 n = 1 [(buf.validate.field).int64.const = 9223372036854775807];
        }`,
      );
      diff(s, create(s, { n: 9223372036854775807n }));
      diff(s, create(s, { n: 9223372036854775806n }));
    });

    void test("T5: explicit float.finite=false claims the field but emits nothing", () => {
      const s = compile(
        `message M {
          float x = 1 [(buf.validate.field).float.finite = false];
        }`,
      );
      // finite=false means "no constraint" — every value passes, even NaN.
      diff(s, create(s, { x: Number.NaN }));
      diff(s, create(s, { x: Number.POSITIVE_INFINITY }));
      diff(s, create(s, { x: 1.5 }));
    });
  });
});
