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

import type {
  Constant,
  Expr,
  Expr_Select,
  Expr_Call,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_Comprehension,
} from "../gen/cel/expr/syntax_pb.ts";

import type { Message } from "@bufbuild/protobuf";

const decoder = new TextDecoder();

/**
 * Returns adorned debug output for the given expression tree, following cel-go.
 *
 * > [!CAUTION]
 * > This functions requires ES2024 features.
 */
export function toDebugString(
  expr: Expr,
  adorner: Adorner = EmptyAdorner.singleton,
): string {
  const writer = new Writer(adorner);
  writer.buffer(expr);

  return writer.toString();
}

class Writer {
  adorner: Adorner;
  content = "";
  indent = 0;
  lineStart = true;

  constructor(adorner: Adorner) {
    this.adorner = adorner;
  }

  buffer(e?: Expr): void {
    if (e == undefined) {
      return;
    }

    switch (e.exprKind.case) {
      case "constExpr":
        this.append(formatLiteral(e.exprKind.value));
        break;
      case "identExpr":
        this.append(e.exprKind.value.name);
        break;
      case "selectExpr":
        this.appendSelect(e.exprKind.value);
        break;
      case "callExpr":
        this.appendCall(e.exprKind.value);
        break;
      case "listExpr":
        this.appendList(e.exprKind.value);
        break;
      case "structExpr":
        this.appendStruct(e.exprKind.value);
        break;
      case "comprehensionExpr":
        this.appendComprehension(e.exprKind.value);
        break;
    }

    this.adorn(e);
  }

  appendSelect(sel: Expr_Select): void {
    this.buffer(sel.operand);
    this.append(".");
    this.append(sel.field);

    if (sel.testOnly) {
      this.append("~test-only~");
    }
  }

  appendCall(call: Expr_Call): void {
    if (call.target !== undefined) {
      // above check is equivalent to `call.isMemberFunction()`
      this.buffer(call.target);
      this.append(".");
    }
    this.append(call.function);
    this.append("(");
    if (call.args.length > 0) {
      this.addIndent();
      this.appendLine();
      for (let i = 0; i < call.args.length; ++i) {
        if (i > 0) {
          this.append(",");
          this.appendLine();
        }
        this.buffer(call.args[i]);
      }
      this.removeIndent();
      this.appendLine();
    }
    this.append(")");
  }

  appendList(list: Expr_CreateList): void {
    this.append("[");
    if (list.elements.length > 0) {
      this.appendLine();
      this.addIndent();
      for (let i = 0; i < list.elements.length; ++i) {
        if (i > 0) {
          this.append(",");
          this.appendLine();
        }
        this.buffer(list.elements[i]);
      }
      this.removeIndent();
      this.appendLine();
    }
    this.append("]");
  }

  appendStruct(obj: Expr_CreateStruct) {
    this.append(obj.messageName);
    this.append("{");
    if (obj.entries.length > 0) {
      this.appendLine();
      this.addIndent();
      for (let i = 0; i < obj.entries.length; ++i) {
        const entry = obj.entries[i];
        if (i > 0) {
          this.append(",");
          this.appendLine();
        }

        if (entry.optionalEntry) {
          this.append("?");
        }

        if (entry.keyKind.case === "fieldKey") {
          this.append(entry.keyKind.value);
        } else {
          this.buffer(entry.keyKind.value);
        }

        this.append(":");
        this.buffer(entry.value);
        this.adorn(entry);
      }
      this.removeIndent();
      this.appendLine();
    }
    this.append("}");
  }

  appendComprehension(comprehension: Expr_Comprehension) {
    this.append("__comprehension__(");
    this.addIndent();
    this.appendLine();
    this.append("// Variable");
    this.appendLine();
    this.append(comprehension.iterVar);
    this.append(",");
    this.appendLine();
    this.append("// Target");
    this.appendLine();
    this.buffer(comprehension.iterRange);
    this.append(",");
    this.appendLine();
    this.append("// Accumulator");
    this.appendLine();
    this.append(comprehension.accuVar);
    this.append(",");
    this.appendLine();
    this.append("// Init");
    this.appendLine();
    this.buffer(comprehension.accuInit);
    this.append(",");
    this.appendLine();
    this.append("// LoopCondition");
    this.appendLine();
    this.buffer(comprehension.loopCondition);
    this.append(",");
    this.appendLine();
    this.append("// LoopStep");
    this.appendLine();
    this.buffer(comprehension.loopStep);
    this.append(",");
    this.appendLine();
    this.append("// Result");
    this.appendLine();
    this.buffer(comprehension.result);
    this.append(")");
    this.removeIndent();
  }

  append(s: string) {
    this.doIndent();
    this.content += s;
  }

  doIndent() {
    if (this.lineStart) {
      this.lineStart = false;
      this.content += "  ".repeat(this.indent);
    }
  }

  adorn(e: Message) {
    this.append(this.adorner.GetMetadata(e));
  }

  appendLine() {
    this.content += "\n";
    this.lineStart = true;
  }

  addIndent() {
    this.indent++;
  }

  removeIndent() {
    this.indent--;
    if (this.indent < 0) {
      throw new Error("negative indent");
    }
  }

  toString(): string {
    return this.content;
  }
}

export interface Adorner {
  GetMetadata(context: Message): string;
}

class EmptyAdorner implements Adorner {
  static readonly singleton = new EmptyAdorner();
  private constructor() {}

  GetMetadata(_context: Message): string {
    return "";
  }
}

export class KindAdorner implements Adorner {
  static readonly singleton = new KindAdorner();
  private constructor() {}

  GetMetadata(context: Message): string {
    let valueType: string;

    if (isExpr(context)) {
      valueType = getExprType(context);
    } else if (isEntry(context)) {
      valueType = "*expr.Expr_CreateStruct_Entry";
    } else {
      throw new Error("unexpected message type: " + context.$typeName);
    }

    return `^#${valueType}#`;
  }
}

function formatLiteral(c: Constant): string {
  const kind = c.constantKind;

  switch (kind.case) {
    case "boolValue":
      return kind.value ? "true" : "false";
    case "bytesValue":
      return quoteBytes(kind.value);
    case "doubleValue":
      // these are the bounds where Go's default formatting switches to exponential
      if (kind.value < 1e6 && kind.value > -1e6) {
        return (Object.is(kind.value, -0) ? "-" : "") + kind.value.toString();
      }
      // workaround for https://github.com/golang/go/issues/70862
      return kind.value.toExponential().replace(/e\+([0-9])$/, "e+0$1");
    case "int64Value":
      return kind.value.toString();
    case "stringValue":
      return quoteString(kind.value);
    case "uint64Value":
      return `${kind.value.toString()}u`;
    case "nullValue":
      return "null";
    default:
      throw new Error(`Unknown constant type: ${kind.case}`);
  }
}

const unprintableExp = /[^\p{L}\p{N}\p{S}\p{P}\p{Cs} ]/v;
const unprintableExpGlobal = /[^\p{L}\p{N}\p{S}\p{P}\p{Cs} ]/gv;
const segmenter = new Intl.Segmenter("en");

function isPrintable(c: string) {
  return !unprintableExp.test(c.normalize()) || !c.isWellFormed();
}

function quoteBytes(bytes: Uint8Array) {
  const replacement = String.fromCharCode(0xfffd);
  let byteString = "";
  let i = 0;
  while (i < bytes.length) {
    let length = 1;
    const character =
      bytes[i] < 0x80
        ? String.fromCharCode(bytes[i])
        : bytes[i] < 0xc0
          ? "" // continuation
          : bytes[i] < 0xe0
            ? // biome-ignore lint/suspicious/noAssignInExpressions: do not want to remove the ternary expression
              decoder.decode(bytes.slice(i, i + (length = 2)))
            : bytes[i] < 0xf0
              ? // biome-ignore lint/suspicious/noAssignInExpressions: do not want to remove the ternary expression
                decoder.decode(bytes.slice(i, i + (length = 3)))
              : bytes[i] < 0xf5
                ? // biome-ignore lint/suspicious/noAssignInExpressions: do not want to remove the ternary expression
                  decoder.decode(bytes.slice(i, i + (length = 4)))
                : ""; // unused

    // this is a bit subtle; either
    // - we got an unexpected continuation byte, in which case `character` is an empty string
    // - we got an unexpected unused byte, in which case `character` is an empty string
    // - we got the first byte of a multibyte code point, but the subsequent bytes weren't valid and
    //   decoding failed, and the decoder returned the replacement character for one or more bytes
    //   in the byte sequence
    // - we got a literal replacement byte UTF-8 sequence (0xef, 0xbf, 0xbd), which we treat the
    //   same way as if it were a failure because we're just going to encode the escaped bytes in
    //   either case
    // - we successfully decoded a single character but it isn't printable
    //
    // only if none of these things is true can we return the unescaped decoded character
    if (
      character.length !== 1 ||
      character === replacement ||
      unprintableExp.test(character)
    ) {
      byteString += formatSpecial(
        "\\x" + bytes[i].toString(16).padStart(2, "0"),
      );
      i++;
    } else {
      byteString += formatSpecial(character);
      i += length;
    }
  }

  return 'b"' + byteString + '"';
}

function quoteString(text: string): string {
  return '"' + escapeString(text) + '"';
}

function formatSpecial(c: string) {
  if (c === "\\x07" || c === "\\u0007") {
    return "\\a";
  }
  if (c === "\\x08" || c === "\\u0008") {
    return "\\b";
  }
  if (c === "\\x0c" || c === "\\u000c") {
    return "\\f";
  }
  if (c === "\\x0a" || c === "\\u000a") {
    return "\\n";
  }
  if (c === "\\x0d" || c === "\\u000d") {
    return "\\r";
  }
  if (c === "\\x09" || c === "\\u0009") {
    return "\\t";
  }
  if (c === "\\x0b" || c === "\\u000b") {
    return "\\v";
  }
  if (c === "\\") {
    return "\\\\";
  }
  if (c === '"') {
    return '\\"';
  }
  return c;
}

function escapeString(text: string): string {
  return [...segmenter.segment(text)]
    .map((s) => {
      if (isPrintable(s.segment)) {
        return formatSpecial(s.segment);
      }
      return formatSpecial(
        s.segment.replaceAll(
          unprintableExpGlobal,
          (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"),
        ),
      );
    })
    .join("");
}

function getExprType(e: Expr): string {
  switch (e.exprKind.case) {
    case "constExpr":
      return getConstantType(e.exprKind.value);
    case "identExpr":
      return "*expr.Expr_IdentExpr";
    case "selectExpr":
      return "*expr.Expr_SelectExpr";
    case "callExpr":
      return "*expr.Expr_CallExpr";
    case "listExpr":
      return "*expr.Expr_ListExpr";
    case "structExpr":
      return "*expr.Expr_StructExpr";
    case "comprehensionExpr":
      return "*expr.Expr_ComprehensionExpr";
    default:
      throw new Error("unexpected expression type: " + e.exprKind.case);
  }
}

function getConstantType(c: Constant): string {
  switch (c.constantKind.case) {
    case "nullValue":
      return "*expr.Constant_NullValue";
    case "boolValue":
      return "*expr.Constant_BoolValue";
    case "int64Value":
      return "*expr.Constant_Int64Value";
    case "uint64Value":
      return "*expr.Constant_Uint64Value";
    case "doubleValue":
      return "*expr.Constant_DoubleValue";
    case "stringValue":
      return "*expr.Constant_StringValue";
    case "bytesValue":
      return "*expr.Constant_BytesValue";
    default:
      throw new Error("unexpected constant type: " + c.constantKind.case);
  }
}

function isExpr(m: Message): m is Expr {
  return m.$typeName === "cel.expr.Expr";
}

function isEntry(m: Message): m is Expr {
  return m.$typeName === "cel.expr.Expr.CreateStruct.Entry";
}
