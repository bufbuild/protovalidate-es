import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "conversions",
  description: "Tests for type conversions.",
  section: [
    {
      name: "bytes",
      description: "Conversions to bytes.",
      test: [
        { name: "string_empty", expr: "bytes('')", value: { bytesValue: "" } },
        { name: "string", expr: "bytes('abc')", value: { bytesValue: "YWJj" } },
        {
          name: "string_unicode",
          expr: "bytes('ÿ')",
          value: { bytesValue: "w78=" },
        },
        {
          name: "string_unicode_vs_literal",
          expr: "bytes('\\377') == b'\\377'",
          value: { boolValue: false },
        },
      ],
    },
    {
      name: "double",
      description: "Conversions to double.",
      test: [
        { name: "int_zero", expr: "double(0)", value: { doubleValue: 0 } },
        {
          name: "int_pos",
          expr: "double(1000000000000)",
          value: { doubleValue: 1000000000000 },
        },
        {
          name: "int_neg",
          expr: "double(-1000000000000000)",
          value: { doubleValue: -1000000000000000 },
        },
        {
          name: "int_min_exact",
          description: "Smallest contiguous representable int (-2^53).",
          expr: "double(-9007199254740992)",
          value: { doubleValue: -9007199254740992 },
        },
        {
          name: "int_max_exact",
          description: "Largest contiguous representable int (2^53).",
          expr: "double(9007199254740992)",
          value: { doubleValue: 9007199254740992 },
        },
        {
          name: "int_range",
          description: "Largest signed 64-bit. Rounds to nearest double.",
          expr: "double(9223372036854775807)",
          value: { doubleValue: 9223372036854776000 },
        },
        { name: "uint_zero", expr: "double(0u)", value: { doubleValue: 0 } },
        { name: "uint_pos", expr: "double(123u)", value: { doubleValue: 123 } },
        {
          name: "uint_max_exact",
          description: "Largest contiguous representable int (2^53).",
          expr: "double(9007199254740992u)",
          value: { doubleValue: 9007199254740992 },
        },
        {
          name: "uint_range",
          description: "Largest unsigned 64-bit.",
          expr: "double(18446744073709551615u)",
          value: { doubleValue: 18446744073709552000 },
        },
        { name: "string_zero", expr: "double('0')", value: { doubleValue: 0 } },
        {
          name: "string_zero_dec",
          expr: "double('0.0')",
          value: { doubleValue: 0 },
        },
        {
          name: "string_neg_zero",
          expr: "double('-0.0')",
          value: { doubleValue: -0 },
        },
        {
          name: "string_no_dec",
          expr: "double('123')",
          value: { doubleValue: 123 },
        },
        {
          name: "string_pos",
          expr: "double('123.456')",
          value: { doubleValue: 123.456 },
        },
        {
          name: "string_neg",
          expr: "double('-987.654')",
          value: { doubleValue: -987.654 },
        },
        {
          name: "string_exp_pos_pos",
          expr: "double('6.02214e23')",
          value: { doubleValue: 6.02214e23 },
        },
        {
          name: "string_exp_pos_neg",
          expr: "double('1.38e-23')",
          value: { doubleValue: 1.38e-23 },
        },
        {
          name: "string_exp_neg_pos",
          expr: "double('-84.32e7')",
          value: { doubleValue: -843200000 },
        },
        {
          name: "string_exp_neg_neg",
          expr: "double('-5.43e-21')",
          value: { doubleValue: -5.43e-21 },
        },
      ],
    },
    {
      name: "dyn",
      description: "Tests for dyn annotation.",
      test: [
        {
          name: "dyn_heterogeneous_list",
          description: "No need to disable type checking.",
          expr: "type(dyn([1, 'one']))",
          value: { typeValue: "list" },
        },
      ],
    },
    {
      name: "int",
      description: "Conversions to int.",
      test: [
        { name: "uint", expr: "int(42u)", value: { int64Value: "42" } },
        { name: "uint_zero", expr: "int(0u)", value: { int64Value: "0" } },
        {
          name: "uint_max_exact",
          expr: "int(9223372036854775807u)",
          value: { int64Value: "9223372036854775807" },
        },
        {
          name: "uint_range",
          expr: "int(18446744073709551615u)",
          evalError: { errors: [{ message: "range error" }] },
        },
        {
          name: "double_round_neg",
          expr: "int(-123.456)",
          value: { int64Value: "-123" },
        },
        {
          name: "double_truncate",
          expr: "int(1.9)",
          value: { int64Value: "1" },
        },
        {
          name: "double_truncate_neg",
          expr: "int(-7.9)",
          value: { int64Value: "-7" },
        },
        {
          name: "double_half_pos",
          expr: "int(11.5)",
          value: { int64Value: "11" },
        },
        {
          name: "double_half_neg",
          expr: "int(-3.5)",
          value: { int64Value: "-3" },
        },
        {
          name: "double_big_exact",
          description:
            "Beyond exact range (2^53), but no loss of precision (2^55).",
          expr: "int(double(36028797018963968))",
          value: { int64Value: "36028797018963968" },
        },
        {
          name: "double_big_precision",
          description:
            "Beyond exact range (2^53), but loses precisons (2^55 + 1).",
          expr: "int(double(36028797018963969))",
          value: { int64Value: "36028797018963968" },
        },
        {
          name: "double_int_max_range",
          description:
            "The double(2^63-1) cast produces a floating point value outside the int range",
          expr: "int(9223372036854775807.0)",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "double_int_min_range",
          description:
            "The double(-2^63) cast produces a floating point value outside the int range",
          expr: "int(-9223372036854775808.0)",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "double_range",
          expr: "int(1e99)",
          evalError: { errors: [{ message: "range" }] },
        },
        { name: "string", expr: "int('987')", value: { int64Value: "987" } },
        {
          name: "timestamp",
          expr: "int(timestamp('2004-09-16T23:59:59Z'))",
          value: { int64Value: "1095379199" },
        },
      ],
    },
    {
      name: "string",
      description: "Conversions to string.",
      test: [
        { name: "int", expr: "string(123)", value: { stringValue: "123" } },
        {
          name: "int_neg",
          expr: "string(-456)",
          value: { stringValue: "-456" },
        },
        { name: "uint", expr: "string(9876u)", value: { stringValue: "9876" } },
        {
          name: "double",
          expr: "string(123.456)",
          value: { stringValue: "123.456" },
        },
        {
          name: "double_hard",
          expr: "string(-4.5e-3)",
          value: { stringValue: "-0.0045" },
        },
        {
          name: "bytes",
          expr: "string(b'abc')",
          value: { stringValue: "abc" },
        },
        {
          name: "bytes_unicode",
          expr: "string(b'\\303\\277')",
          value: { stringValue: "ÿ" },
        },
        {
          name: "bytes_invalid",
          expr: "string(b'\\000\\xff')",
          evalError: { errors: [{ message: "invalid UTF-8" }] },
        },
      ],
    },
    {
      name: "type",
      description: "Type reflection tests.",
      test: [
        { name: "bool", expr: "type(true)", value: { typeValue: "bool" } },
        { name: "bool_denotation", expr: "bool", value: { typeValue: "bool" } },
        {
          name: "dyn_no_denotation",
          expr: "dyn",
          disableCheck: true,
          evalError: { errors: [{ message: "unknown varaible" }] },
        },
        { name: "int", expr: "type(0)", value: { typeValue: "int" } },
        { name: "int_denotation", expr: "int", value: { typeValue: "int" } },
        {
          name: "eq_same",
          expr: "type(true) == type(false)",
          value: { boolValue: true },
        },
        { name: "uint", expr: "type(64u)", value: { typeValue: "uint" } },
        { name: "uint_denotation", expr: "uint", value: { typeValue: "uint" } },
        { name: "double", expr: "type(3.14)", value: { typeValue: "double" } },
        {
          name: "double_denotation",
          expr: "double",
          value: { typeValue: "double" },
        },
        {
          name: "null_type",
          expr: "type(null)",
          value: { typeValue: "null_type" },
        },
        {
          name: "null_type_denotation",
          expr: "null_type",
          value: { typeValue: "null_type" },
        },
        { name: "string", expr: "type('foo')", value: { typeValue: "string" } },
        {
          name: "string_denotation",
          expr: "string",
          value: { typeValue: "string" },
        },
        {
          name: "bytes",
          expr: "type(b'\\xff')",
          value: { typeValue: "bytes" },
        },
        {
          name: "bytes_denotation",
          expr: "bytes",
          value: { typeValue: "bytes" },
        },
        { name: "list", expr: "type([1, 2, 3])", value: { typeValue: "list" } },
        { name: "list_denotation", expr: "list", value: { typeValue: "list" } },
        {
          name: "lists_monomorphic",
          expr: "type([1, 2, 3]) == type(['one', 'two', 'three'])",
          value: { boolValue: true },
        },
        { name: "map", expr: "type({4: 16})", value: { typeValue: "map" } },
        { name: "map_denotation", expr: "map", value: { typeValue: "map" } },
        {
          name: "map_monomorphic",
          expr: "type({'one': 1}) == type({1: 'one'})",
          value: { boolValue: true },
        },
        {
          name: "eq_diff",
          expr: "type(7) == type(7u)",
          value: { boolValue: false },
        },
        {
          name: "neq_same",
          expr: "type(0.0) != type(-0.0)",
          value: { boolValue: false },
        },
        {
          name: "neq_diff",
          expr: "type(0.0) != type(0)",
          value: { boolValue: true },
        },
        {
          name: "meta",
          expr: "type(type(7)) == type(type(7u))",
          value: { boolValue: true },
        },
        { name: "type", expr: "type(int)", value: { typeValue: "type" } },
        { name: "type_denotation", expr: "type", value: { typeValue: "type" } },
        { name: "type_type", expr: "type(type)", value: { typeValue: "type" } },
      ],
    },
    {
      name: "uint",
      description: "Conversions to uint.",
      test: [
        { name: "int", expr: "uint(1729)", value: { uint64Value: "1729" } },
        {
          name: "int_max",
          expr: "uint(9223372036854775807)",
          value: { uint64Value: "9223372036854775807" },
        },
        {
          name: "int_neg",
          expr: "uint(-1)",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "double",
          expr: "uint(3.14159265)",
          value: { uint64Value: "3" },
        },
        {
          name: "double_truncate",
          expr: "uint(1.9)",
          value: { uint64Value: "1" },
        },
        {
          name: "double_half",
          expr: "uint(25.5)",
          value: { uint64Value: "25" },
        },
        {
          name: "double_big_exact",
          description:
            "Beyond exact range (2^53), but no loss of precision (2^55).",
          expr: "uint(double(36028797018963968u))",
          value: { uint64Value: "36028797018963968" },
        },
        {
          name: "double_big_precision",
          description:
            "Beyond exact range (2^53), but loses precisons (2^55 + 1).",
          expr: "uint(double(36028797018963969u))",
          value: { uint64Value: "36028797018963968" },
        },
        {
          name: "double_uint_max_range",
          description:
            "The exact conversion of uint max as a double does not round trip.",
          expr: "int(18446744073709551615.0)",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "double_range_beyond_uint",
          expr: "uint(6.022e23)",
          evalError: { errors: [{ message: "range" }] },
        },
        { name: "string", expr: "uint('300')", value: { uint64Value: "300" } },
      ],
    },
  ],
};
