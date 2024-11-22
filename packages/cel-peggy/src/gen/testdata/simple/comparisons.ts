import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "comparisons",
  description: "Tests for boolean-valued functions and operators.",
  section: [
    {
      name: "eq_literal",
      description: "Literals comparison on _==_",
      test: [
        { name: "eq_int", expr: "1 == 1", value: { boolValue: true } },
        { name: "not_eq_int", expr: "-1 == 1", value: { boolValue: false } },
        {
          name: "eq_int_uint",
          expr: "dyn(1) == 1u",
          value: { boolValue: true },
        },
        {
          name: "not_eq_int_uint",
          expr: "dyn(2) == 1u",
          value: { boolValue: false },
        },
        {
          name: "eq_int_double",
          expr: "dyn(1) == 1.0",
          value: { boolValue: true },
        },
        {
          name: "not_eq_int_double",
          expr: "dyn(2) == 1.0",
          value: { boolValue: false },
        },
        { name: "eq_uint", expr: "2u == 2u", value: { boolValue: true } },
        { name: "not_eq_uint", expr: "1u == 2u", value: { boolValue: false } },
        {
          name: "eq_uint_int",
          expr: "dyn(1u) == 1",
          value: { boolValue: true },
        },
        {
          name: "not_eq_uint_int",
          expr: "dyn(2u) == 1",
          value: { boolValue: false },
        },
        {
          name: "eq_uint_double",
          expr: "dyn(1u) == 1.0",
          value: { boolValue: true },
        },
        {
          name: "not_eq_uint_double",
          expr: "dyn(2u) == 1.0",
          value: { boolValue: false },
        },
        {
          name: "eq_double",
          expr: "1.0 == 1.0e+0",
          value: { boolValue: true },
        },
        {
          name: "not_eq_double",
          expr: "-1.0 == 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_eq_double_nan",
          expr: "0.0/0.0 == 0.0/0.0",
          value: { boolValue: false },
        },
        {
          name: "not_eq_int_double_nan",
          expr: "dyn(1) == 0.0/0.0",
          value: { boolValue: false },
        },
        {
          name: "not_eq_uint_double_nan",
          expr: "dyn(1u) == 0.0/0.0",
          value: { boolValue: false },
        },
        {
          name: "eq_double_int",
          expr: "dyn(1.0) == 1",
          value: { boolValue: true },
        },
        {
          name: "not_eq_double_int",
          expr: "dyn(2.0) == 1",
          value: { boolValue: false },
        },
        {
          name: "eq_double_uint",
          expr: "dyn(1.0) == 1u",
          value: { boolValue: true },
        },
        {
          name: "not_eq_double_uint",
          expr: "dyn(2.0) == 1u",
          value: { boolValue: false },
        },
        { name: "eq_string", expr: "'' == \"\"", value: { boolValue: true } },
        {
          name: "not_eq_string",
          expr: "'a' == 'b'",
          value: { boolValue: false },
        },
        {
          name: "eq_raw_string",
          expr: "'abc' == r'abc'",
          value: { boolValue: true },
        },
        {
          name: "not_eq_string_case",
          expr: "'abc' == 'ABC'",
          value: { boolValue: false },
        },
        {
          name: "eq_string_unicode",
          expr: "'ίσος' == 'ίσος'",
          value: { boolValue: true },
        },
        {
          name: "not_eq_string_unicode_ascii",
          expr: "'a' == 'à'",
          value: { boolValue: false },
        },
        {
          name: "no_string_normalization",
          description: "Should not normalize Unicode.",
          expr: "'Am\\u00E9lie' == 'Ame\\u0301lie'",
          value: { boolValue: false },
        },
        {
          name: "no_string_normalization_surrogate",
          description: "Should not replace surrogate pairs.",
          expr: "'\\U0001F436' == '\\xef\\xbf\\xbd\\xef\\xbf\\bd'",
          value: { boolValue: false },
        },
        { name: "eq_null", expr: "null == null", value: { boolValue: true } },
        { name: "eq_bool", expr: "true == true", value: { boolValue: true } },
        {
          name: "not_eq_bool",
          expr: "false == true",
          value: { boolValue: false },
        },
        {
          name: "eq_bytes",
          description: "Test bytes literal equality with encoding",
          expr: "b'ÿ' == b'\\303\\277'",
          value: { boolValue: true },
        },
        {
          name: "not_eq_bytes",
          expr: "b'abc' == b'abcd'",
          value: { boolValue: false },
        },
        { name: "eq_list_empty", expr: "[] == []", value: { boolValue: true } },
        {
          name: "eq_list_null",
          expr: "[null] == [null]",
          value: { boolValue: true },
        },
        {
          name: "not_eq_list_null",
          expr: "['1', '2', null] == ['1', '2', '3']",
          value: { boolValue: false },
        },
        {
          name: "eq_list_numbers",
          expr: "[1, 2, 3] == [1, 2, 3]",
          value: { boolValue: true },
        },
        {
          name: "eq_list_mixed_type_numbers",
          expr: "[1.0, 2.0, 3] == [1u, 2, 3u]",
          value: { boolValue: true },
        },
        {
          name: "not_eq_list_mixed_type_numbers",
          expr: "[1.0, 2.1] == [1u, 2]",
          value: { boolValue: false },
        },
        {
          name: "not_eq_list_order",
          expr: "[1, 2, 3] == [1, 3, 2]",
          value: { boolValue: false },
        },
        {
          name: "not_eq_list_string_case",
          expr: "['case'] == ['cAse']",
          value: { boolValue: false },
        },
        {
          name: "not_eq_list_length",
          expr: "['one'] == [2, 3]",
          disableCheck: true,
          value: { boolValue: false },
        },
        {
          name: "not_eq_list_false_vs_types",
          expr: "[1, 'dos', 3] == [1, 2, 4]",
          value: { boolValue: false },
        },
        { name: "eq_map_empty", expr: "{} == {}", value: { boolValue: true } },
        {
          name: "eq_map_null",
          expr: "{'k': null} == {'k': null}",
          value: { boolValue: true },
        },
        {
          name: "not_eq_map_null",
          expr: "{'k': 1, 'j': 2} == {'k': 1, 'j': null}",
          value: { boolValue: false },
        },
        {
          name: "eq_map_onekey",
          expr: "{'k':'v'} == {\"k\":\"v\"}",
          value: { boolValue: true },
        },
        {
          name: "eq_map_double_value",
          expr: "{'k':1.0} == {'k':1e+0}",
          value: { boolValue: true },
        },
        {
          name: "eq_map_mixed_type_numbers",
          expr: "{1: 1.0, 2u: 3u} == {1u: 1, 2: 3.0}",
          value: { boolValue: true },
        },
        {
          name: "not_eq_map_value",
          expr: "{'k':'v'} == {'k':'v1'}",
          value: { boolValue: false },
        },
        {
          name: "not_eq_map_extra_key",
          expr: "{'k':'v','k1':'v1'} == {'k':'v'}",
          value: { boolValue: false },
        },
        {
          name: "eq_map_key_order",
          expr: "{'k1':'v1','k2':'v2'} == {'k2':'v2','k1':'v1'}",
          value: { boolValue: true },
        },
        {
          name: "not_eq_map_key_casing",
          expr: "{'key':'value'} == {'Key':'value'}",
          value: { boolValue: false },
        },
        {
          name: "not_eq_map_false_vs_types",
          expr: "{'k1': 1, 'k2': 'dos', 'k3': 3} == {'k1': 1, 'k2': 2, 'k3': 4}",
          value: { boolValue: false },
        },
        {
          name: "eq_mixed_types",
          expr: "1.0 == 1",
          disableCheck: true,
          value: { boolValue: true },
        },
        {
          name: "eq_list_elem_mixed_types",
          expr: "[1] == [1.0]",
          disableCheck: true,
          value: { boolValue: true },
        },
        {
          name: "eq_map_value_mixed_types",
          expr: "{'k':'v', 1:1} == {'k':'v', 1:'v1'}",
          value: { boolValue: false },
        },
        {
          name: "eq_dyn_json_null",
          expr: "dyn(google.protobuf.Value{}) == null",
          value: { boolValue: true },
        },
        {
          name: "not_eq_dyn_bool_null",
          expr: "dyn(false) == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_bytes_null",
          expr: "dyn(b'') == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_double_null",
          expr: "dyn(2.1) == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_duration_null",
          expr: "dyn(duration('0s')) == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_int_null",
          expr: "dyn(1) == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_list_null",
          expr: "dyn([]) == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_map_null",
          expr: "dyn({}) == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_proto2_msg_null",
          expr: "dyn(TestAllTypes{}) == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_proto3_msg_null",
          expr: "dyn(TestAllTypes{}) == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_string_null",
          expr: "dyn('') == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_timestamp_null",
          expr: "dyn(timestamp(0)) == null",
          value: { boolValue: false },
        },
        {
          name: "not_eq_list_elem_null",
          expr: "[1, 2, null] == [1, null, 3]",
          value: { boolValue: false },
        },
        {
          name: "not_eq_map_value_null",
          expr: "{1:'hello', 2:'world'} == {1:'goodbye', 2:null}",
          value: { boolValue: false },
        },
        {
          name: "eq_dyn_int_uint",
          expr: "dyn(1) == 1u",
          value: { boolValue: true },
        },
        {
          name: "eq_dyn_int_double",
          expr: "dyn(1) == 1.0",
          value: { boolValue: true },
        },
        {
          name: "eq_dyn_uint_int",
          expr: "dyn(1u) == 1",
          value: { boolValue: true },
        },
        {
          name: "eq_dyn_uint_double",
          expr: "dyn(1u) == 1.0",
          value: { boolValue: true },
        },
        {
          name: "eq_dyn_double_int",
          expr: "dyn(1.0) == 1",
          value: { boolValue: true },
        },
        {
          name: "eq_dyn_double_uint",
          expr: "dyn(1.0) == 1u",
          value: { boolValue: true },
        },
        {
          name: "not_eq_dyn_int_uint",
          expr: "dyn(1) == 2u",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_int_double",
          expr: "dyn(1) == 2.0",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_uint_int",
          expr: "dyn(1u) == 2",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_uint_double",
          expr: "dyn(1u) == 120",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_double_int",
          expr: "dyn(1.0) == 2",
          value: { boolValue: false },
        },
        {
          name: "not_eq_dyn_double_uint",
          expr: "dyn(1.0) == 2u",
          value: { boolValue: false },
        },
      ],
    },
    {
      name: "eq_wrapper",
      description:
        "Wrapper type comparison on _==_. Wrapper types treated as boxed primitives when they appear on message fields. An unset wrapper field should be treated as null. The tests show the distinction between unset, empty, and set equality behavior.",
      test: [
        {
          name: "eq_bool",
          expr: "google.protobuf.BoolValue{value: true} == true",
          value: { boolValue: true },
        },
        {
          name: "eq_bool_empty",
          expr: "google.protobuf.BoolValue{} == false",
          value: { boolValue: true },
        },
        {
          name: "eq_bool_not_null",
          expr: "google.protobuf.BoolValue{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_bool_proto2_null",
          expr: "TestAllTypes{}.single_bool_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_bool_proto3_null",
          expr: "TestAllTypes{}.single_bool_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_bytes",
          expr: "google.protobuf.BytesValue{value: b'set'} == b'set'",
          value: { boolValue: true },
        },
        {
          name: "eq_bytes_empty",
          expr: "google.protobuf.BytesValue{} == b''",
          value: { boolValue: true },
        },
        {
          name: "eq_bytes_not_null",
          expr: "google.protobuf.BytesValue{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_bytes_proto2_null",
          expr: "TestAllTypes{}.single_bytes_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_bytes_proto3_null",
          expr: "TestAllTypes{}.single_bytes_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_double",
          expr: "google.protobuf.DoubleValue{value: -1.175494e-40} == -1.175494e-40",
          value: { boolValue: true },
        },
        {
          name: "eq_double_empty",
          expr: "google.protobuf.DoubleValue{} == 0.0",
          value: { boolValue: true },
        },
        {
          name: "eq_double_not_null",
          expr: "google.protobuf.DoubleValue{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_double_proto2_null",
          expr: "TestAllTypes{}.single_double_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_double_proto3_null",
          expr: "TestAllTypes{}.single_double_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_float",
          expr: "google.protobuf.FloatValue{value: -1.5} == -1.5",
          value: { boolValue: true },
        },
        {
          name: "eq_float_empty",
          expr: "google.protobuf.FloatValue{} == 0.0",
          value: { boolValue: true },
        },
        {
          name: "eq_float_not_null",
          expr: "google.protobuf.FloatValue{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_float_proto2_null",
          expr: "TestAllTypes{}.single_float_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_float_proto3_null",
          expr: "TestAllTypes{}.single_float_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_int32",
          expr: "google.protobuf.Int32Value{value: 123} == 123",
          value: { boolValue: true },
        },
        {
          name: "eq_int32_empty",
          expr: "google.protobuf.Int32Value{} == 0",
          value: { boolValue: true },
        },
        {
          name: "eq_int32_not_null",
          expr: "google.protobuf.Int32Value{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_int32_proto2_null",
          expr: "TestAllTypes{}.single_int32_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_int32_proto3_null",
          expr: "TestAllTypes{}.single_int32_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_int64",
          expr: "google.protobuf.Int64Value{value: 2147483650} == 2147483650",
          value: { boolValue: true },
        },
        {
          name: "eq_int64_empty",
          expr: "google.protobuf.Int64Value{} == 0",
          value: { boolValue: true },
        },
        {
          name: "eq_int64_not_null",
          expr: "google.protobuf.Int64Value{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_int64_proto2_null",
          expr: "TestAllTypes{}.single_int64_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_int64_proto3_null",
          expr: "TestAllTypes{}.single_int64_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_string",
          expr: "google.protobuf.StringValue{value: 'set'} == 'set'",
          value: { boolValue: true },
        },
        {
          name: "eq_string_empty",
          expr: "google.protobuf.StringValue{} == ''",
          value: { boolValue: true },
        },
        {
          name: "eq_string_not_null",
          expr: "google.protobuf.StringValue{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_string_proto2_null",
          expr: "TestAllTypes{}.single_string_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_string_proto3_null",
          expr: "TestAllTypes{}.single_string_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_uint32",
          expr: "google.protobuf.UInt32Value{value: 42u} == 42u",
          value: { boolValue: true },
        },
        {
          name: "eq_uint32_empty",
          expr: "google.protobuf.UInt32Value{} == 0u",
          value: { boolValue: true },
        },
        {
          name: "eq_uint32_not_null",
          expr: "google.protobuf.UInt32Value{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_uint32_proto2_null",
          expr: "TestAllTypes{}.single_uint32_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_uint32_proto3_null",
          expr: "TestAllTypes{}.single_uint32_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_uint64",
          expr: "google.protobuf.UInt64Value{value: 4294967296u} == 4294967296u",
          value: { boolValue: true },
        },
        {
          name: "eq_uint64_empty",
          expr: "google.protobuf.UInt64Value{} == 0u",
          value: { boolValue: true },
        },
        {
          name: "eq_uint64_not_null",
          expr: "google.protobuf.UInt64Value{} != null",
          value: { boolValue: true },
        },
        {
          name: "eq_uint64_proto2_null",
          expr: "TestAllTypes{}.single_uint64_wrapper == null",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_uint64_proto3_null",
          expr: "TestAllTypes{}.single_uint64_wrapper == null",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_proto2",
          expr: "TestAllTypes{single_int64: 1234, single_string: '1234'} == TestAllTypes{single_int64: 1234, single_string: '1234'}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_proto3",
          expr: "TestAllTypes{single_int64: 1234, single_string: '1234'} == TestAllTypes{single_int64: 1234, single_string: '1234'}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_proto2_missing_fields_neq",
          expr: "TestAllTypes{single_int64: 1234} == TestAllTypes{single_string: '1234'}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "eq_proto3_missing_fields_neq",
          expr: "TestAllTypes{single_int64: 1234} == TestAllTypes{single_string: '1234'}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: false },
        },
        {
          name: "eq_proto_nan_equal",
          description:
            "For proto equality, fields with NaN value are treated as not equal.",
          expr: "TestAllTypes{single_double: double('NaN')} == TestAllTypes{single_double: double('NaN')}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "eq_proto_different_types",
          description:
            "At runtime, differently typed messages are treated as not equal.",
          expr: "dyn(TestAllTypes{}) == dyn(NestedTestAllTypes{})",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "eq_proto2_any_unpack_equal",
          description: "Any values should be unpacked and compared.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_proto2_any_unpack_not_equal",
          description: "Any values should be unpacked and compared.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'a\\000\\000\\000\\000\\000H\\223\\300r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "eq_proto2_any_unpack_bytewise_fallback_not_equal",
          description:
            "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "eq_proto2_any_unpack_bytewise_fallback_equal",
          description:
            "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "eq_proto3_any_unpack_equal",
          description: "Any values should be unpacked and compared.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "eq_proto3_any_unpack_not_equal",
          description: "Any values should be unpacked and compared.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'a\\000\\000\\000\\000\\000H\\223\\300r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: false },
        },
        {
          name: "eq_proto3_any_unpack_bytewise_fallback_not_equal",
          description:
            "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: false },
        },
        {
          name: "eq_proto3_any_unpack_bytewise_fallback_equal",
          description:
            "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "ne_literal",
      description: "Literals comparison on _!=_",
      test: [
        { name: "ne_int", expr: "24 != 42", value: { boolValue: true } },
        { name: "not_ne_int", expr: "1 != 1", value: { boolValue: false } },
        {
          name: "ne_int_double",
          expr: "dyn(24) != 24.1",
          value: { boolValue: true },
        },
        {
          name: "not_ne_int_double",
          expr: "dyn(1) != 1.0",
          value: { boolValue: false },
        },
        {
          name: "ne_int_uint",
          expr: "dyn(24) != 42u",
          value: { boolValue: true },
        },
        {
          name: "not_ne_int_uint",
          expr: "dyn(1) != 1u",
          value: { boolValue: false },
        },
        { name: "ne_uint", expr: "1u != 2u", value: { boolValue: true } },
        {
          name: "not_ne_uint",
          expr: "99u != 99u",
          value: { boolValue: false },
        },
        {
          name: "ne_uint_double",
          expr: "dyn(1u) != 2.0",
          value: { boolValue: true },
        },
        {
          name: "not_ne_uint_double",
          expr: "dyn(99u) != 99.0",
          value: { boolValue: false },
        },
        {
          name: "ne_double",
          expr: "9.0e+3 != 9001.0",
          value: { boolValue: true },
        },
        {
          name: "not_ne_double_nan",
          expr: "0.0/0.0 != 0.0/0.0",
          value: { boolValue: true },
        },
        {
          name: "not_ne_int_double_nan",
          expr: "dyn(1) != 0.0/0.0",
          value: { boolValue: true },
        },
        {
          name: "not_ne_uint_double_nan",
          expr: "dyn(1u) != 0.0/0.0",
          value: { boolValue: true },
        },
        {
          name: "not_ne_double",
          expr: "1.0 != 1e+0",
          value: { boolValue: false },
        },
        {
          name: "ne_double_int",
          expr: "dyn(9000) != 9001.0",
          value: { boolValue: true },
        },
        {
          name: "not_ne_double_int",
          expr: "dyn(1) != 1e+0",
          value: { boolValue: false },
        },
        {
          name: "ne_double_uint",
          expr: "dyn(9000u) != 9001.0",
          value: { boolValue: true },
        },
        {
          name: "not_ne_double_uint",
          expr: "dyn(1u) != 1e+0",
          value: { boolValue: false },
        },
        {
          name: "ne_double_nan",
          expr: "0.0/0.0 != 0.0/0.0",
          value: { boolValue: true },
        },
        { name: "ne_string", expr: "'abc' != ''", value: { boolValue: true } },
        {
          name: "not_ne_string",
          expr: "'abc' != 'abc'",
          value: { boolValue: false },
        },
        {
          name: "ne_string_unicode",
          expr: "'résumé' != 'resume'",
          value: { boolValue: true },
        },
        {
          name: "not_ne_string_unicode",
          expr: "'ίδιο' != 'ίδιο'",
          value: { boolValue: false },
        },
        {
          name: "ne_bytes",
          expr: "b'\\x00\\xFF' != b'ÿ'",
          value: { boolValue: true },
        },
        {
          name: "not_ne_bytes",
          expr: "b'\\303\\277' != b'ÿ'",
          value: { boolValue: false },
        },
        { name: "ne_bool", expr: "false != true", value: { boolValue: true } },
        {
          name: "not_ne_bool",
          expr: "true != true",
          value: { boolValue: false },
        },
        {
          name: "not_ne_null",
          description: "null can only be equal to null, or else it won't match",
          expr: "null != null",
          value: { boolValue: false },
        },
        {
          name: "ne_list_empty",
          expr: "[] != [1]",
          value: { boolValue: true },
        },
        {
          name: "not_ne_list_empty",
          expr: "[] != []",
          value: { boolValue: false },
        },
        {
          name: "ne_list_bool",
          expr: "[true, false, true] != [true, true, false]",
          value: { boolValue: true },
        },
        {
          name: "not_ne_list_bool",
          expr: "[false, true] != [false, true]",
          value: { boolValue: false },
        },
        {
          name: "not_ne_list_of_list",
          expr: "[[]] != [[]]",
          value: { boolValue: false },
        },
        {
          name: "ne_map_by_value",
          expr: "{'k':'v'} != {'k':'v1'}",
          value: { boolValue: true },
        },
        {
          name: "ne_map_by_key",
          expr: "{'k':true} != {'k1':true}",
          value: { boolValue: true },
        },
        {
          name: "not_ne_map_int_to_float",
          expr: "{1:1.0} != {1:1.0}",
          value: { boolValue: false },
        },
        {
          name: "not_ne_map_key_order",
          expr: "{'a':'b','c':'d'} != {'c':'d','a':'b'}",
          value: { boolValue: false },
        },
        {
          name: "ne_mixed_types",
          expr: "2u != 2",
          disableCheck: true,
          value: { boolValue: false },
        },
        {
          name: "ne_proto2",
          expr: "TestAllTypes{single_int64: 1234, single_string: '1234'} != TestAllTypes{single_int64: 1234, single_string: '1234'}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "ne_proto3",
          expr: "TestAllTypes{single_int64: 1234, single_string: '1234'} != TestAllTypes{single_int64: 1234, single_string: '1234'}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: false },
        },
        {
          name: "ne_proto2_missing_fields_neq",
          expr: "TestAllTypes{single_int64: 1234} != TestAllTypes{single_string: '1234'}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "ne_proto3_missing_fields_neq",
          expr: "TestAllTypes{single_int64: 1234} != TestAllTypes{single_string: '1234'}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "ne_proto_nan_not_equal",
          description:
            "For proto equality, NaN field values are not considered equal.",
          expr: "TestAllTypes{single_double: double('NaN')} != TestAllTypes{single_double: double('NaN')}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "ne_proto_different_types",
          description:
            "At runtime, comparing differently typed messages is false.",
          expr: "dyn(TestAllTypes{}) != dyn(NestedTestAllTypes{})",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: true },
        },
        {
          name: "ne_proto2_any_unpack",
          description: "Any values should be unpacked and compared.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} != TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "ne_proto2_any_unpack_bytewise_fallback",
          description:
            "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} != TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
        {
          name: "ne_proto3_any_unpack",
          description: "Any values should be unpacked and compared.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} != TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto2",
          value: { boolValue: false },
        },
        {
          name: "ne_proto3_any_unpack_bytewise_fallback",
          description:
            "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
          expr: "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} != TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
          container: "cel.expr.conformance.proto3",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "lt_literal",
      description:
        "Literals comparison on _<_. (a < b) == (b > a) == !(a >= b) == !(b <= a)",
      test: [
        { name: "lt_int", expr: "-1 < 0", value: { boolValue: true } },
        { name: "not_lt_int", expr: "0 < 0", value: { boolValue: false } },
        { name: "lt_uint", expr: "0u < 1u", value: { boolValue: true } },
        { name: "not_lt_uint", expr: "2u < 2u", value: { boolValue: false } },
        {
          name: "lt_double",
          expr: "1.0 < 1.0000001",
          value: { boolValue: true },
        },
        {
          name: "not_lt_double",
          description:
            "Following IEEE 754, negative zero compares equal to zero",
          expr: "-0.0 < 0.0",
          value: { boolValue: false },
        },
        { name: "lt_string", expr: "'a' < 'b'", value: { boolValue: true } },
        {
          name: "lt_string_empty_to_nonempty",
          expr: "'' < 'a'",
          value: { boolValue: true },
        },
        {
          name: "lt_string_case",
          expr: "'Abc' < 'aBC'",
          value: { boolValue: true },
        },
        {
          name: "lt_string_length",
          expr: "'abc' < 'abcd'",
          value: { boolValue: true },
        },
        {
          name: "lt_string_diacritical_mark_sensitive",
          description:
            "Verifies that the we're not using a string comparison function that strips diacritical marks (á)",
          expr: "'a' < '\\u00E1'",
          value: { boolValue: true },
        },
        {
          name: "not_lt_string_empty",
          expr: "'' < ''",
          value: { boolValue: false },
        },
        {
          name: "not_lt_string_same",
          expr: "'abc' < 'abc'",
          value: { boolValue: false },
        },
        {
          name: "not_lt_string_case_length",
          expr: "'a' < 'AB'",
          value: { boolValue: false },
        },
        {
          name: "unicode_order_lexical",
          description:
            "Compare the actual code points of the string, instead of decomposing ế into 'e' plus accent modifiers.",
          expr: "'f' < '\\u1EBF'",
          value: { boolValue: true },
        },
        { name: "lt_bytes", expr: "b'a' < b'b'", value: { boolValue: true } },
        {
          name: "not_lt_bytes_same",
          expr: "b'abc' < b'abc'",
          value: { boolValue: false },
        },
        {
          name: "not_lt_bytes_width",
          expr: "b'á' < b'b'",
          value: { boolValue: false },
        },
        {
          name: "lt_bool_false_first",
          expr: "false < true",
          value: { boolValue: true },
        },
        {
          name: "not_lt_bool_same",
          expr: "true < true",
          value: { boolValue: false },
        },
        {
          name: "not_lt_bool_true_first",
          expr: "true < false",
          value: { boolValue: false },
        },
        {
          name: "lt_list_unsupported",
          expr: "[0] < [1]",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "lt_map_unsupported",
          expr: "{0:'a'} < {1:'b'}",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "lt_null_unsupported",
          description: "Ensure _<_ doesn't have a binding for null",
          expr: "null < null",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "lt_mixed_types_error",
          expr: "'foo' < 1024",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "lt_dyn_int_uint",
          expr: "dyn(1) < 2u",
          value: { boolValue: true },
        },
        {
          name: "lt_dyn_int_double",
          expr: "dyn(1) < 2.0",
          value: { boolValue: true },
        },
        {
          name: "lt_dyn_uint_int",
          expr: "dyn(1u) < 2",
          value: { boolValue: true },
        },
        {
          name: "lt_dyn_uint_double",
          expr: "dyn(1u) < 2.0",
          value: { boolValue: true },
        },
        {
          name: "lt_dyn_double_int",
          expr: "dyn(1.0) < 2",
          value: { boolValue: true },
        },
        {
          name: "lt_dyn_double_uint",
          expr: "dyn(1.0) < 2u",
          value: { boolValue: true },
        },
        {
          name: "not_lt_dyn_int_uint",
          expr: "dyn(1) < 1u",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_int_double",
          expr: "dyn(1) < 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_uint_int",
          expr: "dyn(1u) < 1",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_uint_double",
          expr: "dyn(1u) < 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_double_int",
          expr: "dyn(1.0) < 1",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_double_uint",
          expr: "dyn(1.0) < 1u",
          value: { boolValue: false },
        },
        {
          name: "lt_dyn_int_big_uint",
          expr: "dyn(1) < 9223372036854775808u",
          value: { boolValue: true },
        },
        {
          name: "lt_dyn_small_int_uint",
          expr: "dyn(-1) < 0u",
          value: { boolValue: true },
        },
        {
          name: "not_lt_dyn_int_big_lossy_double",
          expr: "dyn(9223372036854775807) < 9223372036854775808.0",
          value: { boolValue: false },
        },
        {
          name: "lt_dyn_int_big_lossy_double",
          expr: "dyn(9223372036854775807) < 9223372036854777857.0",
          value: { boolValue: true },
        },
        {
          name: "not_lt_dyn_int_small_double",
          expr: "dyn(9223372036854775807) < -9223372036854777857.0",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_int_small_lossy_double",
          expr: "dyn(-9223372036854775808) < -9223372036854775809.0",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_uint_small_int",
          expr: "dyn(1u) < -9223372036854775808",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_big_uint_int",
          expr: "dyn(9223372036854775808u) < 1",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_uint_small_double",
          expr: "dyn(18446744073709551615u) < -1.0",
          value: { boolValue: false },
        },
        {
          name: "lt_dyn_uint_big_double",
          expr: "dyn(18446744073709551615u) < 18446744073709590000.0",
          value: { boolValue: true },
        },
        {
          name: "not_lt_dyn_big_double_uint",
          expr: "dyn(18446744073709553665.0) < 18446744073709551615u",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_big_double_int",
          expr: "dyn(9223372036854775808.0) < 9223372036854775807",
          value: { boolValue: false },
        },
        {
          name: "not_lt_dyn_small_double_int",
          expr: "dyn(-9223372036854775809.0) < -9223372036854775808",
          value: { boolValue: false },
        },
      ],
    },
    {
      name: "gt_literal",
      description: "Literals comparison on _>_",
      test: [
        { name: "gt_int", expr: "42 > -42", value: { boolValue: true } },
        { name: "not_gt_int", expr: "0 > 0", value: { boolValue: false } },
        { name: "gt_uint", expr: "48u > 46u", value: { boolValue: true } },
        { name: "not_gt_uint", expr: "0u > 999u", value: { boolValue: false } },
        { name: "gt_double", expr: "1e+1 > 1e+0", value: { boolValue: true } },
        {
          name: "not_gt_double",
          expr: ".99 > 9.9e-1",
          value: { boolValue: false },
        },
        {
          name: "gt_string_case",
          expr: "'abc' > 'aBc'",
          value: { boolValue: true },
        },
        {
          name: "gt_string_to_empty",
          expr: "'A' > ''",
          value: { boolValue: true },
        },
        {
          name: "not_gt_string_empty_to_empty",
          expr: "'' > ''",
          value: { boolValue: false },
        },
        {
          name: "gt_string_unicode",
          expr: "'α' > 'omega'",
          value: { boolValue: true },
        },
        {
          name: "gt_bytes_one",
          expr: "b'\u0001' > b'\u0000'",
          value: { boolValue: true },
        },
        {
          name: "gt_bytes_one_to_empty",
          expr: "b'\u0000' > b''",
          value: { boolValue: true },
        },
        {
          name: "not_gt_bytes_sorting",
          expr: "b'\u0000\u0001' > b'\u0001'",
          value: { boolValue: false },
        },
        {
          name: "gt_bool_true_false",
          expr: "true > false",
          value: { boolValue: true },
        },
        {
          name: "not_gt_bool_false_true",
          expr: "false > true",
          value: { boolValue: false },
        },
        {
          name: "not_gt_bool_same",
          expr: "true > true",
          value: { boolValue: false },
        },
        {
          name: "gt_null_unsupported",
          expr: "null > null",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "gt_list_unsupported",
          expr: "[1] > [0]",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "gt_map_unsupported",
          expr: "{1:'b'} > {0:'a'}",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "gt_mixed_types_error",
          expr: "'foo' > 1024",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "gt_dyn_int_uint",
          expr: "dyn(2) > 1u",
          value: { boolValue: true },
        },
        {
          name: "gt_dyn_int_double",
          expr: "dyn(2) > 1.0",
          value: { boolValue: true },
        },
        {
          name: "gt_dyn_uint_int",
          expr: "dyn(2u) > 1",
          value: { boolValue: true },
        },
        {
          name: "gt_dyn_uint_double",
          expr: "dyn(2u) > 1.0",
          value: { boolValue: true },
        },
        {
          name: "gt_dyn_double_int",
          expr: "dyn(2.0) > 1",
          value: { boolValue: true },
        },
        {
          name: "gt_dyn_double_uint",
          expr: "dyn(2.0) > 1u",
          value: { boolValue: true },
        },
        {
          name: "not_gt_dyn_int_uint",
          expr: "dyn(1) > 1u",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_int_double",
          expr: "dyn(1) > 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_uint_int",
          expr: "dyn(1u) > 1",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_uint_double",
          expr: "dyn(1u) > 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_double_int",
          expr: "dyn(1.0) > 1",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_double_uint",
          expr: "dyn(1.0) > 1u",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_int_big_uint",
          expr: "dyn(1) > 9223372036854775808u",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_small_int_uint",
          expr: "dyn(-1) > 0u",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_int_big_double",
          expr: "dyn(9223372036854775807) > 9223372036854775808.0",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_int_small_lossy_double",
          description:
            "The conversion of the int to double is lossy and the numbers end up being equal",
          expr: "dyn(-9223372036854775808) > -9223372036854775809.0",
          value: { boolValue: false },
        },
        {
          name: "gt_dyn_int_small_lossy_double_greater",
          expr: "dyn(-9223372036854775808) > -9223372036854777857.0",
          value: { boolValue: true },
        },
        {
          name: "gt_dyn_uint_small_int",
          expr: "dyn(1u) > -1",
          value: { boolValue: true },
        },
        {
          name: "gt_dyn_big_uint_int",
          expr: "dyn(9223372036854775808u) > 1",
          value: { boolValue: true },
        },
        {
          name: "gt_dyn_uint_small_double",
          expr: "dyn(9223372036854775807u) > -1.0",
          value: { boolValue: true },
        },
        {
          name: "not_gt_dyn_uint_big_double",
          expr: "dyn(18446744073709551615u) > 18446744073709590000.0",
          value: { boolValue: false },
        },
        {
          name: "gt_dyn_big_double_uint",
          expr: "dyn(18446744073709553665.0) > 18446744073709551615u",
          value: { boolValue: true },
        },
        {
          name: "not_gt_dyn_big_double_int",
          expr: "dyn(9223372036854775808.0) > 9223372036854775807",
          value: { boolValue: false },
        },
        {
          name: "not_gt_dyn_small_double_int",
          expr: "dyn(-9223372036854775809.0) > -9223372036854775808",
          value: { boolValue: false },
        },
      ],
    },
    {
      name: "lte_literal",
      description: "Literals comparison on _<=_",
      test: [
        { name: "lte_int_lt", expr: "0 <= 1", value: { boolValue: true } },
        { name: "lte_int_eq", expr: "1 <= 1", value: { boolValue: true } },
        {
          name: "not_lte_int_gt",
          expr: "1 <= -1",
          value: { boolValue: false },
        },
        { name: "lte_uint_lt", expr: "0u <= 1u", value: { boolValue: true } },
        { name: "lte_uint_eq", expr: "1u <= 1u", value: { boolValue: true } },
        {
          name: "not_lte_uint_gt",
          expr: "1u <= 0u",
          value: { boolValue: false },
        },
        {
          name: "lte_double_lt",
          expr: "0.0 <= 0.1e-31",
          value: { boolValue: true },
        },
        {
          name: "lte_double_eq",
          expr: "0.0 <= 0e-1",
          value: { boolValue: true },
        },
        {
          name: "not_lte_double_gt",
          expr: "1.0 <= 0.99",
          value: { boolValue: false },
        },
        {
          name: "lte_string_empty",
          expr: "'' <= ''",
          value: { boolValue: true },
        },
        {
          name: "lte_string_from_empty",
          expr: "'' <= 'a'",
          value: { boolValue: true },
        },
        {
          name: "not_lte_string_to_empty",
          expr: "'a' <= ''",
          value: { boolValue: false },
        },
        {
          name: "lte_string_lexicographical",
          expr: "'aBc' <= 'abc'",
          value: { boolValue: true },
        },
        {
          name: "lte_string_unicode_eq",
          expr: "'α' <= 'α'",
          value: { boolValue: true },
        },
        {
          name: "lte_string_unicode_lt",
          expr: "'a' <= 'α'",
          value: { boolValue: true },
        },
        {
          name: "not_lte_string_unicode",
          expr: "'α' <= 'a'",
          value: { boolValue: false },
        },
        {
          name: "lte_bytes_empty",
          expr: "b'' <= b'\u0000'",
          value: { boolValue: true },
        },
        {
          name: "not_lte_bytes_length",
          expr: "b'\u0001\u0000' <= b'\u0001'",
          value: { boolValue: false },
        },
        {
          name: "lte_bool_false_true",
          expr: "false <= true",
          value: { boolValue: true },
        },
        {
          name: "lte_bool_false_false",
          expr: "false <= false",
          value: { boolValue: true },
        },
        {
          name: "lte_bool_true_false",
          expr: "true <= false",
          value: { boolValue: false },
        },
        {
          name: "lte_null_unsupported",
          expr: "null <= null",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "lte_list_unsupported",
          expr: "[0] <= [0]",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "lte_map_unsupported",
          expr: "{0:'a'} <= {1:'b'}",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "lte_mixed_types_error",
          expr: "'foo' <= 1024",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "lte_dyn_int_uint",
          expr: "dyn(1) <= 2u",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_int_double",
          expr: "dyn(1) <= 2.0",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_uint_int",
          expr: "dyn(1u) <= 2",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_uint_double",
          expr: "dyn(1u) <= 2.0",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_double_int",
          expr: "dyn(1.0) <= 2",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_double_uint",
          expr: "dyn(1.0) <= 2u",
          value: { boolValue: true },
        },
        {
          name: "not_lte_dyn_int_uint",
          expr: "dyn(2) <= 1u",
          value: { boolValue: false },
        },
        {
          name: "not_lte_dyn_int_double",
          expr: "dyn(2) <= 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_lte_dyn_uint_int",
          expr: "dyn(2u) <= 1",
          value: { boolValue: false },
        },
        {
          name: "not_lte_dyn_uint_double",
          expr: "dyn(2u) <= 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_lte_dyn_double_int",
          expr: "dyn(2.0) <= 1",
          value: { boolValue: false },
        },
        {
          name: "not_lte_dyn_double_uint",
          expr: "dyn(2.0) <= 1u",
          value: { boolValue: false },
        },
        {
          name: "lte_dyn_int_big_uint",
          expr: "dyn(1) <= 9223372036854775808u",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_small_int_uint",
          expr: "dyn(-1) <= 0u",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_int_big_double",
          expr: "dyn(9223372036854775807) <= 9223372036854775808.0",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_int_small_lossy_double",
          description:
            "The conversion of the int to double is lossy and the numbers end up being equal",
          expr: "dyn(-9223372036854775808) <= -9223372036854775809.0",
          value: { boolValue: true },
        },
        {
          name: "not_lte_dyn_int_small_lossy_double_less",
          expr: "dyn(-9223372036854775808) <= -9223372036854777857.0",
          value: { boolValue: false },
        },
        {
          name: "not_lte_dyn_uint_small_int",
          expr: "dyn(1u) <= -9223372036854775808",
          value: { boolValue: false },
        },
        {
          name: "not_lte_dyn_big_uint_int",
          expr: "dyn(9223372036854775808u) <= 1",
          value: { boolValue: false },
        },
        {
          name: "not_lte_dyn_uint_small_double",
          expr: "dyn(18446744073709551615u) <= -1.0",
          value: { boolValue: false },
        },
        {
          name: "lte_dyn_uint_big_double",
          expr: "dyn(18446744073709551615u) <= 18446744073709590000.0",
          value: { boolValue: true },
        },
        {
          name: "not_lte_dyn_big_double_uint",
          expr: "dyn(18446744073709553665.0) <= 18446744073709551615u",
          value: { boolValue: false },
        },
        {
          name: "lte_dyn_big_double_int",
          expr: "dyn(9223372036854775808.0) <= 9223372036854775807",
          value: { boolValue: true },
        },
        {
          name: "lte_dyn_small_double_int",
          expr: "dyn(-9223372036854775809.0) <= -9223372036854775808",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "gte_literal",
      description: "Literals comparison on _>=_",
      test: [
        { name: "gte_int_gt", expr: "0 >= -1", value: { boolValue: true } },
        { name: "gte_int_eq", expr: "999 >= 999", value: { boolValue: true } },
        {
          name: "not_gte_int_lt",
          expr: "999 >= 1000",
          value: { boolValue: false },
        },
        { name: "gte_uint_gt", expr: "1u >= 0u", value: { boolValue: true } },
        { name: "gte_uint_eq", expr: "0u >= 0u", value: { boolValue: true } },
        {
          name: "not_gte_uint_lt",
          expr: "1u >= 10u",
          value: { boolValue: false },
        },
        {
          name: "gte_double_gt",
          expr: "1e+1 >= 1e+0",
          value: { boolValue: true },
        },
        {
          name: "gte_double_eq",
          expr: "9.80665 >= 9.80665e+0",
          value: { boolValue: true },
        },
        {
          name: "not_gte_double_lt",
          expr: "0.9999 >= 1.0",
          value: { boolValue: false },
        },
        {
          name: "gte_string_empty",
          expr: "'' >= ''",
          value: { boolValue: true },
        },
        {
          name: "gte_string_to_empty",
          expr: "'a' >= ''",
          value: { boolValue: true },
        },
        {
          name: "gte_string_empty_to_nonempty",
          expr: "'' >= 'a'",
          value: { boolValue: false },
        },
        {
          name: "gte_string_length",
          expr: "'abcd' >= 'abc'",
          value: { boolValue: true },
        },
        {
          name: "not_gte_string_lexicographical",
          expr: "'abc' >= 'abd'",
          value: { boolValue: false },
        },
        {
          name: "gte_string_unicode_eq",
          expr: "'τ' >= 'τ'",
          value: { boolValue: true },
        },
        {
          name: "gte_string_unicode_gt",
          expr: "'τ' >= 't'",
          value: { boolValue: true },
        },
        {
          name: "not_get_string_unicode",
          expr: "'t' >= 'τ'",
          value: { boolValue: false },
        },
        {
          name: "gte_bytes_to_empty",
          expr: "b'\u0000' >= b''",
          value: { boolValue: true },
        },
        {
          name: "not_gte_bytes_empty_to_nonempty",
          expr: "b'' >= b'\u0000'",
          value: { boolValue: false },
        },
        {
          name: "gte_bytes_samelength",
          expr: "b'\u0000\u0001' >= b'\u0001\u0000'",
          value: { boolValue: false },
        },
        {
          name: "gte_bool_gt",
          expr: "true >= false",
          value: { boolValue: true },
        },
        {
          name: "gte_bool_eq",
          expr: "true >= true",
          value: { boolValue: true },
        },
        {
          name: "not_gte_bool_lt",
          expr: "false >= true",
          value: { boolValue: false },
        },
        {
          name: "gte_null_unsupported",
          expr: "null >= null",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "gte_list_unsupported",
          expr: "['y'] >= ['x']",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "gte_map_unsupported",
          expr: "{1:'b'} >= {0:'a'}",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "gte_mixed_types_error",
          expr: "'foo' >= 1.0",
          disableCheck: true,
          evalError: { errors: [{ message: "no such overload" }] },
        },
        {
          name: "gte_dyn_int_uint",
          expr: "dyn(2) >= 1u",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_int_double",
          expr: "dyn(2) >= 1.0",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_uint_int",
          expr: "dyn(2u) >= 1",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_uint_double",
          expr: "dyn(2u) >= 1.0",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_double_int",
          expr: "dyn(2.0) >= 1",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_double_uint",
          expr: "dyn(2.0) >= 1u",
          value: { boolValue: true },
        },
        {
          name: "not_gte_dyn_int_uint",
          expr: "dyn(0) >= 1u",
          value: { boolValue: false },
        },
        {
          name: "not_gte_dyn_int_double",
          expr: "dyn(0) >= 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_gte_dyn_uint_int",
          expr: "dyn(0u) >= 1",
          value: { boolValue: false },
        },
        {
          name: "not_gte_dyn_uint_double",
          expr: "dyn(0u) >= 1.0",
          value: { boolValue: false },
        },
        {
          name: "not_gte_dyn_double_int",
          expr: "dyn(0.0) >= 1",
          value: { boolValue: false },
        },
        {
          name: "not_gte_dyn_double_uint",
          expr: "dyn(0.0) >= 1u",
          value: { boolValue: false },
        },
        {
          name: "not_gte_dyn_int_big_uint",
          expr: "dyn(1) >= 9223372036854775808u",
          value: { boolValue: false },
        },
        {
          name: "not_gte_dyn_small_int_uint",
          expr: "dyn(-1) >= 0u",
          value: { boolValue: false },
        },
        {
          name: "gte_dyn_int_big_lossy_double",
          expr: "dyn(9223372036854775807) >= 9223372036854775808.0",
          value: { boolValue: true },
        },
        {
          name: "not_gte_dyn_int_big_double",
          expr: "dyn(9223372036854775807) >= 9223372036854777857.0",
          value: { boolValue: false },
        },
        {
          name: "gte_dyn_int_small_lossy_double_equal",
          description:
            "The conversion of the int to double is lossy and the numbers end up being equal",
          expr: "dyn(-9223372036854775808) >= -9223372036854775809.0",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_int_small_lossy_double_greater",
          expr: "dyn(-9223372036854775808) >= -9223372036854777857.0",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_uint_small_int",
          expr: "dyn(1u) >= -1",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_big_uint_int",
          expr: "dyn(9223372036854775808u) >= 1",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_uint_small_double",
          expr: "dyn(9223372036854775807u) >= -1.0",
          value: { boolValue: true },
        },
        {
          name: "not_gte_dyn_uint_big_double",
          expr: "dyn(18446744073709551615u) >= 18446744073709553665.0",
          value: { boolValue: false },
        },
        {
          name: "gte_dyn_big_double_uint",
          expr: "dyn(18446744073709553665.0) >= 18446744073709551615u",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_big_double_int",
          expr: "dyn(9223372036854775808.0) >= 9223372036854775807",
          value: { boolValue: true },
        },
        {
          name: "gte_dyn_small_double_int",
          expr: "dyn(-9223372036854775809.0) >= -9223372036854775808",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "in_list_literal",
      description:
        "Set membership tests using list literals and the 'in' operator",
      test: [
        {
          name: "elem_not_in_empty_list",
          expr: "'empty' in []",
          value: { boolValue: false },
        },
        {
          name: "elem_in_list",
          expr: "'elem' in ['elem', 'elemA', 'elemB']",
          value: { boolValue: true },
        },
        {
          name: "elem_not_in_list",
          expr: "'not' in ['elem1', 'elem2', 'elem3']",
          value: { boolValue: false },
        },
        {
          name: "elem_in_mixed_type_list",
          description:
            "Set membership tests should succeed if the 'elem' exists in a mixed element type list.",
          expr: "'elem' in [1, 'elem', 2]",
          value: { boolValue: true },
        },
        {
          name: "elem_in_mixed_type_list_cross_type",
          description:
            "Set membership tests should return false due to the introduction of heterogeneous-equality. Set membership via 'in' is equivalent to the macro exists() behavior.",
          expr: "'elem' in [1u, 'str', 2, b'bytes']",
          value: { boolValue: false },
        },
      ],
    },
    {
      name: "in_map_literal",
      description:
        "Set membership tests using map literals and the 'in' operator",
      test: [
        {
          name: "key_not_in_empty_map",
          expr: "'empty' in {}",
          value: { boolValue: false },
        },
        {
          name: "key_in_map",
          expr: "'key' in {'key':'1', 'other':'2'}",
          value: { boolValue: true },
        },
        {
          name: "key_not_in_map",
          expr: "'key' in {'lock':1, 'gate':2}",
          value: { boolValue: false },
        },
        {
          name: "key_in_mixed_key_type_map",
          description:
            "Map keys are of mixed type, but since the key is present the result is true.",
          expr: "'key' in {3:3.0, 'key':2u}",
          value: { boolValue: true },
        },
        {
          name: "key_in_mixed_key_type_map_cross_type",
          expr: "'key' in {1u:'str', 2:b'bytes'}",
          value: { boolValue: false },
        },
      ],
    },
    {
      name: "bound",
      description: "Comparing bound variables with literals or other variables",
      test: [
        {
          name: "bytes_gt_left_false",
          expr: "x > b'\u0000'",
          typeEnv: [{ name: "x", ident: { type: { primitive: "BYTES" } } }],
          bindings: { x: { value: { bytesValue: "AA==" } } },
          value: { boolValue: false },
        },
        {
          name: "int_lte_right_true",
          expr: "123 <= x",
          typeEnv: [{ name: "x", ident: { type: { primitive: "INT64" } } }],
          bindings: { x: { value: { int64Value: "124" } } },
          value: { boolValue: true },
        },
        {
          name: "bool_lt_right_true",
          expr: "false < x",
          typeEnv: [{ name: "x", ident: { type: { primitive: "BOOL" } } }],
          bindings: { x: { value: { boolValue: true } } },
          value: { boolValue: true },
        },
        {
          name: "double_ne_left_false",
          expr: "x != 9.8",
          typeEnv: [{ name: "x", ident: { type: { primitive: "DOUBLE" } } }],
          bindings: { x: { value: { doubleValue: 9.8 } } },
          value: { boolValue: false },
        },
        {
          name: "map_ne_right_false",
          expr: "{'a':'b','c':'d'} != x",
          typeEnv: [
            {
              name: "x",
              ident: {
                type: {
                  mapType: {
                    keyType: { primitive: "STRING" },
                    valueType: { primitive: "STRING" },
                  },
                },
              },
            },
          ],
          bindings: {
            x: {
              value: {
                mapValue: {
                  entries: [
                    { key: { stringValue: "c" }, value: { stringValue: "d" } },
                    { key: { stringValue: "a" }, value: { stringValue: "b" } },
                  ],
                },
              },
            },
          },
          value: { boolValue: false },
        },
        {
          name: "null_eq_left_true",
          description:
            "A comparison _==_ against null only binds if the type is determined to be null or we skip the type checking",
          expr: "x == null",
          typeEnv: [{ name: "x", ident: { type: { null: null } } }],
          bindings: { x: { value: { nullValue: null } } },
          value: { boolValue: true },
        },
        {
          name: "list_eq_right_false",
          expr: "[1, 2] == x",
          typeEnv: [
            {
              name: "x",
              ident: {
                type: { listType: { elemType: { primitive: "INT64" } } },
              },
            },
          ],
          bindings: {
            x: {
              value: {
                listValue: {
                  values: [{ int64Value: "2" }, { int64Value: "1" }],
                },
              },
            },
          },
          value: { boolValue: false },
        },
        {
          name: "string_gte_right_true",
          expr: "'abcd' >= x",
          typeEnv: [{ name: "x", ident: { type: { primitive: "STRING" } } }],
          bindings: { x: { value: { stringValue: "abc" } } },
          value: { boolValue: true },
        },
        {
          name: "uint_eq_right_false",
          expr: "999u == x",
          typeEnv: [{ name: "x", ident: { type: { primitive: "UINT64" } } }],
          bindings: { x: { value: { uint64Value: "1000" } } },
          value: { boolValue: false },
        },
        {
          name: "null_lt_right_no_such_overload",
          description:
            "There is no _<_ operation for null, even if both operands are null",
          expr: "null < x",
          disableCheck: true,
          bindings: { x: { value: { nullValue: null } } },
          evalError: { errors: [{ message: "no such overload" }] },
        },
      ],
    },
  ],
};
