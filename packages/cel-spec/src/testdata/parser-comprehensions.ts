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

// Generated from cel-go github.com/google/cel-go@v0.22.2-0.20241217215216-98789f34a481/ext/comprehensions_test.go
export const parserTests = [
  {
    expr: "[1, 2, 3, 4].all(i, v, i \u003c 5 \u0026\u0026 v \u003e 0)",
    ast: "[\n  1^#*expr.Constant_Int64Value#,\n  2^#*expr.Constant_Int64Value#,\n  3^#*expr.Constant_Int64Value#,\n  4^#*expr.Constant_Int64Value#\n]^#*expr.Expr_ListExpr#.all(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _\u0026\u0026_(\n    _\u003c_(\n      i^#*expr.Expr_IdentExpr#,\n      5^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    _\u003e_(\n      v^#*expr.Expr_IdentExpr#,\n      0^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[1, 2, 3, 4].all(i, v, i \u003c v)",
    ast: "[\n  1^#*expr.Constant_Int64Value#,\n  2^#*expr.Constant_Int64Value#,\n  3^#*expr.Constant_Int64Value#,\n  4^#*expr.Constant_Int64Value#\n]^#*expr.Expr_ListExpr#.all(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    i^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[1, 2, 3, 4].all(i, v, i \u003e v) == false",
    ast: "_==_(\n  [\n    1^#*expr.Constant_Int64Value#,\n    2^#*expr.Constant_Int64Value#,\n    3^#*expr.Constant_Int64Value#,\n    4^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#.all(\n    i^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    _\u003e_(\n      i^#*expr.Expr_IdentExpr#,\n      v^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  false^#*expr.Constant_BoolValue#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "\n\t\tcel.bind(listA, [1, 2, 3, 4],\n\t\tcel.bind(listB, [1, 2, 3, 4, 5],\n\t\t   listA.all(i, v, listB[?i].hasValue() \u0026\u0026 listB[i] == v)\n\t\t))\n\t\t",
    error:
      "ERROR: \u003cinput\u003e:4:27: unsupported syntax '[?'\n |      listA.all(i, v, listB[?i].hasValue() \u0026\u0026 listB[i] == v)\n | ..........................^",
  },
  {
    expr: "\n\t\tcel.bind(listA, [1, 2, 3, 4, 5, 6],\n\t\tcel.bind(listB, [1, 2, 3, 4, 5],\n\t\t   listA.all(i, v, listB[?i].hasValue() \u0026\u0026 listB[i] == v)\n\t\t)) == false\n\t\t",
    error:
      "ERROR: \u003cinput\u003e:4:27: unsupported syntax '[?'\n |      listA.all(i, v, listB[?i].hasValue() \u0026\u0026 listB[i] == v)\n | ..........................^",
  },
  {
    expr: "\n\t\tcel.bind(l, ['hello', 'world', 'hello!', 'worlds'],\n\t\t  l.exists(i, v,\n\t\t    v.startsWith('hello') \u0026\u0026 l[?(i+1)].optMap(next, next.endsWith('world')).orValue(false)\n\t\t  )\n\t\t)\n\t\t",
    error:
      "ERROR: \u003cinput\u003e:4:33: unsupported syntax '[?'\n |       v.startsWith('hello') \u0026\u0026 l[?(i+1)].optMap(next, next.endsWith('world')).orValue(false)\n | ................................^",
  },
  {
    expr: "\n\t\tcel.bind(l, ['hello', 'world', 'hello!', 'worlds'],\n\t\t  l.existsOne(i, v,\n\t\t    v.startsWith('hello') \u0026\u0026 l[?(i+1)].optMap(next, next.endsWith('world')).orValue(false)\n\t\t  )\n\t\t)\n\t\t",
    error:
      "ERROR: \u003cinput\u003e:4:33: unsupported syntax '[?'\n |       v.startsWith('hello') \u0026\u0026 l[?(i+1)].optMap(next, next.endsWith('world')).orValue(false)\n | ................................^",
  },
  {
    expr: "\n\t\tcel.bind(l, ['hello', 'goodbye', 'hello!', 'goodbye'],\n\t\t  l.exists_one(i, v,\n\t\t    v.startsWith('hello') \u0026\u0026 l[?(i+1)].optMap(next, next == \"goodbye\").orValue(false)\n\t\t  )\n\t\t) == false\n\t\t",
    error:
      "ERROR: \u003cinput\u003e:4:33: unsupported syntax '[?'\n |       v.startsWith('hello') \u0026\u0026 l[?(i+1)].optMap(next, next == \"goodbye\").orValue(false)\n | ................................^",
  },
  {
    expr: '\n\t\t[\'Hello\', \'world\'].transformList(i, v, "[%d]%s".format([i, v.lowerAscii()])) == ["[0]hello", "[1]world"]\n\t\t',
    ast: '_==_(\n  [\n    "Hello"^#*expr.Constant_StringValue#,\n    "world"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#.transformList(\n    i^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    "[%d]%s"^#*expr.Constant_StringValue#.format(\n      [\n        i^#*expr.Expr_IdentExpr#,\n        v^#*expr.Expr_IdentExpr#.lowerAscii()^#*expr.Expr_CallExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  [\n    "[0]hello"^#*expr.Constant_StringValue#,\n    "[1]world"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t['hello', 'world'].transformList(i, v, v.startsWith('greeting'), \"[%d]%s\".format([i, v])) == []\n\t\t",
    ast: '_==_(\n  [\n    "hello"^#*expr.Constant_StringValue#,\n    "world"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#.transformList(\n    i^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#.startsWith(\n      "greeting"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    "[%d]%s"^#*expr.Constant_StringValue#.format(\n      [\n        i^#*expr.Expr_IdentExpr#,\n        v^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  []^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t[1, 2, 3].transformList(indexVar, valueVar, (indexVar * valueVar) + valueVar) == [1, 4, 9]\n\t\t",
    ast: "_==_(\n  [\n    1^#*expr.Constant_Int64Value#,\n    2^#*expr.Constant_Int64Value#,\n    3^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#.transformList(\n    indexVar^#*expr.Expr_IdentExpr#,\n    valueVar^#*expr.Expr_IdentExpr#,\n    _+_(\n      _*_(\n        indexVar^#*expr.Expr_IdentExpr#,\n        valueVar^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#,\n      valueVar^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  [\n    1^#*expr.Constant_Int64Value#,\n    4^#*expr.Constant_Int64Value#,\n    9^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "\n\t\t[1, 2, 3].transformList(indexVar, valueVar, indexVar % 2 == 0, (indexVar * valueVar) + valueVar) == [1, 9]\n\t\t",
    ast: "_==_(\n  [\n    1^#*expr.Constant_Int64Value#,\n    2^#*expr.Constant_Int64Value#,\n    3^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#.transformList(\n    indexVar^#*expr.Expr_IdentExpr#,\n    valueVar^#*expr.Expr_IdentExpr#,\n    _==_(\n      _%_(\n        indexVar^#*expr.Expr_IdentExpr#,\n        2^#*expr.Constant_Int64Value#\n      )^#*expr.Expr_CallExpr#,\n      0^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    _+_(\n      _*_(\n        indexVar^#*expr.Expr_IdentExpr#,\n        valueVar^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#,\n      valueVar^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  [\n    1^#*expr.Constant_Int64Value#,\n    9^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "\n\t\t['Hello', 'world'].transformMap(i, v, [v.lowerAscii()]) == {0: ['hello'], 1: ['world']}\n\t\t",
    ast: '_==_(\n  [\n    "Hello"^#*expr.Constant_StringValue#,\n    "world"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#.transformMap(\n    i^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    [\n      v^#*expr.Expr_IdentExpr#.lowerAscii()^#*expr.Expr_CallExpr#\n    ]^#*expr.Expr_ListExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    0^#*expr.Constant_Int64Value#:[\n      "hello"^#*expr.Constant_StringValue#\n    ]^#*expr.Expr_ListExpr#^#*expr.Expr_CreateStruct_Entry#,\n    1^#*expr.Constant_Int64Value#:[\n      "world"^#*expr.Constant_StringValue#\n    ]^#*expr.Expr_ListExpr#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t// round-tripping example\n\t\t['world', 'Hello'].transformMap(i, v, [v.lowerAscii()])\n\t\t  .transformList(k, v, v) // extract the list back form the map\n\t\t  .flatten()\n\t\t  .sort() == ['hello', 'world']\n\t\t",
    ast: '_==_(\n  [\n    "world"^#*expr.Constant_StringValue#,\n    "Hello"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#.transformMap(\n    i^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    [\n      v^#*expr.Expr_IdentExpr#.lowerAscii()^#*expr.Expr_CallExpr#\n    ]^#*expr.Expr_ListExpr#\n  )^#*expr.Expr_CallExpr#.transformList(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#.flatten()^#*expr.Expr_CallExpr#.sort()^#*expr.Expr_CallExpr#,\n  [\n    "hello"^#*expr.Constant_StringValue#,\n    "world"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t[1, 2, 3].transformMap(indexVar, valueVar,\n\t      (indexVar * valueVar) + valueVar) == {0: 1, 1: 4, 2: 9}\n        ",
    ast: "_==_(\n  [\n    1^#*expr.Constant_Int64Value#,\n    2^#*expr.Constant_Int64Value#,\n    3^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#.transformMap(\n    indexVar^#*expr.Expr_IdentExpr#,\n    valueVar^#*expr.Expr_IdentExpr#,\n    _+_(\n      _*_(\n        indexVar^#*expr.Expr_IdentExpr#,\n        valueVar^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#,\n      valueVar^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    0^#*expr.Constant_Int64Value#:1^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#,\n    1^#*expr.Constant_Int64Value#:4^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#,\n    2^#*expr.Constant_Int64Value#:9^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "\n\t\t[1, 2, 3].transformMap(indexVar, valueVar, indexVar % 2 == 0,\n\t  \t  (indexVar * valueVar) + valueVar) == {0: 1, 2: 9}\n\t\t",
    ast: "_==_(\n  [\n    1^#*expr.Constant_Int64Value#,\n    2^#*expr.Constant_Int64Value#,\n    3^#*expr.Constant_Int64Value#\n  ]^#*expr.Expr_ListExpr#.transformMap(\n    indexVar^#*expr.Expr_IdentExpr#,\n    valueVar^#*expr.Expr_IdentExpr#,\n    _==_(\n      _%_(\n        indexVar^#*expr.Expr_IdentExpr#,\n        2^#*expr.Constant_Int64Value#\n      )^#*expr.Expr_CallExpr#,\n      0^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    _+_(\n      _*_(\n        indexVar^#*expr.Expr_IdentExpr#,\n        valueVar^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#,\n      valueVar^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    0^#*expr.Constant_Int64Value#:1^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#,\n    2^#*expr.Constant_Int64Value#:9^#*expr.Constant_Int64Value#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "\n\t\t\"key1:value1 key2:value2 key3:value3\".split(\" \")\n\t\t.transformMapEntry(i, v,\n\t\t  cel.bind(entry, v.split(\":\"),\n\t\t    entry.size() == 2 ? {entry[0]: entry[1]} : {}\n\t\t  )\n\t\t) == {'key1': 'value1', 'key2': 'value2', 'key3': 'value3'}\n\t\t",
    ast: '_==_(\n  "key1:value1 key2:value2 key3:value3"^#*expr.Constant_StringValue#.split(\n    " "^#*expr.Constant_StringValue#\n  )^#*expr.Expr_CallExpr#.transformMapEntry(\n    i^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    cel^#*expr.Expr_IdentExpr#.bind(\n      entry^#*expr.Expr_IdentExpr#,\n      v^#*expr.Expr_IdentExpr#.split(\n        ":"^#*expr.Constant_StringValue#\n      )^#*expr.Expr_CallExpr#,\n      _?_:_(\n        _==_(\n          entry^#*expr.Expr_IdentExpr#.size()^#*expr.Expr_CallExpr#,\n          2^#*expr.Constant_Int64Value#\n        )^#*expr.Expr_CallExpr#,\n        {\n          _[_](\n            entry^#*expr.Expr_IdentExpr#,\n            0^#*expr.Constant_Int64Value#\n          )^#*expr.Expr_CallExpr#:_[_](\n            entry^#*expr.Expr_IdentExpr#,\n            1^#*expr.Constant_Int64Value#\n          )^#*expr.Expr_CallExpr#^#*expr.Expr_CreateStruct_Entry#\n        }^#*expr.Expr_StructExpr#,\n        {}^#*expr.Expr_StructExpr#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    "key1"^#*expr.Constant_StringValue#:"value1"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "key2"^#*expr.Constant_StringValue#:"value2"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "key3"^#*expr.Constant_StringValue#:"value3"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t\"key1:value1:extra key2:value2 key3\".split(\" \")\n\t\t.transformMapEntry(i, v,\n\t\t  cel.bind(entry, v.split(\":\"), {?entry[0]: entry[?1]})\n\t\t) == {'key1': 'value1', 'key2': 'value2'}\n\t\t",
    error:
      "ERROR: \u003cinput\u003e:4:36: unsupported syntax '?'\n |     cel.bind(entry, v.split(\":\"), {?entry[0]: entry[?1]})\n | ...................................^",
  },
  {
    expr: "\n\t\t{'hello': 'world', 'hello!': 'world'}.all(k, v, k.startsWith('hello') \u0026\u0026 v == 'world')\n\t\t",
    ast: '{\n  "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n  "hello!"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#.all(\n  k^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _\u0026\u0026_(\n    k^#*expr.Expr_IdentExpr#.startsWith(\n      "hello"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    _==_(\n      v^#*expr.Expr_IdentExpr#,\n      "world"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'hello!': 'worlds'}.all(k, v, k.startsWith('hello') \u0026\u0026 v.endsWith('world')) == false\n\t\t",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "hello!"^#*expr.Constant_StringValue#:"worlds"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.all(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    _\u0026\u0026_(\n      k^#*expr.Expr_IdentExpr#.startsWith(\n        "hello"^#*expr.Constant_StringValue#\n      )^#*expr.Expr_CallExpr#,\n      v^#*expr.Expr_IdentExpr#.endsWith(\n        "world"^#*expr.Constant_StringValue#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  false^#*expr.Constant_BoolValue#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'hello!': 'worlds'}.exists(k, v, k.startsWith('hello') \u0026\u0026 v.endsWith('world'))\n\t\t",
    ast: '{\n  "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n  "hello!"^#*expr.Constant_StringValue#:"worlds"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#.exists(\n  k^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _\u0026\u0026_(\n    k^#*expr.Expr_IdentExpr#.startsWith(\n      "hello"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    v^#*expr.Expr_IdentExpr#.endsWith(\n      "world"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'hello!': 'worlds'}.existsOne(k, v, k.startsWith('hello') \u0026\u0026 v.endsWith('world'))\n\t\t",
    ast: '{\n  "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n  "hello!"^#*expr.Constant_StringValue#:"worlds"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#.existsOne(\n  k^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _\u0026\u0026_(\n    k^#*expr.Expr_IdentExpr#.startsWith(\n      "hello"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    v^#*expr.Expr_IdentExpr#.endsWith(\n      "world"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'hello!': 'worlds'}.exists_one(k, v, k.startsWith('hello') \u0026\u0026 v.endsWith('world'))\n\t\t",
    ast: '{\n  "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n  "hello!"^#*expr.Constant_StringValue#:"worlds"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#.exists_one(\n  k^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _\u0026\u0026_(\n    k^#*expr.Expr_IdentExpr#.startsWith(\n      "hello"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    v^#*expr.Expr_IdentExpr#.endsWith(\n      "world"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'hello!': 'wow, world'}.exists_one(k, v, k.startsWith('hello') \u0026\u0026 v.endsWith('world')) == false\n\t\t",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "hello!"^#*expr.Constant_StringValue#:"wow, world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.exists_one(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    _\u0026\u0026_(\n      k^#*expr.Expr_IdentExpr#.startsWith(\n        "hello"^#*expr.Constant_StringValue#\n      )^#*expr.Expr_CallExpr#,\n      v^#*expr.Expr_IdentExpr#.endsWith(\n        "world"^#*expr.Constant_StringValue#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  false^#*expr.Constant_BoolValue#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'Hello': 'world'}.transformList(k, v, \"%s=%s\".format([k.lowerAscii(), v])) == [\"hello=world\"]\n\t\t",
    ast: '_==_(\n  {\n    "Hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformList(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    "%s=%s"^#*expr.Constant_StringValue#.format(\n      [\n        k^#*expr.Expr_IdentExpr#.lowerAscii()^#*expr.Expr_CallExpr#,\n        v^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  [\n    "hello=world"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\tdyn({'Hello': 'world'}).transformList(k, v, \"%s=%s\".format([k.lowerAscii(), v])) == [\"hello=world\"]\n\t\t",
    ast: '_==_(\n  dyn(\n    {\n      "Hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n    }^#*expr.Expr_StructExpr#\n  )^#*expr.Expr_CallExpr#.transformList(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    "%s=%s"^#*expr.Constant_StringValue#.format(\n      [\n        k^#*expr.Expr_IdentExpr#.lowerAscii()^#*expr.Expr_CallExpr#,\n        v^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  [\n    "hello=world"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world'}.transformList(k, v, k.startsWith('greeting'), \"%s=%s\".format([k, v])) == []\n\t\t",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformList(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    k^#*expr.Expr_IdentExpr#.startsWith(\n      "greeting"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    "%s=%s"^#*expr.Constant_StringValue#.format(\n      [\n        k^#*expr.Expr_IdentExpr#,\n        v^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  []^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'greeting': 'hello', 'farewell': 'goodbye'}\n\t\t  .transformList(k, _, k).sort() == ['farewell', 'greeting']\n\t\t",
    ast: '_==_(\n  {\n    "greeting"^#*expr.Constant_StringValue#:"hello"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "farewell"^#*expr.Constant_StringValue#:"goodbye"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformList(\n    k^#*expr.Expr_IdentExpr#,\n    _^#*expr.Expr_IdentExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#.sort()^#*expr.Expr_CallExpr#,\n  [\n    "farewell"^#*expr.Constant_StringValue#,\n    "greeting"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'greeting': 'hello', 'farewell': 'goodbye'}\n\t\t  .transformList(_, v, v).sort() == ['goodbye', 'hello']\n\t\t",
    ast: '_==_(\n  {\n    "greeting"^#*expr.Constant_StringValue#:"hello"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "farewell"^#*expr.Constant_StringValue#:"goodbye"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformList(\n    _^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#.sort()^#*expr.Expr_CallExpr#,\n  [\n    "goodbye"^#*expr.Constant_StringValue#,\n    "hello"^#*expr.Constant_StringValue#\n  ]^#*expr.Expr_ListExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'goodbye': 'cruel world'}.transformMap(k, v, \"%s, %s!\".format([k, v]))\n\t\t   == {'hello': 'hello, world!', 'goodbye': 'goodbye, cruel world!'}\n\t\t",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "goodbye"^#*expr.Constant_StringValue#:"cruel world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformMap(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    "%s, %s!"^#*expr.Constant_StringValue#.format(\n      [\n        k^#*expr.Expr_IdentExpr#,\n        v^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    "hello"^#*expr.Constant_StringValue#:"hello, world!"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "goodbye"^#*expr.Constant_StringValue#:"goodbye, cruel world!"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\tdyn({'hello': 'world', 'goodbye': 'cruel world'}).transformMap(k, v, \"%s, %s!\".format([k, v]))\n\t\t   == {'hello': 'hello, world!', 'goodbye': 'goodbye, cruel world!'}\n\t\t",
    ast: '_==_(\n  dyn(\n    {\n      "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n      "goodbye"^#*expr.Constant_StringValue#:"cruel world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n    }^#*expr.Expr_StructExpr#\n  )^#*expr.Expr_CallExpr#.transformMap(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    "%s, %s!"^#*expr.Constant_StringValue#.format(\n      [\n        k^#*expr.Expr_IdentExpr#,\n        v^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    "hello"^#*expr.Constant_StringValue#:"hello, world!"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "goodbye"^#*expr.Constant_StringValue#:"goodbye, cruel world!"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'goodbye': 'cruel world'}.transformMap(k, v, v.startsWith('world'), \"%s, %s!\".format([k, v]))\n\t\t   == {'hello': 'hello, world!'}\n\t\t",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "goodbye"^#*expr.Constant_StringValue#:"cruel world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformMap(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#.startsWith(\n      "world"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    "%s, %s!"^#*expr.Constant_StringValue#.format(\n      [\n        k^#*expr.Expr_IdentExpr#,\n        v^#*expr.Expr_IdentExpr#\n      ]^#*expr.Expr_ListExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    "hello"^#*expr.Constant_StringValue#:"hello, world!"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'greetings': 'tacocat'}.transformMapEntry(k, v, {k.reverse(): v.reverse()})\n\t\t   == {'olleh': 'dlrow', 'sgniteerg': 'tacocat'}\n\t\t",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "greetings"^#*expr.Constant_StringValue#:"tacocat"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformMapEntry(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    {\n      k^#*expr.Expr_IdentExpr#.reverse()^#*expr.Expr_CallExpr#:v^#*expr.Expr_IdentExpr#.reverse()^#*expr.Expr_CallExpr#^#*expr.Expr_CreateStruct_Entry#\n    }^#*expr.Expr_StructExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    "olleh"^#*expr.Constant_StringValue#:"dlrow"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "sgniteerg"^#*expr.Constant_StringValue#:"tacocat"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'greetings': 'tacocat'}.transformMapEntry(k, v, v.reverse() == v, {k.reverse(): v.reverse()})\n\t\t   == {'sgniteerg': 'tacocat'}\n\t\t",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "greetings"^#*expr.Constant_StringValue#:"tacocat"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformMapEntry(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    _==_(\n      v^#*expr.Expr_IdentExpr#.reverse()^#*expr.Expr_CallExpr#,\n      v^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#,\n    {\n      k^#*expr.Expr_IdentExpr#.reverse()^#*expr.Expr_CallExpr#:v^#*expr.Expr_IdentExpr#.reverse()^#*expr.Expr_CallExpr#^#*expr.Expr_CreateStruct_Entry#\n    }^#*expr.Expr_StructExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    "sgniteerg"^#*expr.Constant_StringValue#:"tacocat"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "\n\t\t{'hello': 'world', 'greetings': 'tacocat'}.transformMapEntry(k, v, {}) == {}\n\t\t",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "greetings"^#*expr.Constant_StringValue#:"tacocat"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformMapEntry(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    {}^#*expr.Expr_StructExpr#\n  )^#*expr.Expr_CallExpr#,\n  {}^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "[].all(i, i, i \u003c i)",
    ast: "[]^#*expr.Expr_ListExpr#.all(\n  i^#*expr.Expr_IdentExpr#,\n  i^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    i^#*expr.Expr_IdentExpr#,\n    i^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].all(__result__, i, __result__ \u003c i)",
    ast: "[]^#*expr.Expr_ListExpr#.all(\n  __result__^#*expr.Expr_IdentExpr#,\n  i^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    __result__^#*expr.Expr_IdentExpr#,\n    i^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].all(j, __result__, __result__ \u003c j)",
    ast: "[]^#*expr.Expr_ListExpr#.all(\n  j^#*expr.Expr_IdentExpr#,\n  __result__^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    __result__^#*expr.Expr_IdentExpr#,\n    j^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].all(i.j, k, i.j \u003c k)",
    ast: "[]^#*expr.Expr_ListExpr#.all(\n  i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].all(j, i.k, j \u003c i.k)",
    ast: "[]^#*expr.Expr_ListExpr#.all(\n  j^#*expr.Expr_IdentExpr#,\n  i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#,\n  _\u003c_(\n    j^#*expr.Expr_IdentExpr#,\n    i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "1.all(j, k, j \u003c k)",
    ast: "1^#*expr.Constant_Int64Value#.all(\n  j^#*expr.Expr_IdentExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    j^#*expr.Expr_IdentExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].exists(i.j, k, i.j \u003c k)",
    ast: "[]^#*expr.Expr_ListExpr#.exists(\n  i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].exists(j, i.k, j \u003c i.k)",
    ast: "[]^#*expr.Expr_ListExpr#.exists(\n  j^#*expr.Expr_IdentExpr#,\n  i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#,\n  _\u003c_(\n    j^#*expr.Expr_IdentExpr#,\n    i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "''.exists(j, k, j \u003c k)",
    ast: '""^#*expr.Constant_StringValue#.exists(\n  j^#*expr.Expr_IdentExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    j^#*expr.Expr_IdentExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "[].exists_one(i.j, k, i.j \u003c k)",
    ast: "[]^#*expr.Expr_ListExpr#.exists_one(\n  i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].existsOne(j, i.k, j \u003c i.k)",
    ast: "[]^#*expr.Expr_ListExpr#.existsOne(\n  j^#*expr.Expr_IdentExpr#,\n  i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#,\n  _\u003c_(\n    j^#*expr.Expr_IdentExpr#,\n    i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].exists_one(i.j, k, i.j \u003c k)",
    ast: "[]^#*expr.Expr_ListExpr#.exists_one(\n  i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "''.existsOne(j, k, j \u003c k)",
    ast: '""^#*expr.Constant_StringValue#.existsOne(\n  j^#*expr.Expr_IdentExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    j^#*expr.Expr_IdentExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "[].transformList(i.j, k, i.j + k)",
    ast: "[]^#*expr.Expr_ListExpr#.transformList(\n  i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _+_(\n    i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[].transformList(j, i.k, j + i.k)",
    ast: "[]^#*expr.Expr_ListExpr#.transformList(\n  j^#*expr.Expr_IdentExpr#,\n  i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#,\n  _+_(\n    j^#*expr.Expr_IdentExpr#,\n    i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{}.transformMap(i.j, k, i.j + k)",
    ast: "{}^#*expr.Expr_StructExpr#.transformMap(\n  i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  _+_(\n    i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n    k^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{}.transformMap(j, i.k, j + i.k)",
    ast: "{}^#*expr.Expr_StructExpr#.transformMap(\n  j^#*expr.Expr_IdentExpr#,\n  i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#,\n  _+_(\n    j^#*expr.Expr_IdentExpr#,\n    i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{}.transformMapEntry(j, i.k, {j: i.k})",
    ast: "{}^#*expr.Expr_StructExpr#.transformMapEntry(\n  j^#*expr.Expr_IdentExpr#,\n  i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#,\n  {\n    j^#*expr.Expr_IdentExpr#:i^#*expr.Expr_IdentExpr#.k^#*expr.Expr_SelectExpr#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{}.transformMapEntry(i.j, k, {k: i.j})",
    ast: "{}^#*expr.Expr_StructExpr#.transformMapEntry(\n  i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  {\n    k^#*expr.Expr_IdentExpr#:i^#*expr.Expr_IdentExpr#.j^#*expr.Expr_SelectExpr#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{}.transformMapEntry(j, k, 'bad filter', {k: j})",
    ast: '{}^#*expr.Expr_StructExpr#.transformMapEntry(\n  j^#*expr.Expr_IdentExpr#,\n  k^#*expr.Expr_IdentExpr#,\n  "bad filter"^#*expr.Constant_StringValue#,\n  {\n    k^#*expr.Expr_IdentExpr#:j^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "[1, 2].transformList(i, v, v % 2 == 0 ? [v] : v)",
    ast: "[\n  1^#*expr.Constant_Int64Value#,\n  2^#*expr.Constant_Int64Value#\n]^#*expr.Expr_ListExpr#.transformList(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _?_:_(\n    _==_(\n      _%_(\n        v^#*expr.Expr_IdentExpr#,\n        2^#*expr.Constant_Int64Value#\n      )^#*expr.Expr_CallExpr#,\n      0^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    [\n      v^#*expr.Expr_IdentExpr#\n    ]^#*expr.Expr_ListExpr#,\n    v^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{'hello': 'world', 'greetings': 'tacocat'}.transformMapEntry(k, v, []) == {}",
    ast: '_==_(\n  {\n    "hello"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n    "greetings"^#*expr.Constant_StringValue#:"tacocat"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#.transformMapEntry(\n    k^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    []^#*expr.Expr_ListExpr#\n  )^#*expr.Expr_CallExpr#,\n  {}^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "[1, 1].transformMapEntry(i, v, {v: i})",
    ast: "[\n  1^#*expr.Constant_Int64Value#,\n  1^#*expr.Constant_Int64Value#\n]^#*expr.Expr_ListExpr#.transformMapEntry(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  {\n    v^#*expr.Expr_IdentExpr#:i^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[0, 0u].transformMapEntry(i, v, {v: i})",
    ast: "[\n  0^#*expr.Constant_Int64Value#,\n  0u^#*expr.Constant_Uint64Value#\n]^#*expr.Expr_ListExpr#.transformMapEntry(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  {\n    v^#*expr.Expr_IdentExpr#:i^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "[0, 0u].transformMapEntry(i, v, {v: i})",
    ast: "[\n  0^#*expr.Constant_Int64Value#,\n  0u^#*expr.Constant_Uint64Value#\n]^#*expr.Expr_ListExpr#.transformMapEntry(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  {\n    v^#*expr.Expr_IdentExpr#:i^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{'a': 'world', 'b': 'hello'}.transformMap(i, v, i == 'a' ? v.upperAscii() : v)",
    ast: '{\n  "a"^#*expr.Constant_StringValue#:"world"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n  "b"^#*expr.Constant_StringValue#:"hello"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#.transformMap(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _?_:_(\n    _==_(\n      i^#*expr.Expr_IdentExpr#,\n      "a"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    v^#*expr.Expr_IdentExpr#.upperAscii()^#*expr.Expr_CallExpr#,\n    v^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "[1.0, 2.0, 2.0].transformList(i, v, i / 2.0 == 1.0)",
    ast: "[\n  1^#*expr.Constant_DoubleValue#,\n  2^#*expr.Constant_DoubleValue#,\n  2^#*expr.Constant_DoubleValue#\n]^#*expr.Expr_ListExpr#.transformList(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _==_(\n    _/_(\n      i^#*expr.Expr_IdentExpr#,\n      2^#*expr.Constant_DoubleValue#\n    )^#*expr.Expr_CallExpr#,\n    1^#*expr.Constant_DoubleValue#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "{'a': 'b', 'c': 'd'}.existsOne(k, v, k == 'b' || v == 'b')",
    ast: '{\n  "a"^#*expr.Constant_StringValue#:"b"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n  "c"^#*expr.Constant_StringValue#:"d"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#.existsOne(\n  k^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _||_(\n    _==_(\n      k^#*expr.Expr_IdentExpr#,\n      "b"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    _==_(\n      v^#*expr.Expr_IdentExpr#,\n      "b"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "{'a': 'b', 'c': 'd'}.exists(k, v, k == 'b' || v == 'b')",
    ast: '{\n  "a"^#*expr.Constant_StringValue#:"b"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#,\n  "c"^#*expr.Constant_StringValue#:"d"^#*expr.Constant_StringValue#^#*expr.Expr_CreateStruct_Entry#\n}^#*expr.Expr_StructExpr#.exists(\n  k^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _||_(\n    _==_(\n      k^#*expr.Expr_IdentExpr#,\n      "b"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#,\n    _==_(\n      v^#*expr.Expr_IdentExpr#,\n      "b"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "[null, null, 'hello', string].all(i, v, i == 0 || type(v) != int)",
    ast: '[\n  null^#*expr.Constant_NullValue#,\n  null^#*expr.Constant_NullValue#,\n  "hello"^#*expr.Constant_StringValue#,\n  string^#*expr.Expr_IdentExpr#\n]^#*expr.Expr_ListExpr#.all(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _||_(\n    _==_(\n      i^#*expr.Expr_IdentExpr#,\n      0^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    _!=_(\n      type(\n        v^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#,\n      int^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "x.transformMapEntry(i, v, {v: i}).size() \u003c y",
    ast: "_\u003c_(\n  x^#*expr.Expr_IdentExpr#.transformMapEntry(\n    i^#*expr.Expr_IdentExpr#,\n    v^#*expr.Expr_IdentExpr#,\n    {\n      v^#*expr.Expr_IdentExpr#:i^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n    }^#*expr.Expr_StructExpr#\n  )^#*expr.Expr_CallExpr#.size()^#*expr.Expr_CallExpr#,\n  y^#*expr.Expr_IdentExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "x.transformMapEntry(i, v, i \u003c y, {v: i})",
    ast: "x^#*expr.Expr_IdentExpr#.transformMapEntry(\n  i^#*expr.Expr_IdentExpr#,\n  v^#*expr.Expr_IdentExpr#,\n  _\u003c_(\n    i^#*expr.Expr_IdentExpr#,\n    y^#*expr.Expr_IdentExpr#\n  )^#*expr.Expr_CallExpr#,\n  {\n    v^#*expr.Expr_IdentExpr#:i^#*expr.Expr_IdentExpr#^#*expr.Expr_CreateStruct_Entry#\n  }^#*expr.Expr_StructExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "x.exists(val, y.exists(key, _, key == val))",
    ast: "__comprehension__(\n  // Variable\n  val,\n  // Target\n  x^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  false^#*expr.Constant_BoolValue#,\n  // LoopCondition\n  @not_strictly_false(\n    !_(\n      __result__^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  // LoopStep\n  _||_(\n    __result__^#*expr.Expr_IdentExpr#,\n    y^#*expr.Expr_IdentExpr#.exists(\n      key^#*expr.Expr_IdentExpr#,\n      _^#*expr.Expr_IdentExpr#,\n      _==_(\n        key^#*expr.Expr_IdentExpr#,\n        val^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "x.exists(val, y.exists(key, _, key == val))",
    ast: "__comprehension__(\n  // Variable\n  val,\n  // Target\n  x^#*expr.Expr_IdentExpr#,\n  // Accumulator\n  __result__,\n  // Init\n  false^#*expr.Constant_BoolValue#,\n  // LoopCondition\n  @not_strictly_false(\n    !_(\n      __result__^#*expr.Expr_IdentExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  // LoopStep\n  _||_(\n    __result__^#*expr.Expr_IdentExpr#,\n    y^#*expr.Expr_IdentExpr#.exists(\n      key^#*expr.Expr_IdentExpr#,\n      _^#*expr.Expr_IdentExpr#,\n      _==_(\n        key^#*expr.Expr_IdentExpr#,\n        val^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#,\n  // Result\n  __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#",
  },
  {
    expr: "x.exists(val, y.exists(key, _, key == val)) \u0026\u0026 y.all(key, val, val.startsWith('h'))",
    ast: '_\u0026\u0026_(\n  __comprehension__(\n    // Variable\n    val,\n    // Target\n    x^#*expr.Expr_IdentExpr#,\n    // Accumulator\n    __result__,\n    // Init\n    false^#*expr.Constant_BoolValue#,\n    // LoopCondition\n    @not_strictly_false(\n      !_(\n        __result__^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#,\n    // LoopStep\n    _||_(\n      __result__^#*expr.Expr_IdentExpr#,\n      y^#*expr.Expr_IdentExpr#.exists(\n        key^#*expr.Expr_IdentExpr#,\n        _^#*expr.Expr_IdentExpr#,\n        _==_(\n          key^#*expr.Expr_IdentExpr#,\n          val^#*expr.Expr_IdentExpr#\n        )^#*expr.Expr_CallExpr#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#,\n    // Result\n    __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#,\n  y^#*expr.Expr_IdentExpr#.all(\n    key^#*expr.Expr_IdentExpr#,\n    val^#*expr.Expr_IdentExpr#,\n    val^#*expr.Expr_IdentExpr#.startsWith(\n      "h"^#*expr.Constant_StringValue#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#',
  },
  {
    expr: "x.exists(val, y.exists(key, _, key == val)) || x[0] == 0 || x[1] == 1 || x[2] == 2",
    ast: "_||_(\n  __comprehension__(\n    // Variable\n    val,\n    // Target\n    x^#*expr.Expr_IdentExpr#,\n    // Accumulator\n    __result__,\n    // Init\n    false^#*expr.Constant_BoolValue#,\n    // LoopCondition\n    @not_strictly_false(\n      !_(\n        __result__^#*expr.Expr_IdentExpr#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#,\n    // LoopStep\n    _||_(\n      __result__^#*expr.Expr_IdentExpr#,\n      y^#*expr.Expr_IdentExpr#.exists(\n        key^#*expr.Expr_IdentExpr#,\n        _^#*expr.Expr_IdentExpr#,\n        _==_(\n          key^#*expr.Expr_IdentExpr#,\n          val^#*expr.Expr_IdentExpr#\n        )^#*expr.Expr_CallExpr#\n      )^#*expr.Expr_CallExpr#\n    )^#*expr.Expr_CallExpr#,\n    // Result\n    __result__^#*expr.Expr_IdentExpr#)^#*expr.Expr_ComprehensionExpr#,\n  _==_(\n    _[_](\n      x^#*expr.Expr_IdentExpr#,\n      0^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    0^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#,\n  _==_(\n    _[_](\n      x^#*expr.Expr_IdentExpr#,\n      1^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    1^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#,\n  _==_(\n    _[_](\n      x^#*expr.Expr_IdentExpr#,\n      2^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#,\n    2^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "x.exists(val, y.exists(key, _, key == val)) || (x[?0].hasValue() \u0026\u0026 x[?1].hasValue())",
    error:
      "ERROR: \u003cinput\u003e:1:50: unsupported syntax '[?'\n | x.exists(val, y.exists(key, _, key == val)) || (x[?0].hasValue() \u0026\u0026 x[?1].hasValue())\n | .................................................^\nERROR: \u003cinput\u003e:1:70: unsupported syntax '[?'\n | x.exists(val, y.exists(key, _, key == val)) || (x[?0].hasValue() \u0026\u0026 x[?1].hasValue())\n | .....................................................................^",
  },
  {
    expr: "x.exists(key, val, y[?key] == optional.of(val))",
    error:
      "ERROR: \u003cinput\u003e:1:21: unsupported syntax '[?'\n | x.exists(key, val, y[?key] == optional.of(val))\n | ....................^",
  },
  {
    expr: "y.exists(key, y[?key] == x[?key])",
    error:
      "ERROR: \u003cinput\u003e:1:16: unsupported syntax '[?'\n | y.exists(key, y[?key] == x[?key])\n | ...............^\nERROR: \u003cinput\u003e:1:27: unsupported syntax '[?'\n | y.exists(key, y[?key] == x[?key])\n | ..........................^",
  },
  {
    expr: "cel.bind(z, y[0], z + y[1])",
    ast: "cel^#*expr.Expr_IdentExpr#.bind(\n  z^#*expr.Expr_IdentExpr#,\n  _[_](\n    y^#*expr.Expr_IdentExpr#,\n    0^#*expr.Constant_Int64Value#\n  )^#*expr.Expr_CallExpr#,\n  _+_(\n    z^#*expr.Expr_IdentExpr#,\n    _[_](\n      y^#*expr.Expr_IdentExpr#,\n      1^#*expr.Constant_Int64Value#\n    )^#*expr.Expr_CallExpr#\n  )^#*expr.Expr_CallExpr#\n)^#*expr.Expr_CallExpr#",
  },
  {
    expr: "cel.bind(z, y[0], x.all(i, val, val == z || optional.of(val) == y[?i]))",
    error:
      "ERROR: \u003cinput\u003e:1:66: unsupported syntax '[?'\n | cel.bind(z, y[0], x.all(i, val, val == z || optional.of(val) == y[?i]))\n | .................................................................^",
  },
] as const;
