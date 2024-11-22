import { suite, test } from "node:test";
import * as assert from "node:assert/strict";

import * as type from "./type.js";

void suite("type", () => {
  void test("scalar types", () => {
    assert.equal(type.BOOL.name, "bool");
    assert.equal(type.UINT.name, "uint");
    assert.equal(type.INT.name, "int");
    assert.equal(type.DOUBLE.name, "double");
    assert.equal(type.STRING.name, "string");
    assert.equal(type.BYTES.name, "bytes");
  });

  void test("list type", () => {
    assert.equal(type.LIST.name, "list");
    assert.equal(type.LIST.fullname(), "list(dyn)");
    assert.ok(type.LIST.elemType === type.DYN);
    const other = new type.ListType(type.INT);
    assert.equal(other.name, "list");
    assert.ok(other.equals(type.LIST));
    assert.ok(!other.identical(type.LIST));
  });

  void test("map type", () => {
    assert.equal(type.DYN_MAP.name, "map");
    assert.equal(type.DYN_MAP.fullname(), "map(dyn, dyn)");
    assert.ok(type.DYN_MAP.keyType === type.DYN);
    assert.ok(type.DYN_MAP.valueType === type.DYN);

    const other = new type.MapType(type.INT, type.STRING);
    assert.equal(other.name, "map");
    assert.equal(other.fullname(), "map(int, string)");
    assert.ok(other.equals(type.DYN_MAP));
    assert.ok(!other.identical(type.DYN_MAP));
  });

  void test("type type", () => {
    assert.equal(type.TYPE.name, "type");
    assert.equal(type.TYPE.fullname(), "type");
    assert.ok(!type.TYPE.equals(type.DYN));
    assert.ok(!type.TYPE.identical(type.DYN));

    const other = new type.TypeType(type.INT);
    assert.equal(other.name, "type");
    assert.equal(other.fullname(), "type(int)");
    assert.ok(other.equals(type.TYPE));
    assert.ok(!other.identical(type.TYPE));

    const other2 = new type.TypeType(other);
    assert.equal(other2.name, "type");
    assert.equal(other2.fullname(), "type(type(int))");
    assert.ok(other2.equals(type.TYPE));
    assert.ok(!other2.identical(type.TYPE));
  });
});
