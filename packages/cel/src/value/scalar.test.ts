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
