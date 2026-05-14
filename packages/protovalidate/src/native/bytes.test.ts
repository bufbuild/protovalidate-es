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
import { create } from "@bufbuild/protobuf";
import { pathToString } from "@bufbuild/protobuf/reflect";
import { compile, diff, native } from "./testing.js";
import { RuntimeError } from "../error.js";
import { createValidator } from "../validator.js";

function bytes(...vs: number[]): Uint8Array {
  return new Uint8Array(vs);
}

void suite("native bytes rules", () => {
  void test("bytes.const passes and fails", () => {
    const s = compile(
      `message M { bytes b = 1 [(buf.validate.field).bytes.const = "\\x01\\x02"]; }`,
    );
    diff(s, create(s, { b: bytes(0x01, 0x02) }));
    diff(s, create(s, { b: bytes(0x01, 0x03) }));
    diff(s, create(s, { b: bytes() }));
  });

  void test("bytes.len passes and fails", () => {
    const s = compile(
      `message M { bytes b = 1 [(buf.validate.field).bytes.len = 4]; }`,
    );
    diff(s, create(s, { b: bytes(1, 2, 3, 4) }));
    diff(s, create(s, { b: bytes(1, 2, 3) }));
    diff(s, create(s, { b: bytes(1, 2, 3, 4, 5) }));
  });

  void test("bytes.min_len + max_len", () => {
    const s = compile(
      `message M { bytes b = 1 [(buf.validate.field).bytes = { min_len: 2, max_len: 4 }]; }`,
    );
    diff(s, create(s, { b: bytes(1, 2) }));
    diff(s, create(s, { b: bytes(1, 2, 3, 4) }));
    diff(s, create(s, { b: bytes(1) }));
    diff(s, create(s, { b: bytes(1, 2, 3, 4, 5) }));
  });

  void test("bytes.prefix", () => {
    const s = compile(
      `message M { bytes b = 1 [(buf.validate.field).bytes.prefix = "\\xaa\\xbb"]; }`,
    );
    diff(s, create(s, { b: bytes(0xaa, 0xbb, 0xcc) }));
    diff(s, create(s, { b: bytes(0xaa, 0xcc) }));
    diff(s, create(s, { b: bytes() }));
  });

  void test("bytes.suffix", () => {
    const s = compile(
      `message M { bytes b = 1 [(buf.validate.field).bytes.suffix = "\\xee\\xff"]; }`,
    );
    diff(s, create(s, { b: bytes(0xdd, 0xee, 0xff) }));
    diff(s, create(s, { b: bytes(0xee, 0xfe) }));
  });

  void test("bytes.contains", () => {
    const s = compile(
      `message M { bytes b = 1 [(buf.validate.field).bytes.contains = "\\xab\\xcd"]; }`,
    );
    diff(s, create(s, { b: bytes(0x00, 0xab, 0xcd, 0xff) }));
    diff(s, create(s, { b: bytes(0x00, 0xab, 0xff) }));
  });

  void test("bytes.in / not_in", () => {
    const s = compile(
      `message M {
        bytes b = 1 [(buf.validate.field).bytes = {
          in: ["\\x01", "\\x02"],
          not_in: ["\\x03"]
        }];
      }`,
    );
    diff(s, create(s, { b: bytes(0x01) }));
    diff(s, create(s, { b: bytes(0x02) }));
    diff(s, create(s, { b: bytes(0x03) })); // violates both
    diff(s, create(s, { b: bytes(0x04) })); // violates in only
  });

  void suite("bytes.pattern", () => {
    void test("valid match passes", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.pattern = "^[a-z]+$"]; }`,
      );
      diff(s, create(s, { b: new TextEncoder().encode("hello") }));
    });
    void test("mismatch fails", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.pattern = "^[a-z]+$"]; }`,
      );
      diff(s, create(s, { b: new TextEncoder().encode("HELLO") }));
    });
    void test("non-UTF-8 input is a RuntimeError, not a violation", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.pattern = ".+"]; }`,
      );
      // 0xff alone is not valid UTF-8.
      diff(s, create(s, { b: bytes(0xff) }));
      const r = native.validate(s, create(s, { b: bytes(0xff) }));
      assert.equal(r.kind, "error");
      assert.ok(r.error instanceof RuntimeError);
    });
    void test("custom regexMatch override is honored", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.pattern = ".+"]; }`,
      );
      let calledWith: { pattern: string; against: string } | undefined;
      const v = createValidator({
        regexMatch: (pattern, against) => {
          calledWith = { pattern, against };
          return false; // always fail
        },
      });
      const r = v.validate(s, create(s, { b: new TextEncoder().encode("x") }));
      assert.equal(r.kind, "invalid");
      assert.equal(calledWith?.pattern, ".+");
      assert.equal(calledWith?.against, "x");
    });
  });

  void suite("well-known formats", () => {
    void test("bytes.ip accepts 4-byte and 16-byte values", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.ip = true]; }`,
      );
      diff(s, create(s, { b: bytes(1, 2, 3, 4) }));
      diff(s, create(s, { b: bytes(...new Array(16).fill(0)) }));
    });
    void test("bytes.ip rejects 5-byte values", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.ip = true]; }`,
      );
      diff(s, create(s, { b: bytes(1, 2, 3, 4, 5) }));
    });
    void test("bytes.ip rejects empty (emits *_empty rule)", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.ip = true]; }`,
      );
      diff(s, create(s, { b: bytes() }));
      const r = native.validate(s, create(s, { b: bytes() }));
      assert.equal(r.kind, "invalid");
      const v = r.violations?.[0];
      assert.ok(v);
      assert.equal(v.ruleId, "bytes.ip_empty");
    });
    void test("bytes.ipv4 requires exactly 4 bytes", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.ipv4 = true]; }`,
      );
      diff(s, create(s, { b: bytes(1, 2, 3, 4) }));
      diff(s, create(s, { b: bytes(1, 2, 3) })); // too short
      diff(s, create(s, { b: bytes(...new Array(16).fill(0)) })); // v6 size
    });
    void test("bytes.ipv6 requires exactly 16 bytes", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.ipv6 = true]; }`,
      );
      diff(s, create(s, { b: bytes(...new Array(16).fill(0)) }));
      diff(s, create(s, { b: bytes(1, 2, 3, 4) })); // v4 size
    });
    void test("bytes.uuid requires exactly 16 bytes", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.uuid = true]; }`,
      );
      diff(s, create(s, { b: bytes(...new Array(16).fill(0)) }));
      diff(s, create(s, { b: bytes(1, 2, 3, 4) }));
    });
    void test("explicit ip=false is a no-op claim — never emits a violation", () => {
      // `ip: false` is field-set, so the native handler claims the well-known
      // field and emits nothing. Behavior is identical to CEL (whose
      // predicate `!rules.ip` short-circuits to no violation).
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.ip = false]; }`,
      );
      diff(s, create(s, { b: bytes() }));
      diff(s, create(s, { b: bytes(1, 2, 3, 4, 5) }));
      // Direct assertions on the native path so a future refactor that
      // breaks claim semantics surfaces immediately.
      assert.equal(native.validate(s, create(s, { b: bytes() })).kind, "valid");
      assert.equal(
        native.validate(s, create(s, { b: bytes(1, 2, 3, 4, 5) })).kind,
        "valid",
      );
    });

    void test("bytes.ip with 1-byte input fails as wrong-size", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.ip = true]; }`,
      );
      diff(s, create(s, { b: bytes(0x01) }));
      // Confirm it hits `bytes.ip` (wrong-size), not `bytes.ip_empty`.
      const r = native.validate(s, create(s, { b: bytes(0x01) }));
      assert.equal(r.kind, "invalid");
      assert.equal(r.violations?.[0]?.ruleId, "bytes.ip");
    });
  });

  void suite("BytesValue wrapper", () => {
    void test("inner value validated against bytes.len", () => {
      const s = compile(
        `message M {
          google.protobuf.BytesValue b = 1 [(buf.validate.field).bytes.len = 2];
        }`,
      );
      diff(s, create(s, { b: bytes(1, 2) }));
      diff(s, create(s, { b: bytes(1) }));
    });
    void test("inner value validated against bytes.ip", () => {
      const s = compile(
        `message M {
          google.protobuf.BytesValue b = 1 [(buf.validate.field).bytes.ip = true];
        }`,
      );
      diff(s, create(s, { b: bytes(1, 2, 3, 4) }));
      diff(s, create(s, { b: bytes(1, 2, 3) }));
    });
  });

  void suite("rule path assertions", () => {
    void test("path lands at bytes.const", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.const = "\\x01"]; }`,
      );
      const r = native.validate(s, create(s, { b: bytes(0x02) }));
      assert.equal(r.kind, "invalid");
      const v = r.violations?.[0];
      assert.ok(v);
      assert.equal(pathToString(v.rule), "bytes.const");
    });
    void test("path lands at bytes.pattern", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.pattern = "^x$"]; }`,
      );
      const r = native.validate(
        s,
        create(s, { b: new TextEncoder().encode("y") }),
      );
      assert.equal(r.kind, "invalid");
      const v = r.violations?.[0];
      assert.ok(v);
      assert.equal(pathToString(v.rule), "bytes.pattern");
    });
    void test("path lands at bytes.ip (non-empty wrong size)", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.ip = true]; }`,
      );
      const r = native.validate(s, create(s, { b: bytes(1, 2, 3) }));
      assert.equal(r.kind, "invalid");
      const v = r.violations?.[0];
      assert.ok(v);
      assert.equal(pathToString(v.rule), "bytes.ip");
      assert.equal(v.ruleId, "bytes.ip");
    });
  });

  void test("combined len + pattern fires both", () => {
    const s = compile(
      `message M {
        bytes b = 1 [(buf.validate.field).bytes = {
          len: 3, pattern: "^[a-z]+$"
        }];
      }`,
    );
    diff(s, create(s, { b: new TextEncoder().encode("ab") })); // len fails, pattern passes
    diff(s, create(s, { b: new TextEncoder().encode("AB") })); // both fail
    diff(s, create(s, { b: new TextEncoder().encode("abc") })); // both pass
  });

  // Review follow-up: gaps surfaced by the code review.
  void suite("review gap coverage", () => {
    void test("bytes.const with empty rule value vs empty input", () => {
      // `const = ""` matches an empty input; the violation message for any
      // mismatch is `"must be "` (trailing space, empty hex).
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.const = ""]; }`,
      );
      diff(s, create(s, { b: bytes() }));
      diff(s, create(s, { b: bytes(0x01) }));
    });

    void test("bytes.pattern with empty pattern matches any input", () => {
      // `new RegExp("")` matches the empty string at every position. Confirm
      // native and CEL agree.
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.pattern = ""]; }`,
      );
      diff(s, create(s, { b: bytes() }));
      diff(s, create(s, { b: new TextEncoder().encode("hello") }));
    });

    void test("bytes.in with explicitly-set empty list is a no-op", () => {
      // `in: []` (proto3 repeated, length 0) is treated as unset by both
      // native and CEL — no violation regardless of input.
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes = { in: [] }]; }`,
      );
      diff(s, create(s, { b: bytes() }));
      diff(s, create(s, { b: bytes(0x01) }));
    });

    void test("bytes.not_in with explicitly-set empty list is a no-op", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes = { not_in: [] }]; }`,
      );
      diff(s, create(s, { b: bytes() }));
      diff(s, create(s, { b: bytes(0x01) }));
    });

    void test("bytes.contains with empty needle accepts every input", () => {
      // Matches Go's `bytes.Contains(_, []byte{})` returning true.
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.contains = ""]; }`,
      );
      diff(s, create(s, { b: bytes() }));
      diff(s, create(s, { b: bytes(0x01) }));
      diff(s, create(s, { b: bytes(0x01, 0x02, 0x03) }));
    });

    void test("BytesValue wrapper with absent inner value", () => {
      // Wrapper field unset on the parent — EvalField's presence check
      // skips validation entirely, so no spurious bytes.len violation.
      const s = compile(
        `message M {
          google.protobuf.BytesValue b = 1 [(buf.validate.field).bytes.len = 2];
        }`,
      );
      diff(s, create(s, {})); // wrapper absent
      assert.equal(native.validate(s, create(s, {})).kind, "valid");
    });

    void test("custom regexMatch that throws is wrapped in RuntimeError", () => {
      const s = compile(
        `message M { bytes b = 1 [(buf.validate.field).bytes.pattern = ".+"]; }`,
      );
      const v = createValidator({
        regexMatch: () => {
          throw new Error("synthetic engine failure");
        },
      });
      const r = v.validate(s, create(s, { b: new TextEncoder().encode("x") }));
      assert.equal(r.kind, "error");
      assert.ok(r.error instanceof RuntimeError);
    });
  });
});
