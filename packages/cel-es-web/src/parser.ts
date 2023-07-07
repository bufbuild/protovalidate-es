import {
  Expr,
  Expr_CreateList,
  Expr_CreateStruct,
  ParsedExpr,
} from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/syntax_pb";
import { ExprBuilder, type CelParser } from "@bufbuild/cel-es";
import { NullValue } from "@bufbuild/protobuf";
import Parser from "web-tree-sitter";
import { highlightCel, Highlight } from "./highlight";

export class TreeSitterParser implements CelParser {
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }

  parse(expr: string): ParsedExpr {
    const tree = this.parser.parse(expr);
    return parseTree(tree);
  }

  highlight(expr: string): Highlight[] {
    return highlightCel(expr, this.parser);
  }
}

class ParseContext extends ExprBuilder {
  parseIntLiteral(node: Parser.SyntaxNode): bigint {
    return BigInt(node.text);
  }

  parseBinaryExpr(node: Parser.SyntaxNode): Expr {
    const opNode = node.child(1)!;
    return this.newInfixExpr(opNode.startIndex, opNode.text, [
      this.parseExpr(node.child(0)!),
      this.parseExpr(node.child(2)!),
    ]);
  }

  parseSelectExpr(node: Parser.SyntaxNode): Expr {
    return this.newSelectExpr(
      node.child(1)!.startIndex,
      this.parseExpr(node.child(0)!),
      node.child(2)!.text
    );
  }

  parseCallExpr(node: Parser.SyntaxNode): Expr {
    const argNodes = node.childForFieldName("arguments")!;
    const args = [];
    for (let i = 0; i < argNodes.namedChildCount; i++) {
      const arg = argNodes.namedChild(i)!;
      const argExpr = this.parseExpr(arg);
      args.push(argExpr);
    }
    const func = node.childForFieldName("function")!;
    const operand = node.childForFieldName("operand");
    if (operand !== null) {
      return this.newMemberCallExpr(
        node.child(0)!.startIndex,
        this.parseExpr(operand),
        func.text,
        args
      );
    }
    return this.newCallExpr(func.startIndex, func.text, args);
  }

  parseStringLiteral(node: Parser.SyntaxNode): Expr {
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
      case "triple_single_quoted_string_literal":
        value = quoted.text.slice(3, -3);
        break;
    }
    if (isBytes) {
      return this.newBytesExpr(node.startIndex, value, isRaw);
    }
    return this.newStringExpr(node.startIndex, value, isRaw);
  }

  parseListExpr(node: Parser.SyntaxNode): Expr {
    const expr = this.nextExpr(node.startIndex);
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
      case "identifier":
        return this.newIdentExpr(node.startIndex, node.text);
      case "call_expression":
        return this.parseCallExpr(node);
      case "member_call_expression":
        return this.parseCallExpr(node);
      case "list_expression":
        return this.parseListExpr(node);
      case "float_literal": {
        return this.newConstExpr(node.startIndex, {
          case: "doubleValue",
          value: parseFloat(node.text),
        });
      }
      case "int_literal":
        return this.newConstExpr(node.startIndex, {
          case: "int64Value",
          value: this.parseIntLiteral(node),
        });
      case "uint_literal":
        return this.newConstExpr(node.startIndex, {
          case: "uint64Value",
          value: this.parseIntLiteral(node.firstNamedChild!),
        });
      case "true":
        return this.newConstExpr(node.startIndex, {
          case: "boolValue",
          value: true,
        });
      case "false":
        return this.newConstExpr(node.startIndex, {
          case: "boolValue",
          value: false,
        });
      case "null":
        return this.newConstExpr(node.startIndex, {
          case: "nullValue",
          value: NullValue.NULL_VALUE,
        });
      case "string_literal": {
        return this.parseStringLiteral(node);
      }
      case "unary_expression":
        return this.newCallExpr(
          node.startIndex,
          node.childForFieldName("operator")!.text + "_",
          [this.parseExpr(node.childForFieldName("operand")!)]
        );
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
    return this.newCallExpr(node.startIndex, "_?_:_", [
      this.parseExpr(node.childForFieldName("condition")!),
      this.parseExpr(node.childForFieldName("consequence")!),
      this.parseExpr(node.childForFieldName("alternative")!),
    ]);
  }

  parseIndexExpr(node: Parser.SyntaxNode): Expr {
    return this.newMemberCallExpr(
      node.startIndex,
      this.parseExpr(node.childForFieldName("operand")!),
      "_[_]",
      [this.parseExpr(node.childForFieldName("index")!)]
    );
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
          this.newStructEntry(key.startIndex, key.text, this.parseExpr(value))
        );
      }
    }
    const expr = this.nextExpr(node.startIndex);
    expr.exprKind = {
      case: "structExpr",
      value: structExpr,
    };
    return expr;
  }

  parseMapExpr(node: Parser.SyntaxNode): Expr {
    const expr = this.nextExpr(node.startIndex);
    const mapExpr = new Expr_CreateStruct();
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i)!;
      const key = this.parseExpr(child.childForFieldName("key")!);
      const value = this.parseExpr(child.childForFieldName("value")!);
      mapExpr.entries.push(this.newMapEntry(child.startIndex, key, value));
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
