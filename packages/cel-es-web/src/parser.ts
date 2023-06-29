import Parser from "web-tree-sitter";
import { type CelParser } from "@bufbuild/cel-es";
import {
  Constant,
  Expr,
  Expr_Call,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_CreateStruct_Entry,
  Expr_Ident,
  Expr_Select,
  ParsedExpr,
  SourceInfo,
} from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/syntax_pb";
import { NullValue } from "@bufbuild/protobuf";

export class TreeSitterParser implements CelParser {
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }

  parse(expr: string): ParsedExpr {
    const tree = this.parser.parse(expr);
    return parseTree(tree);
  }
}

class ParseContext {
  prevId = 0;
  readonly sourceInfo = new SourceInfo();

  nextId(): number {
    return ++this.prevId;
  }

  newExpr(node: Parser.SyntaxNode): Expr {
    const expr = new Expr();
    expr.id = BigInt(this.nextId());
    this.sourceInfo.positions[String(expr.id)] = node.startIndex;
    return expr;
  }

  parseIntLiteral(node: Parser.SyntaxNode): bigint {
    return BigInt(node.text);
  }

  parseBinaryExpr(node: Parser.SyntaxNode): Expr {
    const callExpr = new Expr_Call();
    const opNode = node.child(1)!;
    if (opNode.type === "in") {
      callExpr.function = "@in";
    } else {
      callExpr.function = `_${opNode.text}_`;
    }
    callExpr.args.push(this.parseExpr(node.child(0)!));
    callExpr.args.push(this.parseExpr(node.child(2)!));
    const expr = this.newExpr(opNode);
    expr.exprKind = {
      case: "callExpr",
      value: callExpr,
    };
    return expr;
  }

  parseSelectExpr(node: Parser.SyntaxNode): Expr {
    const selectExpr = new Expr_Select();
    selectExpr.operand = this.parseExpr(node.child(0)!);
    selectExpr.field = node.child(2)!.text;
    const expr = this.newExpr(node.child(1)!);
    expr.exprKind = {
      case: "selectExpr",
      value: selectExpr,
    };
    return expr;
  }

  parseCallExpr(node: Parser.SyntaxNode): Expr {
    const callExpr = new Expr_Call();
    callExpr.function = node.childForFieldName("function")!.text;
    const expr = this.newExpr(node);
    const args = node.childForFieldName("arguments")!;
    for (let i = 0; i < args.namedChildCount; i++) {
      const arg = args.namedChild(i)!;
      const argExpr = this.parseExpr(arg);
      callExpr.args.push(argExpr);
    }
    const operand = node.childForFieldName("operand");
    if (operand !== null) {
      callExpr.target = this.parseExpr(operand);
    }
    expr.exprKind = {
      case: "callExpr",
      value: callExpr,
    };
    return expr;
  }

  parseStringLiteral(node: Parser.SyntaxNode): Expr {
    const expr = this.newExpr(node);
    const kind = node.childForFieldName("kind");
    let isBytes = false;
    let isRaw = false;
    if (kind !== null) {
      const kindSet = new Set(kind.text.toLowerCase());
      if (kindSet.has("b")) {
        kindSet.delete("b");
        isBytes = true;
      }
      if (kindSet.has("r")) {
        kindSet.delete("r");
        isRaw = true;
      }
      if (kindSet.size !== 0) {
        throw new Error(`Unsupported string literal kind: ${kind.text}`);
      }
    }
    const quoted = node.childForFieldName("quoted")!;
    let value = quoted.text.slice(1, -1);
    switch (quoted.type) {
      case "triple_double_quote_string_literal":
      case "triple_single_quoted_string_literall":
        value = quoted.text.slice(2, -2);
        break;
    }
    if (!isRaw) {
      // Handle escape sequences.
      value = value.replace(
        /\\([0-7]{1,3}|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|.)/g,
        (match, p1) => {
          switch (p1[0]) {
            case "0":
              return String.fromCharCode(parseInt(p1, 8));
            case "x":
              return String.fromCharCode(parseInt(p1.slice(1), 16));
            case "u":
              return String.fromCharCode(parseInt(p1.slice(1), 16));
            case "U":
              return String.fromCodePoint(parseInt(p1.slice(1), 16));
            default:
              return p1;
          }
        }
      );
    }
    if (isBytes) {
      const bytes = new Uint8Array(value.length);
      for (let i = 0; i < value.length; i++) {
        bytes[i] = value.charCodeAt(i);
      }
      expr.exprKind = {
        case: "constExpr",
        value: new Constant({
          constantKind: {
            case: "bytesValue",
            value: bytes,
          },
        }),
      };
    } else {
      expr.exprKind = {
        case: "constExpr",
        value: new Constant({
          constantKind: {
            case: "stringValue",
            value: value,
          },
        }),
      };
    }
    return expr;
  }

  parseListExpr(node: Parser.SyntaxNode): Expr {
    const expr = this.newExpr(node);
    const listExpr = new Expr_CreateList();
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i)!;
      listExpr.elements.push(this.parseExpr(child));
    }
    expr.exprKind = {
      case: "listExpr",
      value: listExpr,
    };
    return expr;
  }

  parseExpr(node: Parser.SyntaxNode): Expr {
    switch (node.type) {
      case "binary_expression":
        return this.parseBinaryExpr(node);
      case "select_expression":
        return this.parseSelectExpr(node);
      case "identifier": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "identExpr",
          value: new Expr_Ident({
            name: node.text,
          }),
        };
        return expr;
      }
      case "call_expression":
        return this.parseCallExpr(node);
      case "member_call_expression":
        return this.parseCallExpr(node);
      case "list_expression":
        return this.parseListExpr(node);
      case "float_literal": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "constExpr",
          value: new Constant({
            constantKind: {
              case: "doubleValue",
              value: parseFloat(node.text),
            },
          }),
        };
        return expr;
      }
      case "int_literal": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "constExpr",
          value: new Constant({
            constantKind: {
              case: "int64Value",
              value: this.parseIntLiteral(node),
            },
          }),
        };
        return expr;
      }
      case "uint_literal": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "constExpr",
          value: new Constant({
            constantKind: {
              case: "uint64Value",
              value: this.parseIntLiteral(node.firstNamedChild!),
            },
          }),
        };
        return expr;
      }
      case "true": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "constExpr",
          value: new Constant({
            constantKind: {
              case: "boolValue",
              value: true,
            },
          }),
        };
        return expr;
      }
      case "false": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "constExpr",
          value: new Constant({
            constantKind: {
              case: "boolValue",
              value: false,
            },
          }),
        };
        return expr;
      }
      case "null": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "constExpr",
          value: new Constant({
            constantKind: {
              case: "nullValue",
              value: NullValue.NULL_VALUE,
            },
          }),
        };
        return expr;
      }
      case "string_literal": {
        return this.parseStringLiteral(node);
      }
      case "unary_expression": {
        const expr = this.newExpr(node);
        const unaryExpr = new Expr_Call();
        unaryExpr.function = node.childForFieldName("operator")!.text + "_";
        unaryExpr.args.push(this.parseExpr(node.childForFieldName("operand")!));
        expr.exprKind = {
          case: "callExpr",
          value: unaryExpr,
        };
        return expr;
      }
      case "map_expression":
        return this.parseMapExpr(node);
      case "struct_expression":
        return this.parseStructExpr(node);
      case "index_expression":
        return this.parseIndexExpr(node);
      case "parenthesized_expression":
        return this.parseExpr(node.namedChild(0)!);
      case "conditional_expression":
        return this.parseConditionalExpr(node);
      default:
        throw new Error(`Unsupported node type: ${node}`);
    }
  }

  parseConditionalExpr(node: Parser.SyntaxNode): Expr {
    const expr = this.newExpr(node);
    const conditionalExpr = new Expr_Call();
    conditionalExpr.function = "_?_:_";
    conditionalExpr.args = [
      this.parseExpr(node.childForFieldName("condition")!),
      this.parseExpr(node.childForFieldName("consequence")!),
      this.parseExpr(node.childForFieldName("alternative")!),
    ];
    return expr;
  }

  parseIndexExpr(node: Parser.SyntaxNode): Expr {
    const expr = this.newExpr(node);
    const indexExpr = new Expr_Call();
    indexExpr.function = "_[_]";
    indexExpr.target = this.parseExpr(node.childForFieldName("operand")!);
    return expr;
  }

  parseStructExpr(node: Parser.SyntaxNode): Expr {
    const structExpr = new Expr_CreateStruct();
    const fields = node.childForFieldName("fields");
    structExpr.messageName = node.childForFieldName("type")!.text;
    if (fields !== null) {
      for (let i = 0; i < fields.namedChildCount; i++) {
        const field = fields.namedChild(i)!;
        const key = field.childForFieldName("key")!;
        const value = field.childForFieldName("value")!;
        structExpr.entries.push(
          new Expr_CreateStruct_Entry({
            keyKind: {
              case: "fieldKey",
              value: key.text,
            },
            value: this.parseExpr(value),
          })
        );
      }
    }
    const expr = this.newExpr(node);
    expr.exprKind = {
      case: "structExpr",
      value: structExpr,
    };
    return expr;
  }

  parseMapExpr(node: Parser.SyntaxNode): Expr {
    const expr = this.newExpr(node);
    const mapExpr = new Expr_CreateStruct();
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i)!;
      const key = this.parseExpr(child.childForFieldName("key")!);
      const value = this.parseExpr(child.childForFieldName("value")!);
      mapExpr.entries.push(
        new Expr_CreateStruct_Entry({
          keyKind: {
            case: "mapKey",
            value: key,
          },
          value: value,
        })
      );
    }
    expr.exprKind = {
      case: "structExpr",
      value: mapExpr,
    };
    return expr;
  }
}

export function parseTree(tree: Parser.Tree): ParsedExpr {
  const ctx = new ParseContext();
  const expr = new ParsedExpr();
  if (tree.rootNode.firstChild !== null) {
    expr.expr = ctx.parseExpr(tree.rootNode.firstChild);
  }
  expr.sourceInfo = ctx.sourceInfo;
  return expr;
}
