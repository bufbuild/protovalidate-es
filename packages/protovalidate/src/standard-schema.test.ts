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
import { suite, test } from "node:test";
import { readFileSync } from "node:fs";
import { create, type Message } from "@bufbuild/protobuf";
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
  void test("creates StandardSchemaV1 compliant validator", () => {
    const descMessage = compileMessage(`
      syntax = "proto3";
      message TestMessage {
        string name = 1;
      }`);
    const schema = createStandardSchema(descMessage);
    assert.ok(schema["~standard"]);
    assert.equal(schema["~standard"].version, 1);
    assert.equal(schema["~standard"].vendor, "protovalidate-es");
    assert.equal(typeof schema["~standard"].validate, "function");
  });
  void test("returns SuccessResult for valid message", async () => {
    const descMessage = compileMessage(
      `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      message User {
        string email = 1 [(buf.validate.field).string.email = true];
      }`,
      bufCompileOptions,
    );
    const schema = createStandardSchema(descMessage);
    const message = create(descMessage, { email: "test@example.com" });
    const result = await schema["~standard"].validate(message);
    assert.deepStrictEqual(result, {
      value: message,
    } satisfies StandardSchemaV1.SuccessResult<Message>);
  });
  void test("returns FailureResult for non-message input", async () => {
    const descMessage = compileMessage(`
      syntax = "proto3";
      message TestMessage {
        string name = 1;
      }`);
    const schema = createStandardSchema(descMessage);

    // Test with null
    let result = await schema["~standard"].validate(null);
    assert.ok(result.issues?.length === 1);
    assert.equal(result.issues[0].message, "Expected an object");

    // Test with string
    result = await schema["~standard"].validate("not an object");
    assert.ok(result.issues?.length === 1);
    assert.equal(result.issues[0].message, "Expected an object");

    // Test with number
    result = await schema["~standard"].validate(42);
    assert.ok(result.issues?.length === 1);
    assert.equal(result.issues[0].message, "Expected an object");
  });
  void test("returns FailureResult for CEL compilation error", async () => {
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
      }`,
      bufCompileOptions,
    );
    const schema = createStandardSchema(descMessage);
    const message = create(descMessage, { value: "test" });
    const result = await schema["~standard"].validate(message);
    assert.ok(result.issues?.length === 1);
    assert.match(result.issues[0].message, /^failed to compile .*/);
  });
  void test("returns FailureResult for invalid message", async () => {
    const descMessage = compileMessage(
      `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      message User {
        string email = 1 [(buf.validate.field).string.email = true];
      }`,
      bufCompileOptions,
    );
    const schema = createStandardSchema(descMessage);
    const message = create(descMessage, { email: "not-an-email" });
    const result = await schema["~standard"].validate(message);
    assert.ok(result.issues?.length === 1);
    assert.equal(
      result.issues[0].message,
      "value must be a valid email address",
    );
  });
  void test("FailureResult maps multiple violations to issues", async () => {
    const descMessage = compileMessage(
      `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      message User {
        string email = 1 [(buf.validate.field).string.email = true];
        int32 age = 2 [(buf.validate.field).int32 = {gte: 18}];
        string username = 3 [(buf.validate.field).string = {min_len: 3}];
      }`,
      bufCompileOptions,
    );
    const schema = createStandardSchema(descMessage);
    const message = create(descMessage, {
      email: "not-an-email",
      age: 15,
      username: "ab",
    });
    const result = await schema["~standard"].validate(message);
    assert.ok(result.issues);
    assert.deepStrictEqual(result.issues, [
      { message: "value must be a valid email address", path: ["email"] },
      { message: "value must be greater than or equal to 18", path: ["age"] },
      {
        message: "value length must be at least 3 characters",
        path: ["username"],
      },
    ]);
  });
  void suite("FailureResult maps violation field path to issue path", () => {
    void test("for message field path", async () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message User {
          Address user_address = 2;
          message Address {
            string address_street = 1 [(buf.validate.field).string.min_len = 1];
          }
        }`,
        bufCompileOptions,
      );
      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        name: "John",
        userAddress: {
          addressStreet: "", // Invalid: empty street
        },
      });
      const result = await schema["~standard"].validate(message);
      assert.ok(result.issues?.length === 1);
      assert.deepStrictEqual(result.issues[0].path, [
        "userAddress",
        "addressStreet",
      ]);
    });
    void test("for oneof field path", async () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message Contact {
          oneof contact_method {
            option (buf.validate.oneof).required = true;
            string email = 1;
          }
        }`,
        bufCompileOptions,
      );
      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {});
      const result = await schema["~standard"].validate(message);
      assert.ok(result.issues?.length === 1);
      assert.deepStrictEqual(result.issues[0].path, ["contactMethod"]);
    });
    void test("for oneof member path", async () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message Contact {
          oneof contact_method {
            string email_address = 1 [(buf.validate.field).string.email = true];
          }
        }`,
        bufCompileOptions,
      );
      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        contactMethod: {
          case: "emailAddress",
          value: "123",
        },
      });
      const result = await schema["~standard"].validate(message);
      assert.ok(result.issues?.length === 1);
      assert.deepStrictEqual(result.issues[0].path, ["contactMethod", "value"]);
    });
    void test("for repeated field path", async () => {
      const descMessage = compileMessage(
        `
        syntax = "proto3";
        import "buf/validate/validate.proto";
        message EmailList {
          repeated string emails = 1 [(buf.validate.field).repeated = {
            items: {string: {email: true}}
          }];
        }`,
        bufCompileOptions,
      );
      const schema = createStandardSchema(descMessage);
      const message = create(descMessage, {
        emails: ["valid@example.com", "invalid-email", "another@valid.com"],
      });
      const result = await schema["~standard"].validate(message);
      assert.ok(result.issues?.length === 1);
      assert.deepStrictEqual(result.issues[0].path, ["emails", 1]); // Index 1 is invalid
    });
    void test("for map field path", async () => {
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
      const result = await schema["~standard"].validate(message);
      assert.ok(result.issues?.length === 1);
      assert.deepEqual(result.issues[0].path, ["scores", "english"]);
    });
  });
});
