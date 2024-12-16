import { suite, test } from "node:test";
import { fromJson } from "@bufbuild/protobuf";
import { FuncRegistry } from "../func.js";
import { STD_FUNCS } from "../std/std.js";
import { addStringsExt, Formatter } from "./strings.js";
import { Planner } from "../planner.js";
import {
  CelError,
  CelUint,
  NATIVE_ADAPTER,
  ObjectActivation,
} from "../index.js";
import { EmptyActivation } from "../activation.js";
import * as assert from "node:assert/strict";
import { TimestampSchema } from "@bufbuild/protobuf/wkt";
import { parseDuration } from "../value/value.js";
import { parse } from "../parser.js";

type StringFormatTestCase = {
  name: string;
  format: string;
  locale?: string;
  formatArgs?: string;
  dynArgs?: Record<string, unknown>;
  skipCompileCheck?: boolean;
  expectedOutput?: string;
  expectedRuntimeCost?: number;
  err?: string;
};

// TODO find source of truth
// Also see:
// https://github.com/bufbuild/cel-es/blob/main/packages/cel/src/ext/strings.test.ts
// https://github.com/bufbuild/cel-es-parse/blob/main/packages/cel-es-antlr4/src/string_ext.test.ts
const STRINGS_FORMAT_TEST_CASES: StringFormatTestCase[] = [
  {
    name: "no-op",
    format: "no substitution",
    expectedOutput: "no substitution",
  },

  {
    name: "mid-string substitution",
    format: "str is %s and some more",
    formatArgs: `"filler"`,
    expectedOutput: "str is filler and some more",
  },
  {
    name: "percent escaping",
    format: "%% and also %%",
    expectedOutput: "% and also %",
  },
  {
    name: "substution inside escaped percent signs",
    format: "%%%s%%",
    formatArgs: `"text"`,
    expectedOutput: "%text%",
  },
  {
    name: "substitution with one escaped percent sign on the right",
    format: "%s%%",
    formatArgs: `"percent on the right"`,
    expectedOutput: "percent on the right%",
  },
  {
    name: "substitution with one escaped percent sign on the left",
    format: "%%%s",
    formatArgs: `"percent on the left"`,
    expectedOutput: "%percent on the left",
  },
  {
    name: "multiple substitutions",
    format: "%d %d %d, %s %s %s, %d %d %d, %s %s %s",
    formatArgs: `1, 2, 3, "A", "B", "C", 4, 5, 6, "D", "E", "F"`,
    expectedOutput: "1 2 3, A B C, 4 5 6, D E F",
  },
  {
    name: "percent sign escape sequence support",
    format: "\\u0025\\u0025escaped \\u0025s\\u0025\\u0025",
    formatArgs: `"percent"`,
    expectedOutput: "%escaped percent%",
  },
  {
    name: "fixed point formatting clause",
    format: "%.3f",
    formatArgs: "1.2345",
    expectedOutput: "1.235",
    locale: "en_US",
  },
  {
    name: "binary formatting clause",
    format: "this is 5 in binary: %b",
    formatArgs: "5",
    expectedOutput: "this is 5 in binary: 101",
  },
  {
    name: "uint support for binary formatting",
    format: "unsigned 64 in binary: %b",
    formatArgs: "uint(64)",
    expectedOutput: "unsigned 64 in binary: 1000000",
  },
  {
    name: "bool support for binary formatting",
    format: "bit set from bool: %b",
    formatArgs: "true",
    expectedOutput: "bit set from bool: 1",
  },
  {
    name: "octal formatting clause",
    format: "%o",
    formatArgs: "11",
    expectedOutput: "13",
  },
  {
    name: "uint support for octal formatting clause",
    format: "this is an unsigned octal: %o",
    formatArgs: "uint(65535)",
    expectedOutput: "this is an unsigned octal: 177777",
  },
  {
    name: "lowercase hexadecimal formatting clause",
    format: "%x is 20 in hexadecimal",
    formatArgs: "30",
    expectedOutput: "1e is 20 in hexadecimal",
  },
  {
    name: "uppercase hexadecimal formatting clause",
    format: "%X is 20 in hexadecimal",
    formatArgs: "30",
    expectedOutput: "1E is 20 in hexadecimal",
  },
  {
    name: "unsigned support for hexadecimal formatting clause",
    format: "%X is 6000 in hexadecimal",
    formatArgs: "uint(6000)",
    expectedOutput: "1770 is 6000 in hexadecimal",
  },
  {
    name: "string support with hexadecimal formatting clause",
    format: "%x",
    formatArgs: `"Hello world!"`,
    expectedOutput: "48656c6c6f20776f726c6421",
  },
  {
    name: "string support with uppercase hexadecimal formatting clause",
    format: "%X",
    formatArgs: `"Hello world!"`,
    expectedOutput: "48656C6C6F20776F726C6421",
  },
  {
    name: "byte support with hexadecimal formatting clause",
    format: "%x",
    formatArgs: `b"byte string"`,
    expectedOutput: "6279746520737472696e67",
  },
  {
    name: "byte support with uppercase hexadecimal formatting clause",
    format: "%X",
    formatArgs: `b"byte string"`,
    expectedOutput: "6279746520737472696E67",
  },
  {
    name: "scientific notation formatting clause",
    format: "%.6e",
    formatArgs: "1052.032911275",
    expectedOutput: "1.052033e+3",
    // expectedOutput: "1.052033\u202f\u00d7\u202f10\u2070\u00b3",
    locale: "en_US",
  },
  {
    name: "locale support",
    format: "%.3f",
    formatArgs: "3.14",
    locale: "fr_FR",
    expectedOutput: "3,140",
  },
  {
    name: "default precision for fixed-point clause",
    format: "%f",
    formatArgs: "2.71828",
    expectedOutput: "2.718280",
    locale: "en_US",
  },
  {
    name: "default precision for scientific notation",
    format: "%e",
    formatArgs: "2.71828",
    expectedOutput: "2.718280e+0",
    //expectedOutput: "2.718280\u202f\u00d7\u202f10\u2070\u2070",
    locale: "en_US",
  },
  {
    name: "unicode output for scientific notation",
    format: "unescaped unicode: %e, escaped unicode: %e",
    formatArgs: "2.71828, 2.71828",
    expectedOutput:
      "unescaped unicode: 2.718280e+0, escaped unicode: 2.718280e+0",
    // expectedOutput:
    // eslint-disable-next-line no-irregular-whitespace
    //   "unescaped unicode: 2.718280 × 10⁰⁰, escaped unicode: 2.718280\u202f\u00d7\u202f10\u2070\u2070",
    locale: "en_US",
  },
  {
    name: "NaN support for fixed-point",
    format: "%f",
    formatArgs: `"NaN"`,
    expectedOutput: "NaN",
    locale: "en_US",
  },
  {
    name: "positive infinity support for fixed-point",
    format: "%f",
    formatArgs: `"Infinity"`,
    expectedOutput: "∞",
    locale: "en_US",
  },
  {
    name: "negative infinity support for fixed-point",
    format: "%f",
    formatArgs: `"-Infinity"`,
    expectedOutput: "-∞",
    locale: "en_US",
  },
  {
    name: "uint support for decimal clause",
    format: "%d",
    formatArgs: "uint(64)",
    expectedOutput: "64",
  },
  {
    name: "null support for string",
    format: "null: %s",
    formatArgs: "null",
    expectedOutput: "null: null",
  },
  {
    name: "bytes support for string",
    format: "some bytes: %s",
    formatArgs: `b"xyz"`,
    expectedOutput: "some bytes: xyz",
  },
  {
    name: "type() support for string",
    format: "type is %s",
    formatArgs: `type("test string")`,
    expectedOutput: "type is string",
  },
  {
    name: "timestamp support for string",
    format: "%s",
    formatArgs: `timestamp("2023-02-03T23:31:20+00:00")`,
    expectedOutput: "2023-02-03T23:31:20Z",
  },
  {
    name: "duration support for string",
    format: "%s",
    formatArgs: `duration("1h45m47s")`,
    expectedOutput: "6347s",
  },
  {
    name: "list support for string",
    format: "%s",
    formatArgs: `["abc", 3.14, null, [9, 8, 7, 6], timestamp("2023-02-03T23:31:20Z")]`,
    expectedOutput: `["abc", 3.140000, null, [9, 8, 7, 6], timestamp("2023-02-03T23:31:20Z")]`,
  },
  {
    name: "map support for string",
    format: "%s",
    formatArgs: `{"key1": b"xyz", "key5": null, "key2": duration("2h"), "key4": true, "key3": 2.71828}`,
    locale: "nl_NL",
    expectedOutput: `{"key1":b"xyz", "key5":null, "key2":duration("7200s"), "key4":true, "key3":2.718280}`,
  },
  {
    name: "map support (all key types)",
    format: "map with multiple key types: %s",
    formatArgs: `{1: "value1", uint(2): "value2", true: double("NaN")}`,
    expectedOutput: `map with multiple key types: {1:"value1", 2:"value2", true:"NaN"}`,
  },
  {
    name: "boolean support for %s",
    format: "true bool: %s, false bool: %s",
    formatArgs: `true, false`,
    expectedOutput: "true bool: true, false bool: false",
  },
  {
    name: "dyntype support for string formatting clause",
    format: "dynamic string: %s",
    formatArgs: `dynStr`,
    dynArgs: {
      dynStr: "a string",
    },
    expectedOutput: "dynamic string: a string",
  },
  {
    name: "dyntype support for numbers with string formatting clause",
    format: "dynIntStr: %s dynDoubleStr: %s",
    formatArgs: `dynIntStr, dynDoubleStr`,
    dynArgs: {
      dynIntStr: 32n,
      dynDoubleStr: 56.8,
    },
    expectedOutput: "dynIntStr: 32 dynDoubleStr: 56.8",
    locale: "en_US",
  },
  {
    name: "dyntype support for integer formatting clause",
    format: "dynamic int: %d",
    formatArgs: `dynInt`,
    dynArgs: {
      dynInt: 128n,
    },
    expectedOutput: "dynamic int: 128",
  },
  {
    name: "dyntype support for integer formatting clause (unsigned)",
    format: "dynamic unsigned int: %d",
    formatArgs: `dynUnsignedInt`,
    dynArgs: {
      dynUnsignedInt: new CelUint(256n),
    },
    expectedOutput: "dynamic unsigned int: 256",
  },
  {
    name: "dyntype support for hex formatting clause",
    format: "dynamic hex int: %x",
    formatArgs: `dynHexInt`,
    dynArgs: {
      dynHexInt: 22n,
    },
    expectedOutput: "dynamic hex int: 16",
  },
  {
    name: "dyntype support for hex formatting clause (uppercase)",
    format: "dynamic hex int: %X (uppercase)",
    formatArgs: `dynHexInt`,
    dynArgs: {
      dynHexInt: 26n,
    },
    expectedOutput: "dynamic hex int: 1A (uppercase)",
  },
  {
    name: "dyntype support for unsigned hex formatting clause",
    format: "dynamic hex int: %x (unsigned)",
    formatArgs: `dynUnsignedHexInt`,
    dynArgs: {
      dynUnsignedHexInt: new CelUint(500n),
    },
    expectedOutput: "dynamic hex int: 1f4 (unsigned)",
  },
  {
    name: "dyntype support for fixed-point formatting clause",
    format: "dynamic double: %.3f",
    formatArgs: `dynDouble`,
    dynArgs: {
      dynDouble: 4.5,
    },
    expectedOutput: "dynamic double: 4.500",
    expectedRuntimeCost: 13,
  },
  {
    name: "dyntype support for fixed-point formatting clause (comma separator locale)",
    format: "dynamic double: %f",
    formatArgs: `dynDouble`,
    dynArgs: {
      dynDouble: 4.5,
    },
    expectedOutput: "dynamic double: 4,500000",
    locale: "fr_FR",
  },
  {
    name: "dyntype support for scientific notation",
    format: "(dyntype) e: %e",
    formatArgs: "dynE",
    dynArgs: {
      dynE: 2.71828,
    },
    expectedOutput: "(dyntype) e: 2.718280e+0",
    locale: "en_US",
  },
  {
    name: "dyntype NaN/infinity support for fixed-point",
    format: "NaN: %f, infinity: %f",
    formatArgs: `dynNaN, dynInf`,
    dynArgs: {
      dynNaN: NaN,
      dynInf: Infinity,
    },
    expectedOutput: "NaN: NaN, infinity: ∞",
  },
  {
    name: "dyntype support for timestamp",
    format: "dyntype timestamp: %s",
    formatArgs: `dynTime`,
    dynArgs: {
      dynTime: fromJson(TimestampSchema, "2009-11-10T23:00:00Z"),
    },
    expectedOutput: "dyntype timestamp: 2009-11-10T23:00:00Z",
  },
  {
    name: "dyntype support for duration",
    format: "dyntype duration: %s",
    formatArgs: `dynDuration`,
    dynArgs: {
      dynDuration: parseDuration(0, "2h25m47s"),
    },
    expectedOutput: "dyntype duration: 8747s",
  },
  {
    name: "dyntype support for lists",
    format: "dyntype list: %s",
    formatArgs: `dynList`,
    dynArgs: {
      dynList: [6n, 4.2, "a string"],
    },
    expectedOutput: `dyntype list: [6, 4.200000, "a string"]`,
  },
  // {
  //   name: "dyntype support for maps",
  //   format: "dyntype map: %s",
  //   formatArgs: `dynMap`,
  //   dynArgs: {
  //     dynMap: {
  //       strKey: "x",
  //       true: 42,
  //       "6": parseDuration("7m2s"),
  //     },
  //   },
  //   expectedOutput: `dyntype map: {"strKey":"x", 6:duration("422s"), true:42}`,
  // },
  {
    name: "unrecognized formatting clause",
    format: "%a",
    formatArgs: "1",
    skipCompileCheck: true,
    err: 'could not parse formatting clause: unrecognized formatting clause "a"',
  },
  {
    name: "out of bounds arg index",
    format: "%d %d %d",
    formatArgs: "0, 1",
    skipCompileCheck: true,
    err: "index 2 out of range",
  },
  {
    name: "string substitution is not allowed with binary clause",
    format: "string is %b",
    formatArgs: `"abc"`,
    skipCompileCheck: true,
    err: "error during formatting: only integers and bools can be formatted as binary, was given string",
  },
  {
    name: "duration substitution not allowed with decimal clause",
    format: "%d",
    formatArgs: `duration("30m2s")`,
    skipCompileCheck: true,
    err: "error during formatting: decimal clause can only be used on integers, was given google.protobuf.Duration",
  },
  {
    name: "string substitution not allowed with octal clause",
    format: "octal: %o",
    formatArgs: `"a string"`,
    skipCompileCheck: true,
    err: "error during formatting: octal clause can only be used on integers, was given string",
  },
  {
    name: "double substitution not allowed with hex clause",
    format: "double is %x",
    formatArgs: "0.5",
    skipCompileCheck: true,
    err: "error during formatting: only integers, byte buffers, and strings can be formatted as hex, was given double",
  },
  {
    name: "uppercase not allowed for scientific clause",
    format: "double is %E",
    formatArgs: "0.5",
    skipCompileCheck: true,
    err: `could not parse formatting clause: unrecognized formatting clause "E"`,
  },
  {
    name: "object not allowed",
    format: "object is %s",
    formatArgs: `ext.TestAllTypes{PbVal: test.TestAllTypes{}}`,
    skipCompileCheck: true,
    err: "error during formatting: string clause can only be used on strings, bools, bytes, ints, doubles, maps, lists, types, durations, and timestamps, was given ext.TestAllTypes",
  },
  {
    name: "object inside list",
    format: "%s",
    formatArgs: "[1, 2, ext.TestAllTypes{PbVal: test.TestAllTypes{}}]",
    skipCompileCheck: true,
    err: "error during formatting: no formatting function for ext.TestAllTypes",
  },
  {
    name: "object inside map",
    format: "%s",
    formatArgs: `{1: "a", 2: ext.TestAllTypes{}}`,
    skipCompileCheck: true,
    err: "error during formatting: no formatting function for ext.TestAllTypes",
  },
  {
    name: "null not allowed for %d",
    format: "null: %d",
    formatArgs: "null",
    skipCompileCheck: true,
    err: "error during formatting: decimal clause can only be used on integers, was given null_type",
  },
  {
    name: "null not allowed for %e",
    format: "null: %e",
    formatArgs: "null",
    skipCompileCheck: true,
    err: "error during formatting: scientific clause can only be used on doubles, was given null_type",
  },
  {
    name: "null not allowed for %f",
    format: "null: %f",
    formatArgs: "null",
    skipCompileCheck: true,
    err: "error during formatting: fixed-point clause can only be used on doubles, was given null_type",
  },
  {
    name: "null not allowed for %x",
    format: "null: %x",
    formatArgs: "null",
    skipCompileCheck: true,
    err: "error during formatting: only integers, byte buffers, and strings can be formatted as hex, was given null_type",
  },
  {
    name: "null not allowed for %X",
    format: "null: %X",
    formatArgs: "null",
    skipCompileCheck: true,
    err: "error during formatting: only integers, byte buffers, and strings can be formatted as hex, was given null_type",
  },
  {
    name: "null not allowed for %b",
    format: "null: %b",
    formatArgs: "null",
    skipCompileCheck: true,
    err: "error during formatting: only integers and bools can be formatted as binary, was given null_type",
  },
  {
    name: "null not allowed for %o",
    format: "null: %o",
    formatArgs: "null",
    skipCompileCheck: true,
    err: "error during formatting: octal clause can only be used on integers, was given null_type",
  },
  {
    name: "compile-time cardinality check (too few for string)",
    format: "%s %s",
    formatArgs: `"abc"`,
    err: "index 1 out of range",
  },
  {
    name: "compile-time cardinality check (too many for string)",
    format: "%s %s",
    formatArgs: `"abc", "def", "ghi"`,
    err: "too many arguments supplied to string.format (expected 2, got 3)",
  },
  {
    name: "compile-time syntax check (unexpected end of string)",
    format: "filler %",
    formatArgs: "",
    err: "unexpected end of string",
  },
  {
    name: "compile-time syntax check (unrecognized formatting clause)",
    format: "%j",
    // pass args here, otherwise the cardinality check will fail first
    formatArgs: "123",
    err: `could not parse formatting clause: unrecognized formatting clause "j"`,
  },
  {
    name: "compile-time %s check",
    format: "object is %s",
    formatArgs: `ext.TestAllTypes{PbVal: test.TestAllTypes{}}`,
    err: "error during formatting: string clause can only be used on strings, bools, bytes, ints, doubles, maps, lists, types, durations, and timestamps",
  },
  {
    name: "compile-time check for objects inside list literal",
    format: "list is %s",
    formatArgs: `[1, 2, ext.TestAllTypes{PbVal: test.TestAllTypes{}}]`,
    err: "error during formatting: string clause can only be used on strings, bools, bytes, ints, doubles, maps, lists, types, durations, and timestamps",
  },
  {
    name: "compile-time %d check",
    format: "int is %d",
    formatArgs: "5.2",
    err: "error during formatting: integer clause can only be used on integers",
  },
  {
    name: "compile-time %f check",
    format: "double is %f",
    formatArgs: "true",
    err: "error during formatting: fixed-point clause can only be used on doubles",
  },
  {
    name: "compile-time precision syntax check",
    format: "double is %.34",
    formatArgs: "5.0",
    err: "could not parse formatting clause: error while parsing precision: could not find end of precision specifier",
  },
  {
    name: "compile-time %e check",
    format: "double is %e",
    formatArgs: "true",
    err: "error during formatting: scientific clause can only be used on doubles",
  },
  {
    name: "compile-time %b check",
    format: "string is %b",
    formatArgs: `"a string"`,
    err: "error during formatting: only integers and bools can be formatted as binary",
  },
  {
    name: "compile-time %x check",
    format: "%x is a double",
    formatArgs: "2.5",
    err: "error during formatting: only integers, byte buffers, and strings can be formatted as hex",
  },
  {
    name: "compile-time %X check",
    format: "%X is a double",
    formatArgs: "2.5",
    err: "error during formatting: only integers, byte buffers, and strings can be formatted as hex",
  },
  {
    name: "compile-time %o check",
    format: "an octal: %o",
    formatArgs: "3.14",
    err: "error during formatting: octal clause can only be used on integers",
  },
];

void suite("string.format", () => {
  for (const tc of STRINGS_FORMAT_TEST_CASES) {
    void test(tc.name, () => {
      const extFuncs = new FuncRegistry(STD_FUNCS);
      addStringsExt(
        extFuncs,
        tc.locale === undefined ? undefined : new Formatter(tc.locale),
      );
      const planner = new Planner(extFuncs);
      // Create the input expression from 'format'.format([formatArgs])
      // const input =
      //   "'" + tc.format + "'.format([" + (tc.formatArgs ?? "") + "])";
      const input = `'${tc.format}'.format([${tc.formatArgs ?? ""}])`;
      const parsed = parse(input);
      const plan = planner.plan(parsed);
      const ctx =
        tc.dynArgs === undefined
          ? new EmptyActivation()
          : new ObjectActivation(tc.dynArgs, NATIVE_ADAPTER);
      const result = plan.eval(ctx);
      if (tc.err) {
        assert.ok(result instanceof CelError);
      } else {
        assert.deepEqual(result, tc.expectedOutput);
      }
    });
  }
});
