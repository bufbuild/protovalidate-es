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

import * as assert from "node:assert/strict";
import { suite, test } from "node:test";
import { buildPath, type Path, parsePath } from "@bufbuild/protobuf/reflect";
import {
  CompilationError,
  pathFromViolationProto,
  RuntimeError,
  ValidationError,
  Violation,
  violationsToProto,
  violationToProto,
} from "./error.js";
import {
  FieldRulesSchema,
  type FieldPath,
  FieldPathElementSchema,
  ViolationSchema,
  ViolationsSchema,
} from "./gen/buf/validate/validate_pb.js";
import { isFieldSet, isMessage } from "@bufbuild/protobuf";
import { compileMessage } from "@bufbuild/protocompile";
import { FieldDescriptorProto_Type } from "@bufbuild/protobuf/wkt";
import { getTestDataForPaths } from "./error.testdata.js";

void suite("Violation", () => {
  void test("constructor", () => {
    const field = parsePath(FieldRulesSchema, "cel[1].id");
    const rule = parsePath(FieldRulesSchema, "string.min_len");
    const v = new Violation("failure-message", "rule-id", field, rule, false);
    assert.strictEqual(v.message, "failure-message");
    assert.strictEqual(v.ruleId, "rule-id");
    assert.strictEqual(v.field, field);
    assert.strictEqual(v.rule, rule);
    assert.strictEqual(v.forKey, false);
  });
  void test("toString", () => {
    const field = parsePath(FieldRulesSchema, "cel[1].id");
    const rule = parsePath(FieldRulesSchema, "string.min_len");
    const v = new Violation("failure-message", "rule-id", field, rule, false);
    assert.equal(v.toString(), "cel[1].id: failure-message [rule-id]");
  });
  void test("toString with empty field path", () => {
    const field: Path = [];
    const rule = parsePath(FieldRulesSchema, "string.min_len");
    const v = new Violation("failure-message", "rule-id", field, rule, false);
    assert.equal(v.toString(), "failure-message [rule-id]");
  });
});

void suite("violationToProto", () => {
  void test("converts as expected", () => {
    const violation = new Violation(
      "failure-message",
      "rule-id",
      parsePath(FieldRulesSchema, "cel[1].id"),
      [],
      false,
    );
    const proto = violationToProto(violation);
    assert.ok(isMessage(proto, ViolationSchema));
    assert.equal(proto.message, violation.message);
    assert.equal(proto.ruleId, violation.ruleId);
    assert.equal(proto.forKey, violation.forKey);
    assert.strictEqual(proto.field?.elements.length, 2);
    assert.strictEqual(proto.rule, undefined);
  });
  void test("sets field type GROUP for message field with message_encoding = DELIMITED", () => {
    const descMessage = compileMessage(`
      edition="2023";
      message M {
        Msg val = 1 [features.message_encoding = DELIMITED];
        message Msg {
          string val = 1;
        }
      }
    `);
    const violation = new Violation(
      "failure-message",
      "rule-id",
      buildPath(descMessage).field(descMessage.field.val).toPath(),
      [],
      false,
    );
    const proto = violationToProto(violation);
    assert.ok(proto.field);
    assert.equal(proto.field.elements.length, 1);
    assert.equal(proto.field.elements[0].fieldName, "val");
    assert.equal(
      proto.field.elements[0].fieldType,
      FieldDescriptorProto_Type.GROUP,
    );
  });
  void test("does not populate FieldPathElement.key_type and value_type for map field without subscript", () => {
    const descMessage = compileMessage(`
      syntax="proto3";
      message M {
        map<int32, int32> m = 1;
      }
    `);
    const violation = new Violation(
      "failure-message",
      "rule-id",
      buildPath(descMessage).field(descMessage.field.m).toPath(),
      [],
      false,
    );
    const proto = violationToProto(violation);
    assert.ok(proto.field);
    assert.equal(proto.field.elements.length, 1);
    assert.equal(
      isFieldSet(proto.field.elements[0], FieldPathElementSchema.field.keyType),
      false,
    );
    assert.equal(
      isFieldSet(
        proto.field.elements[0],
        FieldPathElementSchema.field.valueType,
      ),
      false,
    );
  });
  void test("populates FieldPathElement.key_type and value_type for map field with subscript", () => {
    const descMessage = compileMessage(`
      syntax="proto3";
      message M {
        map<int32, int32> m = 1;
      }
    `);
    const violation = new Violation(
      "failure-message",
      "rule-id",
      buildPath(descMessage).field(descMessage.field.m).map(123).toPath(),
      [],
      false,
    );
    const proto = violationToProto(violation);
    assert.ok(proto.field);
    assert.equal(proto.field.elements.length, 1);
    assert.equal(
      isFieldSet(proto.field.elements[0], FieldPathElementSchema.field.keyType),
      true,
    );
    assert.equal(
      isFieldSet(
        proto.field.elements[0],
        FieldPathElementSchema.field.valueType,
      ),
      true,
    );
  });
  void test("violationsToProto", () => {
    const violations = [
      new Violation("message-1", "id-1", [], [], false),
      new Violation("message-2", "id-2", [], [], false),
    ];
    const proto = violationsToProto(violations);
    assert.ok(isMessage(proto, ViolationsSchema));
    assert.equal(proto.violations.length, violations.length);
  });
});

void suite("pathFromViolationProto", () => {
  function toProto(path: Path): FieldPath {
    const proto = violationsToProto([
      new Violation("message", "id", path, [], false),
    ]).violations[0].field;
    assert.ok(proto !== undefined);
    return proto;
  }
  for (const { string, golden, schema, registry } of getTestDataForPaths()) {
    void test(string, () => {
      const proto = toProto(golden);
      const path = pathFromViolationProto(schema, proto, registry);
      assert.deepStrictEqual(path, golden);
    });
  }
});

void suite("ValidationError", () => {
  void test("constructor with 1 violation", () => {
    const violations = [
      new Violation(
        "failure-message",
        "rule-id",
        parsePath(FieldRulesSchema, "cel[1].id"),
        [],
        false,
      ),
    ];
    const err = new ValidationError(violations);
    assert.equal(err.message, "cel[1].id: failure-message [rule-id]");
  });
  void test("constructor with 2 violations", () => {
    const violations = [
      new Violation(
        "failure-message-1",
        "rule-id-1",
        parsePath(FieldRulesSchema, "cel[1].id"),
        [],
        false,
      ),
      new Violation(
        "failure-message-2",
        "rule-id-2",
        parsePath(FieldRulesSchema, "cel[2].id"),
        [],
        false,
      ),
    ];
    const err = new ValidationError(violations);
    assert.equal(
      err.message,
      "cel[1].id: failure-message-1 [rule-id-1], and 1 more violation",
    );
  });
  void test("constructor without violations", () => {
    const violations: Violation[] = [];
    const err = new ValidationError(violations);
    assert.equal(err.name, "ValidationError");
    assert.strictEqual(err.violations, violations);
    assert.equal(err.message, "validation failed");
  });
});

void suite("CompilationError", () => {
  void test("message", () => {
    const err = new CompilationError("test-message");
    assert.equal(err.name, "CompilationError");
    assert.equal(err.message, "test-message");
    assert.strictEqual(err.cause, undefined);
  });
  void test("cause", () => {
    const cause = {};
    const err = new CompilationError("test-message", {
      cause,
    });
    assert.strictEqual(err.cause, cause);
  });
});

void suite("RuntimeError", () => {
  void test("message", () => {
    const err = new RuntimeError("test-message");
    assert.equal(err.name, "RuntimeError");
    assert.equal(err.message, "test-message");
    assert.strictEqual(err.cause, undefined);
  });
  void test("cause", () => {
    const cause = {};
    const err = new RuntimeError("test-message", {
      cause,
    });
    assert.strictEqual(err.cause, cause);
  });
});
