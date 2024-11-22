import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "macros",
  description: "Tests for CEL macros.",
  section: [
    {
      name: "exists",
      description:
        "Tests for the .exists() macro, which is equivalent to joining the evaluated elements with logical-OR.",
      test: [
        {
          name: "list_elem_all_true",
          expr: "[1, 2, 3].exists(e, e > 0)",
          value: { boolValue: true },
        },
        {
          name: "list_elem_some_true",
          expr: "[1, 2, 3].exists(e, e == 2)",
          value: { boolValue: true },
        },
        {
          name: "list_elem_none_true",
          expr: "[1, 2, 3].exists(e, e > 3)",
          value: { boolValue: false },
        },
        {
          name: "list_elem_type_shortcircuit",
          description: "Exists filter is true for the last element.",
          expr: "[1, 'foo', 3].exists(e, e != '1')",
          value: { boolValue: true },
        },
        {
          name: "list_elem_type_exhaustive",
          description:
            "Exists filter is never true, but heterogenous equality ensure the result is false.",
          expr: "[1, 'foo', 3].exists(e, e == '10')",
          value: { boolValue: false },
        },
        {
          name: "list_elem_exists_error",
          expr: "[1, 2, 3].exists(e, e / 0 == 17)",
          evalError: { errors: [{ message: "divide by zero" }] },
        },
        {
          name: "list_empty",
          expr: "[].exists(e, e == 2)",
          value: { boolValue: false },
        },
        {
          name: "map_key",
          expr: "{'key1':1, 'key2':2}.exists(k, k == 'key2')",
          value: { boolValue: true },
        },
        {
          name: "not_map_key",
          expr: "!{'key1':1, 'key2':2}.exists(k, k == 'key3')",
          value: { boolValue: true },
        },
        {
          name: "map_key_type_shortcircuit",
          description: "Exists filter is true for the second key",
          expr: "{'key':1, 1:21}.exists(k, k != 2)",
          value: { boolValue: true },
        },
        {
          name: "map_key_type_exhaustive",
          description:
            "Exists filter is never true, but heterogeneous equality ensures the result is false.",
          expr: "!{'key':1, 1:42}.exists(k, k == 2)",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "all",
      description:
        "Tests for the .all() macro, which is equivalent to joining the evaluated elements with logical-AND.",
      test: [
        {
          name: "list_elem_all_true",
          expr: "[1, 2, 3].all(e, e > 0)",
          value: { boolValue: true },
        },
        {
          name: "list_elem_some_true",
          expr: "[1, 2, 3].all(e, e == 2)",
          value: { boolValue: false },
        },
        {
          name: "list_elem_none_true",
          expr: "[1, 2, 3].all(e, e == 17)",
          value: { boolValue: false },
        },
        {
          name: "list_elem_type_shortcircuit",
          expr: "[1, 'foo', 3].all(e, e == 1)",
          value: { boolValue: false },
        },
        {
          name: "list_elem_type_exhaustive",
          expr: "[1, 'foo', 3].all(e, e % 2 == 1)",
          evalError: { errors: [{ message: "no_such_overload" }] },
        },
        {
          name: "list_elem_error_shortcircuit",
          expr: "[1, 2, 3].all(e, 6 / (2 - e) == 6)",
          value: { boolValue: false },
        },
        {
          name: "list_elem_error_exhaustive",
          expr: "[1, 2, 3].all(e, e / 0 != 17)",
          evalError: { errors: [{ message: "divide by zero" }] },
        },
        {
          name: "list_empty",
          expr: "[].all(e, e > 0)",
          value: { boolValue: true },
        },
        {
          name: "map_key",
          expr: "{'key1':1, 'key2':2}.all(k, k == 'key2')",
          value: { boolValue: false },
        },
      ],
    },
    {
      name: "exists_one",
      description:
        "Tests for exists_one() macro. An expression 'L.exists_one(I, E)' is equivalent to 'size(L.filter(I, E)) == 1'.",
      test: [
        {
          name: "list_empty",
          expr: "[].exists_one(a, a == 7)",
          value: { boolValue: false },
        },
        {
          name: "list_one_true",
          expr: "[7].exists_one(a, a == 7)",
          value: { boolValue: true },
        },
        {
          name: "list_one_false",
          expr: "[8].exists_one(a, a == 7)",
          value: { boolValue: false },
        },
        {
          name: "list_none",
          expr: "[1, 2, 3].exists_one(x, x > 20)",
          value: { boolValue: false },
        },
        {
          name: "list_one",
          expr: "[6, 7, 8].exists_one(foo, foo % 5 == 2)",
          value: { boolValue: true },
        },
        {
          name: "list_many",
          expr: "[0, 1, 2, 3, 4].exists_one(n, n % 2 == 1)",
          value: { boolValue: false },
        },
        {
          name: "list_all",
          expr: "['foal', 'foo', 'four'].exists_one(n, n.startsWith('fo'))",
          value: { boolValue: false },
        },
        {
          name: "list_no_shortcircuit",
          description: "Errors invalidate everything, even if already false.",
          expr: "[3, 2, 1, 0].exists_one(n, 12 / n > 1)",
          evalError: { errors: [{ message: "divide by zero" }] },
        },
        {
          name: "map_one",
          expr: "{6: 'six', 7: 'seven', 8: 'eight'}.exists_one(foo, foo % 5 == 2)",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "map",
      description: "Tests for map() macro.",
      test: [
        {
          name: "list_empty",
          expr: "[].map(n, n / 2)",
          value: { listValue: {} },
        },
        {
          name: "list_one",
          expr: "[3].map(n, n * n)",
          value: { listValue: { values: [{ int64Value: "9" }] } },
        },
        {
          name: "list_many",
          expr: "[2, 4, 6].map(n, n / 2)",
          value: {
            listValue: {
              values: [
                { int64Value: "1" },
                { int64Value: "2" },
                { int64Value: "3" },
              ],
            },
          },
        },
        {
          name: "list_error",
          expr: "[2, 1, 0].map(n, 4 / n)",
          evalError: { errors: [{ message: "divide by zero" }] },
        },
      ],
    },
    {
      name: "filter",
      description: "Tests for filter() macro.",
      test: [
        {
          name: "list_empty",
          expr: "[].filter(n, n % 2 == 0)",
          value: { listValue: {} },
        },
        {
          name: "list_one_true",
          expr: "[2].filter(n, n == 2)",
          value: { listValue: { values: [{ int64Value: "2" }] } },
        },
        {
          name: "list_one_false",
          expr: "[1].filter(n, n > 3)",
          value: { listValue: {} },
        },
        {
          name: "list_none",
          expr: "[1, 2, 3].filter(e, e > 3)",
          value: { listValue: {} },
        },
        {
          name: "list_some",
          expr: "[0, 1, 2, 3, 4].filter(x, x % 2 == 1)",
          value: {
            listValue: { values: [{ int64Value: "1" }, { int64Value: "3" }] },
          },
        },
        {
          name: "list_all",
          expr: "[1, 2, 3].filter(n, n > 0)",
          value: {
            listValue: {
              values: [
                { int64Value: "1" },
                { int64Value: "2" },
                { int64Value: "3" },
              ],
            },
          },
        },
        {
          name: "list_no_shortcircuit",
          expr: "[3, 2, 1, 0].filter(n, 12 / n > 4)",
          evalError: { errors: [{ message: "divide by zero" }] },
        },
      ],
    },
    {
      name: "nested",
      description: "Tests with nested macros.",
      test: [
        {
          name: "filter_all",
          expr: "['signer'].filter(signer, ['artifact'].all(artifact, true))",
          value: { listValue: { values: [{ stringValue: "signer" }] } },
        },
        {
          name: "all_all",
          expr: "['signer'].all(signer, ['artifact'].all(artifact, true))",
          value: { boolValue: true },
        },
      ],
    },
  ],
};
