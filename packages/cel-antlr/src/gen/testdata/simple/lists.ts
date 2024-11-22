import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "lists",
  description: "Tests for list operations.",
  section: [
    {
      name: "concatentation",
      description: "Tests for list concatenation.",
      test: [
        {
          name: "list_append",
          expr: "[0, 1, 2] + [3, 4, 5] == [0, 1, 2, 3, 4, 5]",
          value: { boolValue: true },
        },
        {
          name: "list_not_commutative",
          expr: "[0, 1, 2] + [3, 4, 5] == [3, 4, 5, 0, 1, 2]",
          value: { boolValue: false },
        },
        {
          name: "list_repeat",
          expr: "[2] + [2]",
          value: {
            listValue: { values: [{ int64Value: "2" }, { int64Value: "2" }] },
          },
        },
        { name: "empty_empty", expr: "[] + []", value: { listValue: {} } },
        {
          name: "left_unit",
          expr: "[] + [3, 4]",
          value: {
            listValue: { values: [{ int64Value: "3" }, { int64Value: "4" }] },
          },
        },
        {
          name: "right_unit",
          expr: "[1, 2] + []",
          value: {
            listValue: { values: [{ int64Value: "1" }, { int64Value: "2" }] },
          },
        },
      ],
    },
    {
      name: "index",
      description: "List indexing tests.",
      test: [
        {
          name: "zero_based",
          expr: "[7, 8, 9][0]",
          value: { int64Value: "7" },
        },
        {
          name: "zero_based_double",
          expr: "[7, 8, 9][dyn(0.0)]",
          value: { int64Value: "7" },
        },
        {
          name: "zero_based_double_error",
          expr: "[7, 8, 9][dyn(0.1)]",
          evalError: { errors: [{ message: "invalid_argument" }] },
        },
        {
          name: "zero_based_uint",
          expr: "[7, 8, 9][dyn(0u)]",
          value: { int64Value: "7" },
        },
        {
          name: "singleton",
          expr: "['foo'][0]",
          value: { stringValue: "foo" },
        },
        {
          name: "middle",
          expr: "[0, 1, 1, 2, 3, 5, 8, 13][4]",
          value: { int64Value: "3" },
        },
        {
          name: "last",
          expr: "['George', 'John', 'Paul', 'Ringo'][3]",
          value: { stringValue: "Ringo" },
        },
        {
          name: "range",
          expr: "[1, 2, 3][3]",
          evalError: { errors: [{ message: "invalid_argument" }] },
        },
      ],
    },
    {
      name: "in",
      description: "List membership tests.",
      test: [
        { name: "empty", expr: "7 in []", value: { boolValue: false } },
        { name: "singleton", expr: "4u in [4u]", value: { boolValue: true } },
        {
          name: "first",
          expr: "'alpha' in ['alpha', 'beta', 'gamma']",
          value: { boolValue: true },
        },
        {
          name: "middle",
          expr: "3 in [5, 4, 3, 2, 1]",
          value: { boolValue: true },
        },
        {
          name: "last",
          expr: "20u in [4u, 6u, 8u, 12u, 20u]",
          value: { boolValue: true },
        },
        {
          name: "double_in_ints",
          expr: "dyn(3.0) in [5, 4, 3, 2, 1]",
          value: { boolValue: true },
        },
        {
          name: "uint_in_ints",
          expr: "dyn(3u) in [5, 4, 3, 2, 1]",
          value: { boolValue: true },
        },
        {
          name: "int_in_doubles",
          expr: "dyn(3) in [5.0, 4.0, 3.0, 2.0, 1.0]",
          value: { boolValue: true },
        },
        {
          name: "uint_in_doubles",
          expr: "dyn(3u) in [5.0, 4.0, 3.0, 2.0, 1.0]",
          value: { boolValue: true },
        },
        {
          name: "int_in_uints",
          expr: "dyn(3) in [5u, 4u, 3u, 2u, 1u]",
          value: { boolValue: true },
        },
        {
          name: "double_in_uints",
          expr: "dyn(3.0) in [5u, 4u, 3u, 2u, 1u]",
          value: { boolValue: true },
        },
        {
          name: "missing",
          expr: "'hawaiian' in ['meat', 'veggie', 'margarita', 'cheese']",
          value: { boolValue: false },
        },
      ],
    },
    {
      name: "size",
      description: "List and map size tests.",
      test: [
        { name: "list_empty", expr: "size([])", value: { int64Value: "0" } },
        { name: "list", expr: "size([1, 2, 3])", value: { int64Value: "3" } },
        { name: "map_empty", expr: "size({})", value: { int64Value: "0" } },
        {
          name: "map",
          expr: "size({1: 'one', 2: 'two', 3: 'three'})",
          value: { int64Value: "3" },
        },
      ],
    },
  ],
};
