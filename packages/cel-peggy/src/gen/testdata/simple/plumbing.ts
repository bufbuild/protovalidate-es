import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "plumbing",
  description:
    "Check that the ConformanceService server can accept all arguments and return all responses.",
  section: [
    {
      name: "min",
      description: "Minimal programs.",
      test: [
        {
          name: "min_program",
          description: "Smallest functionality: expr in, result out.",
          expr: "17",
          value: { int64Value: "17" },
        },
      ],
    },
    {
      name: "eval_results",
      description: "All evaluation result kinds.",
      test: [
        {
          name: "error_result",
          description: "Check that error results go through.",
          expr: "1 / 0",
          evalError: { errors: [{ message: "foo" }] },
        },
        {
          name: "eval_map_results",
          description: "Check that map literals results are order independent.",
          expr: '{"k1":"v1","k":"v"}',
          value: {
            mapValue: {
              entries: [
                { key: { stringValue: "k" }, value: { stringValue: "v" } },
                { key: { stringValue: "k1" }, value: { stringValue: "v1" } },
              ],
            },
          },
        },
      ],
    },
    {
      name: "check_inputs",
      description: "All inputs to Check phase.",
      test: [
        {
          name: "skip_check",
          description: "Make sure we can skip type checking.",
          expr: "[17, 'pancakes']",
          disableCheck: true,
          value: {
            listValue: {
              values: [{ int64Value: "17" }, { stringValue: "pancakes" }],
            },
          },
        },
      ],
    },
    {
      name: "eval_inputs",
      description: "All inputs to Eval phase.",
      test: [
        {
          name: "one_ignored_value_arg",
          description:
            "Check that value bindings can be given, even if ignored.",
          expr: "'foo'",
          bindings: { x: { value: { int64Value: "17" } } },
          value: { stringValue: "foo" },
        },
      ],
    },
  ],
};
