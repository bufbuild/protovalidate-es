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
import { create } from "@bufbuild/protobuf";
import { compileMessage } from "@bufbuild/protocompile";
import { createValidator, type Validator } from "./validator.js";
import { ValidationError } from "./error.js";

void suite("createValidator()", () => {
  void test("create()", () => {
    const v = createValidator();
    assert.ok(typeof v.validate == "function");
    assert.ok(typeof v.for == "function");
  });
});

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
  void suite("validation", () => {
    const bufCompileOptions = {
      imports: {
        "buf/validate/validate.proto": readFileSync(
          "proto/buf/validate/validate.proto",
          "utf-8",
        ),
      },
    };
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
    void test("throws error with all violations", () => {
      const validate = createValidator().for(descMessage);
      let error: ValidationError | undefined = undefined;
      try {
        validate(create(descMessage));
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
    void test("option failFast: true throws error with first violation", () => {
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
  });
});
