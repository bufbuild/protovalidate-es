import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "integer_math",
  description: "Tests for int and uint math.",
  section: [
    {
      name: "int64_math",
      description: "Simple tests for int64.",
      test: [
        {
          name: "add_positive_positive",
          expr: "40 + 2",
          value: { int64Value: "42" },
        },
        {
          name: "add_positive_negative",
          expr: "42 + (-7)",
          value: { int64Value: "35" },
        },
        {
          name: "add_negative_negative",
          expr: "-4 + (-2)",
          value: { int64Value: "-6" },
        },
        {
          name: "sub_positive_positive",
          expr: "42 - 12",
          value: { int64Value: "30" },
        },
        {
          name: "sub_positive_negative",
          expr: "42 - (-22)",
          value: { int64Value: "64" },
        },
        {
          name: "sub_negative_negative",
          expr: "-42 - (-12)",
          value: { int64Value: "-30" },
        },
        {
          name: "multiply_positive_positive",
          expr: "42 * 2",
          value: { int64Value: "84" },
        },
        {
          name: "multiply_positive_negative",
          expr: "40 * (-2)",
          value: { int64Value: "-80" },
        },
        {
          name: "multiply_negative_negative",
          expr: "-30 * (-2)",
          value: { int64Value: "60" },
        },
        {
          name: "divide_positive_positive",
          expr: "42 / 2",
          value: { int64Value: "21" },
        },
        {
          name: "divide_positive_negative",
          expr: "-20 / 2",
          value: { int64Value: "-10" },
        },
        {
          name: "divide_negative_negative",
          expr: "-80 / (-2)",
          value: { int64Value: "40" },
        },
        {
          name: "mod_positive_positive",
          expr: "47 % 5",
          value: { int64Value: "2" },
        },
        {
          name: "mod_positive_negative",
          expr: "43 % (-5)",
          value: { int64Value: "3" },
        },
        {
          name: "mod_negative_negative",
          expr: "-42 % (-5)",
          value: { int64Value: "-2" },
        },
        {
          name: "mod_negative_positive",
          expr: "-3 % 5",
          value: { int64Value: "-3" },
        },
        {
          name: "unary_minus_pos",
          expr: "-(42)",
          value: { int64Value: "-42" },
        },
        {
          name: "unary_minus_neg",
          expr: "-(-42)",
          value: { int64Value: "42" },
        },
        {
          name: "unary_minus_no_overload",
          expr: "-(42u)",
          disableCheck: true,
          evalError: { errors: [{ message: "no_such_overload" }] },
        },
        {
          name: "unary_minus_not_bool",
          expr: "-false",
          disableCheck: true,
          evalError: { errors: [{ message: "no_such_overload" }] },
        },
        {
          name: "mod_zero",
          expr: "34 % 0",
          evalError: { errors: [{ message: "modulus by zero" }] },
        },
        { name: "negtive_zero", expr: "-(0)", value: { int64Value: "0" } },
        {
          name: "double_negative",
          expr: "-(-42)",
          value: { int64Value: "42" },
        },
        {
          name: "divide_zero",
          expr: "15 / 0",
          evalError: { errors: [{ message: "divide by zero" }] },
        },
        { name: "multiply_zero", expr: "15 * 0", value: { int64Value: "0" } },
        {
          name: "add_left_identity",
          expr: "0 + 17",
          value: { int64Value: "17" },
        },
        {
          name: "add_right_identity",
          expr: " 29 + 0",
          value: { int64Value: "29" },
        },
        {
          name: "add_commutative",
          expr: "75 + 15 == 15 + 75",
          value: { boolValue: true },
        },
        {
          name: "add_associative",
          expr: "5 + (15 + 20) == (5 + 15) + 20",
          value: { boolValue: true },
        },
        {
          name: "mul_left_identity",
          expr: "1 * 45",
          value: { int64Value: "45" },
        },
        {
          name: "mul_right_identity",
          expr: "-25 * 1",
          value: { int64Value: "-25" },
        },
        {
          name: "mul_commutative",
          expr: "15 * 25 == 25 * 15",
          value: { boolValue: true },
        },
        {
          name: "mul_associative",
          expr: "15 * (23 * 88) == (15 * 23) * 88",
          value: { boolValue: true },
        },
        {
          name: "add_mul_distribute",
          expr: "5 * (15 + 25)  == 5 * 15 + 5 * 25",
          value: { boolValue: true },
        },
        {
          name: "int64_overflow_positive",
          description: "LLONG_MAX plus one.",
          expr: "9223372036854775807 + 1",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "int64_overflow_negative",
          description: "LLONG_MIN minus one.",
          expr: "-9223372036854775808 - 1",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "int64_overflow_add_negative",
          description: "negative overflow via addition",
          expr: "-9223372036854775808 + (-1)",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "int64_overflow_sub_positive",
          description: "positive overflow via subtraction",
          expr: "1 - (-9223372036854775807)",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "int64_min_negate",
          description: "Negated LLONG_MIN is not representable.",
          expr: "-(-9223372036854775808)",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "int64_min_negate_mul",
          description: "Negate LLONG_MIN via multiplication",
          expr: "(-9223372036854775808) * -1",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "int64_min_negate_div",
          description: "Negate LLONG_MIN via division.",
          expr: "(-9223372036854775808)/-1",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "int64_overflow_mul_positive",
          description: "Overflow via multiplication.",
          expr: "5000000000 * 5000000000",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "int64_overflow_mul_negative",
          description: "Overflow via multiplication.",
          expr: "(-5000000000) * 5000000000",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "uint64_overflow_positive",
          description: "ULLONG_MAX plus one.",
          expr: "18446744073709551615u + 1u",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "uint64_overflow_negative",
          description: "zero minus one.",
          expr: "0u - 1u",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
        {
          name: "uint64_overflow_mul_positive",
          description: "Overflow via multiplication.",
          expr: "5000000000u * 5000000000u",
          evalError: { errors: [{ message: "return error for overflow" }] },
        },
      ],
    },
    {
      name: "uint64_math",
      description: "Simple tests for uint64.",
      test: [
        { name: "add", expr: "42u + 2u", value: { uint64Value: "44" } },
        { name: "sub", expr: "42u - 12u", value: { uint64Value: "30" } },
        { name: "multiply", expr: "40u * 2u", value: { uint64Value: "80" } },
        { name: "divide", expr: "60u / 2u", value: { uint64Value: "30" } },
        { name: "mod", expr: "42u % 5u", value: { uint64Value: "2" } },
        {
          name: "negtive_no_overload",
          expr: "-(5u)",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "mod_zero",
          expr: "34u % 0u",
          evalError: { errors: [{ message: "modulus by zero" }] },
        },
        {
          name: "divide_zero",
          expr: "15u / 0u",
          evalError: { errors: [{ message: "divide by zero" }] },
        },
        {
          name: "multiply_zero",
          expr: "15u * 0u",
          value: { uint64Value: "0" },
        },
        {
          name: "add_left_identity",
          expr: "0u + 17u",
          value: { uint64Value: "17" },
        },
        {
          name: "add_right_identity",
          expr: " 29u + 0u",
          value: { uint64Value: "29" },
        },
        {
          name: "add_commutative",
          expr: "75u + 15u == 15u + 75u",
          value: { boolValue: true },
        },
        {
          name: "add_associative",
          expr: "5u + (15u + 20u) == (5u + 15u) + 20u",
          value: { boolValue: true },
        },
        {
          name: "mul_left_identity",
          expr: "1u * 45u",
          value: { uint64Value: "45" },
        },
        {
          name: "mul_right_identity",
          expr: "25u * 1u",
          value: { uint64Value: "25" },
        },
        {
          name: "mul_commutative",
          expr: "15u * 25u == 25u * 15u",
          value: { boolValue: true },
        },
        {
          name: "mul_associative",
          expr: "15u * (23u * 88u) == (15u * 23u) * 88u",
          value: { boolValue: true },
        },
        {
          name: "add_mul_distribute",
          expr: "5u * (15u + 25u)  == 5u * 15u + 5u * 25u",
          value: { boolValue: true },
        },
      ],
    },
  ],
};
