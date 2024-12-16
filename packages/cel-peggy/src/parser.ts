namespace runtime {
  export interface Location {
    line: number;
    column: number;
    offset: number;
  }
  export interface LocationRange {
    source?: string | GrammarLocation;
    start: Location;
    end: Location;
  }
  export interface Range {
    source?: string | GrammarLocation;
    start: number;
    end: number;
  }
  export class GrammarLocation {
    source: string | GrammarLocation;
    start: Location;
    constructor(source: string | GrammarLocation, start: Location) {
      this.source = source;
      this.start = start;
    }
    toString(): string {
      return String(this.source);
    }
    offset(loc: Location): Location {
      return {
        line: loc.line + this.start.line - 1,
        column:
          loc.line === 1 ? loc.column + this.start.column - 1 : loc.column,
        offset: loc.offset + this.start.offset,
      };
    }
    static offsetStart(range: LocationRange): Location {
      if (range.source instanceof GrammarLocation) {
        return range.source.offset(range.start);
      }
      return range.start;
    }
    static offsetEnd(range: LocationRange): Location {
      if (range.source instanceof GrammarLocation) {
        return range.source.offset(range.end);
      }
      return range.end;
    }
  }
  export function padEnd(str: string, targetLength: number, padString: string) {
    padString = padString || " ";
    if (str.length > targetLength) {
      return str;
    }
    targetLength -= str.length;
    padString += padString.repeat(targetLength);
    return str + padString.slice(0, targetLength);
  }
  export interface SourceText {
    source: any;
    text: string;
  }
  export interface Expectation {
    type: "literal" | "class" | "any" | "end" | "pattern" | "other";
    value: string;
  }
  export class ParseFailure {}
  export class ParseOptions {
    currentPosition?: number;
    silentFails?: number;
    maxFailExpected?: Expectation[];
    grammarSource?: string | GrammarLocation;
    library?: boolean;
    startRule?: string;
    [index: string]: unknown;
  }
  export type Result<T> = Failure | Success<T>;
  export interface Failure {
    success: false;
    remainder: string;
    failedExpectations: FailedExpectation[];
  }
  export interface Success<T> {
    success: true;
    value: T;
    remainder: string;
    failedExpectations: FailedExpectation[];
  }
  export interface FailedExpectation {
    expectation: Expectation;
    remainder: string;
  }
  export function isFailure(r: Result<unknown>): r is Failure {
    return !r.success;
  }
  function getLine(input: string, offset: number) {
    let line = 1;
    for (let i = 0; i < offset; i++) {
      if (input[i] === "\r") {
        if (input[i + 1] === "\n") {
          i++;
        }
        line++;
      } else if (input[i] === "\n") {
        line++;
      }
    }
    return line;
  }
  function getColumn(input: string, offset: number) {
    let column = 1;
    for (let i = offset; i > 0; i--) {
      if (["\n", "\r"].includes(input[i - 1])) {
        break;
      }
      column++;
    }
    return column;
  }
  export function getLocation(
    source: string | GrammarLocation | undefined,
    input: string,
    start: string,
    remainder: string,
  ): runtime.LocationRange {
    return {
      source,
      start: {
        offset: input.length - start.length,
        line: getLine(input, input.length - start.length),
        column: getColumn(input, input.length - start.length),
      },
      end: {
        offset: input.length - remainder.length,
        line: getLine(input, input.length - remainder.length),
        column: getColumn(input, input.length - remainder.length),
      },
    };
  }
  export function getRange(
    source: string | GrammarLocation | undefined,
    input: string,
    start: string,
    remainder: string,
  ) {
    return {
      source,
      start: input.length - start.length,
      end: input.length - remainder.length,
    };
  }
  export function getText(start: string, remainder: string) {
    return start.slice(0, remainder.length > 0 ? -remainder.length : undefined);
  }
}
export class ParseError extends Error {
  rawMessage: string;
  location: runtime.LocationRange;
  constructor(
    message: string,
    location: runtime.LocationRange,
    name: string = "parse error",
  ) {
    super(ParseError.#formatMessage(message, location));
    this.name = name;
    this.rawMessage = message;
    this.location = location;
  }
  static #formatMessage(message: string, location: runtime.LocationRange) {
    const source =
      location.source !== undefined ? String(location.source) : "<input>";
    return (
      `${source}:${location.start.line}:${location.start.column}: ` + message
    );
  }
}
export class SyntaxError extends ParseError {
  expected: runtime.Expectation[];
  found: string | null;
  constructor(
    expected: runtime.Expectation[],
    found: string,
    location: runtime.LocationRange,
    name: string = "syntax error",
  ) {
    super(SyntaxError.#formatMessage(expected, found), location, name);
    this.expected = expected;
    this.found = found;
  }
  static #formatMessage(
    expected: runtime.Expectation[],
    found: string,
  ): string {
    function encode(s: string): string {
      const entropyToken = "(fvo47fu3AwHrHsLEMNa7uUXYUF4rQgdm)";
      return (
        "'" +
        s
          .replaceAll("\\", entropyToken)
          .replaceAll("\x07", "\\a")
          .replaceAll("\b", "\\b")
          .replaceAll("\f", "\\f")
          .replaceAll("\n", "\\n")
          .replaceAll("\r", "\\r")
          .replaceAll("\t", "\\t")
          .replaceAll("\v", "\\v")
          .replaceAll("'", "\\'")
          .replaceAll(entropyToken, "\\\\") +
        "'"
      );
    }
    function describeExpected(expected: runtime.Expectation[]): string {
      const descriptions = [
        ...new Set(
          expected.map((e) => {
            if (e.type === "literal") {
              return encode(e.value);
            }
            return e.value;
          }),
        ),
      ];
      descriptions.sort();
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return `${descriptions[0]} or ${descriptions[1]}`;
        default:
          return (
            descriptions.slice(0, -1).join(", ") +
            ", or " +
            descriptions[descriptions.length - 1]
          );
      }
    }
    function describeFound(found: string): string {
      return found.length === 1 ? found : "end of input";
    }
    return (
      "found " +
      describeFound(found) +
      " but expecting " +
      describeExpected(expected)
    );
  }
}
import type { Expr } from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";
import Builder from "./builder.js";
const builder = new Builder();
const item2: runtime.Expectation = {
  type: "any",
  value: "any character",
};
const item40: runtime.Expectation = {
  type: "other",
  value: "whitespace",
};
const item55: runtime.Expectation = {
  type: "literal",
  value: "-",
};
const item61: runtime.Expectation = {
  type: "other",
  value: "digit",
};
const item63: runtime.Expectation = {
  type: "literal",
  value: ".",
};
const item73: runtime.Expectation = {
  type: "class",
  value: "/^[+\\-]/g",
};
const item84: runtime.Expectation = {
  type: "other",
  value: "float literal",
};
const item94: runtime.Expectation = {
  type: "literal",
  value: "0x",
};
const item104: runtime.Expectation = {
  type: "class",
  value: "/^[uU]/g",
};
const item107: runtime.Expectation = {
  type: "other",
  value: "unsigned integer literal",
};
const item123: runtime.Expectation = {
  type: "other",
  value: "integer literal",
};
const item133: runtime.Expectation = {
  type: "class",
  value: "/^[rR]/g",
};
const item138: runtime.Expectation = {
  type: "literal",
  value: '"""',
};
const item151: runtime.Expectation = {
  type: "literal",
  value: "'''",
};
const item162: runtime.Expectation = {
  type: "literal",
  value: '"',
};
const item182: runtime.Expectation = {
  type: "literal",
  value: "'",
};
const item210: runtime.Expectation = {
  type: "literal",
  value: "\\",
};
const item212: runtime.Expectation = {
  type: "class",
  value: "/^[xX]/g",
};
const item221: runtime.Expectation = {
  type: "other",
  value: "byte value",
};
const item227: runtime.Expectation = {
  type: "literal",
  value: "\\u",
};
const item235: runtime.Expectation = {
  type: "literal",
  value: "\\U",
};
const item247: runtime.Expectation = {
  type: "class",
  value: "/^[0-3]/g",
};
const item253: runtime.Expectation = {
  type: "other",
  value: "escaped bytes",
};
const item254: runtime.Expectation = {
  type: "other",
  value: "byte sequence",
};
const item260: runtime.Expectation = {
  type: "class",
  value: "/^[abfnrtv]/g",
};
const item266: runtime.Expectation = {
  type: "class",
  value: "/^[\"'`\\\\?]/g",
};
const item267: runtime.Expectation = {
  type: "other",
  value: "escaped character",
};
const item314: runtime.Expectation = {
  type: "other",
  value: "quoted character sequence",
};
const item316: runtime.Expectation = {
  type: "other",
  value: "string literal",
};
const item322: runtime.Expectation = {
  type: "class",
  value: "/^[bB]/g",
};
const item326: runtime.Expectation = {
  type: "other",
  value: "bytes literal",
};
const item333: runtime.Expectation = {
  type: "literal",
  value: "true",
};
const item335: runtime.Expectation = {
  type: "literal",
  value: "false",
};
const item337: runtime.Expectation = {
  type: "other",
  value: "boolean literal",
};
const item343: runtime.Expectation = {
  type: "literal",
  value: "null",
};
const item349: runtime.Expectation = {
  type: "other",
  value: "null literal",
};
const item362: runtime.Expectation = {
  type: "class",
  value: "/^[_a-zA-Z]/g",
};
const item367: runtime.Expectation = {
  type: "other",
  value: "identifier",
};
const item379: runtime.Expectation = {
  type: "literal",
  value: "{",
};
const item389: runtime.Expectation = {
  type: "literal",
  value: "(",
};
const item394: runtime.Expectation = {
  type: "literal",
  value: ",",
};
const item396: runtime.Expectation = {
  type: "literal",
  value: ")",
};
const item417: runtime.Expectation = {
  type: "literal",
  value: ":",
};
const item426: runtime.Expectation = {
  type: "literal",
  value: "}",
};
const item438: runtime.Expectation = {
  type: "literal",
  value: "[",
};
const item443: runtime.Expectation = {
  type: "literal",
  value: "]",
};
const item510: runtime.Expectation = {
  type: "literal",
  value: "!",
};
const item526: runtime.Expectation = {
  type: "class",
  value: "/^[*\\/%]/g",
};
const item563: runtime.Expectation = {
  type: "literal",
  value: "<=",
};
const item565: runtime.Expectation = {
  type: "literal",
  value: "<",
};
const item567: runtime.Expectation = {
  type: "literal",
  value: ">=",
};
const item569: runtime.Expectation = {
  type: "literal",
  value: ">",
};
const item571: runtime.Expectation = {
  type: "literal",
  value: "==",
};
const item573: runtime.Expectation = {
  type: "literal",
  value: "!=",
};
const item577: runtime.Expectation = {
  type: "literal",
  value: "in",
};
const item579: runtime.Expectation = {
  type: "other",
  value: "relational operator",
};
const item587: runtime.Expectation = {
  type: "literal",
  value: "&&",
};
const item593: runtime.Expectation = {
  type: "literal",
  value: "||",
};
const item602: runtime.Expectation = {
  type: "literal",
  value: "?",
};
const item610: runtime.Expectation = {
  type: "end",
  value: "end of input",
};
type item105 = [string];
type item222 = [string];
type item324 = [
  | string[]
  | (number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string)[],
];
type item347 = [];
type item380 = [".", string[], "{"];
type item381 = [string];
type item397 = [string, Expr[]];
type item420 = [string, Expr];
type item427 = [string, any[]];
type item458 = [Expr, Expr];
type item483 = [string];
type item498 = [Expr];
type item501 = [
  any | any | any | any | any | any | any | any | any | any | Expr | any | any,
  ((prevExpr: Expr) => any)[],
];
type item514 = [string, Expr];
type item529 = [string, Expr];
type item531 = [Expr, ((prevExpr: Expr) => any)[] | null];
type item546 = [Expr, ((prevExpr: Expr) => any)[] | null];
type item582 = [Expr, ((prevExpr: Expr) => any)[] | null];
type item606 = [Expr, Expr];
type item608 = [Expr, [Expr, Expr] | null];
export function parse(
  input: string,
  options: runtime.ParseOptions = new runtime.ParseOptions(),
): Expr {
  const parse$source = options.grammarSource;
  const result = item1(input);
  if (result.success === true) {
    return result.value;
  } else {
    let remainder = input;
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (const e of result.failedExpectations) {
      if (e.remainder.length < remainder.length) {
        remainder = e.remainder;
        failedExpectations = [];
      }
      if (e.remainder.length === remainder.length) {
        failedExpectations.push(e);
      }
    }
    throw new SyntaxError(
      failedExpectations.map((e) => e.expectation),
      remainder.slice(0, 1),
      runtime.getLocation(parse$source, input, remainder, remainder),
    );
  }
  function item83(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    digits: string,
  ) {
    return builder.newDoubleExpr(offset(), digits);
  }
  function item106(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    digits: string,
  ) {
    return builder.newUnsignedInt64Expr(offset(), digits);
  }
  function item122(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    digits: string,
  ) {
    return builder.newInt64Expr(offset(), digits);
  }
  function item223(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    value: string,
  ): number {
    return parseInt(value, 16);
  }
  function item231(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    value: string,
  ): number {
    return parseInt(value, 16);
  }
  function item239(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    value: string,
  ): number {
    return parseInt(value, 16);
  }
  function item252(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    value: string,
  ): number {
    return parseInt(value, 8);
  }
  function item261(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    value: string,
  ): "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" {
    switch (value) {
      case "a":
        return "\x07";
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "v":
        return "\v";
    }
    throw new Error();
  }
  function item315(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    bytes:
      | string[]
      | (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[],
  ) {
    return builder.newStringExpr(offset(), bytes);
  }
  function item325(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    bytes:
      | string[]
      | (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[],
  ) {
    return builder.newBytesExpr(offset(), bytes);
  }
  function item336(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    keyword: "true" | "false",
  ) {
    return builder.newBoolExpr(offset(), keyword);
  }
  function item348(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ) {
    return builder.newNullExpr(offset());
  }
  function item366(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    id: string,
  ): string {
    if (
      [
        "true",
        "false",
        "null",
        "in",
        "as",
        "break",
        "const",
        "continue",
        "else",
        "for",
        "function",
        "if",
        "import",
        "let",
        "loop",
        "package",
        "namespace",
        "return",
        "var",
        "void",
        "while",
      ].includes(id)
    ) {
      error("reserved identifier");
    }
    return id;
  }
  function item382(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    name: string,
  ) {
    return builder.newIdentExpr(offset(), name);
  }
  function item398(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    identifier: string,
    args: Expr[],
  ) {
    return builder.newCallExpr(offset(), identifier, args);
  }
  function item421(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    key: string,
    value: Expr,
  ) {
    return builder.newStructEntry(offset(), key, value);
  }
  function item428(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    name: string,
    entries: any,
  ) {
    return builder.newStructExpr(offset(), entries, name);
  }
  function item445(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    elements: Expr[],
  ) {
    return builder.newListExpr(offset(), elements);
  }
  function item459(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    key: Expr,
    value: Expr,
  ) {
    return builder.newMapEntry(offset(), key, value);
  }
  function item468(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    entries: any,
  ) {
    return builder.newStructExpr(offset(), entries);
  }
  function item484(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    field: string,
  ): (prevExpr: Expr) => any {
    return (prevExpr: Expr) => builder.newSelectExpr(offset(), prevExpr, field);
  }
  function item492(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    identifier: string,
    args: Expr[],
  ): (prevExpr: Expr) => any {
    return (prevExpr: Expr) =>
      builder.newMemberCallExpr(offset(), prevExpr, identifier, args);
  }
  function item499(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    index: Expr,
  ): (prevExpr: Expr) => any {
    return (prevExpr: Expr) =>
      builder.newCallExpr(offset(), "_[_]", [prevExpr, index]);
  }
  function item502(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    primary: any,
    tail: ((prevExpr: Expr) => any)[],
  ): Expr {
    /* : Expr */
    if (tail.length === 0) {
      return primary;
    } else {
      return tail.reduce((expr, op) => op(expr), primary);
    }
  }
  function item515(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    ops: string,
    expr: Expr,
  ): Expr {
    /* : Expr */
    if (ops.length % 2 === 0) {
      return expr;
    } else if (
      expr.exprKind.case === "callExpr" &&
      expr.exprKind.value.function === `${ops[0]}_`
    ) {
      return expr.exprKind.value.args[0];
    } else {
      return builder.newCallExpr(offset(), `${ops[0]}_`, [expr]);
    }
  }
  function item527(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    o: string,
  ): string {
    return `_${o}_`;
  }
  function item530(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    operator: string,
    nextExpr: Expr,
  ): (prevExpr: Expr) => any {
    return (prevExpr: Expr) =>
      builder.newCallExpr(offset(), operator, [prevExpr, nextExpr]);
  }
  function item532(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    unary: Expr,
    tail: ((prevExpr: Expr) => any)[] | null,
  ): Expr {
    /* : Expr */
    if (tail === null) {
      return unary;
    } else {
      return tail.reduce((expr, op) => op(expr), unary);
    }
  }
  function item543(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    o: string,
  ): string {
    return `_${o}_`;
  }
  function item545(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    operator: string,
    nextExpr: Expr,
  ): (prevExpr: Expr) => any {
    return (prevExpr: Expr) =>
      builder.newCallExpr(offset(), operator, [prevExpr, nextExpr]);
  }
  function item547(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    multiplication: Expr,
    tail: ((prevExpr: Expr) => any)[] | null,
  ): Expr {
    /* : Expr */
    if (tail === null) {
      return multiplication;
    } else {
      return tail.reduce((expr, op) => op(expr), multiplication);
    }
  }
  function item574(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    operator: string,
  ): string {
    return `_${operator}_`;
  }
  function item578(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return "@in";
  }
  function item581(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    operator: string,
    nextExpr: Expr,
  ): (prevExpr: Expr) => any {
    return (prevExpr: Expr) =>
      builder.newCallExpr(offset(), operator, [prevExpr, nextExpr]);
  }
  function item583(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    addition: Expr,
    tail: ((prevExpr: Expr) => any)[] | null,
  ): Expr {
    /* : Expr */
    if (tail === null) {
      return addition;
    } else {
      return tail.reduce((expr, op) => op(expr), addition);
    }
  }
  function item589(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    relation: Expr[],
  ): Expr {
    /* : Expr */
    if (relation.length === 1) {
      return relation[0];
    } else {
      return builder.newCallExpr(offset(), "_&&_", relation);
    }
  }
  function item595(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    and: Expr[],
  ): Expr {
    /* : Expr */
    if (and.length === 1) {
      return and[0];
    } else {
      return builder.newCallExpr(offset(), "_||_", and);
    }
  }
  function item607(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    t: Expr,
    f: Expr,
  ): [Expr, Expr] {
    /* : [Expr, Expr] */
    return [t, f];
  }
  function item609(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    or: Expr,
    tail: [Expr, Expr] | null,
  ): Expr {
    /* : Expr */
    if (tail === null) {
      return or;
    } else {
      return builder.newCallExpr(offset(), "_?_:_", [or, ...tail]);
    }
  }
  function item1(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item4(text);
    if (result.success === true) {
      if (result.remainder.length === 0) {
        return result;
      } else {
        return {
          success: false,
          remainder: result.remainder,
          failedExpectations: [
            {
              expectation: item610,
              remainder: result.remainder,
            },
          ],
        };
      }
    } else {
      return result;
    }
  }
  // or:ConditionalOr S
  // tail:TernaryTail?
  // {
  // /* : Expr */
  // if (tail === null) {
  // return or;
  // } else {
  // return builder.newCallExpr(offset(), "_?_:_", [or, ...tail]);
  // }
  // }
  function item4(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item5(text);
    if (result.success === true) {
      return {
        success: true,
        value: item609(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // or:ConditionalOr S
  // tail:TernaryTail?
  function item5(text: string): runtime.Success<item608> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item8(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      };
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item597(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result2.value],
      remainder,
      failedExpectations,
    };
  }
  // and:ConditionalAnd|1.., $(S "||")|
  // {
  // /* : Expr */
  // if (and.length === 1) {
  // return and[0];
  // } else {
  // return builder.newCallExpr(offset(), "_||_", and);
  // }
  // }
  function item8(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item10(text);
    if (result.success === true) {
      return {
        success: true,
        value: item595(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // ConditionalAnd|1.., $(S "||")|
  function item10(text: string): runtime.Success<Expr[]> | runtime.Failure {
    const values: Array<Expr> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item590(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item12(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (
      values.length < 1 &&
      result.success === false /* technically redundant */
    ) {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations,
      };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  // relation:Relation|1.., $(S "&&")|
  // {
  // /* : Expr */
  // if (relation.length === 1) {
  // return relation[0];
  // } else {
  // return builder.newCallExpr(offset(), "_&&_", relation);
  // }
  // }
  function item12(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item14(text);
    if (result.success === true) {
      return {
        success: true,
        value: item589(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // Relation|1.., $(S "&&")|
  function item14(text: string): runtime.Success<Expr[]> | runtime.Failure {
    const values: Array<Expr> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item584(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item16(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (
      values.length < 1 &&
      result.success === false /* technically redundant */
    ) {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations,
      };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  // addition:Addition tail:RelationTail?
  // {
  // /* : Expr */
  // if (tail === null) {
  // return addition;
  // } else {
  // return tail.reduce((expr, op) => op(expr), addition);
  // }
  // }
  function item16(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item17(text);
    if (result.success === true) {
      return {
        success: true,
        value: item583(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // addition:Addition tail:RelationTail?
  function item17(text: string): runtime.Success<item582> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item20(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      };
    } else {
      remainder = result0.remainder;
    }
    const result1 = item549(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value],
      remainder,
      failedExpectations,
    };
  }
  // multiplication:Multiplication tail:AdditionTail?
  // {
  // /* : Expr */
  // if (tail === null) {
  // return multiplication;
  // } else {
  // return tail.reduce((expr, op) => op(expr), multiplication);
  // }
  // }
  function item20(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item21(text);
    if (result.success === true) {
      return {
        success: true,
        value: item547(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // multiplication:Multiplication tail:AdditionTail?
  function item21(text: string): runtime.Success<item546> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item24(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      };
    } else {
      remainder = result0.remainder;
    }
    const result1 = item534(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value],
      remainder,
      failedExpectations,
    };
  }
  // unary:Unary tail:MultiplicationTail?
  // {
  // /* : Expr */
  // if (tail === null) {
  // return unary;
  // } else {
  // return tail.reduce((expr, op) => op(expr), unary);
  // }
  // }
  function item24(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item25(text);
    if (result.success === true) {
      return {
        success: true,
        value: item532(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // unary:Unary tail:MultiplicationTail?
  function item25(text: string): runtime.Success<item531> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item28(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      };
    } else {
      remainder = result0.remainder;
    }
    const result1 = item517(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value],
      remainder,
      failedExpectations,
    };
  }
  // Member
  // / S ops:$( "!"+ / "-"+ ) expr:Member
  // {
  // /* : Expr */
  // if (ops.length % 2 === 0) {
  // return expr;
  // } else if (expr.exprKind.case === "callExpr" && expr.exprKind.value.function === `${ops[0]}_`) {
  // return expr.exprKind.value.args[0];
  // } else {
  // return builder.newCallExpr(offset(), `${ops[0]}_`, [expr]);
  // }
  // }
  function item28(text: string): runtime.Success<Expr> | runtime.Failure {
    const choices = [item30, item503];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // S primary:Primary tail:MemberTail
  // {
  // /* : Expr */
  // if (tail.length === 0) {
  // return primary;
  // } else {
  // return tail.reduce((expr, op) => op(expr), primary);
  // }
  // }
  function item30(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item31(text);
    if (result.success === true) {
      return {
        success: true,
        value: item502(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // S primary:Primary tail:MemberTail
  function item31(text: string): runtime.Success<item501> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item43(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = item471(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result1.value, result2.value],
      remainder,
      failedExpectations,
    };
  }
  // Literal
  // / "."? S name:Identifier !(S [({]) !("." Identifier|1.., "."| "{")
  // { return builder.newIdentExpr(offset(), name) }
  // / "."? S identifier:Identifier S "(" args:ExprList ")"
  // { return builder.newCallExpr(offset(), identifier, args) }
  // / "."? name:$Identifier|1.., "."| S "{" entries:FieldInits (",")? S "}"
  // { return builder.newStructExpr(offset(), entries, name) }
  // / "(" @Expr ")"
  // / elements:("[" @ExprList (",")? S "]")
  // { return builder.newListExpr(offset(), elements) }
  // / entries:("{" @MapInits $((",")? S "}"))
  // { return builder.newStructExpr(offset(), entries) }
  function item43(
    text: string,
  ):
    | runtime.Success<
        | any
        | any
        | any
        | any
        | any
        | any
        | any
        | any
        | any
        | any
        | Expr
        | any
        | any
      >
    | runtime.Failure {
    const choices = [
      item45,
      item350,
      item383,
      item399,
      item429,
      item434,
      item446,
    ];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // FloatLiteral / UnsignedIntLiteral / IntLiteral / StringLiteral / BytesLiteral / BooleanLiteral / NullLiteral
  function item45(
    text: string,
  ):
    | runtime.Success<any | any | any | any | any | any | any>
    | runtime.Failure {
    const choices = [
      item47,
      item86,
      item109,
      item125,
      item318,
      item328,
      item339,
    ];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // FloatLiteral "float literal"
  // = digits:$("-"? Digit* "." Digit+ Exponent? / "-"? Digit+ Exponent)
  // { return builder.newDoubleExpr(offset(), digits) }
  //
  function item47(text: string): runtime.Success<any> | runtime.Failure {
    const result = item48(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item84,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // digits:$("-"? Digit* "." Digit+ Exponent? / "-"? Digit+ Exponent)
  // { return builder.newDoubleExpr(offset(), digits) }
  function item48(text: string): runtime.Success<any> | runtime.Failure {
    const result = item50(text);
    if (result.success === true) {
      return {
        success: true,
        value: item83(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // $("-"? Digit* "." Digit+ Exponent? / "-"? Digit+ Exponent)
  function item50(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(
      /^((-)?([0-9])*\.([0-9])+([eE]([+\-])?([0-9])+)?|(-)?([0-9])+[eE]([+\-])?([0-9])+)/g,
    );
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item55,
            remainder: text,
          },
          {
            expectation: item61,
            remainder: text,
          },
          {
            expectation: item63,
            remainder: text,
          },
        ],
      };
    }
  }
  // UnsignedIntLiteral "unsigned integer literal"
  // = digits:$("0x" HexDigit+ / Digit+) [uU]
  // { return builder.newUnsignedInt64Expr(offset(), digits) }
  //
  function item86(text: string): runtime.Success<any> | runtime.Failure {
    const result = item87(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item107,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // digits:$("0x" HexDigit+ / Digit+) [uU]
  // { return builder.newUnsignedInt64Expr(offset(), digits) }
  function item87(text: string): runtime.Success<any> | runtime.Failure {
    const result = item88(text);
    if (result.success === true) {
      return {
        success: true,
        value: item106(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // digits:$("0x" HexDigit+ / Digit+) [uU]
  function item88(text: string): runtime.Success<item105> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item90(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      };
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^[uU]/g);
    failedExpectations.push({
      expectation: item104,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    return {
      success: true,
      value: [result0.value],
      remainder,
      failedExpectations,
    };
  }
  // $("0x" HexDigit+ / Digit+)
  function item90(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(0x([0-9abcdefABCDEF])+|([0-9])+)/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item94,
            remainder: text,
          },
          {
            expectation: item61,
            remainder: text,
          },
        ],
      };
    }
  }
  // IntLiteral "integer literal"
  // = digits:$("-"? ("0x" HexDigit+ / Digit+))
  // { return builder.newInt64Expr(offset(), digits) }
  //
  function item109(text: string): runtime.Success<any> | runtime.Failure {
    const result = item110(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item123,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // digits:$("-"? ("0x" HexDigit+ / Digit+))
  // { return builder.newInt64Expr(offset(), digits) }
  function item110(text: string): runtime.Success<any> | runtime.Failure {
    const result = item112(text);
    if (result.success === true) {
      return {
        success: true,
        value: item122(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // $("-"? ("0x" HexDigit+ / Digit+))
  function item112(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(-)?(0x([0-9abcdefABCDEF])+|([0-9])+)/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item55,
            remainder: text,
          },
          {
            expectation: item94,
            remainder: text,
          },
          {
            expectation: item61,
            remainder: text,
          },
        ],
      };
    }
  }
  // StringLiteral "string literal"
  // = bytes:CharacterSequence
  // { return builder.newStringExpr(offset(), bytes) }
  //
  function item125(text: string): runtime.Success<any> | runtime.Failure {
    const result = item126(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item316,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // bytes:CharacterSequence
  // { return builder.newStringExpr(offset(), bytes) }
  function item126(text: string): runtime.Success<any> | runtime.Failure {
    const result = item129(text);
    if (result.success === true) {
      return {
        success: true,
        value: item315(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // CharacterSequence "quoted character sequence"
  // = [rR] @( '"""'  @(!'"""' @.)*                  '"""'
  // / "'''"  @(!"'''" @.)*                          "'''"
  // / '"'    @(!( '"' / NewLine ) @.)*              '"'
  // / "'"    @(!( "'" / NewLine ) @.)*              "'")
  // /       ( '"""'  @(Escape / $(!'"""' @.))*      '"""'
  // / "'''"  @(Escape / $(!"'''" @.))*              "'''"
  // / '"'    @(Escape / $(!( '"' / NewLine ) @.))*  '"'
  // / "'"    @(Escape / $(!( "'" / NewLine ) @.))*  "'")
  //
  function item129(
    text: string,
  ):
    | runtime.Success<
        | string[]
        | (
            | number[]
            | "\u0007"
            | "\b"
            | "\f"
            | "\n"
            | "\r"
            | "\t"
            | "\v"
            | string
          )[]
      >
    | runtime.Failure {
    const result = item130(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item314,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // [rR] @( '"""'  @(!'"""' @.)*                  '"""'
  // / "'''"  @(!"'''" @.)*                          "'''"
  // / '"'    @(!( '"' / NewLine ) @.)*              '"'
  // / "'"    @(!( "'" / NewLine ) @.)*              "'")
  // /       ( '"""'  @(Escape / $(!'"""' @.))*      '"""'
  // / "'''"  @(Escape / $(!"'''" @.))*              "'''"
  // / '"'    @(Escape / $(!( '"' / NewLine ) @.))*  '"'
  // / "'"    @(Escape / $(!( "'" / NewLine ) @.))*  "'")
  function item130(
    text: string,
  ):
    | runtime.Success<
        | string[]
        | (
            | number[]
            | "\u0007"
            | "\b"
            | "\f"
            | "\n"
            | "\r"
            | "\t"
            | "\v"
            | string
          )[]
      >
    | runtime.Failure {
    const choices = [item131, item192];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // [rR] @( '"""'  @(!'"""' @.)*                  '"""'
  // / "'''"  @(!"'''" @.)*                          "'''"
  // / '"'    @(!( '"' / NewLine ) @.)*              '"'
  // / "'"    @(!( "'" / NewLine ) @.)*              "'")
  function item131(text: string): runtime.Success<string[]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[rR]/g);
    failedExpectations.push({
      expectation: item133,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item135(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // '"""'  @(!'"""' @.)*                  '"""'
  // / "'''"  @(!"'''" @.)*                          "'''"
  // / '"'    @(!( '"' / NewLine ) @.)*              '"'
  // / "'"    @(!( "'" / NewLine ) @.)*              "'"
  function item135(text: string): runtime.Success<string[]> | runtime.Failure {
    const choices = [item136, item149, item160, item180];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // '"""'  @(!'"""' @.)*                  '"""'
  function item136(text: string): runtime.Success<string[]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^"""/g);
    failedExpectations.push({
      expectation: item138,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item140(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^"""/g);
    failedExpectations.push({
      expectation: item138,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (!'"""' @.)*
  function item140(text: string): runtime.Success<string[]> | runtime.Failure {
    const values: Array<string> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item141(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // !'"""' @.
  function item141(text: string): runtime.Success<string> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?!""")/g);
    failedExpectations.push();
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item145(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // .
  function item145(text: string): runtime.Success<string> | runtime.Failure {
    if (text.length > 0) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item2,
            remainder: text,
          },
        ],
      };
    }
  }
  // "'''"  @(!"'''" @.)*                          "'''"
  function item149(text: string): runtime.Success<string[]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^'''/g);
    failedExpectations.push({
      expectation: item151,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item153(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^'''/g);
    failedExpectations.push({
      expectation: item151,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (!"'''" @.)*
  function item153(text: string): runtime.Success<string[]> | runtime.Failure {
    const values: Array<string> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item154(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // !"'''" @.
  function item154(text: string): runtime.Success<string> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?!''')/g);
    failedExpectations.push();
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item158(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // .
  function item158(text: string): runtime.Success<string> | runtime.Failure {
    if (text.length > 0) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item2,
            remainder: text,
          },
        ],
      };
    }
  }
  // '"'    @(!( '"' / NewLine ) @.)*              '"'
  function item160(text: string): runtime.Success<string[]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^"/g);
    failedExpectations.push({
      expectation: item162,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item164(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^"/g);
    failedExpectations.push({
      expectation: item162,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (!( '"' / NewLine ) @.)*
  function item164(text: string): runtime.Success<string[]> | runtime.Failure {
    const values: Array<string> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item165(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // !( '"' / NewLine ) @.
  function item165(text: string): runtime.Success<string> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?!("|(\\x0D\\x0A|[\n\r])))/g);
    failedExpectations.push();
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item178(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // .
  function item178(text: string): runtime.Success<string> | runtime.Failure {
    if (text.length > 0) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item2,
            remainder: text,
          },
        ],
      };
    }
  }
  // "'"    @(!( "'" / NewLine ) @.)*              "'"
  function item180(text: string): runtime.Success<string[]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^'/g);
    failedExpectations.push({
      expectation: item182,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item184(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^'/g);
    failedExpectations.push({
      expectation: item182,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (!( "'" / NewLine ) @.)*
  function item184(text: string): runtime.Success<string[]> | runtime.Failure {
    const values: Array<string> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item185(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // !( "'" / NewLine ) @.
  function item185(text: string): runtime.Success<string> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?!('|(\\x0D\\x0A|[\n\r])))/g);
    failedExpectations.push();
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item190(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // .
  function item190(text: string): runtime.Success<string> | runtime.Failure {
    if (text.length > 0) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item2,
            remainder: text,
          },
        ],
      };
    }
  }
  // '"""'  @(Escape / $(!'"""' @.))*      '"""'
  // / "'''"  @(Escape / $(!"'''" @.))*              "'''"
  // / '"'    @(Escape / $(!( '"' / NewLine ) @.))*  '"'
  // / "'"    @(Escape / $(!( "'" / NewLine ) @.))*  "'"
  function item192(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const choices = [item193, item276, item288, item301];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // '"""'  @(Escape / $(!'"""' @.))*      '"""'
  function item193(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^"""/g);
    failedExpectations.push({
      expectation: item138,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item196(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^"""/g);
    failedExpectations.push({
      expectation: item138,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (Escape / $(!'"""' @.))*
  function item196(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const values: Array<
      number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
    > = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item197(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // Escape / $(!'"""' @.)
  function item197(
    text: string,
  ):
    | runtime.Success<
        number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
      >
    | runtime.Failure {
    const choices = [item199, item268];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // Escape "escaped character"
  // = ByteSequence
  // / "\\" value:[abfnrtv]
  // {
  // switch(value) {
  // case 'a': return "\x07";
  // case 'b': return "\b";
  // case 'f': return "\f";
  // case 'n': return "\n";
  // case 'r': return "\r";
  // case 't': return "\t";
  // case 'v': return "\v";
  // }
  //
  // throw new Error();
  // }
  // / "\\" @$[\"\'\`\\?]
  //
  function item199(
    text: string,
  ):
    | runtime.Success<
        number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
      >
    | runtime.Failure {
    const result = item200(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item267,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // ByteSequence
  // / "\\" value:[abfnrtv]
  // {
  // switch(value) {
  // case 'a': return "\x07";
  // case 'b': return "\b";
  // case 'f': return "\f";
  // case 'n': return "\n";
  // case 'r': return "\r";
  // case 't': return "\t";
  // case 'v': return "\v";
  // }
  //
  // throw new Error();
  // }
  // / "\\" @$[\"\'\`\\?]
  function item200(
    text: string,
  ):
    | runtime.Success<
        number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
      >
    | runtime.Failure {
    const choices = [item202, item255, item262];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // ByteSequence "byte sequence"
  // = Bytes+
  //
  function item202(text: string): runtime.Success<number[]> | runtime.Failure {
    const result = item203(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item254,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // Bytes+
  function item203(text: string): runtime.Success<number[]> | runtime.Failure {
    const values: Array<number> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item205(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (
      values.length < 1 &&
      result.success === false /* technically redundant */
    ) {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations,
      };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  // Bytes "escaped bytes"
  // = "\\" [xX] value:$Byte|1|        { return parseInt(value, 16) }
  // / "\\u" value:$Byte|2|            { return parseInt(value, 16) }
  // / "\\U" value:$Byte|4|            { return parseInt(value, 16) }
  // / "\\" value:$([0-3] [0-7] [0-7]) { return parseInt(value, 8) }
  //
  function item205(text: string): runtime.Success<number> | runtime.Failure {
    const result = item206(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item253,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // "\\" [xX] value:$Byte|1|        { return parseInt(value, 16) }
  // / "\\u" value:$Byte|2|            { return parseInt(value, 16) }
  // / "\\U" value:$Byte|4|            { return parseInt(value, 16) }
  // / "\\" value:$([0-3] [0-7] [0-7]) { return parseInt(value, 8) }
  function item206(text: string): runtime.Success<number> | runtime.Failure {
    const choices = [item207, item224, item232, item240];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // "\\" [xX] value:$Byte|1|        { return parseInt(value, 16) }
  function item207(text: string): runtime.Success<number> | runtime.Failure {
    const result = item208(text);
    if (result.success === true) {
      return {
        success: true,
        value: item223(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "\\" [xX] value:$Byte|1|
  function item208(text: string): runtime.Success<item222> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\\/g);
    failedExpectations.push({
      expectation: item210,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^[xX]/g);
    failedExpectations.push({
      expectation: item212,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item214(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    };
  }
  // $Byte|1|
  function item214(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9abcdefABCDEF][0-9abcdefABCDEF]){0,1}/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item221,
            remainder: text,
          },
        ],
      };
    }
  }
  // "\\u" value:$Byte|2|            { return parseInt(value, 16) }
  function item224(text: string): runtime.Success<number> | runtime.Failure {
    const result = item225(text);
    if (result.success === true) {
      return {
        success: true,
        value: item231(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "\\u" value:$Byte|2|
  function item225(text: string): runtime.Success<item222> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\\u/g);
    failedExpectations.push({
      expectation: item227,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item229(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    };
  }
  // $Byte|2|
  function item229(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9abcdefABCDEF][0-9abcdefABCDEF]){0,2}/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item221,
            remainder: text,
          },
        ],
      };
    }
  }
  // "\\U" value:$Byte|4|            { return parseInt(value, 16) }
  function item232(text: string): runtime.Success<number> | runtime.Failure {
    const result = item233(text);
    if (result.success === true) {
      return {
        success: true,
        value: item239(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "\\U" value:$Byte|4|
  function item233(text: string): runtime.Success<item222> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\\U/g);
    failedExpectations.push({
      expectation: item235,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item237(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    };
  }
  // $Byte|4|
  function item237(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9abcdefABCDEF][0-9abcdefABCDEF]){0,4}/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item221,
            remainder: text,
          },
        ],
      };
    }
  }
  // "\\" value:$([0-3] [0-7] [0-7]) { return parseInt(value, 8) }
  function item240(text: string): runtime.Success<number> | runtime.Failure {
    const result = item241(text);
    if (result.success === true) {
      return {
        success: true,
        value: item252(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "\\" value:$([0-3] [0-7] [0-7])
  function item241(text: string): runtime.Success<item222> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\\/g);
    failedExpectations.push({
      expectation: item210,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item244(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    };
  }
  // $([0-3] [0-7] [0-7])
  function item244(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^[0-3][0-7][0-7]/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item247,
            remainder: text,
          },
        ],
      };
    }
  }
  // "\\" value:[abfnrtv]
  // {
  // switch(value) {
  // case 'a': return "\x07";
  // case 'b': return "\b";
  // case 'f': return "\f";
  // case 'n': return "\n";
  // case 'r': return "\r";
  // case 't': return "\t";
  // case 'v': return "\v";
  // }
  //
  // throw new Error();
  // }
  function item255(
    text: string,
  ):
    | runtime.Success<"\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v">
    | runtime.Failure {
    const result = item256(text);
    if (result.success === true) {
      return {
        success: true,
        value: item261(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "\\" value:[abfnrtv]
  function item256(text: string): runtime.Success<item222> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\\/g);
    failedExpectations.push({
      expectation: item210,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item259(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    };
  }
  // [abfnrtv]
  function item259(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[abfnrtv]/g.test(text)) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item260,
            remainder: text,
          },
        ],
      };
    }
  }
  // "\\" @$[\"\'\`\\?]
  function item262(text: string): runtime.Success<string> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\\/g);
    failedExpectations.push({
      expectation: item210,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item265(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // $[\"\'\`\\?]
  function item265(text: string): runtime.Success<string> | runtime.Failure {
    if (/^["'`\\?]/g.test(text)) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item266,
            remainder: text,
          },
        ],
      };
    }
  }
  // $(!'"""' @.)
  function item268(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(?!""")./g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item2,
            remainder: text,
          },
        ],
      };
    }
  }
  // "'''"  @(Escape / $(!"'''" @.))*              "'''"
  function item276(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^'''/g);
    failedExpectations.push({
      expectation: item151,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item279(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^'''/g);
    failedExpectations.push({
      expectation: item151,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (Escape / $(!"'''" @.))*
  function item279(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const values: Array<
      number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
    > = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item280(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // Escape / $(!"'''" @.)
  function item280(
    text: string,
  ):
    | runtime.Success<
        number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
      >
    | runtime.Failure {
    const choices = [item199, item281];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // $(!"'''" @.)
  function item281(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(?!''')./g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item2,
            remainder: text,
          },
        ],
      };
    }
  }
  // '"'    @(Escape / $(!( '"' / NewLine ) @.))*  '"'
  function item288(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^"/g);
    failedExpectations.push({
      expectation: item162,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item291(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^"/g);
    failedExpectations.push({
      expectation: item162,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (Escape / $(!( '"' / NewLine ) @.))*
  function item291(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const values: Array<
      number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
    > = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item292(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // Escape / $(!( '"' / NewLine ) @.)
  function item292(
    text: string,
  ):
    | runtime.Success<
        number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
      >
    | runtime.Failure {
    const choices = [item199, item293];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // $(!( '"' / NewLine ) @.)
  function item293(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(?!("|(\\x0D\\x0A|[\n\r])))./g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item2,
            remainder: text,
          },
        ],
      };
    }
  }
  // "'"    @(Escape / $(!( "'" / NewLine ) @.))*  "'"
  function item301(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^'/g);
    failedExpectations.push({
      expectation: item182,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item304(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^'/g);
    failedExpectations.push({
      expectation: item182,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (Escape / $(!( "'" / NewLine ) @.))*
  function item304(
    text: string,
  ):
    | runtime.Success<
        (
          | number[]
          | "\u0007"
          | "\b"
          | "\f"
          | "\n"
          | "\r"
          | "\t"
          | "\v"
          | string
        )[]
      >
    | runtime.Failure {
    const values: Array<
      number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
    > = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item305(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // Escape / $(!( "'" / NewLine ) @.)
  function item305(
    text: string,
  ):
    | runtime.Success<
        number[] | "\u0007" | "\b" | "\f" | "\n" | "\r" | "\t" | "\v" | string
      >
    | runtime.Failure {
    const choices = [item199, item306];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // $(!( "'" / NewLine ) @.)
  function item306(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(?!('|(\\x0D\\x0A|[\n\r])))./g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item2,
            remainder: text,
          },
        ],
      };
    }
  }
  // BytesLiteral "bytes literal"
  // = [bB] bytes:CharacterSequence
  // { return builder.newBytesExpr(offset(), bytes) }
  //
  function item318(text: string): runtime.Success<any> | runtime.Failure {
    const result = item319(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item326,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // [bB] bytes:CharacterSequence
  // { return builder.newBytesExpr(offset(), bytes) }
  function item319(text: string): runtime.Success<any> | runtime.Failure {
    const result = item320(text);
    if (result.success === true) {
      return {
        success: true,
        value: item325(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // [bB] bytes:CharacterSequence
  function item320(text: string): runtime.Success<item324> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[bB]/g);
    failedExpectations.push({
      expectation: item322,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item129(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    };
  }
  // BooleanLiteral "boolean literal"
  // = keyword:("true" / "false")
  // { return builder.newBoolExpr(offset(), keyword) }
  //
  function item328(text: string): runtime.Success<any> | runtime.Failure {
    const result = item329(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item337,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // keyword:("true" / "false")
  // { return builder.newBoolExpr(offset(), keyword) }
  function item329(text: string): runtime.Success<any> | runtime.Failure {
    const result = item331(text);
    if (result.success === true) {
      return {
        success: true,
        value: item336(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "true" / "false"
  function item331(
    text: string,
  ): runtime.Success<"true" | "false"> | runtime.Failure {
    const choices = [item332, item334];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // "true"
  function item332(text: string): runtime.Success<"true"> | runtime.Failure {
    if (text.startsWith("true")) {
      return {
        success: true,
        value: "true",
        remainder: text.slice(4),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item333,
            remainder: text,
          },
        ],
      };
    }
  }
  // "false"
  function item334(text: string): runtime.Success<"false"> | runtime.Failure {
    if (text.startsWith("false")) {
      return {
        success: true,
        value: "false",
        remainder: text.slice(5),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item335,
            remainder: text,
          },
        ],
      };
    }
  }
  // NullLiteral "null literal"
  // = "null" ![_a-zA-Z0-9]
  // { return builder.newNullExpr(offset()) }
  //
  function item339(text: string): runtime.Success<any> | runtime.Failure {
    const result = item340(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item349,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // "null" ![_a-zA-Z0-9]
  // { return builder.newNullExpr(offset()) }
  function item340(text: string): runtime.Success<any> | runtime.Failure {
    const result = item341(text);
    if (result.success === true) {
      return {
        success: true,
        value: item348(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "null" ![_a-zA-Z0-9]
  function item341(text: string): runtime.Success<item347> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^null/g);
    failedExpectations.push({
      expectation: item343,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^(?![_a-zA-Z0-9])/g);
    failedExpectations.push();
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    return {
      success: true,
      value: [],
      remainder,
      failedExpectations,
    };
  }
  // "."? S name:Identifier !(S [({]) !("." Identifier|1.., "."| "{")
  // { return builder.newIdentExpr(offset(), name) }
  function item350(text: string): runtime.Success<any> | runtime.Failure {
    const result = item351(text);
    if (result.success === true) {
      return {
        success: true,
        value: item382(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "."? S name:Identifier !(S [({]) !("." Identifier|1.., "."| "{")
  function item351(text: string): runtime.Success<item381> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(\.)?/g);
    failedExpectations.push({
      expectation: item63,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item356(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^(?!(([\t\n\f\r ])+)?[({])/g);
    failedExpectations.push();
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item373(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      };
    } else {
      remainder = result4.remainder;
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    };
  }
  // Identifier "identifier"
  // = id:$([_a-zA-Z][_a-zA-Z0-9]*)
  // {
  // if ([
  // "true", "false", "null", "in", "as", "break", "const", "continue", "else",
  // "for", "function", "if", "import", "let", "loop", "package", "namespace",
  // "return", "var", "void", "while"
  // ].includes(id)) {
  // error("reserved identifier");
  // }
  //
  // return id;
  // }
  //
  function item356(text: string): runtime.Success<string> | runtime.Failure {
    const result = item357(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item367,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // id:$([_a-zA-Z][_a-zA-Z0-9]*)
  // {
  // if ([
  // "true", "false", "null", "in", "as", "break", "const", "continue", "else",
  // "for", "function", "if", "import", "let", "loop", "package", "namespace",
  // "return", "var", "void", "while"
  // ].includes(id)) {
  // error("reserved identifier");
  // }
  //
  // return id;
  // }
  function item357(text: string): runtime.Success<string> | runtime.Failure {
    const result = item359(text);
    if (result.success === true) {
      return {
        success: true,
        value: item366(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // $([_a-zA-Z][_a-zA-Z0-9]*)
  function item359(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^[_a-zA-Z]([_a-zA-Z0-9])*/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item362,
            remainder: text,
          },
        ],
      };
    }
  }
  // !("." Identifier|1.., "."| "{")
  function item373(text: string): runtime.Success<undefined> | runtime.Failure {
    return (() => {
      const result = item374(text);
      if (result.success) {
        return {
          success: false,
          remainder: text,
          failedExpectations: [],
        };
      } else {
        return {
          success: true,
          value: undefined,
          remainder: text,
          failedExpectations: [],
        };
      }
    })();
  }
  // "." Identifier|1.., "."| "{"
  function item374(text: string): runtime.Success<item380> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item375(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      };
    } else {
      remainder = result0.remainder;
    }
    const result1 = item376(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = item378(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value, result2.value],
      remainder,
      failedExpectations,
    };
  }
  // "."
  function item375(text: string): runtime.Success<"."> | runtime.Failure {
    if (text.startsWith(".")) {
      return {
        success: true,
        value: ".",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item63,
            remainder: text,
          },
        ],
      };
    }
  }
  // Identifier|1.., "."|
  function item376(text: string): runtime.Success<string[]> | runtime.Failure {
    const values: Array<string> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item377(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item356(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (
      values.length < 1 &&
      result.success === false /* technically redundant */
    ) {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations,
      };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  // "."
  function item377(text: string): runtime.Success<"."> | runtime.Failure {
    if (text.startsWith(".")) {
      return {
        success: true,
        value: ".",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item63,
            remainder: text,
          },
        ],
      };
    }
  }
  // "{"
  function item378(text: string): runtime.Success<"{"> | runtime.Failure {
    if (text.startsWith("{")) {
      return {
        success: true,
        value: "{",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item379,
            remainder: text,
          },
        ],
      };
    }
  }
  // "."? S identifier:Identifier S "(" args:ExprList ")"
  // { return builder.newCallExpr(offset(), identifier, args) }
  function item383(text: string): runtime.Success<any> | runtime.Failure {
    const result = item384(text);
    if (result.success === true) {
      return {
        success: true,
        value: item398(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "."? S identifier:Identifier S "(" args:ExprList ")"
  function item384(text: string): runtime.Success<item397> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(\.)?/g);
    failedExpectations.push({
      expectation: item63,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item356(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = remainder.match(/^\(/g);
    failedExpectations.push({
      expectation: item389,
      remainder: remainder,
    });
    if (result4?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result4[0].length);
    }
    const result5 = item392(remainder);
    failedExpectations.push(...result5.failedExpectations);
    if (result5.success === false) {
      return {
        success: false,
        remainder: result5.remainder,
        failedExpectations,
      };
    } else {
      remainder = result5.remainder;
    }
    const result6 = remainder.match(/^\)/g);
    failedExpectations.push({
      expectation: item396,
      remainder: remainder,
    });
    if (result6?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result6[0].length);
    }
    return {
      success: true,
      value: [result2.value, result5.value],
      remainder,
      failedExpectations,
    };
  }
  // Expr|0.., ","|
  function item392(text: string): runtime.Success<Expr[]> | runtime.Failure {
    const values: Array<Expr> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item393(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item4(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // ","
  function item393(text: string): runtime.Success<","> | runtime.Failure {
    if (text.startsWith(",")) {
      return {
        success: true,
        value: ",",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item394,
            remainder: text,
          },
        ],
      };
    }
  }
  // "."? name:$Identifier|1.., "."| S "{" entries:FieldInits (",")? S "}"
  // { return builder.newStructExpr(offset(), entries, name) }
  function item399(text: string): runtime.Success<any> | runtime.Failure {
    const result = item400(text);
    if (result.success === true) {
      return {
        success: true,
        value: item428(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "."? name:$Identifier|1.., "."| S "{" entries:FieldInits (",")? S "}"
  function item400(text: string): runtime.Success<item427> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(\.)?/g);
    failedExpectations.push({
      expectation: item63,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item404(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    const result3 = remainder.match(/^\{/g);
    failedExpectations.push({
      expectation: item379,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item410(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      };
    } else {
      remainder = result4.remainder;
    }
    const result5 = remainder.match(/^(,)?/g);
    failedExpectations.push({
      expectation: item394,
      remainder: remainder,
    });
    if (result5?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result5[0].length);
    }
    const result6 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result6?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result6[0].length);
    }
    const result7 = remainder.match(/^\}/g);
    failedExpectations.push({
      expectation: item426,
      remainder: remainder,
    });
    if (result7?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result7[0].length);
    }
    return {
      success: true,
      value: [result1.value, result4.value],
      remainder,
      failedExpectations,
    };
  }
  // $Identifier|1.., "."|
  function item404(text: string): runtime.Success<string> | runtime.Failure {
    const result = item405(text);
    if (result.success === true) {
      return {
        success: true,
        value: text.slice(0, text.length - result.remainder.length),
        remainder: result.remainder,
        failedExpectations: result.failedExpectations,
      };
    } else {
      return result;
    }
  }
  // Identifier|1.., "."|
  function item405(text: string): runtime.Success<string[]> | runtime.Failure {
    const values: Array<string> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item406(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item356(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (
      values.length < 1 &&
      result.success === false /* technically redundant */
    ) {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations,
      };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  // "."
  function item406(text: string): runtime.Success<"."> | runtime.Failure {
    if (text.startsWith(".")) {
      return {
        success: true,
        value: ".",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item63,
            remainder: text,
          },
        ],
      };
    }
  }
  // (
  // S key:Identifier $(S ":") value:Expr
  // { return builder.newStructEntry(offset(), key, value) }
  // )|0.., ","|
  function item410(text: string): runtime.Success<any[]> | runtime.Failure {
    const values: Array<any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item422(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item411(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // S key:Identifier $(S ":") value:Expr
  // { return builder.newStructEntry(offset(), key, value) }
  function item411(text: string): runtime.Success<any> | runtime.Failure {
    const result = item412(text);
    if (result.success === true) {
      return {
        success: true,
        value: item421(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // S key:Identifier $(S ":") value:Expr
  function item412(text: string): runtime.Success<item420> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item356(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^(([\t\n\f\r ])+)?:/g);
    failedExpectations.push(
      {
        expectation: item40,
        remainder: remainder,
      },
      {
        expectation: item417,
        remainder: remainder,
      },
    );
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    const result3 = item4(remainder);
    failedExpectations.push(...result3.failedExpectations);
    if (result3.success === false) {
      return {
        success: false,
        remainder: result3.remainder,
        failedExpectations,
      };
    } else {
      remainder = result3.remainder;
    }
    return {
      success: true,
      value: [result1.value, result3.value],
      remainder,
      failedExpectations,
    };
  }
  // ","
  function item422(text: string): runtime.Success<","> | runtime.Failure {
    if (text.startsWith(",")) {
      return {
        success: true,
        value: ",",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item394,
            remainder: text,
          },
        ],
      };
    }
  }
  // "(" @Expr ")"
  function item429(text: string): runtime.Success<Expr> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\(/g);
    failedExpectations.push({
      expectation: item389,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item4(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^\)/g);
    failedExpectations.push({
      expectation: item396,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // elements:("[" @ExprList (",")? S "]")
  // { return builder.newListExpr(offset(), elements) }
  function item434(text: string): runtime.Success<any> | runtime.Failure {
    const result = item436(text);
    if (result.success === true) {
      return {
        success: true,
        value: item445(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "[" @ExprList (",")? S "]"
  function item436(text: string): runtime.Success<Expr[]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\[/g);
    failedExpectations.push({
      expectation: item438,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item392(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^(,)?/g);
    failedExpectations.push({
      expectation: item394,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    const result3 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = remainder.match(/^\]/g);
    failedExpectations.push({
      expectation: item443,
      remainder: remainder,
    });
    if (result4?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result4[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // entries:("{" @MapInits $((",")? S "}"))
  // { return builder.newStructExpr(offset(), entries) }
  function item446(text: string): runtime.Success<any> | runtime.Failure {
    const result = item448(text);
    if (result.success === true) {
      return {
        success: true,
        value: item468(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "{" @MapInits $((",")? S "}")
  function item448(text: string): runtime.Success<any[]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\{/g);
    failedExpectations.push({
      expectation: item379,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item452(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^(,)?(([\t\n\f\r ])+)?\}/g);
    failedExpectations.push(
      {
        expectation: item394,
        remainder: remainder,
      },
      {
        expectation: item40,
        remainder: remainder,
      },
      {
        expectation: item426,
        remainder: remainder,
      },
    );
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // (
  // key:Expr ":" value:Expr
  // { return builder.newMapEntry(offset(), key, value) }
  // )|0.., ","|
  function item452(text: string): runtime.Success<any[]> | runtime.Failure {
    const values: Array<any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item460(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item453(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // key:Expr ":" value:Expr
  // { return builder.newMapEntry(offset(), key, value) }
  function item453(text: string): runtime.Success<any> | runtime.Failure {
    const result = item454(text);
    if (result.success === true) {
      return {
        success: true,
        value: item459(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // key:Expr ":" value:Expr
  function item454(text: string): runtime.Success<item458> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item4(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      };
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^:/g);
    failedExpectations.push({
      expectation: item417,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item4(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result2.value],
      remainder,
      failedExpectations,
    };
  }
  // ","
  function item460(text: string): runtime.Success<","> | runtime.Failure {
    if (text.startsWith(",")) {
      return {
        success: true,
        value: ",",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item394,
            remainder: text,
          },
        ],
      };
    }
  }
  // (S @Access)*
  function item471(
    text: string,
  ): runtime.Success<((prevExpr: Expr) => any)[]> | runtime.Failure {
    const values: Array<(prevExpr: Expr) => any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item472(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  // S @Access
  function item472(
    text: string,
  ): runtime.Success<(prevExpr: Expr) => any> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item475(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: result1.value,
      remainder,
      failedExpectations,
    };
  }
  // "." S field:Identifier S ![(]
  // { return ((prevExpr: Expr) => builder.newSelectExpr(offset(), prevExpr, field)) }
  // / "." S identifier:Identifier S "(" args:ExprList ")"
  // { return ((prevExpr: Expr) => builder.newMemberCallExpr(offset(), prevExpr, identifier, args)) }
  // / "[" index:Expr "]"
  // { return ((prevExpr: Expr) => builder.newCallExpr(offset(), "_[_]", [prevExpr, index])) }
  function item475(
    text: string,
  ): runtime.Success<(prevExpr: Expr) => any> | runtime.Failure {
    const choices = [item476, item485, item493];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // "." S field:Identifier S ![(]
  // { return ((prevExpr: Expr) => builder.newSelectExpr(offset(), prevExpr, field)) }
  function item476(
    text: string,
  ): runtime.Success<(prevExpr: Expr) => any> | runtime.Failure {
    const result = item477(text);
    if (result.success === true) {
      return {
        success: true,
        value: item484(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "." S field:Identifier S ![(]
  function item477(text: string): runtime.Success<item483> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\./g);
    failedExpectations.push({
      expectation: item63,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item356(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = remainder.match(/^(?![(])/g);
    failedExpectations.push();
    if (result4?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result4[0].length);
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    };
  }
  // "." S identifier:Identifier S "(" args:ExprList ")"
  // { return ((prevExpr: Expr) => builder.newMemberCallExpr(offset(), prevExpr, identifier, args)) }
  function item485(
    text: string,
  ): runtime.Success<(prevExpr: Expr) => any> | runtime.Failure {
    const result = item486(text);
    if (result.success === true) {
      return {
        success: true,
        value: item492(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "." S identifier:Identifier S "(" args:ExprList ")"
  function item486(text: string): runtime.Success<item397> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\./g);
    failedExpectations.push({
      expectation: item63,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item356(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = remainder.match(/^\(/g);
    failedExpectations.push({
      expectation: item389,
      remainder: remainder,
    });
    if (result4?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result4[0].length);
    }
    const result5 = item392(remainder);
    failedExpectations.push(...result5.failedExpectations);
    if (result5.success === false) {
      return {
        success: false,
        remainder: result5.remainder,
        failedExpectations,
      };
    } else {
      remainder = result5.remainder;
    }
    const result6 = remainder.match(/^\)/g);
    failedExpectations.push({
      expectation: item396,
      remainder: remainder,
    });
    if (result6?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result6[0].length);
    }
    return {
      success: true,
      value: [result2.value, result5.value],
      remainder,
      failedExpectations,
    };
  }
  // "[" index:Expr "]"
  // { return ((prevExpr: Expr) => builder.newCallExpr(offset(), "_[_]", [prevExpr, index])) }
  function item493(
    text: string,
  ): runtime.Success<(prevExpr: Expr) => any> | runtime.Failure {
    const result = item494(text);
    if (result.success === true) {
      return {
        success: true,
        value: item499(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "[" index:Expr "]"
  function item494(text: string): runtime.Success<item498> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\[/g);
    failedExpectations.push({
      expectation: item438,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item4(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^\]/g);
    failedExpectations.push({
      expectation: item443,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    };
  }
  // S ops:$( "!"+ / "-"+ ) expr:Member
  // {
  // /* : Expr */
  // if (ops.length % 2 === 0) {
  // return expr;
  // } else if (expr.exprKind.case === "callExpr" && expr.exprKind.value.function === `${ops[0]}_`) {
  // return expr.exprKind.value.args[0];
  // } else {
  // return builder.newCallExpr(offset(), `${ops[0]}_`, [expr]);
  // }
  // }
  function item503(text: string): runtime.Success<Expr> | runtime.Failure {
    const result = item504(text);
    if (result.success === true) {
      return {
        success: true,
        value: item515(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // S ops:$( "!"+ / "-"+ ) expr:Member
  function item504(text: string): runtime.Success<item514> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item506(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = item30(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result1.value, result2.value],
      remainder,
      failedExpectations,
    };
  }
  // $( "!"+ / "-"+ )
  function item506(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^((!)+|(-)+)/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item510,
            remainder: text,
          },
          {
            expectation: item55,
            remainder: text,
          },
        ],
      };
    }
  }
  // MultiplicationTail?
  function item517(
    text: string,
  ): runtime.Success<((prevExpr: Expr) => any)[] | null> | runtime.Failure {
    const result = item519(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  // (
  // S operator:( o:[*/%] { return `_${o}_` } ) nextExpr:Unary
  // { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
  // )+
  function item519(
    text: string,
  ): runtime.Success<((prevExpr: Expr) => any)[]> | runtime.Failure {
    const values: Array<(prevExpr: Expr) => any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item520(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (
      values.length < 1 &&
      result.success === false /* technically redundant */
    ) {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations,
      };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  // S operator:( o:[*/%] { return `_${o}_` } ) nextExpr:Unary
  // { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
  function item520(
    text: string,
  ): runtime.Success<(prevExpr: Expr) => any> | runtime.Failure {
    const result = item521(text);
    if (result.success === true) {
      return {
        success: true,
        value: item530(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // S operator:( o:[*/%] { return `_${o}_` } ) nextExpr:Unary
  function item521(text: string): runtime.Success<item529> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item523(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = item28(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result1.value, result2.value],
      remainder,
      failedExpectations,
    };
  }
  // o:[*/%] { return `_${o}_` }
  function item523(text: string): runtime.Success<string> | runtime.Failure {
    const result = item525(text);
    if (result.success === true) {
      return {
        success: true,
        value: item527(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // [*/%]
  function item525(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[*\/%]/g.test(text)) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item526,
            remainder: text,
          },
        ],
      };
    }
  }
  // AdditionTail?
  function item534(
    text: string,
  ): runtime.Success<((prevExpr: Expr) => any)[] | null> | runtime.Failure {
    const result = item536(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  // (
  // S operator:( o:[+-] { return `_${o}_` } ) nextExpr:Multiplication
  // { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
  // )+
  function item536(
    text: string,
  ): runtime.Success<((prevExpr: Expr) => any)[]> | runtime.Failure {
    const values: Array<(prevExpr: Expr) => any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item537(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (
      values.length < 1 &&
      result.success === false /* technically redundant */
    ) {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations,
      };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  // S operator:( o:[+-] { return `_${o}_` } ) nextExpr:Multiplication
  // { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
  function item537(
    text: string,
  ): runtime.Success<(prevExpr: Expr) => any> | runtime.Failure {
    const result = item538(text);
    if (result.success === true) {
      return {
        success: true,
        value: item545(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // S operator:( o:[+-] { return `_${o}_` } ) nextExpr:Multiplication
  function item538(text: string): runtime.Success<item529> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item540(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = item24(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result1.value, result2.value],
      remainder,
      failedExpectations,
    };
  }
  // o:[+-] { return `_${o}_` }
  function item540(text: string): runtime.Success<string> | runtime.Failure {
    const result = item542(text);
    if (result.success === true) {
      return {
        success: true,
        value: item543(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // [+-]
  function item542(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[+\-]/g.test(text)) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item73,
            remainder: text,
          },
        ],
      };
    }
  }
  // RelationTail?
  function item549(
    text: string,
  ): runtime.Success<((prevExpr: Expr) => any)[] | null> | runtime.Failure {
    const result = item551(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  // (
  // S operator:Relop nextExpr:Addition
  // { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
  // )+
  function item551(
    text: string,
  ): runtime.Success<((prevExpr: Expr) => any)[]> | runtime.Failure {
    const values: Array<(prevExpr: Expr) => any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item552(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (
      values.length < 1 &&
      result.success === false /* technically redundant */
    ) {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations,
      };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  // S operator:Relop nextExpr:Addition
  // { return ((prevExpr: Expr) => builder.newCallExpr(offset(), operator, [prevExpr, nextExpr])) }
  function item552(
    text: string,
  ): runtime.Success<(prevExpr: Expr) => any> | runtime.Failure {
    const result = item553(text);
    if (result.success === true) {
      return {
        success: true,
        value: item581(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // S operator:Relop nextExpr:Addition
  function item553(text: string): runtime.Success<item529> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item556(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = item20(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      };
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result1.value, result2.value],
      remainder,
      failedExpectations,
    };
  }
  // Relop "relational operator"
  // = (
  // operator:$("<=" / "<" / ">=" / ">" / "==" / "!=")
  // { return `_${operator}_` }
  // )
  // / "in" { return "@in" }
  //
  function item556(text: string): runtime.Success<string> | runtime.Failure {
    const result = item557(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [
          {
            expectation: item579,
            remainder: result.remainder,
          },
        ],
      };
    }
  }
  // (
  // operator:$("<=" / "<" / ">=" / ">" / "==" / "!=")
  // { return `_${operator}_` }
  // )
  // / "in" { return "@in" }
  function item557(text: string): runtime.Success<string> | runtime.Failure {
    const choices = [item558, item575];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (
      let func = choices.shift();
      func !== undefined;
      func = choices.shift()
    ) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        };
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  // operator:$("<=" / "<" / ">=" / ">" / "==" / "!=")
  // { return `_${operator}_` }
  function item558(text: string): runtime.Success<string> | runtime.Failure {
    const result = item560(text);
    if (result.success === true) {
      return {
        success: true,
        value: item574(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value,
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // $("<=" / "<" / ">=" / ">" / "==" / "!=")
  function item560(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(<=|<|>=|>|==|!=)/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item563,
            remainder: text,
          },
          {
            expectation: item565,
            remainder: text,
          },
          {
            expectation: item567,
            remainder: text,
          },
          {
            expectation: item569,
            remainder: text,
          },
          {
            expectation: item571,
            remainder: text,
          },
          {
            expectation: item573,
            remainder: text,
          },
        ],
      };
    }
  }
  // "in" { return "@in" }
  function item575(text: string): runtime.Success<string> | runtime.Failure {
    const result = item576(text);
    if (result.success === true) {
      return {
        success: true,
        value: item578(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "in"
  function item576(text: string): runtime.Success<"in"> | runtime.Failure {
    if (text.startsWith("in")) {
      return {
        success: true,
        value: "in",
        remainder: text.slice(2),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item577,
            remainder: text,
          },
        ],
      };
    }
  }
  // $(S "&&")
  function item584(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(([\t\n\f\r ])+)?&&/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item40,
            remainder: text,
          },
          {
            expectation: item587,
            remainder: text,
          },
        ],
      };
    }
  }
  // $(S "||")
  function item590(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^(([\t\n\f\r ])+)?\|\|/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [
          {
            expectation: item40,
            remainder: text,
          },
          {
            expectation: item593,
            remainder: text,
          },
        ],
      };
    }
  }
  // TernaryTail?
  function item597(
    text: string,
  ): runtime.Success<[Expr, Expr] | null> | runtime.Failure {
    const result = item599(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  // "?" t:ConditionalOr S ":" f:Expr S
  // {
  // /* : [Expr, Expr] */
  // return [t, f];
  // }
  function item599(
    text: string,
  ): runtime.Success<[Expr, Expr]> | runtime.Failure {
    const result = item600(text);
    if (result.success === true) {
      return {
        success: true,
        value: item607(
          () =>
            runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => input.length - text.length,
          (
            message: string,
            location = runtime.getLocation(
              parse$source,
              input,
              text,
              result.remainder,
            ),
            name?: string,
          ) => {
            throw new ParseError(message, location, name);
          },
          result.value[0],
          result.value[1],
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  // "?" t:ConditionalOr S ":" f:Expr S
  function item600(text: string): runtime.Success<item606> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\?/g);
    failedExpectations.push({
      expectation: item602,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item8(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      };
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    const result3 = remainder.match(/^:/g);
    failedExpectations.push({
      expectation: item417,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item4(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      };
    } else {
      remainder = result4.remainder;
    }
    const result5 = remainder.match(/^(([\t\n\f\r ])+)?/g);
    failedExpectations.push({
      expectation: item40,
      remainder: remainder,
    });
    if (result5?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      };
    } else {
      remainder = remainder.slice(result5[0].length);
    }
    return {
      success: true,
      value: [result1.value, result4.value],
      remainder,
      failedExpectations,
    };
  }
}
