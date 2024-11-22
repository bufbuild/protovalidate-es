import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "logic",
  description: "Tests for logical special operators.",
  section: [
    {
      name: "conditional",
      description: "Tests for the conditional operator.",
      test: [
        { name: "true_case", expr: "true ? 1 : 2", value: { int64Value: "1" } },
        {
          name: "false_case",
          expr: "false ? 'foo' : 'bar'",
          value: { stringValue: "bar" },
        },
        {
          name: "error_case",
          expr: "2 / 0 > 4 ? 'baz' : 'quux'",
          evalError: { errors: [{ message: "division by zero" }] },
        },
        {
          name: "mixed_type",
          expr: "true ? 'cows' : 17",
          disableCheck: true,
          value: { stringValue: "cows" },
        },
        {
          name: "bad_type",
          expr: "'cows' ? false : 17",
          disableCheck: true,
          evalError: { errors: [{ message: "no matching overload" }] },
        },
      ],
    },
    {
      name: "AND",
      description: "Tests for logical AND.",
      test: [
        { name: "all_true", expr: "true && true", value: { boolValue: true } },
        {
          name: "all_false",
          expr: "false && false",
          value: { boolValue: false },
        },
        {
          name: "false_left",
          expr: "false && true",
          value: { boolValue: false },
        },
        {
          name: "false_right",
          expr: "true && false",
          value: { boolValue: false },
        },
        {
          name: "short_circuit_type_left",
          expr: "false && 32",
          disableCheck: true,
          value: { boolValue: false },
        },
        {
          name: "short_circuit_type_right",
          expr: "'horses' && false",
          disableCheck: true,
          value: { boolValue: false },
        },
        {
          name: "short_circuit_error_left",
          expr: "false && (2 / 0 > 3 ? false : true)",
          value: { boolValue: false },
        },
        {
          name: "short_circuit_error_right",
          expr: "(2 / 0 > 3 ? false : true) && false",
          value: { boolValue: false },
        },
        {
          name: "error_right",
          expr: "true && 1/0 != 0",
          evalError: { errors: [{ message: "no matching overload" }] },
        },
        {
          name: "error_left",
          expr: "1/0 != 0 && true",
          evalError: { errors: [{ message: "no matching overload" }] },
        },
        {
          name: "no_overload",
          expr: "'less filling' && 'tastes great'",
          disableCheck: true,
          evalError: { errors: [{ message: "no matching overload" }] },
        },
      ],
    },
    {
      name: "OR",
      description: "Tests for logical OR",
      test: [
        { name: "all_true", expr: "true || true", value: { boolValue: true } },
        {
          name: "all_false",
          expr: "false || false",
          value: { boolValue: false },
        },
        {
          name: "false_left",
          expr: "false || true",
          value: { boolValue: true },
        },
        {
          name: "false_right",
          expr: "true || false",
          value: { boolValue: true },
        },
        {
          name: "short_circuit_type_left",
          expr: "true || 32",
          disableCheck: true,
          value: { boolValue: true },
        },
        {
          name: "short_circuit_type_right",
          expr: "'horses' || true",
          disableCheck: true,
          value: { boolValue: true },
        },
        {
          name: "short_circuit_error_left",
          expr: "true || (2 / 0 > 3 ? false : true)",
          value: { boolValue: true },
        },
        {
          name: "short_circuit_error_right",
          expr: "(2 / 0 > 3 ? false : true) || true",
          value: { boolValue: true },
        },
        {
          name: "error_right",
          expr: "false || 1/0 != 0",
          evalError: { errors: [{ message: "no matching overload" }] },
        },
        {
          name: "error_left",
          expr: "1/0 != 0 || false",
          evalError: { errors: [{ message: "no matching overload" }] },
        },
        {
          name: "no_overload",
          expr: "'less filling' || 'tastes great'",
          disableCheck: true,
          evalError: { errors: [{ message: "no matching overload" }] },
        },
      ],
    },
    {
      name: "NOT",
      description: "Tests for logical NOT.",
      test: [
        { name: "not_true", expr: "!true", value: { boolValue: false } },
        { name: "not_false", expr: "!false", value: { boolValue: true } },
        {
          name: "no_overload",
          expr: "!0",
          disableCheck: true,
          evalError: { errors: [{ message: "no matching overload" }] },
        },
      ],
    },
  ],
};
