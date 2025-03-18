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

// Generated from cel-go github.com/google/cel-go@v0.22.2-0.20241217215216-98789f34a481/parser/parser_test.go
export const parserTests = [
  { expr: '"A"', ast: '"A"^#*expr.Constant_StringValue#' },
  { expr: "true", ast: "true^#*expr.Constant_BoolValue#" },
  { expr: "false", ast: "false^#*expr.Constant_BoolValue#" },
  { expr: "0", ast: "0^#*expr.Constant_Int64Value#" },
  { expr: "42", ast: "42^#*expr.Constant_Int64Value#" },
  { expr: "0xF", ast: "15^#*expr.Constant_Int64Value#" },
  { expr: "0u", ast: "0u^#*expr.Constant_Uint64Value#" },
  { expr: "23u", ast: "23u^#*expr.Constant_Uint64Value#" },
  { expr: "24u", ast: "24u^#*expr.Constant_Uint64Value#" },
  { expr: "0xFu", ast: "15u^#*expr.Constant_Uint64Value#" },
  { expr: "-1", ast: "-1^#*expr.Constant_Int64Value#" },
  {
    expr: "4--4",
    ast: "_-_(\n  4^#*expr.Constant_Int64Value#,\n  -4^#*expr.Constant_Int64Value#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "4--4.1",
    ast: "_-_(\n  4^#*expr.Constant_Int64Value#,\n  -4.1^#*expr.Constant_DoubleValue#\n)^#*expr.Expr_CallExpr#",
  },
  { expr: 'b"abc"', ast: 'b"abc"^#*expr.Constant_BytesValue#' },
  { expr: "23.39", ast: "23.39^#*expr.Constant_DoubleValue#" },
  {
    expr: "!a",
    ast: "!_(\n  a^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  { expr: "null", ast: "null^#*expr.Constant_NullValue#" },
  { expr: "a", ast: "a^#*expr.Expr_IdentExpr#" },
  {
    expr: "a?b:c",
    ast: "_?_:_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#,\n  c^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a || b",
    ast: "_||_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a || b || c || d || e || f ",
    ast: "_||_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#,\n  c^#*expr.Expr_IdentExpr#,\n  d^#*expr.Expr_IdentExpr#,\n  e^#*expr.Expr_IdentExpr#,\n  f^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a \u0026\u0026 b",
    ast: "_\u0026\u0026_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a \u0026\u0026 b \u0026\u0026 c \u0026\u0026 d \u0026\u0026 e \u0026\u0026 f \u0026\u0026 g",
    ast: "_\u0026\u0026_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#,\n  c^#*expr.Expr_IdentExpr#,\n  d^#*expr.Expr_IdentExpr#,\n  e^#*expr.Expr_IdentExpr#,\n  f^#*expr.Expr_IdentExpr#,\n  g^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a \u0026\u0026 b \u0026\u0026 c \u0026\u0026 d || e \u0026\u0026 f \u0026\u0026 g \u0026\u0026 h",
    ast: "_||_(\n  _\u0026\u0026_(\n    a^#*expr.Expr_IdentExpr#,\n    b^#*expr.Expr_IdentExpr#,\n    c^#*expr.Expr_IdentExpr#,\n    d^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  _\u0026\u0026_(\n    e^#*expr.Expr_IdentExpr#,\n    f^#*expr.Expr_IdentExpr#,\n    g^#*expr.Expr_IdentExpr#,\n    h^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a + b",
    ast: "_+_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a - b",
    ast: "_-_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a * b",
    ast: "_*_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a / b",
    ast: "_/_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a % b",
    ast: "_%_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a in b",
    ast: "@in(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a == b",
    ast: "_==_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a != b",
    ast: "_!=_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a \u003e b",
    ast: "_\u003e_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a \u003e= b",
    ast: "_\u003e=_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a \u003c b",
    ast: "_\u003c_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a \u003c= b",
    ast: "_\u003c=_(\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  { expr: "a.b", ast: "a^#*expr.Expr_IdentExpr#.b^#*expr.Expr_SelectExpr#" },
  {
    expr: "a.b.c",
    ast: "a^#*expr.Expr_IdentExpr#.b^#*expr.Expr_SelectExpr#.c^#*expr.Expr_SelectExpr#",
  },
  {
    expr: "a[b]",
    ast: "_[_](\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  { expr: "foo{ }", ast: "foo{}^#*expr.Expr_StructExpr#" },
  {
    expr: "foo{ a:b }",
    ast: "foo{\n  a:b^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#",
  },
  {
    expr: "foo{ a:b, c:d }",
    ast: "foo{\n  a:b^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#,\n  c:d^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#",
  },
  { expr: "{}", ast: "{}^#*expr.Expr_StructExpr#" },
  {
    expr: "{a:b, c:d}",
    ast: "{\n  a^#*expr.Expr_IdentExpr#:b^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#,\n  c^#*expr.Expr_IdentExpr#:d^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#",
  },
  { expr: "[]", ast: "[]^#*expr.Expr_ListExpr#" },
  {
    expr: "[a]",
    ast: "[\n  a^#*expr.Expr_IdentExpr#\n]^#*expr.Expr_ListExpr#",
  },
  {
    expr: "[a, b, c]",
    ast: "[\n  a^#*expr.Expr_IdentExpr#,\n  b^#*expr.Expr_IdentExpr#,\n  c^#*expr.Expr_IdentExpr#\n]^#*expr.Expr_ListExpr#",
  },
  { expr: "(a)", ast: "a^#*expr.Expr_IdentExpr#" },
  { expr: "((a))", ast: "a^#*expr.Expr_IdentExpr#" },
  { expr: "a()", ast: "a()^#*expr.Expr_CallExpr#" },
  {
    expr: "a(b)",
    ast: "a(\n  b^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a(b, c)",
    ast: "a(\n  b^#*expr.Expr_IdentExpr#,\n  c^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  { expr: "a.b()", ast: "a^#*expr.Expr_IdentExpr#.b()^#*expr.Expr_CallExpr#" },
  {
    expr: "a.b(c)",
    ast: "a^#*expr.Expr_IdentExpr#.b(\n  c^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "0xFFFFFFFFFFFFFFFFF",
    error:
      "ERROR: \u003cinput\u003e:1:1: invalid int literal\n | 0xFFFFFFFFFFFFFFFFF\n | ^",
  },
  {
    expr: "0xFFFFFFFFFFFFFFFFFu",
    error:
      "ERROR: \u003cinput\u003e:1:1: invalid uint literal\n | 0xFFFFFFFFFFFFFFFFFu\n | ^",
  },
  {
    expr: "1.99e90000009",
    error:
      "ERROR: \u003cinput\u003e:1:1: invalid double literal\n | 1.99e90000009\n | ^",
  },
  {
    expr: "*@a | b",
    error:
      "ERROR: \u003cinput\u003e:1:1: Syntax error: extraneous input '*' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | *@a | b\n | ^\nERROR: \u003cinput\u003e:1:2: Syntax error: token recognition error at: '@'\n | *@a | b\n | .^\nERROR: \u003cinput\u003e:1:5: Syntax error: token recognition error at: '| '\n | *@a | b\n | ....^\nERROR: \u003cinput\u003e:1:7: Syntax error: extraneous input 'b' expecting \u003cEOF\u003e\n | *@a | b\n | ......^",
  },
  {
    expr: "a | b",
    error:
      "ERROR: \u003cinput\u003e:1:3: Syntax error: token recognition error at: '| '\n | a | b\n | ..^\nERROR: \u003cinput\u003e:1:5: Syntax error: extraneous input 'b' expecting \u003cEOF\u003e\n | a | b\n | ....^",
  },
  {
    expr: "has(m.f)",
    ast: "m^#*expr.Expr_IdentExpr#.f~test-only~^#*expr.Expr_SelectExpr#",
  },
  {
    expr: "has(m)",
    error:
      "ERROR: \u003cinput\u003e:1:5: invalid argument to has() macro\n | has(m)\n | ....^",
  },
  {
    expr: "m.exists(v, f)",
    ast: "__comprehension__(\n  // Variable\n  v,\n  // Target\n  m^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  false^#*expr.Constant_BoolValue#,\n  // LoopCondition\n  @not_strictly_false(\n    !_(\n      __result__^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  // LoopStep\n  _||_(\n    __result__^#*expr.Expr_IdentExpr#,\n    f^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "m.all(v, f)",
    ast: "__comprehension__(\n  // Variable\n  v,\n  // Target\n  m^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  true^#*expr.Constant_BoolValue#,\n  // LoopCondition\n  @not_strictly_false(\n    __result__^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // LoopStep\n  _\u0026\u0026_(\n    __result__^#*expr.Expr_IdentExpr#,\n    f^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "m.existsOne(v, f)",
    ast: "__comprehension__(\n  // Variable\n  v,\n  // Target\n  m^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  0^#*expr.Constant_Int64Value#,\n  // LoopCondition\n  true^#*expr.Constant_BoolValue#,\n  // LoopStep\n  _?_:_(\n    f^#*expr.Expr_IdentExpr#,\n    _+_(\n      __result__^#*expr.Expr_IdentExpr#,\n      1^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    __result__^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  _==_(\n    __result__^#*expr.Expr_IdentExpr#,\n    1^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "[].existsOne(__result__, __result__)",
    error:
      "ERROR: \u003cinput\u003e:1:14: iteration variable overwrites accumulator variable\n | [].existsOne(__result__, __result__)\n | .............^",
  },
  {
    expr: "m.map(v, f)",
    ast: "__comprehension__(\n  // Variable\n  v,\n  // Target\n  m^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  []^#*expr.Expr_ListExpr#,\n  // LoopCondition\n  true^#*expr.Constant_BoolValue#,\n  // LoopStep\n  _+_(\n    __result__^#*expr.Expr_IdentExpr#,\n    [\n      f^#*expr.Expr_IdentExpr#\n    ]^#*expr.Expr_ListExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "m.map(__result__, __result__)",
    error:
      "ERROR: \u003cinput\u003e:1:7: iteration variable overwrites accumulator variable\n | m.map(__result__, __result__)\n | ......^",
  },
  {
    expr: "m.map(v, p, f)",
    ast: "__comprehension__(\n  // Variable\n  v,\n  // Target\n  m^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  []^#*expr.Expr_ListExpr#,\n  // LoopCondition\n  true^#*expr.Constant_BoolValue#,\n  // LoopStep\n  _?_:_(\n    p^#*expr.Expr_IdentExpr#,\n    _+_(\n      __result__^#*expr.Expr_IdentExpr#,\n      [\n        f^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#,\n    __result__^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "m.filter(v, p)",
    ast: "__comprehension__(\n  // Variable\n  v,\n  // Target\n  m^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  []^#*expr.Expr_ListExpr#,\n  // LoopCondition\n  true^#*expr.Constant_BoolValue#,\n  // LoopStep\n  _?_:_(\n    p^#*expr.Expr_IdentExpr#,\n    _+_(\n      __result__^#*expr.Expr_IdentExpr#,\n      [\n        v^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#,\n    __result__^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "m.filter(__result__, false)",
    error:
      "ERROR: \u003cinput\u003e:1:10: iteration variable overwrites accumulator variable\n | m.filter(__result__, false)\n | .........^",
  },
  {
    expr: "m.filter(a.b, false)",
    error:
      "ERROR: \u003cinput\u003e:1:11: argument is not an identifier\n | m.filter(a.b, false)\n | ..........^",
  },
  {
    expr: "x * 2",
    ast: "_*_(\n  x^#*expr.Expr_IdentExpr#,\n  2^#*expr.Constant_Int64Value#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "x * 2u",
    ast: "_*_(\n  x^#*expr.Expr_IdentExpr#,\n  2u^#*expr.Constant_Uint64Value#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "x * 2.0",
    ast: "_*_(\n  x^#*expr.Expr_IdentExpr#,\n  2^#*expr.Constant_DoubleValue#\n)^#*expr.Expr_CallExpr#",
  },
  { expr: '"\\u2764"', ast: '"❤"^#*expr.Constant_StringValue#' },
  { expr: '"❤"', ast: '"❤"^#*expr.Constant_StringValue#' },
  {
    expr: "! false",
    ast: "!_(\n  false^#*expr.Constant_BoolValue#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "-a",
    ast: "-_(\n  a^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a.b(5)",
    ast: "a^#*expr.Expr_IdentExpr#.b(\n  5^#*expr.Constant_Int64Value#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a[3]",
    ast: "_[_](\n  a^#*expr.Expr_IdentExpr#,\n  3^#*expr.Constant_Int64Value#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: 'SomeMessage{foo: 5, bar: "xyz"}',
    ast: 'SomeMessage{\n  foo:5^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#,\n  bar:"xyz"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#',
  },
  {
    expr: "[3, 4, 5]",
    ast: "[\n  3^#*expr.Constant_Int64Value#,\n  4^#*expr.Constant_Int64Value#,\n  5^#*expr.Constant_Int64Value#\n]^#*expr.Expr_ListExpr#",
  },
  {
    expr: "[3, 4, 5,]",
    ast: "[\n  3^#*expr.Constant_Int64Value#,\n  4^#*expr.Constant_Int64Value#,\n  5^#*expr.Constant_Int64Value#\n]^#*expr.Expr_ListExpr#",
  },
  {
    expr: '{foo: 5, bar: "xyz"}',
    ast: '{\n  foo^#*expr.Expr_IdentExpr#:5^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#,\n  bar^#*expr.Expr_IdentExpr#:"xyz"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#',
  },
  {
    expr: '{foo: 5, bar: "xyz", }',
    ast: '{\n  foo^#*expr.Expr_IdentExpr#:5^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#,\n  bar^#*expr.Expr_IdentExpr#:"xyz"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#',
  },
  {
    expr: "a \u003e 5 \u0026\u0026 a \u003c 10",
    ast: "_\u0026\u0026_(\n  _\u003e_(\n    a^#*expr.Expr_IdentExpr#,\n    5^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#,\n  _\u003c_(\n    a^#*expr.Expr_IdentExpr#,\n    10^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "a \u003c 5 || a \u003e 10",
    ast: "_||_(\n  _\u003c_(\n    a^#*expr.Expr_IdentExpr#,\n    5^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#,\n  _\u003e_(\n    a^#*expr.Expr_IdentExpr#,\n    10^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{",
    error:
      "ERROR: \u003cinput\u003e:1:2: Syntax error: mismatched input '\u003cEOF\u003e' expecting {'[', '{', '}', '(', '.', ',', '-', '!', '?', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | {\n | .^",
  },
  {
    expr: "[] + [1,2,3,] + [4]",
    ast: "_+_(\n  _+_(\n    []^#*expr.Expr_ListExpr#,\n    [\n      1^#*expr.Constant_Int64Value#,\n      2^#*expr.Constant_Int64Value#,\n      3^#*expr.Constant_Int64Value#\n    ]^#*expr.Expr_ListExpr#\n  )^#*expr.Expr_CallExpr#,\n  [\n    4^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{1:2u, 2:3u}",
    ast: "{\n  1^#*expr.Constant_Int64Value#:2u^#*expr.Constant_Uint64Value#^#*expr.Expr_CreateStruct_Entry#,\n  2^#*expr.Constant_Int64Value#:3u^#*expr.Constant_Uint64Value#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#",
  },
  {
    expr: "TestAllTypes{single_int32: 1, single_int64: 2}",
    ast: "TestAllTypes{\n  single_int32:1^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#,\n  single_int64:2^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#",
  },
  {
    expr: "TestAllTypes(){}",
    error:
      "ERROR: \u003cinput\u003e:1:15: Syntax error: mismatched input '{' expecting \u003cEOF\u003e\n | TestAllTypes(){}\n | ..............^",
  },
  {
    expr: "TestAllTypes{}()",
    error:
      "ERROR: \u003cinput\u003e:1:15: Syntax error: mismatched input '(' expecting \u003cEOF\u003e\n | TestAllTypes{}()\n | ..............^",
  },
  {
    expr: "size(x) == x.size()",
    ast: "_==_(\n  size(\n    x^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  x^#*expr.Expr_IdentExpr#.size()^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "1 + $",
    error:
      "ERROR: \u003cinput\u003e:1:5: Syntax error: token recognition error at: '$'\n | 1 + $\n | ....^\nERROR: \u003cinput\u003e:1:6: Syntax error: mismatched input '\u003cEOF\u003e' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | 1 + $\n | .....^",
  },
  {
    expr: "1 + 2\n3 +",
    error:
      "ERROR: \u003cinput\u003e:2:1: Syntax error: mismatched input '3' expecting \u003cEOF\u003e\n | 3 +\n | ^",
  },
  { expr: '"\\""', ast: '"\\""^#*expr.Constant_StringValue#' },
  {
    expr: "[1,3,4][0]",
    ast: "_[_](\n  [\n    1^#*expr.Constant_Int64Value#,\n    3^#*expr.Constant_Int64Value#,\n    4^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#,\n  0^#*expr.Constant_Int64Value#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "1.all(2, 3)",
    error:
      "ERROR: \u003cinput\u003e:1:7: argument must be a simple name\n | 1.all(2, 3)\n | ......^",
  },
  {
    expr: 'x["a"].single_int32 == 23',
    ast: '_==_(\n  _[_](\n    x^#*expr.Expr_IdentExpr#,\n    "a"^#*expr.Constant_StringValue#\n  )^#*expr.Expr_CallExpr#.single_int32^#*expr.Expr_SelectExpr#,\n  23^#*expr.Constant_Int64Value#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "x.single_nested_message != null",
    ast: "_!=_(\n  x^#*expr.Expr_IdentExpr#.single_nested_message^#*expr.Expr_SelectExpr#,\n  null^#*expr.Constant_NullValue#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "false \u0026\u0026 !true || false ? 2 : 3",
    ast: "_?_:_(\n  _||_(\n    _\u0026\u0026_(\n      false^#*expr.Constant_BoolValue#,\n      !_(\n        true^#*expr.Constant_BoolValue#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#,\n    false^#*expr.Constant_BoolValue#\n  )^#*expr.Expr_CallExpr#,\n  2^#*expr.Constant_Int64Value#,\n  3^#*expr.Constant_Int64Value#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: 'b"abc" + B"def"',
    ast: '_+_(\n  b"abc"^#*expr.Constant_BytesValue#,\n  b"def"^#*expr.Constant_BytesValue#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "1 + 2 * 3 - 1 / 2 == 6 % 1",
    ast: "_==_(\n  _-_(\n    _+_(\n      1^#*expr.Constant_Int64Value#,\n      _*_(\n        2^#*expr.Constant_Int64Value#,\n        3^#*expr.Constant_Int64Value#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#,\n    _/_(\n      1^#*expr.Constant_Int64Value#,\n      2^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  _%_(\n    6^#*expr.Constant_Int64Value#,\n    1^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "1 + +",
    error:
      "ERROR: \u003cinput\u003e:1:5: Syntax error: mismatched input '+' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | 1 + +\n | ....^\nERROR: \u003cinput\u003e:1:6: Syntax error: mismatched input '\u003cEOF\u003e' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | 1 + +\n | .....^",
  },
  {
    expr: '"abc" + "def"',
    ast: '_+_(\n  "abc"^#*expr.Constant_StringValue#,\n  "def"^#*expr.Constant_StringValue#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: '{"a": 1}."a"',
    error:
      'ERROR: \u003cinput\u003e:1:10: Syntax error: no viable alternative at input \'."a"\'\n | {"a": 1}."a"\n | .........^',
  },
  { expr: '"\\xC3\\XBF"', ast: '"Ã¿"^#*expr.Constant_StringValue#' },
  { expr: '"\\303\\277"', ast: '"Ã¿"^#*expr.Constant_StringValue#' },
  {
    expr: '"hi\\u263A \\u263Athere"',
    ast: '"hi☺ ☺there"^#*expr.Constant_StringValue#',
  },
  { expr: '"\\U000003A8\\?"', ast: '"Ψ?"^#*expr.Constant_StringValue#' },
  {
    expr: '"\\a\\b\\f\\n\\r\\t\\v\'\\"\\\\\\? Legal escapes"',
    ast: '"\\a\\b\\f\\n\\r\\t\\v\'\\"\\\\? Legal escapes"^#*expr.Constant_StringValue#',
  },
  {
    expr: '"\\xFh"',
    error:
      "ERROR: \u003cinput\u003e:1:1: Syntax error: token recognition error at: '\"\\xFh'\n | \"\\xFh\"\n | ^\nERROR: \u003cinput\u003e:1:6: Syntax error: token recognition error at: '\"'\n | \"\\xFh\"\n | .....^\nERROR: \u003cinput\u003e:1:7: Syntax error: mismatched input '\u003cEOF\u003e' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | \"\\xFh\"\n | ......^",
  },
  {
    expr: '"\\a\\b\\f\\n\\r\\t\\v\\\'\\"\\\\\\? Illegal escape \\\u003e"',
    error:
      "ERROR: \u003cinput\u003e:1:1: Syntax error: token recognition error at: '\"\\a\\b\\f\\n\\r\\t\\v\\'\\\"\\\\\\? Illegal escape \\\u003e'\n | \"\\a\\b\\f\\n\\r\\t\\v\\'\\\"\\\\\\? Illegal escape \\\u003e\"\n | ^\nERROR: \u003cinput\u003e:1:42: Syntax error: token recognition error at: '\"'\n | \"\\a\\b\\f\\n\\r\\t\\v\\'\\\"\\\\\\? Illegal escape \\\u003e\"\n | .........................................^\nERROR: \u003cinput\u003e:1:43: Syntax error: mismatched input '\u003cEOF\u003e' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | \"\\a\\b\\f\\n\\r\\t\\v\\'\\\"\\\\\\? Illegal escape \\\u003e\"\n | ..........................................^",
  },
  {
    expr: '"😁" in ["😁", "😑", "😦"]',
    ast: '@in(\n  "😁"^#*expr.Constant_StringValue#,\n  [\n    "😁"^#*expr.Constant_StringValue#,\n    "😑"^#*expr.Constant_StringValue#,\n    "😦"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "      '😁' in ['😁', '😑', '😦']\n\t\t\t\u0026\u0026 in.😁",
    error:
      "ERROR: \u003cinput\u003e:2:7: Syntax error: extraneous input 'in' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n |    \u0026\u0026 in.😁\n | ......^\nERROR: \u003cinput\u003e:2:10: Syntax error: token recognition error at: '😁'\n |    \u0026\u0026 in.😁\n | .........＾\nERROR: \u003cinput\u003e:2:11: Syntax error: no viable alternative at input '.'\n |    \u0026\u0026 in.😁\n | .........．^",
  },
  {
    expr: "as",
    error: "ERROR: \u003cinput\u003e:1:1: reserved identifier: as\n | as\n | ^",
  },
  {
    expr: "break",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: break\n | break\n | ^",
  },
  {
    expr: "const",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: const\n | const\n | ^",
  },
  {
    expr: "continue",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: continue\n | continue\n | ^",
  },
  {
    expr: "else",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: else\n | else\n | ^",
  },
  {
    expr: "for",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: for\n | for\n | ^",
  },
  {
    expr: "function",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: function\n | function\n | ^",
  },
  {
    expr: "if",
    error: "ERROR: \u003cinput\u003e:1:1: reserved identifier: if\n | if\n | ^",
  },
  {
    expr: "import",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: import\n | import\n | ^",
  },
  {
    expr: "in",
    error:
      "ERROR: \u003cinput\u003e:1:1: Syntax error: mismatched input 'in' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | in\n | ^\nERROR: \u003cinput\u003e:1:3: Syntax error: mismatched input '\u003cEOF\u003e' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | in\n | ..^",
  },
  {
    expr: "let",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: let\n | let\n | ^",
  },
  {
    expr: "loop",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: loop\n | loop\n | ^",
  },
  {
    expr: "package",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: package\n | package\n | ^",
  },
  {
    expr: "namespace",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: namespace\n | namespace\n | ^",
  },
  {
    expr: "return",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: return\n | return\n | ^",
  },
  {
    expr: "var",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: var\n | var\n | ^",
  },
  {
    expr: "void",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: void\n | void\n | ^",
  },
  {
    expr: "while",
    error:
      "ERROR: \u003cinput\u003e:1:1: reserved identifier: while\n | while\n | ^",
  },
  {
    expr: "[1, 2, 3].map(var, var * var)",
    error:
      "ERROR: \u003cinput\u003e:1:15: reserved identifier: var\n | [1, 2, 3].map(var, var * var)\n | ..............^\nERROR: \u003cinput\u003e:1:15: argument is not an identifier\n | [1, 2, 3].map(var, var * var)\n | ..............^\nERROR: \u003cinput\u003e:1:20: reserved identifier: var\n | [1, 2, 3].map(var, var * var)\n | ...................^\nERROR: \u003cinput\u003e:1:26: reserved identifier: var\n | [1, 2, 3].map(var, var * var)\n | .........................^",
  },
  {
    expr: "func{{a}}",
    error:
      "ERROR: \u003cinput\u003e:1:6: Syntax error: extraneous input '{' expecting {'}', ',', '?', IDENTIFIER, ESC_IDENTIFIER}\n | func{{a}}\n | .....^\nERROR: \u003cinput\u003e:1:8: Syntax error: mismatched input '}' expecting ':'\n | func{{a}}\n | .......^\nERROR: \u003cinput\u003e:1:9: Syntax error: extraneous input '}' expecting \u003cEOF\u003e\n | func{{a}}\n | ........^",
  },
  {
    expr: "msg{:a}",
    error:
      "ERROR: \u003cinput\u003e:1:5: Syntax error: extraneous input ':' expecting {'}', ',', '?', IDENTIFIER, ESC_IDENTIFIER}\n | msg{:a}\n | ....^\nERROR: \u003cinput\u003e:1:7: Syntax error: mismatched input '}' expecting ':'\n | msg{:a}\n | ......^",
  },
  {
    expr: "{a}",
    error:
      "ERROR: \u003cinput\u003e:1:3: Syntax error: mismatched input '}' expecting ':'\n | {a}\n | ..^",
  },
  {
    expr: "{:a}",
    error:
      "ERROR: \u003cinput\u003e:1:2: Syntax error: extraneous input ':' expecting {'[', '{', '}', '(', '.', ',', '-', '!', '?', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | {:a}\n | .^\nERROR: \u003cinput\u003e:1:4: Syntax error: mismatched input '}' expecting ':'\n | {:a}\n | ...^",
  },
  {
    expr: "ind[a{b}]",
    error:
      "ERROR: \u003cinput\u003e:1:8: Syntax error: mismatched input '}' expecting ':'\n | ind[a{b}]\n | .......^",
  },
  {
    expr: "--",
    error:
      "ERROR: \u003cinput\u003e:1:3: Syntax error: no viable alternative at input '-'\n | --\n | ..^\nERROR: \u003cinput\u003e:1:3: Syntax error: mismatched input '\u003cEOF\u003e' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | --\n | ..^",
  },
  {
    expr: "?",
    error:
      "ERROR: \u003cinput\u003e:1:1: Syntax error: mismatched input '?' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | ?\n | ^\nERROR: \u003cinput\u003e:1:2: Syntax error: mismatched input '\u003cEOF\u003e' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | ?\n | .^",
  },
  {
    expr: "a ? b ((?))",
    error:
      "ERROR: \u003cinput\u003e:1:9: Syntax error: mismatched input '?' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | a ? b ((?))\n | ........^\nERROR: \u003cinput\u003e:1:10: Syntax error: mismatched input ')' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | a ? b ((?))\n | .........^\nERROR: \u003cinput\u003e:1:12: Syntax error: error recovery attempt limit exceeded: 4\n | a ? b ((?))\n | ...........^",
  },
  {
    expr: "[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[\n\t\t\t[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[['too many']]]]]]]]]]]]]]]]]]]]]]]]]]]]\n\t\t\t]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]",
    error:
      "ERROR: \u003cinput\u003e:-1:0: expression recursion limit exceeded: 32",
  },
  {
    expr: "-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1\n\t\t--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1--1--0--1--1--1\n\t\t--3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1\n\t\t--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1\n\t\t--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1\n\t\t--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1\n\t\t--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1--1--0--1--1--1\n\t\t--3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1\n\t\t--3-[-1--1--1--1---1-1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1-À1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n\t\t--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1\n\t\t--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1\n\t\t--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1\n\t\t--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1\n\t\t--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1\n\t\t--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1\n\t\t--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1\n\t\t--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1\n\t\t--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1",
    error:
      "ERROR: \u003cinput\u003e:-1:0: expression recursion limit exceeded: 32\nERROR: \u003cinput\u003e:3:33: Syntax error: extraneous input '/' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n |   --3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1\n | ................................^\nERROR: \u003cinput\u003e:8:33: Syntax error: extraneous input '/' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n |   --3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1\n | ................................^\nERROR: \u003cinput\u003e:11:17: Syntax error: token recognition error at: 'À'\n |   --1--1---1--1-À1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n | ................＾\nERROR: \u003cinput\u003e:14:23: Syntax error: extraneous input '/' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n |   --1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1\n | ......................^",
  },
  {
    expr: 'ó ¢\n\t\tó 0 \n\t\t0"""\\""\\"""\\""\\"""\\""\\"""\\""\\"""\\"\\"""\\""\\"""\\""\\"""\\""\\"""\\"!\\"""\\""\\"""\\""\\"',
    error:
      'ERROR: \u003cinput\u003e:-1:0: error recovery token lookahead limit exceeded: 4\nERROR: \u003cinput\u003e:1:1: Syntax error: token recognition error at: \'ó\'\n | ó ¢\n | ＾\nERROR: \u003cinput\u003e:1:2: Syntax error: token recognition error at: \' \'\n | ó ¢\n | ．＾\nERROR: \u003cinput\u003e:1:3: Syntax error: token recognition error at: \'¢\'\n | ó ¢\n | ．．＾\nERROR: \u003cinput\u003e:2:3: Syntax error: token recognition error at: \'ó\'\n |   ó 0 \n | ..＾\nERROR: \u003cinput\u003e:2:4: Syntax error: token recognition error at: \' \'\n |   ó 0 \n | ..．＾\nERROR: \u003cinput\u003e:2:6: Syntax error: token recognition error at: \' \'\n |   ó 0 \n | ..．．.＾\nERROR: \u003cinput\u003e:3:3: Syntax error: token recognition error at: \'\'\n |   0"""\\""\\"""\\""\\"""\\""\\"""\\""\\"""\\"\\"""\\""\\"""\\""\\"""\\""\\"""\\"!\\"""\\""\\"""\\""\\"\n | ..^\nERROR: \u003cinput\u003e:3:4: Syntax error: mismatched input \'0\' expecting \u003cEOF\u003e\n |   0"""\\""\\"""\\""\\"""\\""\\"""\\""\\"""\\"\\"""\\""\\"""\\""\\"""\\""\\"""\\"!\\"""\\""\\"""\\""\\"\n | ...^\nERROR: \u003cinput\u003e:3:11: Syntax error: token recognition error at: \'\\\'\n |   0"""\\""\\"""\\""\\"""\\""\\"""\\""\\"""\\"\\"""\\""\\"""\\""\\"""\\""\\"""\\"!\\"""\\""\\"""\\""\\"\n | ..........^',
  },
  {
    expr: "x.filter(y, y.filter(z, z \u003e 0))",
    ast: "__comprehension__(\n  // Variable\n  y,\n  // Target\n  x^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  []^#*expr.Expr_ListExpr#,\n  // LoopCondition\n  true^#*expr.Constant_BoolValue#,\n  // LoopStep\n  _?_:_(\n    __comprehension__(\n      // Variable\n      z,\n      // Target\n      y^#*expr.Expr_IdentExpr#,\n      // Accumulator\n      __result__,\n      // Init\n      []^#*expr.Expr_ListExpr#,\n      // LoopCondition\n      true^#*expr.Constant_BoolValue#,\n      // LoopStep\n      _?_:_(\n        _\u003e_(\n          z^#*expr.Expr_IdentExpr#,\n          0^#*expr.Constant_Int64Value#\n        )^#*expr.Expr_CallExpr#,\n        _+_(\n          __result__^#*expr.Expr_IdentExpr#,\n          [\n            z^#*expr.Expr_IdentExpr#\n          ]^#*expr.Expr_ListExpr#\n        )^#*expr.Expr_CallExpr#,\n        __result__^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#,\n      // Result\n      __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#,\n    _+_(\n      __result__^#*expr.Expr_IdentExpr#,\n      [\n        y^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#,\n    __result__^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "has(a.b).filter(c, c)",
    ast: "__comprehension__(\n  // Variable\n  c,\n  // Target\n  a^#*expr.Expr_IdentExpr#.b~test-only~^#*expr.Expr_SelectExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  []^#*expr.Expr_ListExpr#,\n  // LoopCondition\n  true^#*expr.Constant_BoolValue#,\n  // LoopStep\n  _?_:_(\n    c^#*expr.Expr_IdentExpr#,\n    _+_(\n      __result__^#*expr.Expr_IdentExpr#,\n      [\n        c^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#,\n    __result__^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "x.filter(y, y.exists(z, has(z.a)) \u0026\u0026 y.exists(z, has(z.b)))",
    ast: "__comprehension__(\n  // Variable\n  y,\n  // Target\n  x^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  []^#*expr.Expr_ListExpr#,\n  // LoopCondition\n  true^#*expr.Constant_BoolValue#,\n  // LoopStep\n  _?_:_(\n    _\u0026\u0026_(\n      __comprehension__(\n        // Variable\n        z,\n        // Target\n        y^#*expr.Expr_IdentExpr#,\n        // Accumulator\n        __result__,\n        // Init\n        false^#*expr.Constant_BoolValue#,\n        // LoopCondition\n        @not_strictly_false(\n          !_(\n            __result__^#*expr.Expr_IdentExpr#\n          )^#*expr.Expr_CallExpr#\n        )^#*expr.Expr_CallExpr#,\n        // LoopStep\n        _||_(\n          __result__^#*expr.Expr_IdentExpr#,\n          z^#*expr.Expr_IdentExpr#.a~test-only~^#*expr.Expr_SelectExpr#\n        )^#*expr.Expr_CallExpr#,\n        // Result\n        __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#,\n      __comprehension__(\n        // Variable\n        z,\n        // Target\n        y^#*expr.Expr_IdentExpr#,\n        // Accumulator\n        __result__,\n        // Init\n        false^#*expr.Constant_BoolValue#,\n        // LoopCondition\n        @not_strictly_false(\n          !_(\n            __result__^#*expr.Expr_IdentExpr#\n          )^#*expr.Expr_CallExpr#\n        )^#*expr.Expr_CallExpr#,\n        // LoopStep\n        _||_(\n          __result__^#*expr.Expr_IdentExpr#,\n          z^#*expr.Expr_IdentExpr#.b~test-only~^#*expr.Expr_SelectExpr#\n        )^#*expr.Expr_CallExpr#,\n        // Result\n        __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#\n    )^#*expr.Expr_CallExpr#,\n    _+_(\n      __result__^#*expr.Expr_IdentExpr#,\n      [\n        y^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#,\n    __result__^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "(has(a.b) || has(c.d)).string()",
    ast: "_||_(\n  a^#*expr.Expr_IdentExpr#.b~test-only~^#*expr.Expr_SelectExpr#,\n  c^#*expr.Expr_IdentExpr#.d~test-only~^#*expr.Expr_SelectExpr#\n)^#*expr.Expr_CallExpr#.string()^#*expr.Expr_CallExpr#",
  },
  {
    expr: "has(a.b).asList().exists(c, c)",
    ast: "__comprehension__(\n  // Variable\n  c,\n  // Target\n  a^#*expr.Expr_IdentExpr#.b~test-only~^#*expr.Expr_SelectExpr#.asList()^#*expr.Expr_CallExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  false^#*expr.Constant_BoolValue#,\n  // LoopCondition\n  @not_strictly_false(\n    !_(\n      __result__^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  // LoopStep\n  _||_(\n    __result__^#*expr.Expr_IdentExpr#,\n    c^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "[has(a.b), has(c.d)].exists(e, e)",
    ast: "__comprehension__(\n  // Variable\n  e,\n  // Target\n  [\n    a^#*expr.Expr_IdentExpr#.b~test-only~^#*expr.Expr_SelectExpr#,\n    c^#*expr.Expr_IdentExpr#.d~test-only~^#*expr.Expr_SelectExpr#\n  ]^#*expr.Expr_ListExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  false^#*expr.Constant_BoolValue#,\n  // LoopCondition\n  @not_strictly_false(\n    !_(\n      __result__^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  // LoopStep\n  _||_(\n    __result__^#*expr.Expr_IdentExpr#,\n    e^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "y!=y!=y!=y!=y!=y!=y!=y!=y!=-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y\n\t\t!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y\n\t\t!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y\n\t\t!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y\n\t\t!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y\n\t\t!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y",
    error: "ERROR: \u003cinput\u003e:-1:0: max recursion depth exceeded",
  },
  {
    expr: "[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[['not fine']]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]",
    error:
      "ERROR: \u003cinput\u003e:-1:0: expression recursion limit exceeded: 32",
  },
  {
    expr: "1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10\n\t\t+ 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20\n\t\t+ 21 + 22 + 23 + 24 + 25 + 26 + 27 + 28 + 29 + 30\n\t\t+ 31 + 32 + 33 + 34",
    error: "ERROR: \u003cinput\u003e:-1:0: max recursion depth exceeded",
  },
  {
    expr: "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.A.B.C.D.E.F.G.H",
    error: "ERROR: \u003cinput\u003e:-1:0: max recursion depth exceeded",
  },
  {
    expr: "a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20]\n\t\t     [21][22][23][24][25][26][27][28][29][30][31][32][33]",
    error: "ERROR: \u003cinput\u003e:-1:0: max recursion depth exceeded",
  },
  {
    expr: "a \u003c 1 \u003c 2 \u003c 3 \u003c 4 \u003c 5 \u003c 6 \u003c 7 \u003c 8 \u003c 9 \u003c 10 \u003c 11\n\t\t      \u003c 12 \u003c 13 \u003c 14 \u003c 15 \u003c 16 \u003c 17 \u003c 18 \u003c 19 \u003c 20 \u003c 21\n\t\t\t  \u003c 22 \u003c 23 \u003c 24 \u003c 25 \u003c 26 \u003c 27 \u003c 28 \u003c 29 \u003c 30 \u003c 31\n\t\t\t  \u003c 32 \u003c 33",
    error: "ERROR: \u003cinput\u003e:-1:0: max recursion depth exceeded",
  },
  {
    expr: "a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=\n\t\ta[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20]",
    error: "ERROR: \u003cinput\u003e:-1:0: max recursion depth exceeded",
  },
  {
    expr: "self.true == 1",
    error:
      "ERROR: \u003cinput\u003e:1:6: Syntax error: mismatched input 'true' expecting IDENTIFIER\n | self.true == 1\n | .....^",
  },
  {
    expr: "a.?b \u0026\u0026 a[?b]",
    error:
      "ERROR: \u003cinput\u003e:1:2: unsupported syntax '.?'\n | a.?b \u0026\u0026 a[?b]\n | .^\nERROR: \u003cinput\u003e:1:10: unsupported syntax '[?'\n | a.?b \u0026\u0026 a[?b]\n | .........^",
  },
  {
    expr: "a.?b[?0] \u0026\u0026 a[?c]",
    error:
      "ERROR: \u003cinput\u003e:1:2: unsupported syntax '.?'\n | a.?b[?0] \u0026\u0026 a[?c]\n | .^\nERROR: \u003cinput\u003e:1:5: unsupported syntax '[?'\n | a.?b[?0] \u0026\u0026 a[?c]\n | ....^\nERROR: \u003cinput\u003e:1:14: unsupported syntax '[?'\n | a.?b[?0] \u0026\u0026 a[?c]\n | .............^",
  },
  {
    expr: "{?'key': value}",
    error:
      "ERROR: \u003cinput\u003e:1:2: unsupported syntax '?'\n | {?'key': value}\n | .^",
  },
  {
    expr: "[?a, ?b]",
    error:
      "ERROR: \u003cinput\u003e:1:2: unsupported syntax '?'\n | [?a, ?b]\n | .^\nERROR: \u003cinput\u003e:1:6: unsupported syntax '?'\n | [?a, ?b]\n | .....^",
  },
  {
    expr: "[?a[?b]]",
    error:
      "ERROR: \u003cinput\u003e:1:2: unsupported syntax '?'\n | [?a[?b]]\n | .^\nERROR: \u003cinput\u003e:1:4: unsupported syntax '[?'\n | [?a[?b]]\n | ...^",
  },
  {
    expr: "[?a, ?b]",
    error:
      "ERROR: \u003cinput\u003e:1:2: unsupported syntax '?'\n | [?a, ?b]\n | .^\nERROR: \u003cinput\u003e:1:6: unsupported syntax '?'\n | [?a, ?b]\n | .....^",
  },
  {
    expr: "Msg{?field: value}",
    error:
      "ERROR: \u003cinput\u003e:1:5: unsupported syntax '?'\n | Msg{?field: value}\n | ....^",
  },
  {
    expr: "Msg{?field: value} \u0026\u0026 {?'key': value}",
    error:
      "ERROR: \u003cinput\u003e:1:5: unsupported syntax '?'\n | Msg{?field: value} \u0026\u0026 {?'key': value}\n | ....^\nERROR: \u003cinput\u003e:1:24: unsupported syntax '?'\n | Msg{?field: value} \u0026\u0026 {?'key': value}\n | .......................^",
  },
  {
    expr: "a.`b-c`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`b-c`\n | ..^",
  },
  {
    expr: "a.`b c`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`b c`\n | ..^",
  },
  {
    expr: "a.`b.c`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`b.c`\n | ..^",
  },
  {
    expr: "a.`in`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`in`\n | ..^",
  },
  {
    expr: "a.`/foo`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`/foo`\n | ..^",
  },
  {
    expr: "Message{`in`: true}",
    error:
      "ERROR: \u003cinput\u003e:1:9: unsupported syntax: '`'\n | Message{`in`: true}\n | ........^",
  },
  {
    expr: "`b-c`",
    error:
      "ERROR: \u003cinput\u003e:1:1: Syntax error: mismatched input '`b-c`' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | `b-c`\n | ^",
  },
  {
    expr: "`b-c`()",
    error:
      "ERROR: \u003cinput\u003e:1:1: Syntax error: extraneous input '`b-c`' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | `b-c`()\n | ^\nERROR: \u003cinput\u003e:1:7: Syntax error: mismatched input ')' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}\n | `b-c`()\n | ......^",
  },
  {
    expr: "a.`$b`",
    error:
      "ERROR: \u003cinput\u003e:1:3: Syntax error: token recognition error at: '`$'\n | a.`$b`\n | ..^\nERROR: \u003cinput\u003e:1:6: Syntax error: token recognition error at: '`'\n | a.`$b`\n | .....^",
  },
  {
    expr: "a.`b.c`()",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`b.c`()\n | ..^\nERROR: \u003cinput\u003e:1:8: Syntax error: mismatched input '(' expecting \u003cEOF\u003e\n | a.`b.c`()\n | .......^",
  },
  {
    expr: "a.`b-c`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`b-c`\n | ..^",
  },
  {
    expr: "a.`b.c`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`b.c`\n | ..^",
  },
  {
    expr: "a.`in`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`in`\n | ..^",
  },
  {
    expr: "a.`/foo`",
    error:
      "ERROR: \u003cinput\u003e:1:3: unsupported syntax: '`'\n | a.`/foo`\n | ..^",
  },
  {
    expr: "Message{`in`: true}",
    error:
      "ERROR: \u003cinput\u003e:1:9: unsupported syntax: '`'\n | Message{`in`: true}\n | ........^",
  },
  {
    expr: "noop_macro(123)",
    ast: "noop_macro(\n  123^#*expr.Constant_Int64Value#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "x{?.",
    error:
      "ERROR: \u003cinput\u003e:1:4: Syntax error: mismatched input '.' expecting {IDENTIFIER, ESC_IDENTIFIER}\n | x{?.\n | ...^\nERROR: \u003cinput\u003e:1:4: Syntax error: error recovery attempt limit exceeded: 4\n | x{?.\n | ...^",
  },
  {
    expr: "x{.",
    error:
      "ERROR: \u003cinput\u003e:1:3: Syntax error: mismatched input '.' expecting {'}', ',', '?', IDENTIFIER, ESC_IDENTIFIER}\n | x{.\n | ..^",
  },
  {
    expr: "'3# \u003c 10\" '\u0026 tru ^^",
    error:
      "ERROR: \u003cinput\u003e:1:12: Syntax error: token recognition error at: '\u0026 '\n | '3# \u003c 10\" '\u0026 tru ^^\n | ...........^\nERROR: \u003cinput\u003e:1:14: Syntax error: extraneous input 'tru' expecting \u003cEOF\u003e\n | '3# \u003c 10\" '\u0026 tru ^^\n | .............^\nERROR: \u003cinput\u003e:1:18: Syntax error: token recognition error at: '^'\n | '3# \u003c 10\" '\u0026 tru ^^\n | .................^\nERROR: \u003cinput\u003e:1:19: Syntax error: token recognition error at: '^'\n | '3# \u003c 10\" '\u0026 tru ^^\n | ..................^",
  },
  {
    expr: "'\\udead' == '\\ufffd'",
    error:
      "ERROR: \u003cinput\u003e:1:1: invalid unicode code point\n | '\\udead' == '\\ufffd'\n | ^",
  },
] as const;
