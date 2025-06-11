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

import * as assert from "node:assert";
import { suite, test } from "node:test";
import { readFileSync } from "node:fs";
import { expectTypeOf } from "expect-type";
import { create, type DescMessage, type Message } from "@bufbuild/protobuf";
import { DurationSchema, TimestampSchema } from "@bufbuild/protobuf/wkt";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import { compileFile, compileMessage } from "@bufbuild/protocompile";
import {
  type CompilationError,
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
  void test("issues #20", () => {
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

  void test("message oneof bad field name", () => {
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
      `field name "xxx" not found in message Example`,
    );
  });
});
