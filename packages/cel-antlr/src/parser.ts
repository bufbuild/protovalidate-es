import { CharStreams, CommonTokenStream, ParserRuleContext } from "antlr4ts";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor.js";
import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";
import {
  Expr,
  Expr_CreateStruct,
  Expr_CreateStruct_Entry,
  ParsedExpr,
  SourceInfo,
} from "./pb/cel/expr/syntax_pb.js";
import { CELLexer } from "./gen/CELLexer.js";
import {
  BoolFalseContext,
  BoolTrueContext,
  BytesContext,
  CalcContext,
  CELParser,
  ConditionalAndContext,
  ConditionalOrContext,
  CreateListContext,
  CreateMessageContext,
  CreateStructContext,
  DoubleContext,
  ExprContext,
  IdentOrGlobalCallContext,
  IndexContext,
  IntContext,
  LogicalNotContext,
  MemberCallContext,
  NegateContext,
  NestedContext,
  NullContext,
  RelationContext,
  SelectContext,
  StringContext,
  UintContext,
} from "./gen/CELParser.js";
import type { CELVisitor } from "./gen/CELVisitor.js";
import { ExprBuilder } from "./builder.js";
import type { CelParser } from "./celenv.js";

class PosVisitor
  extends AbstractParseTreeVisitor<number>
  implements CELVisitor<number>
{
  defaultResult() {
    return -1;
  }

  override visitTerminal(node: TerminalNode): number {
    return node.symbol.startIndex;
  }
}

const POS_VISITOR = new PosVisitor();

export class ExprVisitor
  extends AbstractParseTreeVisitor<Expr>
  implements CELVisitor<Expr>
{
  private builder = new ExprBuilder();

  public getSourceInfo(): SourceInfo {
    return this.builder.sourceInfo;
  }

  private nextExpr(pos: ParserRuleContext | number): Expr {
    if (pos instanceof ParserRuleContext) {
      pos = pos.start.startIndex;
    }
    return this.builder.nextExpr(pos);
  }

  defaultResult() {
    return new Expr();
  }

  visitExpr(ctx: ExprContext): Expr {
    if (ctx._e1 === undefined || ctx._e2 === undefined) {
      return ctx._e.accept(this);
    }
    return this.builder.newCallExpr(ctx.start.startIndex, "_?_:_", [
      ctx._e.accept(this),
      ctx._e1.accept(this),
      ctx._e2.accept(this),
    ]);
  }

  visitNested(ctx: NestedContext): Expr {
    return ctx._e.accept(this);
  }

  visitString(ctx: StringContext): Expr {
    // unescape the string.
    let rawValue = ctx.text;
    let raw = false;
    if (rawValue.startsWith("R") || rawValue.startsWith("r")) {
      raw = true;
      rawValue = rawValue.substring(1);
    }
    if (rawValue.startsWith("'''") || rawValue.startsWith('"""')) {
      rawValue = rawValue.substring(3, rawValue.length - 3);
    } else if (rawValue.startsWith("'") || rawValue.startsWith('"')) {
      rawValue = rawValue.substring(1, rawValue.length - 1);
    }
    return this.builder.newStringExpr(ctx.start.startIndex, rawValue, raw);
  }

  visitBytes(ctx: BytesContext): Expr {
    let rawValue = ctx.text.substring(1);
    let raw = false;
    if (rawValue.startsWith("R") || rawValue.startsWith("r")) {
      raw = true;
      rawValue = rawValue.substring(1);
    }
    if (rawValue.startsWith("'''") || rawValue.startsWith('"""')) {
      rawValue = rawValue.substring(3, rawValue.length - 3);
    } else if (rawValue.startsWith("'") || rawValue.startsWith('"')) {
      rawValue = rawValue.substring(1, rawValue.length - 1);
    }
    return this.builder.newBytesExpr(ctx.start.startIndex, rawValue, raw);
  }

  visitConditionalOr(ctx: ConditionalOrContext): Expr {
    return this.newInfixExpr(ctx);
  }

  visitConditionalAnd(ctx: ConditionalAndContext) {
    return this.newInfixExpr(ctx);
  }

  visitRelation(ctx: RelationContext): Expr {
    return this.newInfixExpr(ctx);
  }

  visitCalc(ctx: CalcContext): Expr {
    return this.newInfixExpr(ctx);
  }

  visitNull(ctx: NullContext): Expr {
    return this.builder.newConstExpr(ctx.start.startIndex, {
      case: "nullValue",
      value: 0,
    });
  }
  visitInt(ctx: IntContext): Expr {
    let txt = ctx.text;
    let minus = false;
    if (txt.startsWith("-")) {
      minus = true;
      txt = txt.substring(1);
    }
    return this.builder.newConstExpr(ctx.start.startIndex, {
      case: "int64Value",
      value: minus ? -BigInt(txt) : BigInt(txt),
    });
  }

  visitUint(ctx: UintContext): Expr {
    return this.builder.newConstExpr(ctx.start.startIndex, {
      case: "uint64Value",
      value: BigInt(ctx.text.substring(0, ctx.text.length - 1)),
    });
  }

  visitDouble(ctx: DoubleContext): Expr {
    return this.builder.newConstExpr(ctx.start.startIndex, {
      case: "doubleValue",
      value: parseFloat(ctx.text),
    });
  }

  visitBoolFalse(ctx: BoolFalseContext): Expr {
    return this.builder.newConstExpr(ctx.start.startIndex, {
      case: "boolValue",
      value: false,
    });
  }

  visitBoolTrue(ctx: BoolTrueContext): Expr {
    return this.builder.newConstExpr(ctx.start.startIndex, {
      case: "boolValue",
      value: true,
    });
  }

  visitLogicalNot(ctx: LogicalNotContext): Expr {
    const arg = ctx.getChild(ctx.childCount - 1).accept(this);
    if (ctx._ops.length % 2 === 0) {
      return arg;
    }
    return this.builder.newCallExpr(ctx.start.startIndex, "!_", [arg]);
  }

  visitNegate(ctx: NegateContext): Expr {
    const arg = ctx.getChild(ctx.childCount - 1).accept(this);
    if (ctx._ops.length % 2 === 0) {
      return arg;
    }
    return this.builder.newCallExpr(ctx.start.startIndex, "-_", [arg]);
  }

  visitIdentOrGlobalCall(ctx: IdentOrGlobalCallContext): Expr {
    let name = ctx.IDENTIFIER().text;
    if (ctx.DOT()) {
      name = "." + name;
    }
    if (ctx.LPAREN()) {
      if (ctx._args.childCount === 1 && name === "has") {
        return this.builder.expandHasMacro(
          ctx.start.startIndex,
          ctx._args.getChild(0).accept(this),
        );
      }
      return this.builder.newCallExpr(
        ctx.start.startIndex,
        name,
        this.newArgs(ctx._args),
      );
    }

    // Ident
    return this.builder.newIdentExpr(ctx.start.startIndex, name);
  }

  visitSelect(ctx: SelectContext): Expr {
    return this.builder.newSelectExpr(
      ctx.getChild(1).accept(POS_VISITOR),
      ctx.getChild(0).accept(this),
      ctx.getChild(2).text,
    );
  }

  visitIndex(ctx: IndexContext): Expr {
    return this.builder.newIndexExpr(
      ctx.start.startIndex,
      ctx.getChild(0).accept(this),
      ctx._index.accept(this),
    );
  }

  visitMemberCall(ctx: MemberCallContext): Expr {
    return this.builder.newMemberCallExpr(
      ctx.getChild(1).accept(POS_VISITOR),
      ctx.getChild(0).accept(this),
      ctx._id.text ?? "?",
      this.newArgs(ctx._args),
    );
  }

  visitCreateList(ctx: CreateListContext): Expr {
    return this.builder.newListExpr(
      ctx.start.startIndex,
      this.newArgs(ctx._elems),
    );
  }

  visitCreateStruct(ctx: CreateStructContext): Expr {
    const expr = this.nextExpr(ctx);
    const entries: Expr_CreateStruct_Entry[] = [];
    if (ctx._entries) {
      for (let i = 0; i < ctx._entries._keys.length; i++) {
        entries.push(
          this.builder.newMapEntry(
            ctx._entries._keys[i].start.startIndex,
            ctx._entries._keys[i].accept(this),
            ctx._entries._values[i].accept(this),
          ),
        );
      }
    }
    expr.exprKind = {
      case: "structExpr",
      value: new Expr_CreateStruct({
        entries: entries,
      }),
    };
    return expr;
  }

  visitCreateMessage(ctx: CreateMessageContext): Expr {
    let messageName = ctx._ids[0].text ?? "";
    for (let i = 1; i < ctx._ids.length; i++) {
      messageName += ".";
      messageName += ctx._ids[i].text;
    }
    const entries: Expr_CreateStruct_Entry[] = [];
    if (ctx._entries) {
      for (let i = 0; i < ctx._entries._fields.length; i++) {
        const field = ctx._entries._fields[i];
        const value = ctx._entries._values[i];
        entries.push(
          this.builder.newStructEntry(
            field.start.startIndex,
            field.text,
            value.accept(this),
          ),
        );
      }
    }
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "structExpr",
      value: new Expr_CreateStruct({
        messageName: messageName,
        entries: entries,
      }),
    };
    return expr;
  }

  private newArgs(ctx?: ParserRuleContext): Expr[] {
    const args: Expr[] = [];
    if (ctx) {
      for (let i = 0; i < ctx.childCount; i += 2) {
        args.push(ctx.getChild(i).accept(this));
      }
    }
    return args;
  }

  private newInfixExpr(ctx: ParserRuleContext): Expr {
    if (ctx.childCount === 1) {
      return ctx.getChild(0).accept(this);
    }
    const args: Expr[] = [];
    for (let i = 0; i < ctx.childCount; i += 2) {
      args.push(ctx.getChild(i).accept(this));
    }
    const op = ctx.getChild(1);
    const loc = op.accept(POS_VISITOR);
    return this.builder.newInfixExpr(loc, op.text, args);
  }
}

// A function that parses the given input
export function parseExpr(input: string): ParsedExpr {
  const chars = CharStreams.fromString(input);
  const lexer = new CELLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new CELParser(tokens);

  const tree = parser.expr();

  // Visit the tree
  const visitor = new ExprVisitor();
  const result = new ParsedExpr();
  result.expr = tree.accept(visitor);
  result.sourceInfo = visitor.getSourceInfo();

  // find all the new line offsets
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "\n") {
      result.sourceInfo.lineOffsets.push(i);
    }
  }

  return result;
}

export class Antrl4Parser implements CelParser {
  parse(expr: string): ParsedExpr {
    return parseExpr(expr);
  }
}
