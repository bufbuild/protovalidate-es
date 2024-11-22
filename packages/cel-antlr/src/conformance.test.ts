import { suite } from "node:test";
import { testSimpleTestFile } from "./testing.js";
import { JSON as BASIC_TEST_JSON } from "./gen/testdata/simple/basic.js";
import { JSON as COMPARISONS_TEST_JSON } from "./gen/testdata/simple/comparisons.js";
import { JSON as CONVERSIONS_TEST_JSON } from "./gen/testdata/simple/conversions.js";
import { JSON as DYNAMIC_TEST_JSON } from "./gen/testdata/simple/dynamic.js";
import { JSON as ENUMS_TEST_JSON } from "./gen/testdata/simple/enums.js";
import { JSON as FIELDS_TEST_JSON } from "./gen/testdata/simple/fields.js";
import { JSON as FP_MATH_TEST_JSON } from "./gen/testdata/simple/fp_math.js";
import { JSON as INTEGER_MATH_TEST_JSON } from "./gen/testdata/simple/integer_math.js";
import { JSON as LISTS_TEST_JSON } from "./gen/testdata/simple/lists.js";
import { JSON as LOGIC_TEST_JSON } from "./gen/testdata/simple/logic.js";
import { JSON as MACROS_TEST_JSON } from "./gen/testdata/simple/macros.js";
import { JSON as NAMESPACE_TEST_JSON } from "./gen/testdata/simple/namespace.js";
import { JSON as PARSE_TEST_JSON } from "./gen/testdata/simple/parse.js";
import { JSON as PLUMBING_TEST_JSON } from "./gen/testdata/simple/plumbing.js";
import { JSON as PROTO2_TEST_JSON } from "./gen/testdata/simple/proto2.js";
import { JSON as PROTO3_TEST_JSON } from "./gen/testdata/simple/proto3.js";
import { JSON as STRING_TEST_JSON } from "./gen/testdata/simple/string.js";
import { JSON as STRINGS_EXT_TEST } from "./gen/testdata/simple/string_ext.js";
import { JSON as TIMESTAMPS_TEST_JSON } from "./gen/testdata/simple/timestamps.js";
import { JSON as UNKNOWNS_TEST_JSON } from "./gen/testdata/simple/unknowns.js";
import { createRegistry } from "@bufbuild/protobuf";
import * as test_all_types_pb2 from "./pb/cel/expr/conformance/proto2/test_all_types_pb.js";
import * as test_all_types_pb3 from "./pb/cel/expr/conformance/proto3/test_all_types_pb.js";
import { SimpleTestFile } from "./pb/cel/expr/conformance/simple_pb.js";

void suite("Conformance Tests", () => {
  const typeRegistry = createRegistry(
    test_all_types_pb2.TestAllTypes,
    test_all_types_pb3.TestAllTypes,
  );
  const files = [
    SimpleTestFile.fromJson(BASIC_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(COMPARISONS_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(CONVERSIONS_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(DYNAMIC_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(ENUMS_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(FIELDS_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(FP_MATH_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(INTEGER_MATH_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(LISTS_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(LOGIC_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(MACROS_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(NAMESPACE_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(PARSE_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(PLUMBING_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(PROTO2_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(PROTO3_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(STRING_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(STRINGS_EXT_TEST, { typeRegistry }),
    SimpleTestFile.fromJson(TIMESTAMPS_TEST_JSON, { typeRegistry }),
    SimpleTestFile.fromJson(UNKNOWNS_TEST_JSON, { typeRegistry }),
  ];
  for (const file of files) {
    void testSimpleTestFile(file, typeRegistry);
  }
});
