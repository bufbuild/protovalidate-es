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

import { suite, test } from "node:test";
import * as assert from "node:assert/strict";
import { CEL_ADAPTER } from "../adapter/cel.js";
import { NATIVE_ADAPTER } from "../adapter/native.js";
import { EMPTY_LIST, EMPTY_MAP } from "./empty.js";
import { Namespace } from "./namespace.js";
import { CelList, CelMap, CelUint, type CelVal } from "./value.js";
import * as type from "./type.js";

void suite("adapter tests", () => {
  void test("main namespace", () => {
    const c = new Namespace("");

    const actual = c.resolveCandidateNames("a.b.c");
    const expected = ["a.b.c"];
    assert.deepEqual(actual, expected);
  });

  void test("named namespace", () => {
    const c = new Namespace("a.b.c.M.N");

    let actual = c.resolveCandidateNames("R.s");
    let expected = [
      "a.b.c.M.N.R.s",
      "a.b.c.M.R.s",
      "a.b.c.R.s",
      "a.b.R.s",
      "a.R.s",
      "R.s",
    ];
    assert.deepEqual(actual, expected);
    actual = c.resolveCandidateNames(".R.s");
    expected = ["R.s"];
    assert.deepEqual(actual, expected);
  });

  void test("equals", () => {
    assert.ok(NATIVE_ADAPTER.equals(true, true));
    assert.ok(!NATIVE_ADAPTER.equals(true, false));
    assert.ok(NATIVE_ADAPTER.equals(-0.0, 0.0));
    assert.ok(NATIVE_ADAPTER.equals(-0.0, -0.0));
    assert.ok(NATIVE_ADAPTER.equals(0.0, 0.0));
    assert.ok(!NATIVE_ADAPTER.equals(NaN, NaN));
  });

  void test("bool", () => {
    assert.equal(NATIVE_ADAPTER.toCel(true), true);
    assert.equal(NATIVE_ADAPTER.toCel(false), false);
    assert.equal(NATIVE_ADAPTER.fromCel(true), true);
    assert.equal(NATIVE_ADAPTER.fromCel(false), false);
  });

  void test("null", () => {
    assert.equal(NATIVE_ADAPTER.toCel(null), null);
    assert.equal(NATIVE_ADAPTER.fromCel(null), null);
  });

  void test("number", () => {
    assert.equal(NATIVE_ADAPTER.toCel(1), 1);
    assert.equal(NATIVE_ADAPTER.fromCel(1), 1);

    assert.equal(NATIVE_ADAPTER.toCel(NaN), NaN);
    assert.equal(NATIVE_ADAPTER.fromCel(NaN), NaN);

    assert.equal(NATIVE_ADAPTER.toCel(Infinity), Infinity);
    assert.equal(NATIVE_ADAPTER.fromCel(-Infinity), -Infinity);
  });

  void test("bigint", () => {
    assert.equal(NATIVE_ADAPTER.toCel(1n), 1n);
    assert.equal(NATIVE_ADAPTER.fromCel(1n), 1n);

    assert.equal(NATIVE_ADAPTER.toCel(-1n), -1n);
    assert.equal(NATIVE_ADAPTER.fromCel(-1n), -1n);

    assert.deepEqual(
      NATIVE_ADAPTER.toCel(9223372036854775808n),
      new CelUint(9223372036854775808n),
    );
  });

  void test("string", () => {
    assert.equal(NATIVE_ADAPTER.toCel(""), "");
    assert.equal(NATIVE_ADAPTER.fromCel(""), "");

    assert.equal(NATIVE_ADAPTER.toCel("abc"), "abc");
    assert.equal(NATIVE_ADAPTER.fromCel("abc"), "abc");
  });

  void test("list", () => {
    assert.equal(NATIVE_ADAPTER.toCel([]), EMPTY_LIST);
    assert.deepEqual(NATIVE_ADAPTER.fromCel(EMPTY_LIST), []);

    assert.deepEqual(
      NATIVE_ADAPTER.toCel([1, 2, 3]),
      new CelList([1, 2, 3], NATIVE_ADAPTER, type.LIST),
    );
    assert.deepEqual(
      NATIVE_ADAPTER.fromCel(new CelList([1, 2, 3], NATIVE_ADAPTER, type.LIST)),
      [1, 2, 3],
    );
    assert.deepEqual(
      NATIVE_ADAPTER.fromCel(
        new CelList([1n, new CelUint(2n), 3], CEL_ADAPTER, type.DYN_MAP),
      ),
      [1n, 2n, 3],
    );
  });

  void test("map", () => {
    assert.equal(NATIVE_ADAPTER.toCel(new Map()), EMPTY_MAP);
    assert.deepEqual(NATIVE_ADAPTER.fromCel(EMPTY_MAP), new Map());

    const testMap = new Map<string, unknown>([
      ["a", 1n],
      ["b", 2n],
      ["c", 3],
    ]);
    assert.deepEqual(
      NATIVE_ADAPTER.toCel(testMap),
      new CelMap(testMap, NATIVE_ADAPTER, type.DYN_MAP),
    );
    assert.deepEqual(
      NATIVE_ADAPTER.fromCel(
        new CelMap(
          new Map<CelVal, CelVal>([
            ["a", 1n],
            ["b", new CelUint(2n)],
            ["c", 3],
          ]),
          CEL_ADAPTER,
          type.DYN_MAP,
        ),
      ),
      testMap,
    );
  });
});
