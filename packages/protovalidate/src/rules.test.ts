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
import {
  create,
  type DescMessage,
  type MessageInitShape,
  ScalarType,
} from "@bufbuild/protobuf";
import {
  AnySchema,
  DurationSchema,
  StringValueSchema,
  TimestampSchema,
} from "@bufbuild/protobuf/wkt";
import { buildPath, pathToString } from "./path.js";
import {
  AnyRulesSchema,
  DoubleRulesSchema,
  DurationRulesSchema,
  EnumRulesSchema,
  FieldRulesSchema,
  FloatRulesSchema,
  Int32RulesSchema,
  Int64RulesSchema,
  MapRulesSchema,
  RepeatedRulesSchema,
  StringRulesSchema,
  TimestampRulesSchema,
} from "./gen/buf/validate/validate_pb.js";
import {
  getEnumRules,
  getListRules,
  getMapRules,
  getMessageRules,
  getScalarRules,
} from "./rules.js";

void suite("getListRules()", () => {
  const fakeField = {
    toString: () => "field fake.Foo.field",
  };
  const basePath = buildPath(FieldRulesSchema);
  void test("fieldRules undefined returns rules undefined", () => {
    const fieldRules = undefined;
    const [rules, path] = getListRules(basePath, fieldRules, fakeField);
    assert.strictEqual(rules, undefined);
    assert.strictEqual(pathToString(path.toPath()), "repeated");
  });
  void test("fieldRules without rules returns rules undefined", () => {
    const fieldRules = create(FieldRulesSchema);
    const [rules, path] = getListRules(basePath, fieldRules, fakeField);
    assert.strictEqual(rules, undefined);
    assert.strictEqual(pathToString(path.toPath()), "repeated");
  });
  void test("fieldRules with repeated rules returns rules", () => {
    const fieldRules = create(FieldRulesSchema, {
      type: { case: "repeated", value: {} },
    });
    const [rules, path] = getListRules(basePath, fieldRules, fakeField);
    assert.ok(rules);
    assert.strictEqual(rules.$typeName, RepeatedRulesSchema.typeName);
    assert.strictEqual(pathToString(path.toPath()), "repeated");
  });
  const failureCases: {
    type: Exclude<MessageInitShape<typeof FieldRulesSchema>["type"], undefined>;
    error: string;
  }[] = [
    {
      type: { case: "string", value: {} },
      error: `expected rule "repeated", got "string" on field fake.Foo.field`,
    },
    {
      type: { case: "map", value: {} },
      error: `expected rule "repeated", got "map" on field fake.Foo.field`,
    },
  ];
  for (const { type, error } of failureCases) {
    void test(`rule "${type.case}" errors`, () => {
      const fieldRules = create(FieldRulesSchema, { type });
      assert.throws(() => getListRules(basePath, fieldRules, fakeField), {
        name: "CompilationError",
        message: error,
      });
    });
  }
});

void suite("getMapRules()", () => {
  const fakeField = {
    toString: () => "field fake.Foo.field",
  };
  const basePath = buildPath(FieldRulesSchema);
  void test("fieldRules undefined returns rules undefined", () => {
    const fieldRules = undefined;
    const [rules, path] = getMapRules(basePath, fieldRules, fakeField);
    assert.strictEqual(rules, undefined);
    assert.strictEqual(pathToString(path.toPath()), "map");
  });
  void test("fieldRules without rules returns rules undefined", () => {
    const fieldRules = create(FieldRulesSchema);
    const [rules, path] = getMapRules(basePath, fieldRules, fakeField);
    assert.strictEqual(rules, undefined);
    assert.strictEqual(pathToString(path.toPath()), "map");
  });
  void test("fieldRules with map rules returns rules", () => {
    const fieldRules = create(FieldRulesSchema, {
      type: { case: "map", value: {} },
    });
    const [rules, path] = getMapRules(basePath, fieldRules, fakeField);
    assert.ok(rules);
    assert.strictEqual(rules.$typeName, MapRulesSchema.typeName);
    assert.strictEqual(pathToString(path.toPath()), "map");
  });
  const failureCases: {
    type: Exclude<MessageInitShape<typeof FieldRulesSchema>["type"], undefined>;
    error: string;
  }[] = [
    {
      type: { case: "string", value: {} },
      error: `expected rule "map", got "string" on field fake.Foo.field`,
    },
    {
      type: { case: "repeated", value: {} },
      error: `expected rule "map", got "repeated" on field fake.Foo.field`,
    },
  ];
  for (const { type, error } of failureCases) {
    void test(`rule "${type.case}" errors`, () => {
      const rules = create(FieldRulesSchema, { type });
      assert.throws(() => getMapRules(basePath, rules, fakeField), {
        name: "CompilationError",
        message: error,
      });
    });
  }
});

void suite("getEnumRules()", () => {
  const fakeField = {
    toString: () => "field fake.Foo.field",
  };
  const basePath = buildPath(FieldRulesSchema)
    .field(FieldRulesSchema.field.repeated)
    .field(RepeatedRulesSchema.field.items);
  void test("fieldRules undefined returns rules undefined", () => {
    const fieldRules = undefined;
    const [rules, path] = getEnumRules(basePath, fieldRules, fakeField);
    assert.strictEqual(rules, undefined);
    assert.strictEqual(pathToString(path.toPath()), "repeated.items.enum");
  });
  void test("fieldRules without rules returns rules undefined", () => {
    const fieldRules = create(FieldRulesSchema);
    const [rules, path] = getEnumRules(basePath, fieldRules, fakeField);
    assert.strictEqual(rules, undefined);
    assert.strictEqual(pathToString(path.toPath()), "repeated.items.enum");
  });
  void test("fieldRules with enum rules returns rules", () => {
    const fieldRules = create(FieldRulesSchema, {
      type: { case: "enum", value: {} },
    });
    const [rules, path] = getEnumRules(basePath, fieldRules, fakeField);
    assert.ok(rules);
    assert.strictEqual(rules.$typeName, EnumRulesSchema.typeName);
    assert.strictEqual(pathToString(path.toPath()), "repeated.items.enum");
  });
  const failureCases: {
    type: Exclude<MessageInitShape<typeof FieldRulesSchema>["type"], undefined>;
    error: string;
  }[] = [
    {
      type: { case: "string", value: {} },
      error: `expected rule "enum", got "string" on field fake.Foo.field`,
    },
    {
      type: { case: "any", value: {} },
      error: `expected rule "enum", got "any" on field fake.Foo.field`,
    },
  ];
  for (const { type, error } of failureCases) {
    void test(`rule "${type.case}" errors`, () => {
      const fieldRules = create(FieldRulesSchema, { type });
      assert.throws(() => getEnumRules(basePath, fieldRules, fakeField), {
        name: "CompilationError",
        message: error,
      });
    });
  }
});

void suite("getMessageRules()", () => {
  const fakeField = {
    toString: () => "field fake.Foo.field",
  };
  const basePath = buildPath(FieldRulesSchema)
    .field(FieldRulesSchema.field.repeated)
    .field(RepeatedRulesSchema.field.items);
  void test("fieldRules undefined returns rules undefined", () => {
    const fieldRules = undefined;
    const [rules] = getMessageRules(AnySchema, basePath, fieldRules, fakeField);
    assert.strictEqual(rules, undefined);
  });
  void test("fieldRules without rules returns rules undefined", () => {
    const fieldRules = create(FieldRulesSchema);
    const [rules] = getMessageRules(AnySchema, basePath, fieldRules, fakeField);
    assert.strictEqual(rules, undefined);
  });
  void test("adds wanted rule to path", () => {
    const fieldRules = create(FieldRulesSchema);
    const [, path] = getMessageRules(
      AnySchema,
      basePath,
      fieldRules,
      fakeField,
    );
    assert.strictEqual(pathToString(path.toPath()), "repeated.items.any");
  });
  void test("does not modify path for message type without rules", () => {
    const fieldRules = create(FieldRulesSchema);
    const [, path] = getMessageRules(
      FieldRulesSchema,
      basePath,
      fieldRules,
      fakeField,
    );
    assert.strictEqual(pathToString(path.toPath()), "repeated.items");
  });
  const successCases: {
    message: DescMessage;
    type: Exclude<MessageInitShape<typeof FieldRulesSchema>["type"], undefined>;
    wantPath: string;
    wantRuleType: DescMessage;
  }[] = [
    {
      message: AnySchema,
      type: { case: "any", value: {} },
      wantPath: "repeated.items.any",
      wantRuleType: AnyRulesSchema,
    },
    {
      message: DurationSchema,
      type: { case: "duration", value: {} },
      wantPath: "repeated.items.duration",
      wantRuleType: DurationRulesSchema,
    },
    {
      message: TimestampSchema,
      type: { case: "timestamp", value: {} },
      wantPath: "repeated.items.timestamp",
      wantRuleType: TimestampRulesSchema,
    },
    {
      message: StringValueSchema,
      type: { case: "string", value: {} },
      wantPath: "repeated.items.string",
      wantRuleType: StringRulesSchema,
    },
  ];
  for (const { message, type, wantPath, wantRuleType } of successCases) {
    void test(`rule "${type.case}" on field with ${message.toString()} is ok`, () => {
      const fieldRules = create(FieldRulesSchema, { type });
      const [rules, path] = getMessageRules(
        message,
        basePath,
        fieldRules,
        fakeField,
      );
      assert.ok(rules);
      assert.strictEqual(rules.$typeName, wantRuleType.typeName);
      assert.strictEqual(pathToString(path.toPath()), wantPath);
    });
  }
  const failureCases: {
    message: DescMessage;
    type: Exclude<MessageInitShape<typeof FieldRulesSchema>["type"], undefined>;
    error: string;
  }[] = [
    {
      message: FieldRulesSchema,
      type: { case: "string", value: {} },
      error: `rule "string" cannot be used on field fake.Foo.field`,
    },
    {
      message: AnySchema,
      type: { case: "repeated", value: {} },
      error: `expected rule "any", got "repeated" on field fake.Foo.field`,
    },
  ];
  for (const { message, type, error } of failureCases) {
    void test(`rule "${type.case}" on field with ${message.toString()} errors`, () => {
      const fieldRules = create(FieldRulesSchema, { type });
      assert.throws(
        () => getMessageRules(message, basePath, fieldRules, fakeField),
        {
          name: "CompilationError",
          message: error,
        },
      );
    });
  }
});

void suite("getScalarRules()", () => {
  const fakeField = {
    toString: () => "field fake.Foo.field",
  };
  const basePath = buildPath(FieldRulesSchema)
    .field(FieldRulesSchema.field.repeated)
    .field(RepeatedRulesSchema.field.items);
  void test("fieldRules undefined returns rules undefined", () => {
    const fieldRules = undefined;
    const [rules] = getScalarRules(
      ScalarType.INT32,
      basePath,
      fieldRules,
      fakeField,
    );
    assert.strictEqual(rules, undefined);
  });
  void test("fieldRules without rules returns rules undefined", () => {
    const fieldRules = create(FieldRulesSchema);
    const [rules] = getScalarRules(
      ScalarType.STRING,
      basePath,
      fieldRules,
      fakeField,
    );
    assert.strictEqual(rules, undefined);
  });
  void test("adds wanted rule to path", () => {
    const fieldRules = create(FieldRulesSchema);
    const [, path] = getScalarRules(
      ScalarType.STRING,
      basePath,
      fieldRules,
      fakeField,
    );
    assert.strictEqual(pathToString(path.toPath()), "repeated.items.string");
  });

  const successCases: {
    type: Exclude<MessageInitShape<typeof FieldRulesSchema>["type"], undefined>;
    scalar: ScalarType;
    wantPath: string;
    wantRuleType: DescMessage;
  }[] = [
    {
      scalar: ScalarType.FLOAT,
      type: { case: "float", value: {} },
      wantPath: "repeated.items.float",
      wantRuleType: FloatRulesSchema,
    },
    {
      scalar: ScalarType.DOUBLE,
      type: { case: "double", value: {} },
      wantPath: "repeated.items.double",
      wantRuleType: DoubleRulesSchema,
    },
    {
      scalar: ScalarType.INT32,
      type: { case: "int32", value: {} },
      wantPath: "repeated.items.int32",
      wantRuleType: Int32RulesSchema,
    },
    {
      scalar: ScalarType.INT64,
      type: { case: "int64", value: {} },
      wantPath: "repeated.items.int64",
      wantRuleType: Int64RulesSchema,
    },
  ];
  for (const { scalar, type, wantPath, wantRuleType } of successCases) {
    void test(`rule ${type.case} on ${ScalarType[scalar]} field is ok`, () => {
      const fieldRules = create(FieldRulesSchema, { type });
      const [rules, path] = getScalarRules(
        scalar,
        basePath,
        fieldRules,
        fakeField,
      );
      assert.ok(rules);
      assert.strictEqual(rules.$typeName, wantRuleType.typeName);
      assert.strictEqual(pathToString(path.toPath()), wantPath);
    });
  }

  const failureCases: {
    type: Exclude<MessageInitShape<typeof FieldRulesSchema>["type"], undefined>;
    scalar: ScalarType;
    error: string;
  }[] = [
    {
      scalar: ScalarType.FLOAT,
      type: { case: "string", value: {} },
      error: `expected rule "float", got "string" on field fake.Foo.field`,
    },
    {
      scalar: ScalarType.STRING,
      type: { case: "any", value: {} },
      error: `expected rule "string", got "any" on field fake.Foo.field`,
    },
  ];
  for (const { type, scalar, error } of failureCases) {
    void test(`rule ${type.case} on ${ScalarType[scalar]} field errors`, () => {
      const fieldRules = create(FieldRulesSchema, { type });
      assert.throws(
        () => getScalarRules(scalar, basePath, fieldRules, fakeField),
        {
          name: "CompilationError",
          message: error,
        },
      );
    });
  }
});
