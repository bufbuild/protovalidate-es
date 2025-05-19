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
import { type CompilationError, RuntimeError, type ValidationError, type Violation} from "./error.js";
import { DurationSchema, TimestampSchema } from "@bufbuild/protobuf/wkt";
import { createValidator, type Validator} from "./validator.js";

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
  void test("validate() returns result", () => {
    const v: Validator = createValidator();
    const descMessage = compileMessage(`
      syntax = "proto3";
      message M {}
    `);
    const message = create(descMessage);
    const result = v.validate(descMessage, message);
    const resultError: ValidationError | RuntimeError | CompilationError | undefined = result.error;
    const resultViolations: Violation[] | undefined = result.violations;
    assert.ok(resultError || resultViolations || true);
    switch (result.kind) {
      case "valid":
        const validViolations: undefined = result.violations;
        const validError: undefined = result.error;
        assert.ok(validViolations || validError || true);
        break;
      case "invalid":
        const invalidViolations: Violation[] = result.violations;
        const invalidError: ValidationError = result.error;
        assert.ok(invalidViolations || invalidError || true);
        break;
      case "error":
        const errorViolations: undefined = result.violations;
        const errorError: RuntimeError | CompilationError = result.error;
        assert.ok(errorViolations || errorError || true);
        break;
    }
  });
  void test("returns error if schema and message mismatch", () => {
    const validator = createValidator();
    const schema = TimestampSchema as DescMessage;
    const message = create(DurationSchema);
    const result = validator.validate(schema, message)
    assert.equal(result.kind, "error");
    assert.ok(result.error instanceof RuntimeError);
    assert.equal(
      result.error.message,
      "Cannot validate message google.protobuf.Duration with schema google.protobuf.Timestamp",
    );
  });
  void test("returns all violations", () => {
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
    const result = validator.validate(descMessage, create(descMessage));
    assert.equal(result.kind, "invalid");
    assert.equal(
      result.error?.message,
      "test-message1 [test-id1], and 1 more violation",
    );
    assert.equal(result.violations?.length, 2);
    assert.equal(result.violations?.[0].toString(), "test-message1 [test-id1]");
    assert.equal(result.violations?.[1].toString(), "test-message2 [test-id2]");
  });
  void test("returns only the first violation with failFast", () => {
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
    const validator: Validator = createValidator({
      failFast: true,
    });
    const result = validator.validate(descMessage, create(descMessage));
    assert.equal(result.kind, "invalid");
    assert.equal(result.violations?.length, 1);
    assert.equal(result.error?.message, "test-message1 [test-id1]");
    assert.equal(result.violations?.[0].toString(), "test-message1 [test-id1]");
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
    const message = create(personSchema, {
      name: "John Doe",
      address: {
        city: "Anytown",
      },
    });
    const result = validator.validate(personSchema, message);
    assert.equal(result.kind, "valid");
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
      const validator = createValidator();
      const message = create(descMessage);
      const result = validator.validate(descMessage, message);
      assert.equal(result.kind, "valid");
    });
    void test("returns invalid if required fields are missing", () => {
      const validator = createValidator({
        legacyRequired: true,
      });
      const message = create(descMessage);
      const result = validator.validate(descMessage, message);
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
      const v = createValidator();
      const m = create(descMessage, {
        int32: 1,
        msg: {},
      });
      assert.doesNotThrow(() => v.validate(descMessage, m));
    });
  });
});
