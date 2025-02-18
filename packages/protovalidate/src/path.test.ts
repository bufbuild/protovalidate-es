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
import { createRegistry } from "@bufbuild/protobuf";
import { compileExtension, compileMessage } from "@bufbuild/protocompile";
import { assertPathsEqual, getTestDataForPaths } from "./path.testdata.js";
import { buildPath, parsePath, pathToString } from "./path.js";

const { cases, invalid, schema } = getTestDataForPaths();

void suite("buildPath() with just schema argument", () => {
  void test("returns PathBuilder", () => {
    const builder = buildPath(schema);
    assert.strictEqual(builder.schema, schema);
  });
});

void suite("parsePath()", () => {
  for (const { schema, string, golden, usesExtension } of cases) {
    void test(`parses "${string}"`, () => {
      const reg = usesExtension ? createRegistry(usesExtension) : undefined;
      const path = parsePath(schema, string, reg);
      assertPathsEqual(path, golden);
    });
  }
  for (const { schema, input, error } of invalid) {
    void test(`fails to parse invalid "${input}"`, () => {
      assert.throws(() => parsePath(schema, input), {
        name: "InvalidPathError",
        message: error,
        path: input,
      });
    });
  }
});

void suite("buildPath() with Path argument", () => {
  for (const { string, schema, golden } of cases) {
    void test(`re-builds path "${string}"`, () => {
      const path = buildPath(schema, golden).toPath();
      assertPathsEqual(path, golden);
    });
  }
});

void suite("pathToString", () => {
  for (const { string, golden, goldenString } of cases) {
    void test(string, () => {
      assert.equal(pathToString(golden), goldenString);
    });
  }
});

void suite("PathBuilder", () => {
  void suite("toPath()", () => {
    void test("returns empty path", () => {
      const path = buildPath(schema).toPath();
      assert.equal(path.length, 0);
    });
    void test("returns path", () => {
      const path = buildPath(schema).add(cases[0].golden).toPath();
      assertPathsEqual(path, cases[0].golden);
    });
    void test("returns copy", () => {
      const builder = buildPath(schema);
      const a = builder.toPath();
      const b = builder.toPath();
      assert.notStrictEqual(a, b);
    });
  });
  void suite("clone()", () => {
    void test("returns copy", () => {
      const builder = buildPath(schema);
      const clone = builder.clone();
      assert.notStrictEqual(clone, builder);
    });
    void test("copies path", () => {
      const builder = buildPath(schema);
      const clone = builder.clone().add(cases[0].golden);
      assert.notEqual(clone.toPath().length, builder.toPath().length);
    });
    void test("clones", () => {
      const builder = buildPath(schema).add(cases[0].golden);
      const clone = builder.clone();
      assert.deepStrictEqual(clone, builder);
    });
  });
  for (const { string, schema, golden } of cases) {
    void test(`add() Path "${string}"`, () => {
      const builder = buildPath(schema).add(golden);
      const path = builder.toPath();
      assertPathsEqual(path, golden);
    });
  }
  void test(`add() PathBuilder`, () => {
    const builder = buildPath(schema).add(
      buildPath(schema).add(cases[0].golden),
    );
    assertPathsEqual(builder.toPath(), cases[0].golden);
  });
  void test(`add() multiple with error does not modify path`, () => {
    const builder = buildPath(schema);
    assert.doesNotThrow(() => builder.clone().add([schema.field.manager]));
    assert.throws(() =>
      builder.add([schema.field.manager, { kind: "list_sub", index: 0 }]),
    );
    assert.equal(builder.toPath().length, 0);
  });
  for (const { string, schema, golden } of cases) {
    void test(`build "${string}" via api`, () => {
      let b = buildPath(schema);
      for (const ele of golden) {
        switch (ele.kind) {
          case "field":
            b = b.field(ele);
            break;
          case "oneof":
            b = b.oneof(ele);
            break;
          case "extension":
            b = b.extension(ele);
            break;
          case "list_sub":
            b = b.list(ele.index);
            break;
          case "map_sub":
            b = b.mapKey(ele.key);
            break;
        }
      }
      const path = b.toPath();
      assertPathsEqual(path, golden);
    });
  }

  void suite("build errors", () => {
    void test("field() on non-message", () => {
      const builder = buildPath(schema).field(schema.field.firstName);
      assert.throws(() => builder.field(schema.field.firstName), {
        name: "InvalidPathError",
        message: "Invalid field access",
      });
    });
    void test("oneof() foreign to message", () => {
      const foreignOneof = compileMessage(`
        syntax="proto3";
        message M {
          oneof o {
            int32 f = 1;
          }
        }
      `).oneofs[0];
      const builder = buildPath(schema);
      assert.throws(() => builder.oneof(foreignOneof), {
        name: "InvalidPathError",
        message: `Invalid oneof access`,
      });
    });
    void test("extension() on wrong message", () => {
      const foreignExtension = compileExtension(`
        syntax="proto2";
        message M { extensions 1 to 1; }
        extend M {
          optional string ext = 1;
        }
      `);
      const builder = buildPath(schema);
      assert.throws(() => builder.extension(foreignExtension), {
        name: "InvalidPathError",
        message: `Invalid extension access`,
      });
    });
    void test("list() on non-list", () => {
      const builder = buildPath(schema);
      assert.throws(() => builder.list(77), {
        name: "InvalidPathError",
        message: `Invalid list access`,
      });
    });
    void test("list() with negative index", () => {
      const builder = buildPath(schema).field(schema.field.locations);
      assert.doesNotThrow(() => builder.clone().list(0));
      assert.throws(() => builder.list(-1), {
        name: "InvalidPathError",
        message: `Invalid list index`,
      });
    });
    void test("list() with float index", () => {
      const builder = buildPath(schema).field(schema.field.locations);
      assert.throws(() => builder.list(1.5), {
        name: "InvalidPathError",
        message: `Invalid list index`,
      });
    });
    void test("list() with infinite index", () => {
      const builder = buildPath(schema).field(schema.field.locations);
      assert.throws(() => builder.list(Number.POSITIVE_INFINITY), {
        name: "InvalidPathError",
        message: `Invalid list index`,
      });
    });
    void test("mapKey() on non-map", () => {
      const builder = buildPath(schema);
      assert.throws(() => builder.mapKey(77), {
        name: "InvalidPathError",
        message: `Invalid map access`,
      });
    });
    void test("mapKey() with wrong type", () => {
      const builder = buildPath(schema).field(schema.field.projects);
      assert.doesNotThrow(() => builder.clone().mapKey("abc"));
      assert.throws(() => builder.mapKey(true), {
        name: "InvalidPathError",
        message: `Invalid map key`,
      });
    });
  });
});
