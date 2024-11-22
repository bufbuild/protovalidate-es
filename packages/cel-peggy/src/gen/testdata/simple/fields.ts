import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "fields",
  description: "Tests for field access in maps.",
  section: [
    {
      name: "map_fields",
      description: "select an element in a map",
      test: [
        {
          name: "map_key_int64",
          expr: "{0:1,2:2,5:true}[5]",
          value: { boolValue: true },
        },
        {
          name: "map_key_uint64",
          expr: "{0u:1u,2u:'happy',5u:3u}[2u]",
          value: { stringValue: "happy" },
        },
        {
          name: "map_key_string",
          expr: "{'name':100u}['name']",
          value: { uint64Value: "100" },
        },
        {
          name: "map_key_bool",
          expr: "{true:5}[true]",
          value: { int64Value: "5" },
        },
        {
          name: "map_key_mixed_type",
          expr: "{true:1,2:2,5u:3}[true]",
          value: { int64Value: "1" },
        },
        {
          name: "map_key_mixed_numbers_double_key",
          expr: "{1u: 1.0, 2: 2.0, 3u: 3.0}[3.0]",
          value: { doubleValue: 3 },
        },
        {
          name: "map_key_mixed_numbers_lossy_double_key",
          expr: "{1u: 1.0, 2: 2.0, 3u: 3.0}[3.1]",
          evalError: { errors: [{ message: "no such key" }] },
        },
        {
          name: "map_key_mixed_numbers_uint_key",
          expr: "{1u: 1.0, 2: 2.0, 3u: 3.0}[2u]",
          value: { doubleValue: 2 },
        },
        {
          name: "map_key_mixed_numbers_int_key",
          expr: "{1u: 1.0, 2: 2.0, 3u: 3.0}[1]",
          value: { doubleValue: 1 },
        },
        {
          name: "map_field_access",
          expr: "x.name",
          typeEnv: [
            {
              name: "x",
              ident: {
                type: {
                  mapType: {
                    keyType: { primitive: "STRING" },
                    valueType: { primitive: "INT64" },
                  },
                },
              },
            },
          ],
          bindings: {
            x: {
              value: {
                mapValue: {
                  entries: [
                    {
                      key: { stringValue: "name" },
                      value: { int64Value: "1024" },
                    },
                  ],
                },
              },
            },
          },
          value: { int64Value: "1024" },
        },
        {
          name: "map_no_such_key",
          expr: "{0:1,2:2,5:3}[1]",
          evalError: { errors: [{ message: "no such key" }] },
        },
        {
          name: "map_field_select_no_such_key",
          expr: "x.name",
          typeEnv: [
            {
              name: "x",
              ident: {
                type: {
                  mapType: {
                    keyType: { primitive: "STRING" },
                    valueType: { primitive: "STRING" },
                  },
                },
              },
            },
          ],
          bindings: {
            x: {
              value: {
                mapValue: {
                  entries: [
                    {
                      key: { stringValue: "holiday" },
                      value: { stringValue: "field" },
                    },
                  ],
                },
              },
            },
          },
          evalError: { errors: [{ message: "no such key: 'name'" }] },
        },
        {
          name: "map_value_null",
          expr: "{true:null}[true]",
          value: { nullValue: null },
        },
        {
          name: "map_value_bool",
          expr: "{27:false}[27]",
          value: { boolValue: false },
        },
        {
          name: "map_value_string",
          expr: "{'n':'x'}['n']",
          value: { stringValue: "x" },
        },
        {
          name: "map_value_float",
          expr: "{3:15.15}[3]",
          value: { doubleValue: 15.15 },
        },
        {
          name: "map_value_uint64",
          expr: "{0u:1u,2u:2u,5u:3u}[0u]",
          value: { uint64Value: "1" },
        },
        {
          name: "map_value_int64",
          expr: "{true:1,false:2}[true]",
          value: { int64Value: "1" },
        },
        {
          name: "map_value_bytes",
          expr: '{0:b""}[0]',
          value: { bytesValue: "" },
        },
        {
          name: "map_value_list",
          expr: "{0u:[1]}[0u]",
          value: { listValue: { values: [{ int64Value: "1" }] } },
        },
        {
          name: "map_value_map",
          expr: '{"map": {"k": "v"}}["map"]',
          value: {
            mapValue: {
              entries: [
                { key: { stringValue: "k" }, value: { stringValue: "v" } },
              ],
            },
          },
        },
        {
          name: "map_value_mix_type",
          expr: '{"map": {"k": "v"}, "list": [1]}["map"]',
          value: {
            mapValue: {
              entries: [
                { key: { stringValue: "k" }, value: { stringValue: "v" } },
              ],
            },
          },
        },
      ],
    },
    {
      name: "map_has",
      description: "Has macro for map entries.",
      test: [
        {
          name: "has",
          expr: "has({'a': 1, 'b': 2}.a)",
          value: { boolValue: true },
        },
        {
          name: "has_not",
          expr: "has({'a': 1, 'b': 2}.c)",
          value: { boolValue: false },
        },
        { name: "has_empty", expr: "has({}.a)", value: { boolValue: false } },
      ],
    },
    {
      name: "qualified_identifier_resolution",
      description: "Tests for qualified identifier resolution.",
      test: [
        {
          name: "qualified_ident",
          expr: "a.b.c",
          typeEnv: [
            { name: "a.b.c", ident: { type: { primitive: "STRING" } } },
          ],
          bindings: { "a.b.c": { value: { stringValue: "yeah" } } },
          value: { stringValue: "yeah" },
        },
        {
          name: "map_field_select",
          expr: "a.b.c",
          typeEnv: [
            {
              name: "a.b",
              ident: {
                type: {
                  mapType: {
                    keyType: { primitive: "STRING" },
                    valueType: { primitive: "STRING" },
                  },
                },
              },
            },
          ],
          bindings: {
            "a.b": {
              value: {
                mapValue: {
                  entries: [
                    {
                      key: { stringValue: "c" },
                      value: { stringValue: "yeah" },
                    },
                  ],
                },
              },
            },
          },
          value: { stringValue: "yeah" },
        },
        {
          name: "qualified_identifier_resolution_unchecked",
          description:
            "namespace resolution should try to find the longest prefix for the evaluator.",
          expr: "a.b.c",
          disableCheck: true,
          typeEnv: [
            { name: "a.b.c", ident: { type: { primitive: "STRING" } } },
            {
              name: "a.b",
              ident: {
                type: {
                  mapType: {
                    keyType: { primitive: "STRING" },
                    valueType: { primitive: "STRING" },
                  },
                },
              },
            },
          ],
          bindings: {
            "a.b": {
              value: {
                mapValue: {
                  entries: [
                    {
                      key: { stringValue: "c" },
                      value: { stringValue: "oops" },
                    },
                  ],
                },
              },
            },
            "a.b.c": { value: { stringValue: "yeah" } },
          },
          value: { stringValue: "yeah" },
        },
        {
          name: "list_field_select_unsupported",
          expr: "a.b.pancakes",
          disableCheck: true,
          typeEnv: [
            {
              name: "a.b",
              ident: {
                type: { listType: { elemType: { primitive: "STRING" } } },
              },
            },
          ],
          bindings: {
            "a.b": {
              value: { listValue: { values: [{ stringValue: "pancakes" }] } },
            },
          },
          evalError: {
            errors: [
              {
                message:
                  "type 'list_type:<elem_type:<primitive:STRING > > ' does not support field selection",
              },
            ],
          },
        },
        {
          name: "int64_field_select_unsupported",
          expr: "a.pancakes",
          disableCheck: true,
          typeEnv: [{ name: "a", ident: { type: { primitive: "INT64" } } }],
          bindings: { a: { value: { int64Value: "15" } } },
          evalError: {
            errors: [
              { message: "type 'int64_type' does not support field selection" },
            ],
          },
        },
        {
          name: "ident_with_longest_prefix_check",
          description:
            "namespace resolution should try to find the longest prefix for the checker.",
          expr: "a.b.c",
          typeEnv: [
            { name: "a.b.c", ident: { type: { primitive: "STRING" } } },
            {
              name: "a.b",
              ident: {
                type: {
                  mapType: {
                    keyType: { primitive: "STRING" },
                    valueType: { primitive: "STRING" },
                  },
                },
              },
            },
          ],
          bindings: {
            "a.b": {
              value: {
                mapValue: {
                  entries: [
                    {
                      key: { stringValue: "c" },
                      value: { stringValue: "oops" },
                    },
                  ],
                },
              },
            },
            "a.b.c": { value: { stringValue: "yeah" } },
          },
          value: { stringValue: "yeah" },
        },
        {
          name: "map_key_float",
          description: "map should not support float as the key.",
          expr: "{3.3:15.15, 1.0: 5}[1.0]",
          disableCheck: true,
          evalError: { errors: [{ message: "unsupported key type" }] },
        },
        {
          name: "map_key_null",
          description: "map should not support null as the key.",
          expr: "{null:false}[null]",
          disableCheck: true,
          evalError: { errors: [{ message: "unsupported key type" }] },
        },
        {
          name: "map_value_repeat_key",
          description: "map should not support repeated key.",
          expr: "{true:1,false:2,true:3}[true]",
          evalError: { errors: [{ message: "Failed with repeated key" }] },
        },
      ],
    },
    {
      name: "in",
      description: "Tests for 'in' operator for maps.",
      test: [
        { name: "empty", expr: "7 in {}", value: { boolValue: false } },
        {
          name: "singleton",
          expr: "true in {true: 1}",
          value: { boolValue: true },
        },
        {
          name: "present",
          expr: "'George' in {'John': 'smart', 'Paul': 'cute', 'George': 'quiet', 'Ringo': 'funny'}",
          value: { boolValue: true },
        },
        {
          name: "absent",
          expr: "'spider' in {'ant': 6, 'fly': 6, 'centipede': 100}",
          value: { boolValue: false },
        },
        {
          name: "mixed_numbers_and_keys_present",
          expr: "3.0 in {1: 1, 2: 2, 3u: 3} && 2u in {1u: 1, 2: 2} && 1 in {1u: 1, 2: 2}",
          value: { boolValue: true },
        },
        {
          name: "mixed_numbers_and_keys_absent",
          expr: "3.1 in {1: 1, 2: 2, 3u: 3}",
          value: { boolValue: false },
        },
      ],
    },
  ],
};
