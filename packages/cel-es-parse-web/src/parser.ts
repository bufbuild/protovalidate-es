import { syntax_pb } from "@bufbuild/cel-es-proto";
import Parser from "web-tree-sitter";

class ParseContext {
  prevId = 0;
  readonly sourceInfo = new syntax_pb.SourceInfo();

  nextId(): number {
    return ++this.prevId;
  }

  newExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    const expr = new syntax_pb.Expr();
    expr.id = BigInt(this.nextId());
    this.sourceInfo.positions[String(expr.id)] = node.startIndex;
    return expr;
  }

  parseIntLiteral(node: Parser.SyntaxNode): bigint {
    return BigInt(node.text);
  }

  parseBinaryExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    const callExpr = new syntax_pb.Expr_Call();
    const opNode = node.child(1)!;
    callExpr.function = `_${opNode.text}_`;
    callExpr.args.push(this.parseExpr(node.child(0)!));
    callExpr.args.push(this.parseExpr(node.child(2)!));
    const expr = this.newExpr(opNode);
    expr.exprKind = {
      case: "callExpr",
      value: callExpr,
    };
    return expr;
  }

  parseSelectExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    const selectExpr = new syntax_pb.Expr_Select();
    selectExpr.operand = this.parseExpr(node.child(0)!);
    selectExpr.field = node.child(2)!.text;
    const expr = this.newExpr(node.child(1)!);
    expr.exprKind = {
      case: "selectExpr",
      value: selectExpr,
    };
    return expr;
  }

  parseCallExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    const callExpr = new syntax_pb.Expr_Call();
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

  parseExpr(node: Parser.SyntaxNode): syntax_pb.Expr {
    switch (node.type) {
      case "binary_expression":
        return this.parseBinaryExpr(node);
      case "select_expression":
        return this.parseSelectExpr(node);
      case "identifier": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "identExpr",
          value: new syntax_pb.Expr_Ident({
            name: node.text,
          }),
        };
        return expr;
      }
      case "call_expression":
        return this.parseCallExpr(node);
      case "member_call_expression":
        return this.parseCallExpr(node);
      case "int_literal": {
        const expr = this.newExpr(node);
        expr.exprKind = {
          case: "constExpr",
          value: new syntax_pb.Constant({
            constantKind: {
              case: "int64Value",
              value: this.parseIntLiteral(node),
            },
          }),
        };
        return expr;
      }
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }
}

export function parseTree(tree: Parser.Tree): syntax_pb.ParsedExpr {
  const ctx = new ParseContext();
  const expr = new syntax_pb.ParsedExpr();
  if (tree.rootNode.firstChild !== null) {
    expr.expr = ctx.parseExpr(tree.rootNode.firstChild);
  }
  expr.sourceInfo = ctx.sourceInfo;
  return expr;
}
