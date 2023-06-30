import { describe, test, expect } from "vitest";
import { CEL_ADAPTER } from "../adapter/cel";
import { NATIVE_ADAPTER } from "../adapter/native";
import { EMPTY_LIST, EMPTY_MAP } from "./empty";
import { Namespace } from "./namespace";
import { CelList, CelMap, CelUint, type CelVal } from "./value";
import * as type from "./type";

describe("adapter tests", () => {
  test("main namespace", () => {
    const c = new Namespace("");

    const actual = c.resolveCandidateNames("a.b.c");
    const expected = ["a.b.c"];
    expect(actual).toStrictEqual(expected);
  });

  test("named namespace", () => {
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
    expect(actual).toStrictEqual(expected);
    actual = c.resolveCandidateNames(".R.s");
    expected = ["R.s"];
    expect(actual).toStrictEqual(expected);
  });

  test("equals", () => {
    expect(NATIVE_ADAPTER.equals(true, true)).toBe(true);
    expect(NATIVE_ADAPTER.equals(true, false)).toBe(false);
    expect(NATIVE_ADAPTER.equals(-0.0, 0.0)).toBe(true);
    expect(NATIVE_ADAPTER.equals(-0.0, -0.0)).toBe(true);
    expect(NATIVE_ADAPTER.equals(0.0, 0.0)).toBe(true);
    expect(NATIVE_ADAPTER.equals(NaN, NaN)).toBe(false);
  });

  test("bool", () => {
    expect(NATIVE_ADAPTER.toCel(true)).toBe(true);
    expect(NATIVE_ADAPTER.toCel(false)).toBe(false);
    expect(NATIVE_ADAPTER.fromCel(true)).toBe(true);
    expect(NATIVE_ADAPTER.fromCel(false)).toBe(false);
  });

  test("null", () => {
    expect(NATIVE_ADAPTER.toCel(null)).toBe(null);
    expect(NATIVE_ADAPTER.fromCel(null)).toBe(null);
  });

  test("number", () => {
    expect(NATIVE_ADAPTER.toCel(1)).toStrictEqual(1);
    expect(NATIVE_ADAPTER.fromCel(1)).toStrictEqual(1);

    expect(NATIVE_ADAPTER.toCel(NaN)).toStrictEqual(NaN);
    expect(NATIVE_ADAPTER.fromCel(NaN)).toStrictEqual(NaN);

    expect(NATIVE_ADAPTER.toCel(Infinity)).toStrictEqual(Infinity);
    expect(NATIVE_ADAPTER.fromCel(-Infinity)).toStrictEqual(-Infinity);
  });

  test("bigint", () => {
    expect(NATIVE_ADAPTER.toCel(1n)).toStrictEqual(1n);
    expect(NATIVE_ADAPTER.fromCel(1n)).toStrictEqual(1n);

    expect(NATIVE_ADAPTER.toCel(-1n)).toStrictEqual(-1n);
    expect(NATIVE_ADAPTER.fromCel(-1n)).toStrictEqual(-1n);

    expect(NATIVE_ADAPTER.toCel(9223372036854775808n)).toStrictEqual(
      new CelUint(9223372036854775808n)
    );
  });

  test("string", () => {
    expect(NATIVE_ADAPTER.toCel("")).toStrictEqual("");
    expect(NATIVE_ADAPTER.fromCel("")).toStrictEqual("");

    expect(NATIVE_ADAPTER.toCel("abc")).toStrictEqual("abc");
    expect(NATIVE_ADAPTER.fromCel("abc")).toStrictEqual("abc");
  });

  test("list", () => {
    expect(NATIVE_ADAPTER.toCel([])).toBe(EMPTY_LIST);
    expect(NATIVE_ADAPTER.fromCel(EMPTY_LIST)).toStrictEqual([]);

    expect(NATIVE_ADAPTER.toCel([1, 2, 3])).toStrictEqual(
      new CelList([1, 2, 3], NATIVE_ADAPTER, type.LIST)
    );
    expect(
      NATIVE_ADAPTER.fromCel(new CelList([1, 2, 3], NATIVE_ADAPTER, type.LIST))
    ).toStrictEqual([1, 2, 3]);
    expect(
      NATIVE_ADAPTER.fromCel(
        new CelList([1n, new CelUint(2n), 3], CEL_ADAPTER, type.DYN_MAP)
      )
    ).toStrictEqual([1n, 2n, 3]);
  });

  test("map", () => {
    expect(NATIVE_ADAPTER.toCel(new Map())).toBe(EMPTY_MAP);
    expect(NATIVE_ADAPTER.fromCel(EMPTY_MAP)).toStrictEqual(new Map());

    const testMap = new Map<string, unknown>([
      ["a", 1n],
      ["b", 2n],
      ["c", 3],
    ]);
    expect(NATIVE_ADAPTER.toCel(testMap)).toStrictEqual(
      new CelMap(testMap, NATIVE_ADAPTER, type.DYN_MAP)
    );
    expect(
      NATIVE_ADAPTER.fromCel(
        new CelMap(
          new Map<CelVal, CelVal>([
            ["a", 1n],
            ["b", new CelUint(2n)],
            ["c", 3],
          ]),
          CEL_ADAPTER,
          type.DYN_MAP
        )
      )
    ).toStrictEqual(testMap);
  });
});
