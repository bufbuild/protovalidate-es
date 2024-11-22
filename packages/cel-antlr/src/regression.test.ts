import { testSimpleTestFile } from "./testing.js";
import { createRegistry } from "@bufbuild/protobuf";
import * as _dev_cel_expr_test_v1_simple_pb from "./pb/cel/expr/conformance/simple_pb.js";

// TODO was generated. see if this has a source
const REGRESSION_TEST = _dev_cel_expr_test_v1_simple_pb.SimpleTestFile.fromJson(
  {
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
  },
);

void testSimpleTestFile(REGRESSION_TEST, createRegistry());
