import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "basic",
  description: "Basic conformance tests that all implementations should pass.",
  section: [
    {
      name: "self_eval_zeroish",
      description: "Simple self-evaluating forms to zero-ish values.",
      test: [
        { name: "self_eval_int_zero", expr: "0", value: { int64Value: "0" } },
        {
          name: "self_eval_uint_zero",
          expr: "0u",
          value: { uint64Value: "0" },
        },
        {
          name: "self_eval_uint_alias_zero",
          expr: "0U",
          value: { uint64Value: "0" },
        },
        {
          name: "self_eval_float_zero",
          expr: "0.0",
          value: { doubleValue: 0 },
        },
        {
          name: "self_eval_float_zerowithexp",
          expr: "0e+0",
          value: { doubleValue: 0 },
        },
        {
          name: "self_eval_string_empty",
          expr: "''",
          value: { stringValue: "" },
        },
        {
          name: "self_eval_string_empty_quotes",
          expr: '""',
          value: { stringValue: "" },
        },
        {
          name: "self_eval_string_raw_prefix",
          expr: 'r""',
          value: { stringValue: "" },
        },
        {
          name: "self_eval_bytes_empty",
          expr: 'b""',
          value: { bytesValue: "" },
        },
        {
          name: "self_eval_bool_false",
          expr: "false",
          value: { boolValue: false },
        },
        { name: "self_eval_null", expr: "null", value: { nullValue: null } },
        { name: "self_eval_empty_list", expr: "[]", value: { listValue: {} } },
        { name: "self_eval_empty_map", expr: "{}", value: { mapValue: {} } },
        {
          name: "self_eval_string_raw_prefix_triple_double",
          expr: 'r""""""',
          value: { stringValue: "" },
        },
        {
          name: "self_eval_string_raw_prefix_triple_single",
          expr: "r''''''",
          value: { stringValue: "" },
        },
      ],
    },
    {
      name: "self_eval_nonzeroish",
      description: "Simple self-evaluating forms to non-zero-ish values.",
      test: [
        {
          name: "self_eval_int_nonzero",
          expr: "42",
          value: { int64Value: "42" },
        },
        {
          name: "self_eval_uint_nonzero",
          expr: "123456789u",
          value: { uint64Value: "123456789" },
        },
        {
          name: "self_eval_uint_alias_nonzero",
          expr: "123456789U",
          value: { uint64Value: "123456789" },
        },
        {
          name: "self_eval_int_negative_min",
          expr: "-9223372036854775808",
          value: { int64Value: "-9223372036854775808" },
        },
        {
          name: "self_eval_float_negative_exp",
          expr: "-2.3e+1",
          value: { doubleValue: -23 },
        },
        {
          name: "self_eval_string_excl",
          expr: '"!"',
          value: { stringValue: "!" },
        },
        {
          name: "self_eval_string_escape",
          expr: "'\\''",
          value: { stringValue: "'" },
        },
        {
          name: "self_eval_bytes_escape",
          expr: "b'ÿ'",
          value: { bytesValue: "w78=" },
        },
        {
          name: "self_eval_bytes_invalid_utf8",
          expr: "b'\\000\\xff'",
          value: { bytesValue: "AP8=" },
        },
        {
          name: "self_eval_list_singleitem",
          expr: "[-1]",
          value: { listValue: { values: [{ int64Value: "-1" }] } },
        },
        {
          name: "self_eval_map_singleitem",
          expr: '{"k":"v"}',
          value: {
            mapValue: {
              entries: [
                { key: { stringValue: "k" }, value: { stringValue: "v" } },
              ],
            },
          },
        },
        {
          name: "self_eval_bool_true",
          expr: "true",
          value: { boolValue: true },
        },
        {
          name: "self_eval_int_hex",
          expr: "0x55555555",
          value: { int64Value: "1431655765" },
        },
        {
          name: "self_eval_int_hex_negative",
          expr: "-0x55555555",
          value: { int64Value: "-1431655765" },
        },
        {
          name: "self_eval_uint_hex",
          expr: "0x55555555u",
          value: { uint64Value: "1431655765" },
        },
        {
          name: "self_eval_uint_alias_hex",
          expr: "0x55555555U",
          value: { uint64Value: "1431655765" },
        },
        {
          name: "self_eval_unicode_escape_four",
          expr: '"\\u270c"',
          value: { stringValue: "✌" },
        },
        {
          name: "self_eval_unicode_escape_eight",
          expr: '"\\U0001f431"',
          value: { stringValue: "🐱" },
        },
        {
          name: "self_eval_ascii_escape_seq",
          expr: '"\\a\\b\\f\\n\\r\\t\\v\\"\\\'\\\\"',
          value: { stringValue: "\u0007\b\f\n\r\t\u000b\"'\\" },
        },
      ],
    },
    {
      name: "variables",
      description: "Variable lookups.",
      test: [
        {
          name: "self_eval_bound_lookup",
          expr: "x",
          typeEnv: [{ name: "x", ident: { type: { primitive: "INT64" } } }],
          bindings: { x: { value: { int64Value: "123" } } },
          value: { int64Value: "123" },
        },
        {
          name: "self_eval_unbound_lookup",
          description:
            "An unbound variable should be marked as an error during execution. See google/cel-go#154",
          expr: "x",
          disableCheck: true,
          evalError: {
            errors: [
              { message: "undeclared reference to 'x' (in container '')" },
            ],
          },
        },
        {
          name: "unbound_is_runtime_error",
          description:
            "Make sure we can short-circuit around an unbound variable.",
          expr: "x || true",
          disableCheck: true,
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "functions",
      description: "Basic mechanisms for function calls.",
      test: [
        { name: "binop", expr: "1 + 1", value: { int64Value: "2" } },
        {
          name: "unbound",
          expr: "f_unknown(17)",
          disableCheck: true,
          evalError: { errors: [{ message: "unbound function" }] },
        },
        {
          name: "unbound_is_runtime_error",
          expr: "f_unknown(17) || true",
          disableCheck: true,
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "reserved_const",
      description: "Named constants should never be shadowed by identifiers.",
      test: [
        {
          name: "false",
          expr: "false",
          typeEnv: [{ name: "false", ident: { type: { primitive: "BOOL" } } }],
          bindings: { false: { value: { boolValue: true } } },
          value: { boolValue: false },
        },
        {
          name: "true",
          expr: "true",
          typeEnv: [{ name: "true", ident: { type: { primitive: "BOOL" } } }],
          bindings: { true: { value: { boolValue: false } } },
          value: { boolValue: true },
        },
        {
          name: "null",
          expr: "null",
          typeEnv: [{ name: "null", ident: { type: { primitive: "BOOL" } } }],
          bindings: { null: { value: { boolValue: true } } },
          value: { nullValue: null },
        },
      ],
    },
  ],
};
