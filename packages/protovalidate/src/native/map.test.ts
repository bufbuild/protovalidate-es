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

import { suite, test } from "node:test";
import * as assert from "node:assert/strict";
import { create } from "@bufbuild/protobuf";
import { pathToString } from "@bufbuild/protobuf/reflect";
import { compile, diff, native } from "./testing.js";

void suite("native map rules", () => {
  void test("map.min_pairs passes and fails", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map.min_pairs = 2];
      }`,
    );
    diff(s, create(s, { kv: { a: 1, b: 2 } }));
    diff(s, create(s, { kv: { a: 1 } }));
    diff(s, create(s, { kv: {} }));
  });

  void test("map.max_pairs passes and fails", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map.max_pairs = 2];
      }`,
    );
    diff(s, create(s, { kv: { a: 1, b: 2 } }));
    diff(s, create(s, { kv: { a: 1, b: 2, c: 3 } }));
  });

  void test("min + max together", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map = {
          min_pairs: 1, max_pairs: 3
        }];
      }`,
    );
    diff(s, create(s, { kv: { a: 1 } }));
    diff(s, create(s, { kv: { a: 1, b: 2, c: 3 } }));
    diff(s, create(s, { kv: {} }));
    diff(s, create(s, { kv: { a: 1, b: 2, c: 3, d: 4 } }));
  });

  void test("map size rules with key/value rules together", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map = {
          min_pairs: 2,
          values: { int32: { gt: 0 } }
        }];
      }`,
    );
    diff(s, create(s, { kv: { a: 1, b: 2 } }));
    diff(s, create(s, { kv: { a: 1, b: -1 } })); // min ok, value bad
    diff(s, create(s, { kv: { a: -1 } })); // both bad
  });

  void test("rule path lands at map.min_pairs", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map.min_pairs = 2];
      }`,
    );
    const r = native.validate(s, create(s, { kv: { a: 1 } }));
    assert.equal(r.kind, "invalid");
    const v = r.violations?.[0];
    assert.ok(v);
    assert.equal(v.ruleId, "map.min_pairs");
    assert.equal(pathToString(v.rule), "map.min_pairs");
  });

  void test("rule path lands at map.max_pairs", () => {
    const s = compile(
      `message M {
        map<string, int32> kv = 1 [(buf.validate.field).map.max_pairs = 1];
      }`,
    );
    const r = native.validate(s, create(s, { kv: { a: 1, b: 2 } }));
    assert.equal(r.kind, "invalid");
    const v = r.violations?.[0];
    assert.ok(v);
    assert.equal(v.ruleId, "map.max_pairs");
    assert.equal(pathToString(v.rule), "map.max_pairs");
  });

  void test("values rules apply to unwrapped Int32Value", () => {
    const s = compile(
      `message M {
        map<string, google.protobuf.Int32Value> kv = 1 [(buf.validate.field).map.values.int32.gt = 10];
      }`,
    );
    const bad = create(s, { kv: { key: { value: 5 } } });
    diff(s, bad);
    diff(s, create(s, { kv: { key: { value: 100 } } }));
    const v = native.validate(s, bad).violations?.[0];
    assert.equal(v?.ruleId, "int32.gt");
    assert.equal(pathToString(v?.field ?? []), 'kv["key"]');
  });

  void test("values rules apply to unwrapped StringValue", () => {
    const s = compile(
      `message M {
        map<string, google.protobuf.StringValue> kv = 1 [(buf.validate.field).map.values.string.min_len = 3];
      }`,
    );
    const bad = create(s, { kv: { k: { value: "a" } } });
    diff(s, bad);
    diff(s, create(s, { kv: { k: { value: "abc" } } }));
    const v = native.validate(s, bad).violations?.[0];
    assert.equal(v?.ruleId, "string.min_len");
    assert.equal(pathToString(v?.field ?? []), 'kv["k"]');
  });
});
