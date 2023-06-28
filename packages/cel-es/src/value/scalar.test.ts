import { describe, test, expect } from "@jest/globals";
import { Duration } from "@bufbuild/protobuf";

import { CEL_ADAPTER } from "../adapter/cel";
import { NATIVE_ADAPTER } from "../adapter/native";
import { CelUint, newDuration } from "./value";

describe("scalar", () => {
  test("bool", () => {
    expect(NATIVE_ADAPTER.toCel(true)).toBe(true);
    expect(NATIVE_ADAPTER.toCel(false)).toBe(false);
  });

  test("uint", () => {
    expect(CelUint.EMPTY.value).toBe(BigInt(0));
    expect(new CelUint(BigInt(1)).value).toBe(BigInt(1));
  });

  test("double", () => {
    expect(CEL_ADAPTER.equals(-0, 0)).toBe(true);
    expect(CEL_ADAPTER.equals(NaN, NaN)).toBe(false);
  });

  test("duration", () => {
    let actual = newDuration(0, 0n, -1);
    expect(actual).toBeInstanceOf(Duration);
    if (actual instanceof Duration) {
      expect(actual.seconds).toBe(-1n);
      expect(actual.nanos).toBe(999999999);
    }

    actual = newDuration(0, 0n, -999999999);
    expect(actual).toBeInstanceOf(Duration);
    if (actual instanceof Duration) {
      expect(actual.seconds).toBe(-1n);
      expect(actual.nanos).toBe(1);
    }

    actual = newDuration(0, 0n, -1000000000);
    expect(actual).toBeInstanceOf(Duration);
    if (actual instanceof Duration) {
      expect(actual.seconds).toBe(-1n);
      expect(actual.nanos).toBe(0);
    }
  });
});
