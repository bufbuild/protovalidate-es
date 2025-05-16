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
import { create, type DescMessage } from "@bufbuild/protobuf";
import { compileFile, compileMessage } from "@bufbuild/protocompile";
import { createValidator, type Validator } from "./validator.js";
import { RuntimeError, ValidationError } from "./error.js";
import { DurationSchema, TimestampSchema } from "@bufbuild/protobuf/wkt";

void suite("createValidator()", () => {
  void test("create()", () => {
    const v = createValidator();
    assert.ok(typeof v.validate == "function");
    assert.ok(typeof v.for == "function");
  });
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
  void test("validate()", () => {
    const v: Validator = createValidator();
    const descMessage = compileMessage(`
      syntax = "proto3";
      message M {}
    `);
    const message = create(descMessage);
    const result = v.validate(descMessage, message);
    assert.strictEqual(result, undefined);
  });
  void test("for()", () => {
    const descMessage = compileMessage(`
      syntax = "proto3";
      message M {}
    `);
    const validate = createValidator().for(descMessage);
    const message = create(descMessage);
    const result = validate(message);
    assert.strictEqual(result, undefined);
  });
  void test("option failFast: true throws error with first violation", () => {
    const descMessage = compileMessage(
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
    const validate = createValidator({
      failFast: true,
    }).for(descMessage);
    let error: ValidationError | undefined = undefined;
    try {
      validate(create(descMessage));
    } catch (e) {
      error = e instanceof ValidationError ? e : undefined;
    }
    assert.ok(error, "expected ValidationError");
    assert.equal(error.message, "test-message1 [test-id1]");
    assert.equal(error.violations.length, 1);
    assert.equal(error.violations[0].toString(), "test-message1 [test-id1]");
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
    const v = createValidator();
    v.validate(
      personSchema,
      create(personSchema, {
        name: "John Doe",
        address: {
          city: "Anytown",
        },
      }),
    );
  });
  void suite("option legacyRequired", () => {
    const descMessage = compileMessage(
      `
        syntax="proto2";
        message Example {
          required int32 int32 = 1;
          required Msg msg = 2;
          message Msg {}
        }
        `,
    );
    void test("is disabled by default", () => {
      const v = createValidator();
      assert.doesNotThrow(() => v.validate(descMessage, create(descMessage)));
    });
    void test("throws if required fields are missing", () => {
      const v = createValidator({
        legacyRequired: true,
      });
      const m = create(descMessage);
      let error: ValidationError | undefined = undefined;
      try {
        v.validate(descMessage, m);
      } catch (e) {
        error = e instanceof ValidationError ? e : undefined;
      }
      assert.ok(error, "expected ValidationError");
      assert.equal(error.violations.length, 2);
      assert.equal(
        error.violations[0].toString(),
        "int32: value is required [legacy_required]",
      );
      assert.equal(
        error.violations[1].toString(),
        "msg: value is required [legacy_required]",
      );
    });
    void test("does not throw if required fields are present", () => {
      const v = createValidator();
      const m = create(descMessage, {
        int32: 1,
        msg: {},
      });
      assert.doesNotThrow(() => v.validate(descMessage, m));
    });
  });
  void test("throws ValidationError with all violations", () => {
    const descMessage = compileMessage(
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
    const validator = createValidator();
    let error: ValidationError | undefined = undefined;
    try {
      validator.validate(descMessage, create(descMessage));
    } catch (e) {
      error = e instanceof ValidationError ? e : undefined;
    }
    assert.ok(error, "expected ValidationError");
    assert.equal(
      error.message,
      "test-message1 [test-id1], and 1 more violation",
    );
    assert.equal(error.violations.length, 2);
    assert.equal(error.violations[0].toString(), "test-message1 [test-id1]");
    assert.equal(error.violations[1].toString(), "test-message2 [test-id2]");
  });
  void test("throws RuntimeError if schema and message mismatch", () => {
    const validator = createValidator();
    let error: RuntimeError | undefined = undefined;
    try {
      validator.validate(
        TimestampSchema as DescMessage,
        create(DurationSchema),
      );
    } catch (e) {
      error = e instanceof RuntimeError ? e : undefined;
    }
    assert.ok(error, "expected RuntimeError");
    assert.equal(
      error.message,
      "Cannot validate message google.protobuf.Duration with schema google.protobuf.Timestamp",
    );
  });
});
