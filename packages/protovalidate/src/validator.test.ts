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

import * as assert from "node:assert";
import { suite, test, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { expectTypeOf } from "expect-type";
import {
  create,
  createRegistry,
  type DescMessage,
  type Message,
} from "@bufbuild/protobuf";
import {
  DurationSchema,
  type Timestamp,
  TimestampSchema,
} from "@bufbuild/protobuf/wkt";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import { compileFile, compileMessage } from "@bufbuild/protocompile";
import {
  CompilationError,
  RuntimeError,
  type ValidationError,
  type Violation,
} from "./error.js";
import { createValidator } from "./validator.js";

void test("createValidator() returns Validator", () => {
  const v = createValidator();
  assert.ok(typeof v.validate == "function");
});

const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

void suite("Validator", () => {
  void suite("validate()", () => {
    void test("returns result", () => {
      type Invalid = Message<"M"> & {
        valid: boolean;
      };
      type Valid = Message<"M"> & {
        valid: true;
      };
      const schema = compileMessage(`
        syntax = "proto2";
        message M {}
      `) as GenMessage<Invalid, { validType: Valid }>;
      const validator = createValidator();
      const result = validator.validate(schema, create(schema));
      assert.ok(result);
      // check result types
      expectTypeOf(result.error).toEqualTypeOf<
        ValidationError | RuntimeError | CompilationError | undefined
      >();
      expectTypeOf(result.violations).toEqualTypeOf<Violation[] | undefined>();
      expectTypeOf(result.message).toEqualTypeOf<Valid | Invalid>();
      expectTypeOf(result.kind).toEqualTypeOf<"valid" | "invalid" | "error">();
      // check narrowed result types
      switch (result.kind) {
        case "valid":
          expectTypeOf(result.violations).toEqualTypeOf(undefined);
          expectTypeOf(result.error).toEqualTypeOf(undefined);
          expectTypeOf(result.message.valid).toEqualTypeOf(true);
          break;
        case "invalid":
          expectTypeOf(result.violations).toEqualTypeOf<Violation[]>();
          expectTypeOf(result.error).toEqualTypeOf<ValidationError>();
          expectTypeOf(result.message.valid).toEqualTypeOf<boolean>();
          break;
        case "error":
          expectTypeOf(result.violations).toEqualTypeOf(undefined);
          expectTypeOf(result.error).toEqualTypeOf<
            RuntimeError | CompilationError
          >();
          expectTypeOf(result.message.valid).toEqualTypeOf<boolean>();
          break;
      }
    });
    void test("returns RuntimeError if schema and message mismatch", () => {
      const validator = createValidator();
      const schema = TimestampSchema as DescMessage;
      const message = create(DurationSchema);
      const result = validator.validate(schema, message);
      assert.equal(result.kind, "error");
      assert.ok(result.error instanceof RuntimeError);
      assert.equal(
        result.error.message,
        "Cannot validate message google.protobuf.Duration with schema google.protobuf.Timestamp",
      );
    });
    const validSchema = compileMessage(`
      syntax = "proto3";
      message M {}
    `);
    const invalidSchema = compileMessage(
      `
      syntax="proto3";
      import "buf/validate/validate.proto";
      message Example {
        option (buf.validate.message).cel = {
          id: "test-id1",
          message: "test-message1",
          expression: "false"
        };
      }`,
      bufCompileOptions,
    );
    const validMessage = create(validSchema);
    const invalidMessage = create(invalidSchema);
    void test("returns valid result for valid message", () => {
      const validator = createValidator();
      const result = validator.validate(validSchema, validMessage);
      assert.equal(result.kind, "valid");
    });
    void test("returns invalid result for invalid message", () => {
      const validator = createValidator();
      const result = validator.validate(invalidSchema, invalidMessage);
      assert.equal(result.kind, "invalid");
    });
  });
  void suite("option failFast", () => {
    const schema = compileMessage(
      `
        syntax="proto3";
        import "buf/validate/validate.proto";
        message Example {
          option (buf.validate.message).cel = {
            id: "test-id1",
            message: "test-message1",
            expression: "false"
          };
          option (buf.validate.message).cel = {
            id: "test-id2",
            message: "test-message2",
            expression: "false"
          };
        }`,
      bufCompileOptions,
    );
    const invalidMessage = create(schema);
    void test("is disabled by default", () => {
      const validator = createValidator();
      const result = validator.validate(schema, invalidMessage);
      assert.equal(result.kind, "invalid");
      assert.equal(result.violations?.length, 2);
      assert.equal(
        result.violations?.[0].toString(),
        "test-message1 [test-id1]",
      );
      assert.equal(
        result.violations?.[1].toString(),
        "test-message2 [test-id2]",
      );
    });
    void test("returns only the first violation", () => {
      const validatorFailFast = createValidator({
        failFast: true,
      });
      const result = validatorFailFast.validate(schema, invalidMessage);
      assert.equal(result.kind, "invalid");
      assert.equal(result.violations?.length, 1);
      assert.equal(result.error?.message, "test-message1 [test-id1]");
      assert.equal(
        result.violations?.[0].toString(),
        "test-message1 [test-id1]",
      );
    });
  });
  void test("option regexMatch", () => {
    const descMessage = compileMessage(
      `
        syntax="proto3";
        import "buf/validate/validate.proto";
        message Example {
          option (buf.validate.message).cel = {
            id: "test-id",
            expression: "'x'.matches('^x$')"
          };
        }`,
      bufCompileOptions,
    );
    let gotPattern: string | undefined;
    let gotAgainst: string | undefined;
    const validator = createValidator({
      regexMatch: (pattern, against) => {
        gotPattern = pattern;
        gotAgainst = against;
        return true;
      },
    });
    validator.validate(descMessage, create(descMessage));
    assert.equal(gotPattern, "^x$");
    assert.equal(gotAgainst, "x");
  });
  void test("issue #20", () => {
    const descFile = compileFile(
      `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message Person {
          string name = 1 [(buf.validate.field).required = true];
          Address address = 2 [(buf.validate.field).required = true];
        }
        message Address {
          string city = 2 [(buf.validate.field).required = true];
        }
      `,
      bufCompileOptions,
    );
    const personSchema = descFile.messages[0];
    const validator = createValidator();
    const person = create(personSchema, {
      name: "John Doe",
      address: {
        city: "Anytown",
      },
    });
    const result = validator.validate(personSchema, person);
    assert.equal(result.kind, "valid");
  });
  void test("issue #107", () => {
    const descMessage = compileMessage(
      `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      message Message {
        string hello = 1 [
          (buf.validate.field).required = true,
          (buf.validate.field).string.min_len = 1
        ];
      }`,
      bufCompileOptions,
    );
    const validator = createValidator();
    const msg = create(descMessage);
    const result = validator.validate(descMessage, msg);
    assert.equal(result.kind, "invalid");
    assert.equal(result.violations?.length, 1);
    assert.equal(result.violations?.[0].ruleId, "required");
    assert.equal(result.violations?.[0].message, "value is required");
  });
  void suite("option legacyRequired", () => {
    const schema = compileMessage(
      `
        syntax="proto2";
        message Example {
          required int32 int32 = 1;
          required Msg msg = 2;
          message Msg {}
        }
        `,
    );
    const validMessage = create(schema, {
      int32: 1,
      msg: {},
    });
    const invalidMessage = create(schema, {});
    const validatorLegacyRequired = createValidator({
      legacyRequired: true,
    });
    void test("is disabled by default", () => {
      const validator = createValidator();
      const result = validator.validate(schema, invalidMessage);
      assert.equal(result.kind, "valid");
    });
    void test("returns invalid if required fields are missing", () => {
      const result = validatorLegacyRequired.validate(schema, invalidMessage);
      assert.equal(result.kind, "invalid");
      assert.equal(result.violations?.length, 2);
      assert.equal(
        result.violations?.[0].toString(),
        "int32: value is required [legacy_required]",
      );
      assert.equal(
        result.violations?.[1].toString(),
        "msg: value is required [legacy_required]",
      );
    });
    void test("returns valid if required fields are present", () => {
      const result = validatorLegacyRequired.validate(schema, validMessage);
      assert.equal(result.kind, "valid");
    });
  });
  void suite("option disableNativeRules", () => {
    const schema = compileMessage(
      `
        syntax="proto3";
        import "buf/validate/validate.proto";
        message Example {
          int32 n = 1 [(buf.validate.field).int32.gt = 0];
          string s = 2 [(buf.validate.field).string.min_len = 3];
        }
        `,
      bufCompileOptions,
    );
    const invalid = create(schema, { n: 0, s: "ab" });
    const valid = create(schema, { n: 1, s: "abc" });
    void test("createValidator accepts the option", () => {
      const v = createValidator({ disableNativeRules: true });
      assert.ok(typeof v.validate == "function");
    });
    void test("default and disabled paths agree on a valid message", () => {
      const def = createValidator().validate(schema, valid);
      const off = createValidator({ disableNativeRules: true }).validate(
        schema,
        valid,
      );
      assert.equal(def.kind, "valid");
      assert.equal(off.kind, "valid");
    });
    void test("default and disabled paths produce identical violations", () => {
      const def = createValidator().validate(schema, invalid);
      const off = createValidator({ disableNativeRules: true }).validate(
        schema,
        invalid,
      );
      assert.equal(def.kind, "invalid");
      assert.equal(off.kind, "invalid");
      const fmt = (v: Violation) => v.toString();
      assert.deepEqual(def.violations?.map(fmt), off.violations?.map(fmt));
    });
  });
  void suite("predefined rules", () => {
    const descFile = compileFile(
      `
      syntax = "proto2";
      import "buf/validate/validate.proto";
      message Person {
        optional string name = 1 [(buf.validate.field).string.(abc) = true];
      }
      extend buf.validate.StringRules {
        optional bool abc = 81048952 [(buf.validate.predefined).cel = {
          id: "string.abc"
          message: "value must be abc"
          expression: "this == 'abc'"
        }];
      }
    `,
      bufCompileOptions,
    );
    const personSchema = descFile.messages[0];
    const ext_abc = descFile.extensions[0];
    void test("unknown extension raises error", () => {
      const validator = createValidator();
      const person = create(personSchema, {
        name: "John Doe",
      });
      const result = validator.validate(personSchema, person);
      assert.equal(result.kind, "error");
      assert.equal(
        result.error?.message,
        "Unknown extension for buf.validate.StringRules with number 81048952. If this is a predefined rule, register the extension with a registry in createValidator().",
      );
      assert.ok(result.error instanceof CompilationError);
    });
    void test("unknown extension raises error on every call", () => {
      const validator = createValidator();
      const person = create(personSchema, {
        name: "Pauly Shore",
      });
      const result = validator.validate(personSchema, person);
      assert.equal(result.kind, "error", "first call should explode");
      assert.ok(result.error instanceof CompilationError);
      const retryResult = validator.validate(personSchema, person);
      assert.equal(
        retryResult.kind,
        "error",
        "second call should also explode",
      );
      assert.ok(retryResult.error instanceof CompilationError);
    });
    void test("registered extension validates", () => {
      const validator = createValidator({
        registry: createRegistry(ext_abc),
      });
      const person = create(personSchema, {
        name: "John Doe",
      });
      const result = validator.validate(personSchema, person);
      assert.equal(result.kind, "invalid");
      assert.equal(result.violations?.[0].ruleId, "string.abc");
      assert.equal(result.violations?.[0].message, "value must be abc");
    });
  });
});

void suite("MessageOneofRule", () => {
  void suite("without required", () => {
    const descMessage = compileMessage(
      `
      syntax="proto3";
      import "buf/validate/validate.proto";
      message Example {
        string a = 1;
        string b = 2;
        bool unrelated = 3;
        option (buf.validate.message).oneof = {
          fields: ["a", "b"]
        };
      }`,
      bufCompileOptions,
    );
    void test("no fields set is valid", () => {
      const validator = createValidator();
      const message = create(descMessage, { unrelated: true });
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "valid");
    });
    void test("one field set is valid", () => {
      const validator = createValidator();
      const message = create(descMessage, {
        a: "A",
      });
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "valid");
    });
    void test("unrelated field set is valid", () => {
      const validator = createValidator();
      const message = create(descMessage, {
        unrelated: true,
      });
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "valid");
    });
    void test("two fields set is invalid", () => {
      const validator = createValidator();
      const message = create(descMessage, {
        a: "A",
        b: "B",
      });
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "invalid");
      assert.equal(result.error?.name, "ValidationError");
      assert.equal(
        result.error?.message,
        `only one of a, b can be set [message.oneof]`,
      );
    });
  });
  void suite("with required = true", () => {
    const descMessage = compileMessage(
      `
      syntax="proto3";
      import "buf/validate/validate.proto";
      message Example {
        string a = 1;
        string b = 2;
        bool unrelated = 3;
        option (buf.validate.message).oneof = {
          fields: ["a", "b"],
          required: true,
        };
      }`,
      bufCompileOptions,
    );
    void test("no fields set is invalid", () => {
      const validator = createValidator();
      const message = create(descMessage, { unrelated: true });
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "invalid");
      assert.equal(result.error?.name, "ValidationError");
      assert.equal(
        result.error?.message,
        `one of a, b must be set [message.oneof]`,
      );
    });
    void test("one field set is valid", () => {
      const validator = createValidator();
      const message = create(descMessage, {
        a: "A",
      });
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "valid");
    });
    void test("unrelated field set is invalid", () => {
      const validator = createValidator();
      const message = create(descMessage, {
        unrelated: true,
      });
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "invalid");
      assert.equal(result.error?.name, "ValidationError");
      assert.equal(
        result.error?.message,
        `one of a, b must be set [message.oneof]`,
      );
    });
    void test("two fields set is invalid", () => {
      const validator = createValidator();
      const message = create(descMessage, {
        a: "A",
        b: "B",
      });
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "invalid");
      assert.equal(result.error?.name, "ValidationError");
      assert.equal(
        result.error?.message,
        `only one of a, b can be set [message.oneof]`,
      );
    });
  });
  void test("with unknown field name", () => {
    const validator = createValidator();
    const schema = compileMessage(
      `
      syntax="proto3";
      import "buf/validate/validate.proto";
      message Example {
        string a = 1;
        string b = 2;
        option (buf.validate.message).oneof = {
          fields: ["a", "b", "xxx"]
        };
      }`,
      bufCompileOptions,
    );
    const message = create(schema, {
      a: "A",
    });
    const result = validator.validate(schema, message);
    assert.equal(result.kind, "error");
    assert.equal(result.error?.name, "CompilationError");
    assert.equal(
      result.error?.message,
      `field "xxx" not found in message Example`,
    );
  });
});

void suite("CEL variable now", () => {
  void test("is fresh for each validation", (t) => {
    // timestampNow() reads the clock through new Date().
    t.mock.timers.enable({ apis: ["Date"], now: 1_000_000_000_000 });
    type M = Message<"M"> & { ts?: Timestamp };
    const schema = compileMessage(
      `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      import "google/protobuf/timestamp.proto";
      message M {
        google.protobuf.Timestamp ts = 1 [(buf.validate.field).timestamp.lt_now = true];
      }
      `,
      bufCompileOptions,
    ) as GenMessage<M>;
    const validator = createValidator();
    // One second in the (mocked) future: not less than now.
    const msg = create(schema, {
      ts: create(TimestampSchema, { seconds: 1_000_000_001n }),
    });
    assert.strictEqual(validator.validate(schema, msg).kind, "invalid");
    // Two seconds later, the same timestamp is in the past. "now" is
    // memoized only for the duration of a single validation, so the second
    // validation must see the new time.
    t.mock.timers.tick(2000);
    assert.strictEqual(validator.validate(schema, msg).kind, "valid");
  });

  // Mock the clock: each parameterless new Date() returns a time one hour
  // later than the last. timestampNow() reads the clock through new Date().
  // Returns a counter of those reads.
  function installAdvancingClock(t: TestContext): () => number {
    const RealDate = globalThis.Date;
    let nowMs = 1_000_000_000_000;
    const mocked = t.mock.method(
      globalThis,
      "Date",
      class extends RealDate {
        constructor(ms?: number) {
          if (ms === undefined) {
            nowMs += 3_600_000;
            ms = nowMs;
          }
          super(ms);
        }
      } as DateConstructor,
    );
    return () =>
      mocked.mock.calls.filter((call) => call.arguments.length === 0).length;
  }

  void test("is read at most once per validation", (t) => {
    installAdvancingClock(t);
    const schema = compileMessage(
      `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      message M {
        option (buf.validate.message).cel = {
          id: "now_is_stable"
          message: "now must be stable within a validation"
          expression: "now == now"
        };
      }
      `,
      bufCompileOptions,
    );
    const validator = createValidator();
    // Every uncached clock read returns a different time, so this can only
    // be valid if both reads of "now" see the same memoized value.
    assert.strictEqual(
      validator.validate(schema, create(schema)).kind,
      "valid",
    );
  });

  void test("is not computed when no rule reads it", (t) => {
    const reads = installAdvancingClock(t);
    type M = Message<"M"> & { x: number };
    const schema = compileMessage(
      `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      message M {
        int32 x = 1 [(buf.validate.field).int32.gt = 0];
      }
      `,
      bufCompileOptions,
    ) as GenMessage<M>;
    const validator = createValidator();
    const msg = create(schema, { x: 1 });
    // First validation compiles the plan; ignore any reads during setup.
    validator.validate(schema, msg);
    const before = reads();
    assert.strictEqual(validator.validate(schema, msg).kind, "valid");
    assert.strictEqual(reads(), before);
  });
});
