import { testSimpleTestFile } from "./testing.js";
import { createRegistry, fromJson } from "@bufbuild/protobuf";
import { SimpleTestFileSchema } from "@bufbuild/cel-spec/cel/expr/conformance/test/simple_pb.js";

// TODO was generated. see if this has a source
const REGRESSION_TEST = fromJson(SimpleTestFileSchema, {
  name: "",
  description: "Regression tests",
  section: [
    {
      name: "charAt",
      test: [
        {
          description: "&& should unrwrap the lhs",
          value: { bool_value: false },
          expr: "google.protobuf.BoolValue{} && true",
        },
        {
          expr: "false || google.protobuf.BoolValue{value: true}",
          description: "|| should unrwrap the rhs",
          value: { bool_value: true },
        },
        {
          expr: "google.protobuf.BoolValue{} ? true : false",
          description: "? should unrwrap",
          value: { bool_value: false },
        },
      ],
    },
  ],
});

void testSimpleTestFile(REGRESSION_TEST, createRegistry());
