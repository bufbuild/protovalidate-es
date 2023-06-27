import { describe, test, expect } from "@jest/globals"

import * as type from "./type";

describe("type", () => {
  test("scalar types", () => {
    expect(type.BOOL.name).toBe("bool");
    expect(type.UINT.name).toBe("uint");
    expect(type.INT.name).toBe("int");
    expect(type.DOUBLE.name).toBe("double");
    expect(type.STRING.name).toBe("string");
    expect(type.BYTES.name).toBe("bytes");
  });

  test("list type", () => {
    expect(type.LIST.name).toBe("list");
    expect(type.LIST.fullname()).toBe("list(dyn)");
    expect(type.LIST.elemType).toBe(type.DYN);
    const other = new type.ListType(type.INT);
    expect(other.name).toBe("list");
    expect(other.fullname()).toBe("list(int)");
    expect(other.equals(type.LIST)).toBe(true);
    expect(other.identical(type.LIST)).toBe(false);
  });

  test("map type", () => {
    expect(type.DYN_MAP.name).toBe("map");
    expect(type.DYN_MAP.fullname()).toBe("map(dyn, dyn)");
    expect(type.DYN_MAP.keyType).toBe(type.DYN);
    expect(type.DYN_MAP.valueType).toBe(type.DYN);
    const other = new type.MapType(type.INT, type.STRING);
    expect(other.name).toBe("map");
    expect(other.fullname()).toBe("map(int, string)");
    expect(other.equals(type.DYN_MAP)).toBe(true);
    expect(other.identical(type.DYN_MAP)).toBe(false);
  });

  test("type type", () => {
    expect(type.TYPE.name).toBe("type");
    expect(type.TYPE.fullname()).toBe("type");
    expect(type.TYPE.equals(type.DYN)).toBe(false);
    expect(type.TYPE.identical(type.DYN)).toBe(false);

    const other = new type.TypeType(type.INT);
    expect(other.name).toBe("type");
    expect(other.fullname()).toBe("type(int)");
    expect(other.equals(type.TYPE)).toBe(true);
    expect(other.identical(type.TYPE)).toBe(false);

    const other2 = new type.TypeType(other);
    expect(other2.name).toBe("type");
    expect(other2.fullname()).toBe("type(type(int))");
    expect(other2.equals(type.TYPE)).toBe(true);
    expect(other2.identical(type.TYPE)).toBe(false);
  });
});
