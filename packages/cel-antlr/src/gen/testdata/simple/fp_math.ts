import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "fp_math",
  description: "Tests for floating-point math.",
  section: [
    {
      name: "fp_math",
      description: "Simple tests for floating point.",
      test: [
        {
          name: "add_positive_positive",
          expr: "4.25 + 15.25",
          value: { doubleValue: 19.5 },
        },
        {
          name: "add_positive_negative",
          expr: "17.75 + (-7.75)",
          value: { doubleValue: 10 },
        },
        {
          name: "add_negative_negative",
          expr: "-4.125 + (-2.125)",
          value: { doubleValue: -6.25 },
        },
        {
          name: "sub_positive_positive",
          expr: "42.0 - 12.0",
          value: { doubleValue: 30 },
        },
        {
          name: "sub_positive_negative",
          expr: "42.875 - (-22.0)",
          value: { doubleValue: 64.875 },
        },
        {
          name: "sub_negative_negative",
          expr: "-4.875 - (-0.125)",
          value: { doubleValue: -4.75 },
        },
        {
          name: "multiply_positive_positive",
          expr: "42.5 * 0.2",
          value: { doubleValue: 8.5 },
        },
        {
          name: "multiply_positive_negative",
          expr: "40.75 * (-2.25)",
          value: { doubleValue: -91.6875 },
        },
        {
          name: "multiply_negative_negative",
          expr: "-3.0 * (-2.5)",
          value: { doubleValue: 7.5 },
        },
        {
          name: "divide_positive_positive",
          expr: "0.0625 / 0.002",
          value: { doubleValue: 31.25 },
        },
        {
          name: "divide_positive_negative",
          expr: "-2.0 / 2.0",
          value: { doubleValue: -1 },
        },
        {
          name: "divide_negative_negative",
          expr: "-8.875 / (-0.0625)",
          value: { doubleValue: 142 },
        },
        {
          name: "mod_not_support",
          expr: "47.5 % 5.5",
          disableCheck: true,
          evalError: {
            errors: [
              {
                message:
                  "found no matching overload for '_%_' applied to '(double, double)'",
              },
            ],
          },
        },
        { name: "negative", expr: "-(4.5)", value: { doubleValue: -4.5 } },
        {
          name: "double_negative",
          expr: "-(-1.25)",
          value: { doubleValue: 1.25 },
        },
        { name: "negative_zero", expr: "-(0.0)", value: { doubleValue: -0 } },
        {
          name: "divide_zero",
          expr: "15.75 / 0.0",
          value: { doubleValue: "Infinity" },
        },
        {
          name: "multiply_zero",
          expr: "15.36 * 0.0",
          value: { doubleValue: 0 },
        },
        {
          name: "add_left_identity",
          expr: "0.0 + 1.75",
          value: { doubleValue: 1.75 },
        },
        {
          name: "add_right_identity",
          expr: " 2.5 + 0.0",
          value: { doubleValue: 2.5 },
        },
        {
          name: "add_commutative",
          expr: "7.5 + 1.5 == 1.5 + 7.5",
          value: { boolValue: true },
        },
        {
          name: "add_associative",
          expr: "5.625 + (15.75 + 2.0) == (5.625 + 15.75) + 2.0",
          value: { boolValue: true },
        },
        {
          name: "mul_left_identity",
          expr: "1.0 * 45.25",
          value: { doubleValue: 45.25 },
        },
        {
          name: "mul_right_identity",
          expr: "-25.25 * 1.0",
          value: { doubleValue: -25.25 },
        },
        {
          name: "mul_commutative",
          expr: "1.5 * 25.875 == 25.875 * 1.5",
          value: { boolValue: true },
        },
        {
          name: "mul_associative",
          expr: "1.5 * (23.625 * 0.75) == (1.5 * 23.625) * 0.75",
          value: { boolValue: true },
        },
        {
          name: "add_mul_distribute",
          expr: "5.75 * (1.5 + 2.5)  == 5.75 * 1.5 + 5.75 * 2.5",
          value: { boolValue: true },
        },
        {
          name: "fp_overflow_positive",
          description: "DBL_MAX(2^1023) times two",
          expr: "2.0 * 8.988466e+307 ",
          value: { doubleValue: "Infinity" },
        },
        {
          name: "fp_overflow_negative",
          description: "-DBL_MAX(-2^1023) times two",
          expr: "2.0 * -8.988466e+307 ",
          value: { doubleValue: "-Infinity" },
        },
        {
          name: "fp_underflow",
          description: "DBL_MIN(2^-1074) divided by two",
          expr: "1e-324  / 2.0",
          value: { doubleValue: 0 },
        },
      ],
    },
  ],
};
