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
import { create, type DescMessage } from "@bufbuild/protobuf";
import { buildPath, pathToString } from "@bufbuild/protobuf/reflect";
import { RepeatedRulesSchema } from "../gen/buf/validate/validate_pb.js";
import {
  cel,
  compile as compileWithPreamble,
  diff,
  native,
} from "./testing.js";
import { tryBuildNativeRepeatedRules } from "./repeated.js";

const PREAMBLE = `
  enum Color { COLOR_UNSPECIFIED = 0; COLOR_RED = 1; COLOR_GREEN = 2; }
  message Inner { int32 x = 1; }
`;

function compile(definition: string): DescMessage {
  return compileWithPreamble(definition, { preamble: PREAMBLE });
}

void suite("native repeated rules", () => {
  void test("repeated.min_items passes and fails", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.min_items = 2]; }`,
    );
    diff(s, create(s, { xs: [1, 2] }));
    diff(s, create(s, { xs: [1] }));
    diff(s, create(s, { xs: [] }));
  });

  void test("repeated.max_items passes and fails", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.max_items = 2]; }`,
    );
    diff(s, create(s, { xs: [1, 2] }));
    diff(s, create(s, { xs: [1, 2, 3] }));
  });

  void test("min_items + max_items together", () => {
    const s = compile(
      `message M {
        repeated int32 xs = 1 [(buf.validate.field).repeated = { min_items: 2, max_items: 4 }];
      }`,
    );
    diff(s, create(s, { xs: [1, 2, 3] }));
    diff(s, create(s, { xs: [1] }));
    diff(s, create(s, { xs: [1, 2, 3, 4, 5] }));
  });

  void suite("repeated.unique", () => {
    void test("scalar (int32)", () => {
      const s = compile(
        `message M {
          repeated int32 xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: [1, 2, 3] }));
      diff(s, create(s, { xs: [1, 2, 1] }));
      diff(s, create(s, { xs: [] }));
      diff(s, create(s, { xs: [42] }));
    });

    void test("string", () => {
      const s = compile(
        `message M {
          repeated string xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: ["a", "b", "c"] }));
      diff(s, create(s, { xs: ["a", "b", "a"] }));
    });

    void test("bytes", () => {
      const s = compile(
        `message M {
          repeated bytes xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(
        s,
        create(s, {
          xs: [new Uint8Array([1, 2]), new Uint8Array([3, 4])],
        }),
      );
      diff(
        s,
        create(s, {
          xs: [new Uint8Array([1, 2]), new Uint8Array([1, 2])],
        }),
      );
      // Lookalike sequences that differ only in one byte
      diff(
        s,
        create(s, {
          xs: [new Uint8Array([1, 2]), new Uint8Array([1, 3])],
        }),
      );
      // Empty Uint8Array elements: two equal-length empty buffers must
      // collide; one is trivially unique.
      diff(s, create(s, { xs: [new Uint8Array([])] }));
      diff(
        s,
        create(s, {
          xs: [new Uint8Array([]), new Uint8Array([])],
        }),
      );
    });

    void test("bytes above the linear-scan threshold", () => {
      // The native bytes check compares buffers directly below the
      // threshold and switches to string keys above it; both must agree.
      const s = compile(
        `message M {
          repeated bytes xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      const distinct = Array.from(
        { length: 20 },
        (_, i) => new Uint8Array([i, i + 1]),
      );
      diff(s, create(s, { xs: distinct }));
      const withDupe = distinct.slice();
      withDupe[19] = new Uint8Array([0, 1]);
      diff(s, create(s, { xs: withDupe }));
    });

    void test("scalars above the linear-scan threshold", () => {
      const s = compile(
        `message M {
          repeated int32 is = 1 [(buf.validate.field).repeated.unique = true];
          repeated string ss = 2 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      const ints = Array.from({ length: 20 }, (_, i) => i);
      const strs = ints.map((i) => `v${i}`);
      diff(s, create(s, { is: ints, ss: strs }));
      diff(s, create(s, { is: [...ints.slice(0, 19), 0], ss: strs }));
      diff(s, create(s, { is: ints, ss: [...strs.slice(0, 19), "v0"] }));
    });

    void test("enum", () => {
      const s = compile(
        `message M {
          repeated Color xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: [1, 2] }));
      diff(s, create(s, { xs: [1, 1] }));
    });

    void test("int64 (bigint)", () => {
      const s = compile(
        `message M {
          repeated int64 xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: [1n, 2n] }));
      diff(s, create(s, { xs: [1n, 1n] }));
    });

    void test("bool", () => {
      const s = compile(
        `message M {
          repeated bool xs = 1 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      diff(s, create(s, { xs: [true, false] }));
      diff(s, create(s, { xs: [true, true] }));
    });

    void suite("float/double NaN and signed zero", () => {
      const s = compile(
        `message M {
          repeated double ds = 1 [(buf.validate.field).repeated.unique = true];
          repeated float fs = 2 [(buf.validate.field).repeated.unique = true];
        }`,
      );
      const nan = Number.NaN;

      // Pad with distinct values that collide with nothing, to reach a
      // length above the linear-scan threshold.
      function pad(xs: number[], to: number): number[] {
        const out = xs.slice();
        let filler = 1000;
        while (out.length < to) out.push(filler++);
        return out;
      }

      // `diff` only proves the two paths agree. These also assert the shared
      // answer, so neither path can drift away from protovalidate-go and
      // protovalidate-java, which both treat every NaN as distinct.
      //
      // Every case runs twice: once short enough for the native linear scan
      // and once long enough for its Set fallback. The two have separate
      // implementations of the NaN and signed-zero rules, so both need
      // covering.
      function check(xs: number[], want: "valid" | "invalid") {
        for (const length of [xs.length, 20]) {
          const padded = pad(xs, length);
          for (const msg of [
            create(s, { ds: padded }),
            create(s, { fs: padded }),
          ]) {
            diff(s, msg);
            assert.equal(
              native.validate(s, msg).kind,
              want,
              `length ${length}`,
            );
            assert.equal(cel.validate(s, msg).kind, want, `length ${length}`);
          }
        }
      }

      void test("every NaN counts as distinct", () => {
        check([nan], "valid");
        check([nan, nan], "valid");
        check([nan, nan, nan], "valid");
        check([nan, 1], "valid");
        check([1, nan], "valid");
      });

      void test("a real duplicate alongside NaN is still caught", () => {
        check([nan, 1, 1], "invalid");
        check([1, nan, 1], "invalid");
      });

      void test("positive and negative zero collide", () => {
        check([0, -0], "invalid");
        check([-0, 0], "invalid");
        check([0, 1], "valid");
      });
    });

    void test("message elements fall through to CEL", () => {
      // For `unique` on message-element lists, the native dispatcher returns
      // undefined for the unique field and CEL handles it. min/max_items still
      // works natively; output must still match CEL byte-for-byte.
      const s = compile(
        `message M {
          repeated Inner xs = 1 [(buf.validate.field).repeated = {
            min_items: 1, unique: true
          }];
        }`,
      );
      diff(s, create(s, { xs: [] }));
      diff(s, create(s, { xs: [{ x: 1 }] }));
      // Two identical messages — exercises the CEL-handled unique path so we
      // confirm fallthrough actually triggers the violation.
      diff(s, create(s, { xs: [{ x: 1 }, { x: 1 }] }));
    });

    void test("a missing list field descriptor falls through to CEL", () => {
      // The planner always supplies the list field, so this is reached by
      // calling the builder directly. Without the descriptor the element
      // kind is unknown, so the whole rules message must fall through to
      // CEL rather than claiming min_items/max_items and leaving `unique`
      // behind — a split that would emit the violations out of order.
      const rules = create(RepeatedRulesSchema, {
        minItems: 2n,
        maxItems: 1n,
        unique: true,
      });
      const built = tryBuildNativeRepeatedRules(
        rules,
        buildPath(RepeatedRulesSchema),
        false,
        undefined,
      );
      assert.equal(
        built === undefined,
        true,
        "expected the whole rules message to fall through to CEL",
      );
    });
  });

  void test("repeated.max_items with empty list passes", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.max_items = 2]; }`,
    );
    diff(s, create(s, { xs: [] }));
  });

  void test("min_items + max_items + unique together", () => {
    const s = compile(
      `message M {
        repeated int32 xs = 1 [(buf.validate.field).repeated = {
          min_items: 2, max_items: 4, unique: true
        }];
      }`,
    );
    diff(s, create(s, { xs: [1, 2, 3] })); // valid
    diff(s, create(s, { xs: [1] })); // min fails
    diff(s, create(s, { xs: [1, 2, 3, 4, 5] })); // max fails
    diff(s, create(s, { xs: [1, 2, 2] })); // unique fails
    diff(s, create(s, { xs: [1, 1, 1, 1, 1] })); // max + unique fail
    diff(s, create(s, { xs: [1, 1] })); // unique fails (min satisfied)
  });

  void test("rule path lands at repeated.min_items", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.min_items = 2]; }`,
    );
    const r = native.validate(s, create(s, { xs: [] }));
    assert.equal(r.kind, "invalid");
    assert.equal(r.violations?.length, 1);
    const v = r.violations?.[0];
    assert.ok(v);
    assert.equal(v.ruleId, "repeated.min_items");
    assert.equal(pathToString(v.rule), "repeated.min_items");
  });

  void test("rule path lands at repeated.max_items", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.max_items = 1]; }`,
    );
    const r = native.validate(s, create(s, { xs: [1, 2] }));
    assert.equal(r.kind, "invalid");
    const v = r.violations?.[0];
    assert.ok(v);
    assert.equal(v.ruleId, "repeated.max_items");
    assert.equal(pathToString(v.rule), "repeated.max_items");
  });

  void test("rule path lands at repeated.unique", () => {
    const s = compile(
      `message M { repeated int32 xs = 1 [(buf.validate.field).repeated.unique = true]; }`,
    );
    const r = native.validate(s, create(s, { xs: [1, 1] }));
    assert.equal(r.kind, "invalid");
    const v = r.violations?.[0];
    assert.ok(v);
    assert.equal(v.ruleId, "repeated.unique");
    assert.equal(pathToString(v.rule), "repeated.unique");
  });

  void test("repeated.unique = false claims the field (no-op rule)", () => {
    // Explicit unique=false is a no-op; the native handler claims the field
    // so CEL doesn't re-evaluate. Behavior is unchanged from CEL.
    const s = compile(
      `message M {
        repeated int32 xs = 1 [(buf.validate.field).repeated.unique = false];
      }`,
    );
    diff(s, create(s, { xs: [1, 1] })); // duplicates allowed
    diff(s, create(s, { xs: [] }));
  });
});
