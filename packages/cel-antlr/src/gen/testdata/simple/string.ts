import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "string",
  description: "Tests for string and bytes operations.",
  section: [
    {
      name: "size",
      description: "Tests for the size() function.",
      test: [
        { name: "empty", expr: "size('')", value: { int64Value: "0" } },
        { name: "one_ascii", expr: "size('A')", value: { int64Value: "1" } },
        { name: "one_unicode", expr: "size('ÿ')", value: { int64Value: "1" } },
        { name: "ascii", expr: "size('four')", value: { int64Value: "4" } },
        { name: "unicode", expr: "size('πέντε')", value: { int64Value: "5" } },
        { name: "bytes_empty", expr: "size(b'')", value: { int64Value: "0" } },
        { name: "bytes", expr: "size(b'abc')", value: { int64Value: "3" } },
      ],
    },
    {
      name: "starts_with",
      description: "Tests for the startsWith() function.",
      test: [
        {
          name: "basic_true",
          expr: "'foobar'.startsWith('foo')",
          value: { boolValue: true },
        },
        {
          name: "basic_false",
          expr: "'foobar'.startsWith('bar')",
          value: { boolValue: false },
        },
        {
          name: "empty_target",
          expr: "''.startsWith('foo')",
          value: { boolValue: false },
        },
        {
          name: "empty_arg",
          expr: "'foobar'.startsWith('')",
          value: { boolValue: true },
        },
        {
          name: "empty_empty",
          expr: "''.startsWith('')",
          value: { boolValue: true },
        },
        {
          name: "unicode",
          expr: "'завтра'.startsWith('за')",
          value: { boolValue: true },
        },
        {
          name: "unicode_smp",
          expr: "'🐱😀😛'.startsWith('🐱')",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "ends_with",
      description: "Tests for the endsWith() function.",
      test: [
        {
          name: "basic_true",
          expr: "'foobar'.endsWith('bar')",
          value: { boolValue: true },
        },
        {
          name: "basic_false",
          expr: "'foobar'.endsWith('foo')",
          value: { boolValue: false },
        },
        {
          name: "empty_target",
          expr: "''.endsWith('foo')",
          value: { boolValue: false },
        },
        {
          name: "empty_arg",
          expr: "'foobar'.endsWith('')",
          value: { boolValue: true },
        },
        {
          name: "empty_empty",
          expr: "''.endsWith('')",
          value: { boolValue: true },
        },
        {
          name: "unicode",
          expr: "'forté'.endsWith('té')",
          value: { boolValue: true },
        },
        {
          name: "unicode_smp",
          expr: "'🐱😀😛'.endsWith('😛')",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "matches",
      description:
        "Tests for regexp matching.  For now, we will only test the subset of regular languages.",
      test: [
        {
          name: "basic",
          expr: "'hubba'.matches('ubb')",
          value: { boolValue: true },
        },
        {
          name: "empty_target",
          expr: "''.matches('foo|bar')",
          value: { boolValue: false },
        },
        {
          name: "empty_arg",
          expr: "'cows'.matches('')",
          value: { boolValue: true },
        },
        {
          name: "empty_empty",
          expr: "''.matches('')",
          value: { boolValue: true },
        },
        {
          name: "re_concat",
          expr: "'abcd'.matches('bc')",
          value: { boolValue: true },
        },
        {
          name: "re_alt",
          expr: "'grey'.matches('gr(a|e)y')",
          value: { boolValue: true },
        },
        {
          name: "re_rep",
          expr: "'banana'.matches('ba(na)*')",
          value: { boolValue: true },
        },
        {
          name: "unicode",
          expr: "'mañana'.matches('a+ñ+a+')",
          value: { boolValue: true },
        },
        {
          name: "unicode_smp",
          expr: "'🐱😀😀'.matches('(a|😀){2}')",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "concatentation",
      description: "Tests for string concatenation.",
      test: [
        {
          name: "concat_true",
          expr: "'he' + 'llo'",
          value: { stringValue: "hello" },
        },
        {
          name: "concat_with_spaces",
          expr: "'hello' + ' ' == 'hello'",
          value: { boolValue: false },
        },
        {
          name: "concat_empty_string_beginning",
          expr: "'' + 'abc'",
          value: { stringValue: "abc" },
        },
        {
          name: "concat_empty_string_end",
          expr: "'abc' + ''",
          value: { stringValue: "abc" },
        },
        {
          name: "concat_empty_with_empty",
          expr: "'' + ''",
          value: { stringValue: "" },
        },
        {
          name: "unicode_unicode",
          expr: "'¢' + 'ÿ' + 'Ȁ'",
          value: { stringValue: "¢ÿȀ" },
        },
        {
          name: "ascii_unicode",
          expr: "'r' + 'ô' + 'le'",
          value: { stringValue: "rôle" },
        },
        {
          name: "ascii_unicode_unicode_smp",
          expr: "'a' + 'ÿ' + '🐱'",
          value: { stringValue: "aÿ🐱" },
        },
        {
          name: "empty_unicode",
          expr: "'' + 'Ω' + ''",
          value: { stringValue: "Ω" },
        },
      ],
    },
    {
      name: "contains",
      description: "Tests for contains.",
      test: [
        {
          name: "contains_true",
          expr: "'hello'.contains('he')",
          value: { boolValue: true },
        },
        {
          name: "contains_empty",
          expr: "'hello'.contains('')",
          value: { boolValue: true },
        },
        {
          name: "contains_false",
          expr: "'hello'.contains('ol')",
          value: { boolValue: false },
        },
        {
          name: "contains_multiple",
          expr: "'abababc'.contains('ababc')",
          value: { boolValue: true },
        },
        {
          name: "contains_unicode",
          expr: "'Straße'.contains('aß')",
          value: { boolValue: true },
        },
        {
          name: "contains_unicode_smp",
          expr: "'🐱😀😁'.contains('😀')",
          value: { boolValue: true },
        },
        {
          name: "empty_contains",
          expr: "''.contains('something')",
          value: { boolValue: false },
        },
        {
          name: "empty_empty",
          expr: "''.contains('')",
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "bytes_concat",
      description: "Tests for bytes concatenation.",
      test: [
        {
          name: "concat",
          expr: "b'abc' + b'def'",
          value: { bytesValue: "YWJjZGVm" },
        },
        {
          name: "left_unit",
          expr: "b'' + b'\\xffoo'",
          value: { bytesValue: "/29v" },
        },
        {
          name: "right_unit",
          expr: "b'zxy' + b''",
          value: { bytesValue: "enh5" },
        },
        { name: "empty_empty", expr: "b'' + b''", value: { bytesValue: "" } },
      ],
    },
  ],
};
