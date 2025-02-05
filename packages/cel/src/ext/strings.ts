// Copyright 2024-2025 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { isMessage, toJson } from "@bufbuild/protobuf";
import { DurationSchema, TimestampSchema } from "@bufbuild/protobuf/wkt";

import { CEL_ADAPTER } from "../adapter/cel.js";
import { argsMatch, Func, FuncRegistry } from "../func.js";
import * as type from "../value/type.js";
import {
  type CelResult,
  type CelVal,
  CelError,
  CelUnknown,
  CelList,
  CelMap,
  CelUint,
  CelType,
  CelErrors,
} from "../value/value.js";

function toNum(number: unknown): number | undefined {
  switch (typeof number) {
    case "number":
      return number;
    case "bigint":
      return Number(number);
    default:
      return undefined;
  }
}

// Checks that the args matched, followed by an optional int.
function argsMatchInt(args: CelVal[], ...celTypes: CelType[]): boolean {
  return argsMatch(args, celTypes.length, ...celTypes, type.INT);
}

const charAtFunc = Func.binary(
  "charAt",
  ["string_char_at_int"],
  (id: number, str: CelVal, index: CelVal) => {
    if (
      typeof str !== "string" ||
      (typeof index !== "number" && typeof index !== "bigint")
    ) {
      return undefined;
    }
    const i = Number(index);
    if (i < 0 || i > str.length) {
      return CelErrors.indexOutOfBounds(id, i, str.length);
    }
    return str.charAt(i);
  },
);

const indexOfFunc = Func.newStrict(
  "indexOf",
  ["string_index_of_string", "string_index_of_string_int"],
  (id: number, args: CelVal[]) => {
    if (!argsMatchInt(args, type.STRING, type.STRING)) {
      return undefined;
    }
    const str = args[0] as string;
    const substr = args[1] as string;
    const start = toNum(args[2]);
    if (start !== undefined && (start < 0 || start >= str.length)) {
      return CelErrors.indexOutOfBounds(id, start, str.length);
    }
    return str.indexOf(substr, start);
  },
);

const lastIndexOfFunc = Func.newStrict(
  "lastIndexOf",
  ["string_last_index_of_string", "string_last_index_of_string_int"],
  (id: number, args: CelVal[]) => {
    if (!argsMatchInt(args, type.STRING, type.STRING)) {
      return undefined;
    }
    const str = args[0] as string;
    const substr = args[1] as string;
    const start = toNum(args[2]);
    if (start !== undefined && (start < 0 || start >= str.length)) {
      return CelErrors.indexOutOfBounds(id, start, str.length);
    }
    return str.lastIndexOf(substr, start);
  },
);

const lowerAsciiFunc = Func.unary(
  "lowerAscii",
  ["string_lower_ascii"],
  (_id: number, str: CelVal) => {
    if (typeof str !== "string") {
      return undefined;
    }
    // Only lower case ascii characters.
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        result += String.fromCharCode(code + 32);
      } else {
        result += str.charAt(i);
      }
    }
    return result;
  },
);

const upperAsciiFunc = Func.unary(
  "upperAscii",
  ["string_upper_ascii"],
  (_id: number, str: CelVal) => {
    if (typeof str !== "string") {
      return undefined;
    }
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c >= 97 && c <= 122) {
        result += String.fromCharCode(c - 32);
      } else {
        result += str.charAt(i);
      }
    }
    return result;
  },
);

const replaceFunc = Func.newStrict(
  "replace",
  ["string_replace_string_string", "string_replace_string_string_int"],
  (_id: number, args: CelVal[]) => {
    if (!argsMatchInt(args, type.STRING, type.STRING, type.STRING)) {
      return undefined;
    }
    const str = args[0] as string;
    const substr = args[1] as string;
    const repl = args[2] as string;
    let num = toNum(args[3]) ?? str.length;
    // Replace the first num occurrences of substr with repl.
    let result = str;
    let offset = 0;
    let index = result.indexOf(substr, offset);
    while (num > 0 && index !== -1) {
      result =
        result.substring(0, index) +
        repl +
        result.substring(index + substr.length);
      offset = index + repl.length;
      num--;
      index = result.indexOf(substr, offset);
    }
    return result;
  },
);

const splitFunc = Func.newStrict(
  "split",
  ["string_split_string", "string_split_string_int"],
  (_id: number, args: CelVal[]) => {
    if (!argsMatchInt(args, type.STRING, type.STRING)) {
      return undefined;
    }
    const str = args[0] as string;
    const sep = args[1] as string;
    const num = toNum(args[2]);
    if (num === 1) {
      return new CelList([str], CEL_ADAPTER, type.LIST_STRING);
    }
    return new CelList(str.split(sep, num), CEL_ADAPTER, type.LIST_STRING);
  },
);

const substringFunc = Func.newStrict(
  "substring",
  ["string_substring_int", "string_substring_int_int"],
  (id: number, args: CelVal[]) => {
    if (!argsMatchInt(args, type.STRING, type.INT)) {
      return undefined;
    }
    const str = args[0] as string;
    const start = args[1] as number | bigint;
    const end = args[2] as number | bigint | undefined;
    if (end === undefined) {
      const i = Number(start);
      if (i < 0 || i > str.length) {
        return CelErrors.indexOutOfBounds(id, i, str.length);
      }
      return str.substring(i);
    }
    const i = Number(start);
    const j = Number(end);
    if (i < 0 || i > str.length) {
      return CelErrors.indexOutOfBounds(id, i, str.length);
    }
    if (j < 0 || j > str.length) {
      return CelErrors.indexOutOfBounds(id, j, str.length);
    }
    if (i > j) {
      return CelErrors.invalidArgument(id, "substring", "start > end");
    }
    return str.substring(Number(start), Number(end));
  },
);

// The set of white space characters defined by the unicode standard.
const WHITE_SPACE = new Set([
  0x20, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x85, 0xa0, 0x1680, 0x2000, 0x2001,
  0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a,
  0x2028, 0x2029, 0x202f, 0x205f, 0x3000,
]);

const trimFunc = Func.unary(
  "trim",
  ["string_trim"],
  (_id: number, str: CelVal) => {
    if (typeof str !== "string") {
      return undefined;
    }
    // Trim using the unicode white space definition.
    let start = 0;
    let end = str.length - 1;
    while (start < str.length && WHITE_SPACE.has(str.charCodeAt(start))) {
      start++;
    }
    while (end > start && WHITE_SPACE.has(str.charCodeAt(end))) {
      end--;
    }
    return str.substring(start, end + 1);
  },
);

const joinFunc = Func.newStrict(
  "join",
  ["list_join", "list_join_string"],
  (id: number, args: CelVal[]) => {
    if (!argsMatch(args, 1, type.LIST, type.STRING)) {
      return undefined;
    }
    const list = args[0] as CelList;
    const sep = args[1] === undefined ? "" : (args[1] as string);
    const items = list.getItems();
    let result = "";
    for (let i = 0; i < items.length; i++) {
      if (typeof items[i] !== "string") {
        return CelErrors.invalidArgument(
          id,
          "join",
          "list contains non-string value",
        );
      }
      if (i > 0) {
        result += sep;
      }
      result += items[i];
    }
    return result;
  },
);

const QUOTE_MAP: Map<number, string> = new Map([
  [0x00, "\\0"],
  [0x07, "\\a"],
  [0x08, "\\b"],
  [0x09, "\\t"],
  [0x0a, "\\n"],
  [0x0b, "\\v"],
  [0x0c, "\\f"],
  [0x0d, "\\r"],
  [0x22, '\\"'],
  [0x5c, "\\\\"],
]);
function quoteString(_id: number, str: string): string {
  let result = '"';
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    result += QUOTE_MAP.get(c) ?? str.charAt(i);
  }
  result += '"';
  return result;
}

const quoteFunc = Func.unary(
  "strings.quote",
  ["strings_quote"],
  (id: number, str: CelVal) => {
    if (typeof str !== "string") {
      return undefined;
    }
    return quoteString(id, str);
  },
);

export class Formatter {
  constructor(private readonly locale: string | undefined = undefined) {}

  public formatFloatString(id: number, val: string): CelResult<string> {
    switch (val) {
      case "Infinity":
        return "∞";
      case "-Infinity":
        return "-∞";
      case "NaN":
        return "NaN";
      default:
        return CelErrors.invalidArgument(
          id,
          "format",
          "invalid floating point value",
        );
    }
  }

  public formatFloating(
    id: number,
    val: CelResult,
    precision: number | undefined,
  ): CelResult<string> {
    if (typeof val === "number") {
      if (isNaN(val)) {
        return "NaN";
      } else if (val === Infinity) {
        return "∞";
      } else if (val === -Infinity) {
        return "-∞";
      } else if (this.locale !== undefined) {
        return val.toLocaleString(this.locale.replace("_", "-"), {
          maximumFractionDigits: precision,
          minimumFractionDigits: precision,
        });
      } else if (precision === undefined) {
        return val.toString();
      }
      return val.toFixed(precision);
    } else if (typeof val === "string") {
      return this.formatFloatString(id, val);
    } else if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }
    return CelErrors.invalidArgument(
      id,
      "format",
      "invalid floating point value",
    );
  }

  public formatExponent(
    id: number,
    val: CelResult,
    precision: number | undefined,
  ): CelResult<string> {
    if (typeof val === "number") {
      if (isNaN(val)) {
        return "NaN";
      } else if (val === Infinity) {
        return "∞";
      } else if (val === -Infinity) {
        return "-∞";
      }
      return val.toExponential(precision);
    } else if (typeof val === "string") {
      return this.formatFloatString(id, val);
    } else if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }
    return CelErrors.invalidArgument(
      id,
      "format",
      "invalid floating point value",
    );
  }

  public formatBinary(id: number, val: CelResult): CelResult<string> {
    if (typeof val === "boolean") {
      return val ? "1" : "0";
    } else if (typeof val === "bigint") {
      return val.toString(2);
    } else if (val instanceof CelUint) {
      return val.value.toString(2);
    } else if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }
    return CelErrors.invalidArgument(id, "format", "invalid integer value");
  }

  public formatOctal(id: number, val: CelResult): CelResult<string> {
    if (typeof val === "bigint") {
      return val.toString(8);
    } else if (val instanceof CelUint) {
      return val.value.toString(8);
    } else if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }
    return CelErrors.invalidArgument(id, "format", "invalid integer value");
  }

  public formatDecimal(id: number, val: CelResult): CelResult<string> {
    if (typeof val === "bigint") {
      return val.toString(10);
    } else if (val instanceof CelUint) {
      return val.value.toString(10);
    } else if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }
    return CelErrors.invalidArgument(id, "format", "invalid integer value");
  }

  public formatHexString(_id: number, val: string): string {
    let result = "";
    for (let i = 0; i < val.length; i++) {
      const c = val.charCodeAt(i);
      result += c.toString(16);
    }
    return result;
  }

  public formatHexBytes(_id: number, val: Uint8Array): string {
    let result = "";
    for (let i = 0; i < val.length; i++) {
      result += val[i].toString(16);
    }
    return result;
  }

  public formatHex(id: number, val: CelResult): CelResult<string> {
    if (typeof val === "bigint") {
      return val.toString(16);
    } else if (val instanceof CelUint) {
      return val.value.toString(16);
    } else if (typeof val === "string") {
      return this.formatHexString(id, val);
    } else if (val instanceof Uint8Array) {
      return this.formatHexBytes(id, val);
    } else if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }
    return CelErrors.invalidArgument(id, "format", "invalid integer value");
  }

  public formatHeX(id: number, val: CelResult): CelResult<string> {
    if (typeof val === "bigint") {
      return val.toString(16).toUpperCase();
    } else if (val instanceof CelUint) {
      return val.value.toString(16).toUpperCase();
    } else if (typeof val === "string") {
      return this.formatHexString(id, val).toUpperCase();
    } else if (val instanceof Uint8Array) {
      return this.formatHexBytes(id, val).toUpperCase();
    } else if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }
    return CelErrors.invalidArgument(id, "format", "invalid integer value");
  }

  public formatList(id: number, val: CelList): CelResult<string> {
    const items = val.getItems();
    let result = "[";
    for (let i = 0; i < items.length; i++) {
      if (i > 0) {
        result += ", ";
      }
      const item = this.formatRepl(id, items[i]);
      if (item instanceof CelError || item instanceof CelUnknown) {
        return item;
      }
      result += item;
    }
    result += "]";
    return result;
  }

  public formatMap(id: number, val: CelMap): CelResult<string> {
    let result = "{";
    let delim = "";
    for (const [rawKey, raValue] of val.value) {
      const key = val.adapter.toCel(rawKey);
      const keyStr = this.formatRepl(id, key);
      if (keyStr instanceof CelError || keyStr instanceof CelUnknown) {
        return keyStr;
      }
      const value = val.adapter.toCel(raValue);
      const valueStr = this.formatRepl(id, value);
      if (valueStr instanceof CelError || valueStr instanceof CelUnknown) {
        return valueStr;
      }
      result += delim + keyStr + ":" + valueStr;
      delim = ", ";
    }
    result += "}";
    return result;
  }

  public formatRepl(id: number, val: CelResult): CelResult<string> {
    switch (typeof val) {
      case "boolean":
        return val ? "true" : "false";
      case "bigint":
        return DEFAULT_FORMATTER.formatDecimal(id, val);
      case "number":
        if (isNaN(val)) {
          return '"NaN"';
        } else if (val === Infinity) {
          return '"Infinity"';
        } else if (val === -Infinity) {
          return '"-Infinity"';
        }
        return DEFAULT_FORMATTER.formatFloating(id, val, 6);
      case "string":
        return quoteString(id, val);
      case "object":
        if (val === null) {
          return "null";
        } else if (val instanceof CelType) {
          return val.name;
        } else if (val instanceof CelUint) {
          return val.value.toString();
        } else if (isMessage(val, TimestampSchema)) {
          return 'timestamp("' + toJson(TimestampSchema, val) + '")';
        } else if (isMessage(val, DurationSchema)) {
          return 'duration("' + toJson(DurationSchema, val) + '")';
        } else if (val instanceof Uint8Array) {
          // escape non-printable characters
          return 'b"' + new TextDecoder().decode(val) + '"';
        } else if (val instanceof CelList) {
          return this.formatList(id, val);
        } else if (val instanceof CelMap) {
          return this.formatMap(id, val);
        } else if (val instanceof CelError || val instanceof CelUnknown) {
          return val;
        }
        break;
      default:
        break;
    }
    return CelErrors.invalidArgument(id, "format", "invalid value");
  }

  public formatString(id: number, val: CelResult): CelResult<string> {
    switch (typeof val) {
      case "boolean":
        return val ? "true" : "false";
      case "bigint":
        return this.formatDecimal(id, val);
      case "number":
        return this.formatFloating(id, val, undefined);
      case "string":
        return val;
      case "object":
        if (val === null) {
          return "null";
        } else if (val instanceof CelType) {
          return val.name;
        } else if (val instanceof CelUint) {
          return val.value.toString();
        } else if (isMessage(val, TimestampSchema)) {
          return toJson(TimestampSchema, val);
        } else if (isMessage(val, DurationSchema)) {
          return toJson(DurationSchema, val);
        } else if (val instanceof Uint8Array) {
          return new TextDecoder().decode(val);
        } else if (val instanceof CelList) {
          return this.formatList(id, val);
        } else if (val instanceof CelMap) {
          return this.formatMap(id, val);
        } else if (val instanceof CelError || val instanceof CelUnknown) {
          return val;
        }
        break;
      default:
        break;
    }
    return CelErrors.invalidArgument(id, "format", "invalid string value");
  }

  public format(id: number, format: string, args: CelList): CelResult<string> {
    const items = args.getItems();
    let result = "";
    let i = 0;
    let j = 0;
    while (i < format.length) {
      if (format.charAt(i) === "%") {
        if (i + 1 >= format.length) {
          return CelErrors.invalidArgument(
            id,
            "format",
            "invalid format string",
          );
        }
        let c = format.charAt(i + 1);
        i += 2;
        if (c === "%") {
          result += "%";
          continue;
        }
        let precision = 6;
        if (c === ".") {
          // Parse precision.
          precision = 0;
          while (
            i < format.length &&
            format.charAt(i) >= "0" &&
            format.charAt(i) <= "9"
          ) {
            precision = precision * 10 + Number(format.charAt(i));
            i++;
          }
          if (i >= format.length) {
            return CelErrors.invalidArgument(
              id,
              "format",
              "invalid format string",
            );
          }
          c = format.charAt(i);
          i++;
        }
        if (j >= items.length) {
          return CelErrors.invalidArgument(
            id,
            "format",
            "too few arguments for format string",
          );
        }
        const val = items[j++];
        let str: CelResult<string> = "";
        switch (c) {
          case "e":
            str = this.formatExponent(id, val, precision);
            break;
          case "f":
            str = this.formatFloating(id, val, precision);
            break;
          case "b":
            str = this.formatBinary(id, val);
            break;
          case "d":
            str = this.formatDecimal(id, val);
            break;
          case "s":
            str = this.formatString(id, val);
            break;
          case "x":
            str = this.formatHex(id, val);
            break;
          case "X":
            str = this.formatHeX(id, val);
            break;
          case "o":
            str = this.formatOctal(id, val);
            break;
          default:
            return CelErrors.invalidArgument(
              id,
              "format",
              "invalid format string",
            );
        }
        if (str instanceof CelError || str instanceof CelUnknown) {
          return str;
        }
        result += str;
      } else {
        result += format.charAt(i);
        i++;
      }
    }
    if (j < items.length) {
      return CelErrors.invalidArgument(
        id,
        "format",
        "too many arguments for format string",
      );
    }
    return result;
  }
}

export const DEFAULT_FORMATTER = new Formatter();

export function makeStringFormatFunc(formatter: Formatter): Func {
  return Func.binary(
    "format",
    ["string_format_list"],
    (id: number, format: CelVal, args: CelVal) => {
      if (typeof format !== "string" || !(args instanceof CelList)) {
        return undefined;
      }
      return formatter.format(id, format, args);
    },
  );
}
export function addStringsExt(
  funcs: FuncRegistry,
  formatter: Formatter = DEFAULT_FORMATTER,
) {
  funcs.add(charAtFunc);
  funcs.add(indexOfFunc);
  funcs.add(lastIndexOfFunc);
  funcs.add(lowerAsciiFunc);
  funcs.add(replaceFunc);
  funcs.add(splitFunc);
  funcs.add(substringFunc);
  funcs.add(trimFunc);
  funcs.add(upperAsciiFunc);
  funcs.add(joinFunc);
  funcs.add(quoteFunc);
  funcs.add(makeStringFormatFunc(formatter));
}

export function makeStringExtFuncRegistry(
  locale: string | undefined = undefined,
): FuncRegistry {
  const funcs = new FuncRegistry();
  addStringsExt(funcs, new Formatter(locale));
  return funcs;
}

export const STRINGS_EXT_FUNCS = makeStringExtFuncRegistry();
