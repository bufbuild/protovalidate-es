import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "timestamps",
  description: "Timestamp and duration tests.",
  section: [
    {
      name: "timestamp_conversions",
      description: "Conversions of timestamps to other types.",
      test: [
        {
          name: "toInt_timestamp",
          expr: "int(timestamp('2009-02-13T23:31:30Z'))",
          value: { int64Value: "1234567890" },
        },
        {
          name: "toString_timestamp",
          expr: "string(timestamp('2009-02-13T23:31:30Z'))",
          value: { stringValue: "2009-02-13T23:31:30Z" },
        },
        {
          name: "toString_timestamp_nanos",
          expr: "string(timestamp('9999-12-31T23:59:59.999999999Z'))",
          value: { stringValue: "9999-12-31T23:59:59.999999999Z" },
        },
        {
          name: "toType_timestamp",
          expr: "type(timestamp('2009-02-13T23:31:30Z'))",
          value: { typeValue: "google.protobuf.Timestamp" },
        },
      ],
    },
    {
      name: "duration_conversions",
      description: "Conversions of durations to other types.",
      test: [
        {
          name: "toString_duration",
          expr: "string(duration('1000000s'))",
          value: { stringValue: "1000000s" },
        },
        {
          name: "toType_duration",
          expr: "type(duration('1000000s'))",
          value: { typeValue: "google.protobuf.Duration" },
        },
      ],
    },
    {
      name: "timestamp_selectors",
      description: "Timestamp selection operators without timezones",
      test: [
        {
          name: "getDate",
          expr: "timestamp('2009-02-13T23:31:30Z').getDate()",
          value: { int64Value: "13" },
        },
        {
          name: "getDayOfMonth",
          expr: "timestamp('2009-02-13T23:31:30Z').getDayOfMonth()",
          value: { int64Value: "12" },
        },
        {
          name: "getDayOfWeek",
          expr: "timestamp('2009-02-13T23:31:30Z').getDayOfWeek()",
          value: { int64Value: "5" },
        },
        {
          name: "getDayOfYear",
          expr: "timestamp('2009-02-13T23:31:30Z').getDayOfYear()",
          value: { int64Value: "43" },
        },
        {
          name: "getFullYear",
          expr: "timestamp('2009-02-13T23:31:30Z').getFullYear()",
          value: { int64Value: "2009" },
        },
        {
          name: "getHours",
          expr: "timestamp('2009-02-13T23:31:30Z').getHours()",
          value: { int64Value: "23" },
        },
        {
          name: "getMilliseconds",
          expr: "timestamp('2009-02-13T23:31:20.123Z').getMilliseconds()",
          value: { int64Value: "123" },
        },
        {
          name: "getMinutes",
          expr: "timestamp('2009-02-13T23:31:30Z').getMinutes()",
          value: { int64Value: "31" },
        },
        {
          name: "getMonth",
          expr: "timestamp('2009-02-13T23:31:30Z').getMonth()",
          value: { int64Value: "1" },
        },
        {
          name: "getSeconds",
          expr: "timestamp('2009-02-13T23:31:30Z').getSeconds()",
          value: { int64Value: "30" },
        },
      ],
    },
    {
      name: "timestamp_selectors_tz",
      description: "Timestamp selection operators with timezones",
      test: [
        {
          name: "getDate",
          expr: "timestamp('2009-02-13T23:31:30Z').getDate('Australia/Sydney')",
          value: { int64Value: "14" },
        },
        {
          name: "getDayOfMonth_name_pos",
          expr: "timestamp('2009-02-13T23:31:30Z').getDayOfMonth('US/Central')",
          value: { int64Value: "12" },
        },
        {
          name: "getDayOfMonth_numerical_pos",
          expr: "timestamp('2009-02-13T23:31:30Z').getDayOfMonth('+11:00')",
          value: { int64Value: "13" },
        },
        {
          name: "getDayOfMonth_numerical_neg",
          expr: "timestamp('2009-02-13T02:00:00Z').getDayOfMonth('-02:30')",
          value: { int64Value: "11" },
        },
        {
          name: "getDayOfMonth_name_neg",
          expr: "timestamp('2009-02-13T02:00:00Z').getDayOfMonth('America/St_Johns')",
          value: { int64Value: "11" },
        },
        {
          name: "getDayOfWeek",
          expr: "timestamp('2009-02-13T23:31:30Z').getDayOfWeek('UTC')",
          value: { int64Value: "5" },
        },
        {
          name: "getDayOfYear",
          expr: "timestamp('2009-02-13T23:31:30Z').getDayOfYear('US/Central')",
          value: { int64Value: "43" },
        },
        {
          name: "getFullYear",
          expr: "timestamp('2009-02-13T23:31:30Z').getFullYear('-09:30')",
          value: { int64Value: "2009" },
        },
        {
          name: "getHours",
          expr: "timestamp('2009-02-13T23:31:30Z').getHours('02:00')",
          value: { int64Value: "1" },
        },
        {
          name: "getMinutes",
          expr: "timestamp('2009-02-13T23:31:30Z').getMinutes('Asia/Kathmandu')",
          value: { int64Value: "16" },
        },
        {
          name: "getMonth",
          expr: "timestamp('2009-02-13T23:31:30Z').getMonth('UTC')",
          value: { int64Value: "1" },
        },
        {
          name: "getSeconds",
          expr: "timestamp('2009-02-13T23:31:30Z').getSeconds('-00:00')",
          value: { int64Value: "30" },
        },
      ],
    },
    {
      name: "timestamp_equality",
      description: "Equality operations on timestamps.",
      test: [
        {
          name: "eq_same",
          expr: "timestamp('2009-02-13T23:31:30Z') == timestamp('2009-02-13T23:31:30Z')",
          value: { boolValue: true },
        },
        {
          name: "eq_diff",
          expr: "timestamp('2009-02-13T23:31:29Z') == timestamp('2009-02-13T23:31:30Z')",
          value: { boolValue: false },
        },
        {
          name: "neq_same",
          expr: "timestamp('1945-05-07T02:41:00Z') != timestamp('1945-05-07T02:41:00Z')",
          value: { boolValue: false },
        },
        {
          name: "neq_diff",
          expr: "timestamp('2000-01-01T00:00:00Z') != timestamp('2001-01-01T00:00:00Z')",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "duration_equality",
      description: "Equality tests for durations.",
      test: [
        {
          name: "eq_same",
          expr: "duration('123s') == duration('123s')",
          value: { boolValue: true },
        },
        {
          name: "eq_diff",
          expr: "duration('60s') == duration('3600s')",
          value: { boolValue: false },
        },
        {
          name: "neq_same",
          expr: "duration('604800s') != duration('604800s')",
          value: { boolValue: false },
        },
        {
          name: "neq_diff",
          expr: "duration('86400s') != duration('86164s')",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "timestamp_arithmetic",
      description: "Arithmetic operations on timestamps and/or durations.",
      test: [
        {
          name: "add_duration_to_time",
          expr: "timestamp('2009-02-13T23:00:00Z') + duration('240s') == timestamp('2009-02-13T23:04:00Z')",
          value: { boolValue: true },
        },
        {
          name: "add_time_to_duration",
          expr: "duration('120s') + timestamp('2009-02-13T23:01:00Z') == timestamp('2009-02-13T23:03:00Z')",
          value: { boolValue: true },
        },
        {
          name: "add_duration_to_duration",
          expr: "duration('600s') + duration('50s') == duration('650s')",
          value: { boolValue: true },
        },
        {
          name: "add_time_to_duration_nanos_negative",
          expr: "timestamp('0001-01-01T00:00:01.000000001Z') + duration('-999999999ns') == timestamp('0001-01-01T00:00:00.000000002Z')",
          value: { boolValue: true },
        },
        {
          name: "add_time_to_duration_nanos_positive",
          expr: "timestamp('0001-01-01T00:00:01.999999999Z') + duration('999999999ns') == timestamp('0001-01-01T00:00:02.999999998Z')",
          value: { boolValue: true },
        },
        {
          name: "subtract_duration_from_time",
          expr: "timestamp('2009-02-13T23:10:00Z') - duration('600s') == timestamp('2009-02-13T23:00:00Z')",
          value: { boolValue: true },
        },
        {
          name: "subtract_time_from_time",
          expr: "timestamp('2009-02-13T23:31:00Z') - timestamp('2009-02-13T23:29:00Z') == duration('120s')",
          value: { boolValue: true },
        },
        {
          name: "subtract_duration_from_duration",
          expr: "duration('900s') - duration('42s') == duration('858s')",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "comparisons",
      description: "Comparisons on timestamps and/or durations.",
      test: [
        {
          name: "leq_timestamp_true",
          expr: "timestamp('2009-02-13T23:00:00Z') <= timestamp('2009-02-13T23:00:00Z')",
          value: { boolValue: true },
        },
        {
          name: "leq_timestamp_false",
          expr: "timestamp('2009-02-13T23:00:00Z') <= timestamp('2009-02-13T22:59:59Z')",
          value: { boolValue: false },
        },
        {
          name: "leq_duration_true",
          expr: "duration('200s') <= duration('200s')",
          value: { boolValue: true },
        },
        {
          name: "leq_duration_false",
          expr: "duration('300s') <= duration('200s')",
          value: { boolValue: false },
        },
        {
          name: "less_timestamp_true",
          expr: "timestamp('2009-02-13T23:00:00Z') < timestamp('2009-03-13T23:00:00Z')",
          value: { boolValue: true },
        },
        {
          name: "less_duration_true",
          expr: "duration('200s') < duration('300s')",
          value: { boolValue: true },
        },
        {
          name: "geq_timestamp_true",
          expr: "timestamp('2009-02-13T23:00:00Z') >= timestamp('2009-02-13T23:00:00Z')",
          value: { boolValue: true },
        },
        {
          name: "geq_timestamp_false",
          expr: "timestamp('2009-02-13T22:58:00Z') >= timestamp('2009-02-13T23:00:00Z')",
          value: { boolValue: false },
        },
        {
          name: "geq_duration_true",
          expr: "duration('200s') >= duration('200s')",
          value: { boolValue: true },
        },
        {
          name: "geq_duration_false",
          expr: "duration('120s') >= duration('200s')",
          value: { boolValue: false },
        },
        {
          name: "greater_timestamp_true",
          expr: "timestamp('2009-02-13T23:59:00Z') > timestamp('2009-02-13T23:00:00Z')",
          value: { boolValue: true },
        },
        {
          name: "greater_duration_true",
          expr: "duration('300s') > duration('200s')",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "duration_converters",
      description:
        "Conversion functions on durations. Unlike timestamps, we don't, e.g. select the 'minutes' field - we convert the duration to integer minutes.",
      test: [
        {
          name: "get_hours",
          expr: "duration('10000s').getHours()",
          value: { int64Value: "2" },
        },
        {
          name: "get_milliseconds",
          description:
            "Obtain the milliseconds component of the duration. Note, this is not the same as converting the duration to milliseconds. This behavior will be deprecated.",
          expr: "x.getMilliseconds()",
          typeEnv: [
            {
              name: "x",
              ident: { type: { messageType: "google.protobuf.Duration" } },
            },
          ],
          bindings: {
            x: {
              value: {
                objectValue: {
                  "@type": "type.googleapis.com/google.protobuf.Duration",
                  value: "123.321456789s",
                },
              },
            },
          },
          value: { int64Value: "321" },
        },
        {
          name: "get_minutes",
          expr: "duration('3730s').getMinutes()",
          value: { int64Value: "62" },
        },
        {
          name: "get_seconds",
          expr: "duration('3730s').getSeconds()",
          value: { int64Value: "3730" },
        },
      ],
    },
    {
      name: "timestamp_range",
      description: "Tests for out-of-range operations on timestamps.",
      test: [
        {
          name: "from_string_under",
          expr: "timestamp('0000-01-01T00:00:00Z')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "from_string_over",
          expr: "timestamp('10000-01-01T00:00:00Z')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "add_duration_under",
          expr: "timestamp('0001-01-01T00:00:00Z') + duration('-1s')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "add_duration_over",
          expr: "timestamp('9999-12-31T23:59:59Z') + duration('1s')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "add_duration_nanos_over",
          expr: "timestamp('9999-12-31T23:59:59.999999999Z') + duration('1ns')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "add_duration_nanos_under",
          expr: "timestamp('0001-01-01T00:00:00Z') + duration('-1ns')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "sub_time_duration_over",
          expr: "timestamp('9999-12-31T23:59:59Z') - timestamp('0001-01-01T00:00:00Z')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "sub_time_duration_under",
          expr: "timestamp('0001-01-01T00:00:00Z') - timestamp('9999-12-31T23:59:59Z')",
          evalError: { errors: [{ message: "range" }] },
        },
      ],
    },
    {
      name: "duration_range",
      description: "Tests for out-of-range operations on durations.",
      test: [
        {
          name: "from_string_under",
          expr: "duration('-320000000000s')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "from_string_over",
          expr: "duration('320000000000s')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "add_under",
          expr: "duration('-200000000000s') + duration('-200000000000s')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "add_over",
          expr: "duration('200000000000s') + duration('200000000000s')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "sub_under",
          expr: "duration('-200000000000s') - duration('200000000000s')",
          evalError: { errors: [{ message: "range" }] },
        },
        {
          name: "sub_over",
          expr: "duration('200000000000s') - duration('-200000000000s')",
          evalError: { errors: [{ message: "range" }] },
        },
      ],
    },
  ],
};
