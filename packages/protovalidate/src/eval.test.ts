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
  AnyRulesSchema,
  RuleSchema,
  EnumRulesSchema,
  file_buf_validate_validate,
  MapRulesSchema,
  predefined,
  RepeatedRulesSchema,
  StringRulesSchema,
  MessageRulesSchema,
  OneofRulesSchema,
  FieldRulesSchema,
  PredefinedRulesSchema,
} from "./gen/buf/validate/validate_pb.js";
import { nestedTypes } from "@bufbuild/protobuf/reflect";
import { getOption, hasOption } from "@bufbuild/protobuf";
import { type Eval, EvalMany, EvalNoop } from "./eval.js";
import { Cursor } from "./cursor.js";

void suite("check buf.validate.*Rules fields", () => {
  const knownExceptions = [
    AnyRulesSchema.field.in,
    AnyRulesSchema.field.notIn,
    MapRulesSchema.field.keys,
    MapRulesSchema.field.values,
    RepeatedRulesSchema.field.items,
    EnumRulesSchema.field.definedOnly,
    StringRulesSchema.field.strict,
    MessageRulesSchema.field.cel,
    MessageRulesSchema.field.disabled,
    OneofRulesSchema.field.required,
    FieldRulesSchema.field.cel,
    FieldRulesSchema.field.required,
    FieldRulesSchema.field.ignore,
    FieldRulesSchema.field.float,
    FieldRulesSchema.field.double,
    FieldRulesSchema.field.int32,
    FieldRulesSchema.field.int64,
    FieldRulesSchema.field.uint32,
    FieldRulesSchema.field.uint64,
    FieldRulesSchema.field.sint32,
    FieldRulesSchema.field.sint64,
    FieldRulesSchema.field.fixed32,
    FieldRulesSchema.field.fixed64,
    FieldRulesSchema.field.sfixed32,
    FieldRulesSchema.field.sfixed64,
    FieldRulesSchema.field.bool,
    FieldRulesSchema.field.string,
    FieldRulesSchema.field.bytes,
    FieldRulesSchema.field.enum,
    FieldRulesSchema.field.repeated,
    FieldRulesSchema.field.map,
    FieldRulesSchema.field.any,
    FieldRulesSchema.field.duration,
    FieldRulesSchema.field.timestamp,
    PredefinedRulesSchema.field.cel,
  ];
  const rulesMessages = Array.from(nestedTypes(file_buf_validate_validate))
    .filter((t) => t.kind == "message")
    .filter((m) => m.name.endsWith("Rules"));
  for (const descMessage of rulesMessages) {
    void test(descMessage.toString(), () => {
      const unknownFields = descMessage.fields
        .filter(
          (f) =>
            !hasOption(f, predefined) ||
            getOption(f, predefined).cel.length == 0,
        )
        .filter((f) => !knownExceptions.includes(f));
      assert.ok(
        unknownFields.length == 0,
        `unknown fields without predefined rules: ${unknownFields.map((f) => f.name).join(", ")}`,
      );
    });
  }
});

void suite("EvalNoop", () => {
  void test("get()", () => {
    const noop: EvalNoop<unknown> = EvalNoop.get();
    assert.ok(noop instanceof EvalNoop);
    assert.strictEqual(noop.prune(), true);
  });
  void test("prune()", () => {
    assert.strictEqual(EvalNoop.get().prune(), true);
  });
});

void suite("EvalMany", () => {
  class EvalTest implements Eval<string> {
    evaluated = false;
    pruned = false;
    constructor(private readonly noop: boolean) {}
    eval(): void {
      this.evaluated = true;
    }
    prune(): boolean {
      if (this.noop) {
        this.pruned = true;
        return true;
      }
      return false;
    }
  }
  void test("constructor", () => {
    const a: Eval<string> = EvalNoop.get();
    const b: Eval<string> = EvalNoop.get();
    assert.ok(new EvalMany(a));
    assert.ok(new EvalMany(a, b));
  });
  void test("eval()", () => {
    const a = new EvalTest(false);
    const b = new EvalTest(false);
    const m = new EvalMany<string>(a, b);
    m.eval("", Cursor.create(RuleSchema, false));
    assert.equal(a.evaluated, true);
    assert.equal(b.evaluated, true);
  });
  void suite("prune()", () => {
    void test("prunes no-ops", () => {
      const a = new EvalTest(true);
      const m = new EvalMany<string>(a, EvalNoop.get());
      assert.strictEqual(m.prune(), true);
      m.eval("", Cursor.create(RuleSchema, false));
      assert.equal(a.evaluated, false);
    });
    void test("keeps ops", () => {
      const a = new EvalTest(false);
      const m = new EvalMany<string>(a);
      assert.strictEqual(m.prune(), false);
      m.eval("", Cursor.create(RuleSchema, false));
      assert.equal(a.evaluated, true);
    });
  });
});
