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
import { create, createRegistry } from "@bufbuild/protobuf";
import { pathToString } from "@bufbuild/protobuf/reflect";
import { compileFile } from "@bufbuild/protocompile";
import { bufCompileOptions, cel, compile, diff, native } from "./testing.js";
import { RuntimeError } from "../error.js";
import { createValidator } from "../validator.js";

void suite("native string rules", () => {
  void test("string.const passes and fails", () => {
    const s = compile(
      `message M { string v = 1 [(buf.validate.field).string.const = "hello"]; }`,
    );
    diff(s, create(s, { v: "hello" }));
    diff(s, create(s, { v: "world" }));
    diff(s, create(s, { v: "" }));
  });

  void test("string.len counts code points, not UTF-16 units", () => {
    const s = compile(
      `message M { string v = 1 [(buf.validate.field).string.len = 2]; }`,
    );
    diff(s, create(s, { v: "ab" }));
    // "𝑎" is a surrogate pair: .length is 2, but it is 1 code point.
    diff(s, create(s, { v: "𝑎" }));
    diff(s, create(s, { v: "𝑎b" })); // 2 code points — passes
    diff(s, create(s, { v: "abc" }));
  });

  void test("string.min_len + max_len", () => {
    const s = compile(
      `message M { string v = 1 [(buf.validate.field).string = { min_len: 2, max_len: 4 }]; }`,
    );
    diff(s, create(s, { v: "ab" }));
    diff(s, create(s, { v: "abcd" }));
    diff(s, create(s, { v: "a" }));
    diff(s, create(s, { v: "abcde" }));
    diff(s, create(s, { v: "𝑎𝑏" })); // 2 code points — passes
  });

  void test("string.len_bytes / min_bytes / max_bytes count UTF-8 bytes", () => {
    const s = compile(
      `message M { string v = 1 [(buf.validate.field).string = { min_bytes: 2, max_bytes: 4 }]; }`,
    );
    diff(s, create(s, { v: "ab" }));
    diff(s, create(s, { v: "a" })); // 1 byte — too short
    diff(s, create(s, { v: "é" })); // 2 bytes — passes
    diff(s, create(s, { v: "𝑎" })); // 4 bytes — passes
    diff(s, create(s, { v: "𝑎b" })); // 5 bytes — too long
    const exact = compile(
      `message M { string v = 1 [(buf.validate.field).string.len_bytes = 3]; }`,
    );
    diff(exact, create(exact, { v: "abc" }));
    diff(exact, create(exact, { v: "€" })); // 3 bytes — passes
    diff(exact, create(exact, { v: "ab" }));
  });

  void suite("string.pattern", () => {
    void test("valid match passes, mismatch fails", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.pattern = "^[a-z]+$"]; }`,
      );
      diff(s, create(s, { v: "hello" }));
      diff(s, create(s, { v: "HELLO" }));
      diff(s, create(s, { v: "" }));
    });

    void test("RE2-only syntax works under the default engine", () => {
      // "(?i)" mid-pattern is valid RE2 but invalid ECMAScript — this is
      // the engine swap in action.
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.pattern = "(?i)^hello$"]; }`,
      );
      diff(s, create(s, { v: "HELLO" }));
      diff(s, create(s, { v: "nope" }));
      assert.equal(native.validate(s, create(s, { v: "HeLLo" })).kind, "valid");
    });

    void test("pattern invalid under RE2 errors on both paths", () => {
      // Lookahead is valid ECMAScript but not RE2. The native handler
      // bails to CEL, whose matches() hits the same engine failure.
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.pattern = "(?=a)a"]; }`,
      );
      diff(s, create(s, { v: "a" }));
      assert.equal(native.validate(s, create(s, { v: "a" })).kind, "error");
      assert.equal(cel.validate(s, create(s, { v: "a" })).kind, "error");
    });

    void test("empty pattern matches any input", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.pattern = ""]; }`,
      );
      diff(s, create(s, { v: "" }));
      diff(s, create(s, { v: "hello" }));
    });

    void test("custom regexMatch override is honored", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.pattern = ".+"]; }`,
      );
      let calledWith: { pattern: string; against: string } | undefined;
      const v = createValidator({
        regexMatch: (pattern, against) => {
          if (against !== "") {
            calledWith = { pattern, against };
          }
          return false; // always fail
        },
      });
      const r = v.validate(s, create(s, { v: "x" }));
      assert.equal(r.kind, "invalid");
      assert.equal(calledWith?.pattern, ".+");
      assert.equal(calledWith?.against, "x");
    });

    void test("custom regexMatch that throws at eval is a RuntimeError", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.pattern = ".+"]; }`,
      );
      let probing = true;
      const v = createValidator({
        regexMatch: () => {
          if (probing) {
            return true; // pass the plan-time probe
          }
          throw new Error("synthetic engine failure");
        },
      });
      probing = false;
      const r = v.validate(s, create(s, { v: "x" }));
      assert.equal(r.kind, "error");
      assert.ok(r.error instanceof RuntimeError);
    });
  });

  void test("string.prefix", () => {
    const s = compile(
      `message M { string v = 1 [(buf.validate.field).string.prefix = "ab"]; }`,
    );
    diff(s, create(s, { v: "abc" }));
    diff(s, create(s, { v: "bc" }));
    diff(s, create(s, { v: "" }));
  });

  void test("string.suffix", () => {
    const s = compile(
      `message M { string v = 1 [(buf.validate.field).string.suffix = "yz"]; }`,
    );
    diff(s, create(s, { v: "xyz" }));
    diff(s, create(s, { v: "xy" }));
  });

  void test("string.contains / not_contains", () => {
    const s = compile(
      `message M {
        string v = 1 [(buf.validate.field).string = {
          contains: "needle",
          not_contains: "thorn"
        }];
      }`,
    );
    diff(s, create(s, { v: "a needle here" }));
    diff(s, create(s, { v: "no match" })); // contains fails
    diff(s, create(s, { v: "needle and thorn" })); // not_contains fails
    diff(s, create(s, { v: "just a thorn" })); // both fail
  });

  void test("string.in / not_in", () => {
    const s = compile(
      `message M {
        string v = 1 [(buf.validate.field).string = {
          in: ["foo", "bar"],
          not_in: ["baz"]
        }];
      }`,
    );
    diff(s, create(s, { v: "foo" }));
    diff(s, create(s, { v: "bar" }));
    diff(s, create(s, { v: "baz" })); // violates both
    diff(s, create(s, { v: "qux" })); // violates in only
    // Lock the bare-CSV list formatting in the message.
    const r = native.validate(s, create(s, { v: "qux" }));
    assert.equal(r.kind, "invalid");
    assert.equal(r.violations?.[0]?.message, "must be in list [foo, bar]");
  });

  void test("empty in / not_in lists are no-ops", () => {
    const s = compile(
      `message M {
        string v = 1 [(buf.validate.field).string = { in: [], not_in: [] }];
      }`,
    );
    diff(s, create(s, { v: "" }));
    diff(s, create(s, { v: "anything" }));
  });

  void test("combined rules fire in CEL order", () => {
    const s = compile(
      `message M {
        string v = 1 [(buf.validate.field).string = {
          const: "abcd", min_len: 10, pattern: "^[a-z]+$", suffix: "zz"
        }];
      }`,
    );
    diff(s, create(s, { v: "XY" })); // all four fail
    diff(s, create(s, { v: "abcd" })); // min_len + suffix fail
  });

  void suite("StringValue wrapper", () => {
    void test("inner value validated against string.min_len", () => {
      const s = compile(
        `message M {
          google.protobuf.StringValue v = 1 [(buf.validate.field).string.min_len = 3];
        }`,
      );
      diff(s, create(s, { v: "abc" }));
      diff(s, create(s, { v: "ab" }));
    });
    void test("inner value validated against string.email", () => {
      const s = compile(
        `message M {
          google.protobuf.StringValue v = 1 [(buf.validate.field).string.email = true];
        }`,
      );
      diff(s, create(s, { v: "foo@example.com" }));
      diff(s, create(s, { v: "nope" }));
    });
    void test("absent wrapper skips validation", () => {
      const s = compile(
        `message M {
          google.protobuf.StringValue v = 1 [(buf.validate.field).string.min_len = 3];
        }`,
      );
      diff(s, create(s, {}));
      assert.equal(native.validate(s, create(s, {})).kind, "valid");
    });
  });

  void test("map keys validated with forMapKey", () => {
    const s = compile(
      `message M {
        map<string, string> m = 1 [(buf.validate.field).map.keys.string.min_len = 3];
      }`,
    );
    diff(s, create(s, { m: { abc: "x" } }));
    diff(s, create(s, { m: { ab: "x" } }));
  });

  void suite("rule path assertions", () => {
    void test("path lands at string.const", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.const = "a"]; }`,
      );
      const r = native.validate(s, create(s, { v: "b" }));
      assert.equal(r.kind, "invalid");
      const v = r.violations?.[0];
      assert.ok(v);
      assert.equal(pathToString(v.rule), "string.const");
    });
    void test("path lands at string.pattern", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.pattern = "^x$"]; }`,
      );
      const r = native.validate(s, create(s, { v: "y" }));
      assert.equal(r.kind, "invalid");
      const v = r.violations?.[0];
      assert.ok(v);
      assert.equal(pathToString(v.rule), "string.pattern");
    });
    void test("path lands at string.uuid (well-known oneof)", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.uuid = true]; }`,
      );
      const r = native.validate(s, create(s, { v: "nope" }));
      assert.equal(r.kind, "invalid");
      const v = r.violations?.[0];
      assert.ok(v);
      assert.equal(pathToString(v.rule), "string.uuid");
      assert.equal(v.ruleId, "string.uuid");
    });
  });

  void suite("well-known formats", () => {
    // Each entry: [proto rule name, valid input, invalid input].
    // Empty input is exercised separately to cover the *_empty rule ids.
    const cases: [string, string, string][] = [
      ["email", "foo@example.com", "not-an-email"],
      ["hostname", "example.com", "-bad-.example"],
      ["ip", "192.168.0.1", "999.0.0.1"],
      ["ipv4", "192.168.0.1", "::1"],
      ["ipv6", "::1", "192.168.0.1"],
      ["uri", "https://example.com/path", "not a uri"],
      ["uri_ref", "./relative/path", "::"],
      ["address", "example.com", "!!!"],
      ["uuid", "8badf0d8-2cab-4dcb-94ee-fa6f4e5d4a4a", "not-a-uuid"],
      ["tuuid", "8badf0d82cab4dcb94eefa6f4e5d4a4a", "not-a-tuuid"],
      ["ulid", "01ARZ3NDEKTSV4RRFFQ69G5FAV", "not-a-ulid"],
      ["ip_with_prefixlen", "192.168.1.5/24", "192.168.1.5"],
      ["ipv4_with_prefixlen", "192.168.1.5/24", "2001:db8::1/64"],
      ["ipv6_with_prefixlen", "2001:db8::1/64", "192.168.1.5/24"],
      ["ip_prefix", "192.168.1.0/24", "192.168.1.5/24"],
      ["ipv4_prefix", "192.168.1.0/24", "2001:db8::/64"],
      ["ipv6_prefix", "2001:db8::/64", "2001:db8::1/64"],
      ["host_and_port", "example.com:8080", "example.com"],
      ["protobuf_fqn", "buf.validate.StringRules", ".leading.dot"],
      ["protobuf_dot_fqn", ".buf.validate.StringRules", "no.leading.dot"],
    ];
    for (const [rule, valid, invalid] of cases) {
      void test(`string.${rule} valid, invalid, and empty`, () => {
        const s = compile(
          `message M { string v = 1 [(buf.validate.field).string.${rule} = true]; }`,
        );
        diff(s, create(s, { v: valid }));
        diff(s, create(s, { v: invalid }));
        diff(s, create(s, { v: "" }));
      });
    }

    void test("host_and_port accepts bracketed IPv6 with port", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.host_and_port = true]; }`,
      );
      diff(s, create(s, { v: "[::1]:8080" }));
      diff(s, create(s, { v: "::1" })); // no port
    });

    void test("empty input emits the *_empty rule id", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.email = true]; }`,
      );
      const r = native.validate(s, create(s, { v: "" }));
      assert.equal(r.kind, "invalid");
      const v = r.violations?.[0];
      assert.ok(v);
      assert.equal(v.ruleId, "string.email_empty");
      assert.equal(
        v.message,
        "value is empty, which is not a valid email address",
      );
      assert.equal(pathToString(v.rule), "string.email");
    });

    void test("uri_ref has no *_empty rule", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.uri_ref = true]; }`,
      );
      diff(s, create(s, { v: "" }));
      const r = native.validate(s, create(s, { v: "" }));
      // Whatever the verdict, an empty uri_ref never produces a
      // "string.uri_ref_empty" id — there is no such rule.
      if (r.kind === "invalid") {
        assert.equal(r.violations?.[0]?.ruleId, "string.uri_ref");
      }
    });

    void test("explicit email=false is a no-op claim — never emits a violation", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.email = false]; }`,
      );
      diff(s, create(s, { v: "" }));
      diff(s, create(s, { v: "not-an-email" }));
      assert.equal(native.validate(s, create(s, { v: "" })).kind, "valid");
      assert.equal(
        native.validate(s, create(s, { v: "not-an-email" })).kind,
        "valid",
      );
    });
  });

  void suite("string.well_known_regex", () => {
    void test("header name, strict by default", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.well_known_regex = KNOWN_REGEX_HTTP_HEADER_NAME]; }`,
      );
      diff(s, create(s, { v: "Content-Type" }));
      diff(s, create(s, { v: ":authority" }));
      diff(s, create(s, { v: "bad name" })); // space not allowed
      diff(s, create(s, { v: "bad\u0000name" }));
    });

    void test("header name empty emits header_name_empty", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.well_known_regex = KNOWN_REGEX_HTTP_HEADER_NAME]; }`,
      );
      diff(s, create(s, { v: "" }));
      const r = native.validate(s, create(s, { v: "" }));
      assert.equal(r.kind, "invalid");
      assert.equal(
        r.violations?.[0]?.ruleId,
        "string.well_known_regex.header_name_empty",
      );
    });

    void test("header name with strict=false uses the loose pattern", () => {
      const s = compile(
        `message M {
          string v = 1 [(buf.validate.field).string = {
            well_known_regex: KNOWN_REGEX_HTTP_HEADER_NAME, strict: false
          }];
        }`,
      );
      diff(s, create(s, { v: "anything goes ()" })); // loose allows spaces
      diff(s, create(s, { v: "bad\u0000name" })); // NUL still rejected
      diff(s, create(s, { v: "bad\nname" })); // LF still rejected
      diff(s, create(s, { v: "" }));
    });

    void test("header value, strict by default", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.well_known_regex = KNOWN_REGEX_HTTP_HEADER_VALUE]; }`,
      );
      diff(s, create(s, { v: "application/json" }));
      diff(s, create(s, { v: "tab\tis fine" }));
      diff(s, create(s, { v: "bad\u0000value" }));
      diff(s, create(s, { v: "bad\u001fvalue" }));
      diff(s, create(s, { v: "" })); // empty matches the * pattern
      assert.equal(native.validate(s, create(s, { v: "" })).kind, "valid");
    });

    void test("header value with strict=false uses the loose * pattern", () => {
      const s = compile(
        `message M {
          string v = 1 [(buf.validate.field).string = {
            well_known_regex: KNOWN_REGEX_HTTP_HEADER_VALUE, strict: false
          }];
        }`,
      );
      // The loose header-value pattern is anchored with * (unlike header
      // name's +), so empty input is valid — a spot where CEL and
      // protovalidate-go's native path historically diverged.
      diff(s, create(s, { v: "" }));
      diff(s, create(s, { v: "ctl\u0001is fine when loose" }));
      diff(s, create(s, { v: "bad\u0000value" }));
      diff(s, create(s, { v: "bad\rvalue" }));
      assert.equal(native.validate(s, create(s, { v: "" })).kind, "valid");
    });

    void test("explicit strict=true behaves like the default", () => {
      const s = compile(
        `message M {
          string v = 1 [(buf.validate.field).string = {
            well_known_regex: KNOWN_REGEX_HTTP_HEADER_VALUE, strict: true
          }];
        }`,
      );
      diff(s, create(s, { v: "good value" }));
      diff(s, create(s, { v: "bad\u001fvalue" }));
    });

    void test("KNOWN_REGEX_UNSPECIFIED is a no-op claim", () => {
      const s = compile(
        `message M { string v = 1 [(buf.validate.field).string.well_known_regex = KNOWN_REGEX_UNSPECIFIED]; }`,
      );
      diff(s, create(s, { v: "" }));
      diff(s, create(s, { v: "anything\u0000at all" }));
      assert.equal(
        native.validate(s, create(s, { v: "anything\u0000at all" })).kind,
        "valid",
      );
    });
  });

  void suite("fallthrough", () => {
    void test("custom predefined extension falls back to CEL entirely", () => {
      const descFile = compileFile(
        `
        syntax = "proto2";
        import "buf/validate/validate.proto";
        message M {
          optional string v = 1 [
            (buf.validate.field).string.min_len = 5,
            (buf.validate.field).string.(starts_x) = true
          ];
        }
        extend buf.validate.StringRules {
          optional bool starts_x = 81048953 [(buf.validate.predefined).cel = {
            id: "string.starts_x"
            message: "value must start with x"
            expression: "!rules.starts_x || this.startsWith('x')"
          }];
        }
        `,
        bufCompileOptions,
      );
      const s = descFile.messages[0];
      const ext = descFile.extensions[0];
      const nativeV = createValidator({ registry: createRegistry(ext) });
      const celV = createValidator({
        registry: createRegistry(ext),
        disableNativeRules: true,
      });
      const fmt = (v: { toString(): string }) => v.toString();
      for (const input of ["xhello", "hello", "x", "abc"]) {
        const a = nativeV.validate(s, create(s, { v: input }));
        const b = celV.validate(s, create(s, { v: input }));
        assert.equal(a.kind, b.kind, `kind mismatch for ${input}`);
        assert.deepEqual(a.violations?.map(fmt), b.violations?.map(fmt));
      }
    });
  });
});
