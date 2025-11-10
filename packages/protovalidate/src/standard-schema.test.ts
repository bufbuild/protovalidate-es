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
import {
  createStandardSchema,
  type StandardSchemaV1,
} from "./standard-schema.js";

const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

void suite("createStandardSchema", () => {
  void suite("basic functionality", () => {
    void test("creates StandardSchemaV1 compliant validator", () => {
      const descMessage = compileMessage(`
      syntax = "proto3";
      message TestMessage {
        string name = 1;
      }
    `);

      const schema = createStandardSchema(descMessage);

      // Check structure
      assert.ok(schema["~standard"]);
      assert.equal(schema["~standard"].version, 1);
      assert.equal(schema["~standard"].vendor, "protovalidate-es");
      assert.equal(typeof schema["~standard"].validate, "function");
    });

    void test("validates message without rules", () => {
      const descMessage = compileMessage(`
        syntax = "proto3";
        message User {
          string email = 1;
          int32 age = 2;
        }
      `);

      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        email: "test@example.com",
        age: 25,
      });
      const result = schema["~standard"].validate(
        message,
      ) as StandardSchemaV1.Result<{ email: string; age: number }>;

      assert.ok(!(result instanceof Promise));
      assert.equal(result.issues, undefined);
      assert.ok("value" in result && result.value);
      assert.equal(result.value.email, "test@example.com");
      assert.equal(result.value.age, 25);
    });

    void test("returns issues for invalid input type", () => {
      const descMessage = compileMessage(`
        syntax = "proto3";
        message User {
          string email = 1;
          int32 age = 2;
        }
      `);

      const schema = createStandardSchema(descMessage);
      const result = schema["~standard"].validate("not an object");

      assert.ok(!(result instanceof Promise));
      assert.ok("issues" in result && result.issues);
      assert.ok(Array.isArray(result.issues));
      assert.equal(result.issues.length, 1);
      assert.equal(result.issues[0].message, "Expected an object");
    });

    void test("handles non-object input", () => {
      const descMessage = compileMessage(`
      syntax = "proto3";
      message TestMessage {
        string name = 1;
      }
    `);

      const schema = createStandardSchema(descMessage);

      // Test with null
      let result = schema["~standard"].validate(null);
      assert.ok(!(result instanceof Promise));
      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 1);
      assert.equal(result.issues[0].message, "Expected an object");

      // Test with string
      result = schema["~standard"].validate("not an object");
      assert.ok(!(result instanceof Promise));
      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 1);
      assert.equal(result.issues[0].message, "Expected an object");

      // Test with number
      result = schema["~standard"].validate(42);
      assert.ok(!(result instanceof Promise));
      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 1);
      assert.equal(result.issues[0].message, "Expected an object");
    });
  });

  void suite("validation rules", () => {
    void test("validates standard rule", () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message User {
          string email = 1 [(buf.validate.field).string.email = true];
        }
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);

      // Valid email
      const validMessage = create(descMessage, { email: "test@example.com" });
      const validResult = schema["~standard"].validate(validMessage);
      assert.ok(!(validResult instanceof Promise));
      assert.equal(validResult.issues, undefined);
      assert.ok("value" in validResult && validResult.value);

      // Invalid email
      const invalidMessage = create(descMessage, { email: "not-an-email" });
      const invalidResult = schema["~standard"].validate(invalidMessage);
      assert.ok(!(invalidResult instanceof Promise));
      assert.ok("issues" in invalidResult && invalidResult.issues);
      assert.equal(invalidResult.issues.length, 1);
      assert.deepEqual(invalidResult.issues[0].path, ["email"]);
      assert.ok(invalidResult.issues[0].message.includes("email"));
    });

    void test("validates CEL custom rules", () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message PasswordReset {
          string password = 1 [(buf.validate.field).string.min_len = 8];
          string confirm_password = 2;

          option (buf.validate.message).cel = {
            id: "passwords_must_match"
            message: "passwords must match"
            expression: "this.password == this.confirm_password"
          };
        }
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);

      // Matching passwords
      const validMessage = create(descMessage, {
        password: "securepass123",
        confirmPassword: "securepass123",
      });
      const validResult = schema["~standard"].validate(validMessage);
      assert.ok(!(validResult instanceof Promise));
      assert.equal(validResult.issues, undefined);
      assert.ok("value" in validResult && validResult.value);

      // Non-matching passwords
      const invalidMessage = create(descMessage, {
        password: "securepass123",
        confirmPassword: "different456",
      });
      const invalidResult = schema["~standard"].validate(invalidMessage);
      assert.ok("issues" in invalidResult && invalidResult.issues);
      assert.equal(invalidResult.issues.length, 1);
      assert.equal(invalidResult.issues[0].message, "passwords must match");
      assert.equal(invalidResult.issues[0].path, undefined); // Message-level error has no path
    });
  });

  void suite("error path conversions", () => {
    void test("converts nested field paths", () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message User {
          message Address {
            string street = 1 [(buf.validate.field).string.min_len = 1];
            string city = 2 [(buf.validate.field).string.min_len = 1];
          }
          string name = 1;
          Address address = 2;
        }
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        name: "John",
        address: {
          street: "", // Invalid: empty street
          city: "NYC",
        },
      });
      const result = schema["~standard"].validate(message);

      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 1);
      assert.deepEqual(result.issues[0].path, ["address", "street"]);
    });

    void test("converts oneof field paths", () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message Contact {
          oneof method {
            option (buf.validate.oneof).required = true;
            string email = 1;
            string phone = 2;
          }
        }
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        method: {
          case: 'email',
          value: '123'
        }
      });
      const result = schema["~standard"].validate(message);

      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 1);
      assert.deepEqual(result.issues[0].path, ["method"]);
    });

    void test("converts repeated field paths", () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message EmailList {
          repeated string emails = 1 [(buf.validate.field).repeated = {
            items: {string: {email: true}}
          }];
        }
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        emails: ["valid@example.com", "invalid-email", "another@valid.com"],
      });
      const result = schema["~standard"].validate(message);

      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 1);
      assert.deepEqual(result.issues[0].path, ["emails", 1]); // Index 1 is invalid
    });

    void test("converts map field paths", () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message ScoreBoard {
          map<string, int32> scores = 1 [(buf.validate.field).map = {
            values: {int32: {gte: 0, lte: 100}}
          }];
        }
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        scores: {
          math: 95,
          english: 150, // Invalid: > 100
          science: 85,
        },
      });
      const result = schema["~standard"].validate(message);

      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 1);
      assert.deepEqual(result.issues[0].path, ["scores", "english"]);
    });

    void test("handles multiple validation errors", () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message User {
          string email = 1 [(buf.validate.field).string.email = true];
          int32 age = 2 [(buf.validate.field).int32 = {gte: 18}];
          string username = 3 [(buf.validate.field).string = {min_len: 3}];
        }
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        email: "not-an-email",
        age: 15,
        username: "ab",
      });
      const result = schema["~standard"].validate(message);

      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 3);

      // Check that we have errors for all three fields
      const paths = result.issues.map(
        (issue: StandardSchemaV1.Issue) => issue.path?.[0],
      );
      assert.ok(paths.includes("email"));
      assert.ok(paths.includes("age"));
      assert.ok(paths.includes("username"));
    });

    void test("converts field names with underscores to camelCase", () => {
      const descMessage = compileMessage(
        `  
        syntax = "proto3";  
        import "buf/validate/validate.proto";  
        message User {  
          string user_name = 1 [(buf.validate.field).string.min_len = 1];  
          
          oneof contact_method {  
            option (buf.validate.oneof).required = true;  
            string email_address = 3 [(buf.validate.field).string.email = true];  
          }  
        }  
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);

      const messageInvalidFields = create(descMessage, {
        userName: "",
        contactMethod: {
          case: 'emailAddress',
          value: '123'
        }
      });
      const resultFields = schema["~standard"].validate(messageInvalidFields);

      assert.ok("issues" in resultFields && resultFields.issues);
      const fieldPaths = resultFields.issues.map((issue) => issue.path?.[0]);
      assert.ok(fieldPaths.includes("userName"));
      assert.ok(fieldPaths.includes("contactMethod"));
    });

    void test("handles CEL compilation errors", () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message BadCEL {
          string value = 1 [(buf.validate.field).cel = {
            id: "bad_cel"
            message: "Invalid CEL"
            expression: "this.invalid.syntax("
          }];
        }
      `,
        bufCompileOptions,
      );

      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, { value: "test" });
      const result = schema["~standard"].validate(message);

      assert.ok("issues" in result && result.issues);
      assert.equal(result.issues.length, 1);
      assert.ok(
        result.issues[0].message.includes("CEL") ||
          result.issues[0].message.includes("compile"),
      );
    });
  });
});
