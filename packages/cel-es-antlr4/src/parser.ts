import { type CelParser } from "@bufbuild/cel-es";

import { CharStreams, CommonTokenStream, ParserRuleContext } from "antlr4ts";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";

import {
  Constant,
  Expr,
  Expr_Call,
  Expr_Comprehension,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_CreateStruct_Entry,
  Expr_Ident,
  Expr_Select,
  ParsedExpr,
  SourceInfo,
} from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/syntax_pb";
import { CELLexer } from "./gen/CELLexer";
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
} from "./gen/CELParser";
import { CELVisitor } from "./gen/CELVisitor";

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
  private prevId = 0n;
  public sourceInfo: SourceInfo = new SourceInfo();

  private nextExpr(pos: ParserRuleContext | number): Expr {
    const expr = new Expr();
    expr.id = ++this.prevId;
    this.sourceInfo.positions[expr.id.toString()] =
      pos instanceof ParserRuleContext ? pos.start.startIndex : pos;
    return expr;
  }

  defaultResult() {
    return new Expr();
  }

  visitExpr(ctx: ExprContext): Expr {
    if (ctx._e1 === undefined || ctx._e2 === undefined) {
      return ctx._e.accept(this);
    }
    return this.newCallExpr(ctx, "_?_:_", [
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
    let raw_value = ctx.text;
    let raw = false;
    if (raw_value.startsWith("R") || raw_value.startsWith("r")) {
      raw = true;
      raw_value = raw_value.substring(1);
    }
    if (raw_value.startsWith("'''") || raw_value.startsWith('"""')) {
      raw_value = raw_value.substring(3, raw_value.length - 3);
    } else if (raw_value.startsWith("'") || raw_value.startsWith('"')) {
      raw_value = raw_value.substring(1, raw_value.length - 1);
    }
    if (raw) {
      return this.newConstExpr(ctx, {
        case: "stringValue",
        value: raw_value,
      });
    }

    let value = "";
    let i = 0;
    while (i < raw_value.length) {
      let c = raw_value[i];
      if (c === "\\") {
        i++;
        c = raw_value[i];
        if (c === "x" || c === "X") {
          i++;
          const hex = raw_value.substring(i, i + 2);
          value += String.fromCodePoint(parseInt(hex, 16));
          i += 2;
        } else if (c === "u") {
          i++;
          const hex = raw_value.substring(i, i + 4);
          value += String.fromCodePoint(parseInt(hex, 16));
          i += 4;
        } else if (c === "U") {
          i++;
          value += String.fromCodePoint(
            parseInt(raw_value.substring(i, i + 8), 16)
          );
          i += 8;
        } else if (c === "a") {
          value += "\x07";
          i++;
        } else if (c === "b") {
          value += "\b";
          i++;
        } else if (c === "f") {
          value += "\f";
          i++;
        } else if (c === "n") {
          value += "\n";
          i++;
        } else if (c === "r") {
          value += "\r";
          i++;
        } else if (c === "t") {
          value += "\t";
          i++;
        } else if (c === "v") {
          value += "\v";
          i++;
        } else if (c === "\\") {
          value += "\\";
          i++;
        } else {
          // check if its a digit
          if (c >= "0" && c <= "7") {
            const oct = raw_value.substring(i, i + 3);
            value += String.fromCodePoint(parseInt(oct, 8));
            i += 3;
          } else {
            value += c;
            i++;
          }
        }
      } else {
        value += c;
        i++;
      }
    }

    return this.newConstExpr(ctx, {
      case: "stringValue",
      value: value,
    });
  }

  visitBytes(ctx: BytesContext): Expr {
    let raw_value = ctx.text.substring(1);
    let raw = false;
    if (raw_value.startsWith("R") || raw_value.startsWith("r")) {
      raw = true;
      raw_value = raw_value.substring(1);
    }
    if (raw_value.startsWith("'''") || raw_value.startsWith('"""')) {
      raw_value = raw_value.substring(3, raw_value.length - 3);
    } else if (raw_value.startsWith("'") || raw_value.startsWith('"')) {
      raw_value = raw_value.substring(1, raw_value.length - 1);
    }
    if (raw_value.length === 0) {
      return this.newConstExpr(ctx, {
        case: "bytesValue",
        value: Buffer.of(),
      });
    }
    const raw_bytes = new TextEncoder().encode(raw_value);
    if (raw) {
      return this.newConstExpr(ctx, {
        case: "bytesValue",
        value: raw_bytes,
      });
    }

    const buffer = Buffer.alloc(raw_bytes.length);
    const decoder = new TextDecoder();
    let i = 0;
    let j = 0;
    while (i < raw_bytes.length) {
      let c = raw_bytes[i];
      if (c === 92) {
        i++;
        c = raw_bytes[i];
        if (c === 120 || c === 88) {
          i++;
          const hex = raw_bytes.subarray(i, i + 2);
          buffer[j] = parseInt(decoder.decode(hex), 16);
          j++;
          i += 2;
        } else if (c === 117) {
          i++;
          const hex = raw_bytes.subarray(i, i + 4);
          buffer[j] = parseInt(decoder.decode(hex), 16);
          j++;
          i += 4;
        } else if (c === 85) {
          i++;
          const hex = raw_bytes.subarray(i, i + 8);
          buffer[j] = parseInt(decoder.decode(hex), 16);
          j++;
          i += 8;
        } else if (c === 97) {
          i++;
          buffer[j] = 0x07;
          j++;
        } else if (c === 98) {
          i++;
          buffer[j] = 0x08;
          j++;
        } else if (c === 102) {
          i++;
          buffer[j] = 0x0c;
          j++;
        } else if (c === 110) {
          i++;
          buffer[j] = 0x0a;
          j++;
        } else if (c === 114) {
          i++;
          buffer[j] = 0x0d;
          j++;
        } else if (c === 116) {
          i++;
          buffer[j] = 0x09;
          j++;
        } else if (c === 118) {
          i++;
          buffer[j] = 0x0b;
          j++;
        } else if (c === 92) {
          i++;
          buffer[j] = 0x5c;
          j++;
        } else {
          // check if its a digit
          if (c >= 48 && c <= 55) {
            const oct = raw_bytes.subarray(i, i + 3);
            buffer[j] = parseInt(decoder.decode(oct), 8);
            j++;
            i += 3;
          } else {
            buffer[j] = c;
            j++;
            i++;
          }
        }
      } else {
        buffer[j] = c;
        j++;
        i++;
      }
    }

    // Resize the result to the actual length.
    return this.newConstExpr(ctx, {
      case: "bytesValue",
      value: buffer.subarray(0, j),
    });
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
    return this.newConstExpr(ctx, {
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
    return this.newConstExpr(ctx, {
      case: "int64Value",
      value: minus ? -BigInt(txt) : BigInt(txt),
    });
  }

  visitUint(ctx: UintContext): Expr {
    return this.newConstExpr(ctx, {
      case: "uint64Value",
      value: BigInt(ctx.text.substring(0, ctx.text.length - 1)),
    });
  }

  visitDouble(ctx: DoubleContext): Expr {
    return this.newConstExpr(ctx, {
      case: "doubleValue",
      value: parseFloat(ctx.text),
    });
  }

  visitBoolFalse(ctx: BoolFalseContext): Expr {
    return this.newConstExpr(ctx, {
      case: "boolValue",
      value: false,
    });
  }

  visitBoolTrue(ctx: BoolTrueContext): Expr {
    return this.newConstExpr(ctx, {
      case: "boolValue",
      value: true,
    });
  }

  visitLogicalNot(ctx: LogicalNotContext): Expr {
    const arg = ctx.getChild(ctx.childCount - 1).accept(this);
    if (ctx._ops.length % 2 === 0) {
      return arg;
    }
    return this.newCallExpr(ctx, "!_", [arg]);
  }

  visitNegate(ctx: NegateContext): Expr {
    const arg = ctx.getChild(ctx.childCount - 1).accept(this);
    if (ctx._ops.length % 2 === 0) {
      return arg;
    }
    return this.newCallExpr(ctx, "-_", [arg]);
  }

  visitIdentOrGlobalCall(ctx: IdentOrGlobalCallContext): Expr {
    let name = ctx.IDENTIFIER().text;
    if (ctx.DOT()) {
      name = "." + name;
    }
    if (ctx.LPAREN()) {
      if (ctx._args.childCount === 1 && name === "has") {
        return this.expandHasMacro(ctx, ctx._args.getChild(0).accept(this));
      }
      return this.newCallExpr(ctx, name, this.newArgs(ctx._args));
    }

    // Ident
    return this.newIdentExpr(ctx, name);
  }

  visitSelect(ctx: SelectContext): Expr {
    const expr = this.nextExpr(ctx.getChild(1).accept(POS_VISITOR));
    expr.exprKind = {
      case: "selectExpr",
      value: new Expr_Select({
        operand: ctx.getChild(0).accept(this),
        field: ctx.getChild(2).text,
      }),
    };
    return expr;
  }

  visitIndex(ctx: IndexContext): Expr {
    return this.newCallExpr(ctx, "_[_]", [
      ctx.getChild(0).accept(this),
      ctx._index.accept(this),
    ]);
  }

  expandHasMacro(ctx: ParserRuleContext, target: Expr): Expr {
    if (target.exprKind.case !== "selectExpr") {
      return this.newCallExpr(ctx, "has", [target]);
    }

    target.exprKind.value.testOnly = true;
    return target;
  }

  expandExistsMacro(
    ctx: ParserRuleContext | number,
    target: Expr,
    x: string,
    test: Expr
  ): Expr {
    return this.newBoolMacro(
      ctx,
      target,
      x,
      false,
      this.newCallExpr(ctx, "_||_", [
        this.newIdentExpr(ctx, "__result__"),
        test,
      ]),
      this.newCallExpr(ctx, "@not_strictly_false", [
        this.newCallExpr(ctx, "!_", [this.newIdentExpr(ctx, "__result__")]),
      ])
    );
  }

  expandAllMacro(
    ctx: ParserRuleContext | number,
    target: Expr,
    x: string,
    test: Expr
  ): Expr {
    return this.newBoolMacro(
      ctx,
      target,
      x,
      true,
      this.newCallExpr(ctx, "_&&_", [
        this.newIdentExpr(ctx, "__result__"),
        test,
      ]),
      this.newCallExpr(ctx, "@not_strictly_false", [
        this.newIdentExpr(ctx, "__result__"),
      ])
    );
  }

  expandMapMacro(
    ctx: ParserRuleContext | number,
    target: Expr,
    x: string,
    step: Expr
  ): Expr {
    return this.newListMacro(
      ctx,
      target,
      x,
      this.newCallExpr(ctx, "_+_", [
        this.newIdentExpr(ctx, "__result__"),
        this.newListExpr(ctx, [step]),
      ])
    );
  }

  expandFilterMacro(
    ctx: ParserRuleContext | number,
    target: Expr,
    x: string,
    step: Expr
  ): Expr {
    return this.newListMacro(
      ctx,
      target,
      x,
      this.newCallExpr(ctx, "_?_:_", [
        step,
        this.newCallExpr(ctx, "_+_", [
          this.newIdentExpr(ctx, "__result__"),
          this.newListExpr(ctx, [this.newIdentExpr(ctx, x)]),
        ]),
        this.newIdentExpr(ctx, "__result__"),
      ])
    );
  }

  expandExistsOne(
    ctx: ParserRuleContext | number,
    target: Expr,
    x: string,
    step: Expr
  ): Expr {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "comprehensionExpr",
      value: new Expr_Comprehension({
        accuVar: "__result__",
        accuInit: this.newConstExpr(ctx, {
          case: "int64Value",
          value: BigInt(0),
        }),
        iterVar: x,
        iterRange: target,
        loopCondition: this.newConstExpr(ctx, {
          case: "boolValue",
          value: true,
        }),
        loopStep: this.newCallExpr(ctx, "_?_:_", [
          step,
          this.newCallExpr(ctx, "_+_", [
            this.newIdentExpr(ctx, "__result__"),
            this.newConstExpr(ctx, {
              case: "int64Value",
              value: BigInt(1),
            }),
          ]),
          this.newIdentExpr(ctx, "__result__"),
        ]),
        result: this.newCallExpr(ctx, "_==_", [
          this.newIdentExpr(ctx, "__result__"),
          this.newConstExpr(ctx, {
            case: "int64Value",
            value: BigInt(1),
          }),
        ]),
      }),
    };
    return expr;
  }

  visitMemberCall(ctx: MemberCallContext): Expr {
    // Check for macros.
    if (ctx._id.text === "exists" && ctx._args.childCount === 3) {
      return this.expandExistsMacro(
        ctx.getChild(1).accept(POS_VISITOR),
        ctx.getChild(0).accept(this),
        ctx._args.getChild(0).text,
        ctx._args.getChild(2).accept(this)
      );
    }
    if (ctx._id.text === "all" && ctx._args.childCount === 3) {
      return this.expandAllMacro(
        ctx.getChild(1).accept(POS_VISITOR),
        ctx.getChild(0).accept(this),
        ctx._args.getChild(0).text,
        ctx._args.getChild(2).accept(this)
      );
    }
    if (ctx._id.text === "map" && ctx._args.childCount === 3) {
      return this.expandMapMacro(
        ctx.getChild(1).accept(POS_VISITOR),
        ctx.getChild(0).accept(this),
        ctx._args.getChild(0).text,
        ctx._args.getChild(2).accept(this)
      );
    }
    if (ctx._id.text === "filter" && ctx._args.childCount === 3) {
      return this.expandFilterMacro(
        ctx.getChild(1).accept(POS_VISITOR),
        ctx.getChild(0).accept(this),
        ctx._args.getChild(0).text,
        ctx._args.getChild(2).accept(this)
      );
    }
    if (ctx._id.text === "exists_one" && ctx._args.childCount === 3) {
      return this.expandExistsOne(
        ctx.getChild(1).accept(POS_VISITOR),
        ctx.getChild(0).accept(this),
        ctx._args.getChild(0).text,
        ctx._args.getChild(2).accept(this)
      );
    }

    return this.newMemberCallExpr(
      ctx.getChild(1).accept(POS_VISITOR),
      ctx.getChild(0).accept(this),
      ctx._id.text ?? "?",
      this.newArgs(ctx._args)
    );
  }

  visitCreateList(ctx: CreateListContext): Expr {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "listExpr",
      value: new Expr_CreateList({
        elements: this.newArgs(ctx._elems),
      }),
    };
    return expr;
  }

  visitCreateStruct(ctx: CreateStructContext): Expr {
    const expr = this.nextExpr(ctx);
    const entries: Expr_CreateStruct_Entry[] = [];
    if (ctx._entries) {
      for (let i = 0; i < ctx._entries._keys.length; i++) {
        const key = ctx._entries._keys[i];
        const value = ctx._entries._values[i];
        entries.push(
          new Expr_CreateStruct_Entry({
            id: ++this.prevId,
            keyKind: {
              case: "mapKey",
              value: key.accept(this),
            },
            value: value?.accept(this),
          })
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
          new Expr_CreateStruct_Entry({
            id: ++this.prevId,
            keyKind: {
              case: "fieldKey",
              value: field.text,
            },
            value: value.accept(this),
          })
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- proto type system too complex
  private newConstExpr(
    ctx: ParserRuleContext | number,
    constantKind: any
  ): Expr {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "constExpr",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value: new Constant({ constantKind: constantKind }),
    };
    return expr;
  }

  newIdentExpr(ctx: ParserRuleContext | number, name: string): Expr {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "identExpr",
      value: new Expr_Ident({ name: name }),
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

  private newInfixExpr(ctx: ParserRuleContext, func = ""): Expr {
    if (ctx.childCount === 1) {
      return ctx.getChild(0).accept(this);
    }
    const args: Expr[] = [];
    for (let i = 0; i < ctx.childCount; i += 2) {
      args.push(ctx.getChild(i).accept(this));
    }
    const op = ctx.getChild(1);
    let name = func;
    if (name === "") {
      if (op.text === "in") {
        name = "@in";
      } else {
        name = "_" + op.text + "_";
      }
    }
    const loc = op.accept(POS_VISITOR);
    return this.newCallExpr(loc, name, args);
  }

  newCallExpr(
    ctx: ParserRuleContext | number,
    functionName: string,
    args: Expr[]
  ): Expr {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "callExpr",
      value: new Expr_Call({
        function: functionName,
        args: args,
      }),
    };
    return expr;
  }

  newMemberCallExpr(
    ctx: ParserRuleContext | number,
    target: Expr,
    functionName: string,
    args: Expr[]
  ): Expr {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "callExpr",
      value: new Expr_Call({
        function: functionName,
        target: target,
        args: args,
      }),
    };
    return expr;
  }

  newListExpr(ctx: ParserRuleContext | number, elements: Expr[]): Expr {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "listExpr",
      value: new Expr_CreateList({
        elements: elements,
      }),
    };
    return expr;
  }

  newBoolMacro(
    ctx: ParserRuleContext | number,
    target: Expr,
    x: string,
    init: boolean,
    step: Expr,
    cond: Expr
  ) {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "comprehensionExpr",
      value: new Expr_Comprehension({
        accuVar: "__result__",
        accuInit: this.newConstExpr(ctx, {
          case: "boolValue",
          value: init,
        }),
        iterVar: x,
        iterRange: target,
        loopStep: step,
        loopCondition: cond,
        result: this.newIdentExpr(ctx, "__result__"),
      }),
    };
    return expr;
  }

  newListMacro(
    ctx: ParserRuleContext | number,
    target: Expr,
    x: string,
    step: Expr
  ): Expr {
    const expr = this.nextExpr(ctx);
    expr.exprKind = {
      case: "comprehensionExpr",
      value: new Expr_Comprehension({
        accuVar: "__result__",
        accuInit: this.newListExpr(ctx, []),
        iterVar: x,
        iterRange: target,
        loopCondition: this.newConstExpr(ctx, {
          case: "boolValue",
          value: true,
        }),
        loopStep: step,
        result: this.newIdentExpr(ctx, "__result__"),
      }),
    };
    return expr;
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
  result.sourceInfo = visitor.sourceInfo;

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
