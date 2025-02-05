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

import { isMessage } from "@bufbuild/protobuf";
import { DurationSchema } from "@bufbuild/protobuf/wkt";

import { CEL_ADAPTER } from "../adapter/cel.js";
import { NATIVE_ADAPTER } from "../adapter/native.js";
import { CelUint, newDuration } from "./value.js";

void suite("scalar", () => {
  void test("bool", () => {
    assert.equal(NATIVE_ADAPTER.toCel(true), true);
    assert.equal(NATIVE_ADAPTER.toCel(false), false);
  });

  void test("uint", () => {
    assert.equal(CelUint.EMPTY.value, 0n);
    assert.equal(new CelUint(1n).value, 1n);
    assert.equal(CelUint.ONE.value, 1n);
  });

  void test("double", () => {
    assert.equal(CEL_ADAPTER.equals(-0, 0), true);
    assert.equal(CEL_ADAPTER.equals(NaN, NaN), false);
  });

  void test("duration", () => {
    let actual = newDuration(0, 0n, -1);
    assert.ok(isMessage(actual, DurationSchema));
    assert.equal(actual.seconds, -1n);
    assert.equal(actual.nanos, 999999999);

    actual = newDuration(0, 0n, -999999999);
    assert.ok(isMessage(actual, DurationSchema));
    assert.equal(actual.seconds, -1n);
    assert.equal(actual.nanos, 1);

    actual = newDuration(0, 0n, -1000000000);
    assert.ok(isMessage(actual, DurationSchema));
    assert.equal(actual.seconds, -1n);
    assert.equal(actual.nanos, 0);
  });
});
