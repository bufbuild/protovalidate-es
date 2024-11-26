import {
  Expr,
  Expr_Call,
  Constant,
  Expr_Comprehension,
  Expr_CreateList,
  Expr_CreateStruct_Entry,
  Expr_Ident,
  Expr_Select,
  SourceInfo,
} from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";

export class ExprBuilder {
  private prevId = 0n;
  public sourceInfo: SourceInfo = new SourceInfo();

  public nextExpr(offset: number): Expr {
    const expr = new Expr();
    expr.id = ++this.prevId;
    this.sourceInfo.positions[expr.id.toString()] = offset;
    return expr;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- proto type system too complex
  public newConstExpr(offset: number, constantKind: any): Expr {
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "constExpr",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value: new Constant({ constantKind: constantKind }),
    };
    return expr;
  }

  public newCallExpr(offset: number, functionName: string, args: Expr[]): Expr {
    if (
      functionName === "has" &&
      args.length === 1 &&
      args[0].exprKind?.case === "selectExpr"
    ) {
      return this.expandHasMacro(offset, args[0]);
    }
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "callExpr",
      value: new Expr_Call({
        function: functionName,
        args: args,
      }),
    };
    return expr;
  }

  public newMemberCallExpr(
    offset: number,
    target: Expr,
    functionName: string,
    args: Expr[],
  ): Expr {
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "callExpr",
      value: new Expr_Call({
        function: functionName,
        target: target,
        args: args,
      }),
    };
    return this.maybeExpand(offset, expr);
  }

  public newStringExpr(offset: number, rawValue: string, raw: boolean): Expr {
    if (raw) {
      return this.newConstExpr(offset, {
        case: "stringValue",
        value: rawValue,
      });
    }

    let value = "";
    let i = 0;
    while (i < rawValue.length) {
      let c = rawValue[i];
      if (c === "\\") {
        i++;
        c = rawValue[i];
        if (c === "x" || c === "X") {
          i++;
          const hex = rawValue.substring(i, i + 2);
          value += String.fromCodePoint(parseInt(hex, 16));
          i += 2;
        } else if (c === "u") {
          i++;
          const hex = rawValue.substring(i, i + 4);
          value += String.fromCodePoint(parseInt(hex, 16));
          i += 4;
        } else if (c === "U") {
          i++;
          value += String.fromCodePoint(
            parseInt(rawValue.substring(i, i + 8), 16),
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
            const oct = rawValue.substring(i, i + 3);
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

    return this.newConstExpr(offset, {
      case: "stringValue",
      value: value,
    });
  }

  public newBytesExpr(offset: number, rawValue: string, raw: boolean): Expr {
    if (rawValue.length === 0) {
      return this.newConstExpr(offset, {
        case: "bytesValue",
        value: Buffer.of(),
      });
    }
    const raw_bytes = new TextEncoder().encode(rawValue);
    if (raw) {
      return this.newConstExpr(offset, {
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
    return this.newConstExpr(offset, {
      case: "bytesValue",
      value: buffer.subarray(0, j),
    });
  }

  public newIdentExpr(offset: number, name: string): Expr {
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "identExpr",
      value: new Expr_Ident({ name: name }),
    };
    return expr;
  }

  public newInfixExpr(offset: number, op: string, args: Expr[]): Expr {
    if (op === "in") {
      op = "@in";
    } else {
      op = "_" + op + "_";
    }
    return this.newCallExpr(offset, op, args);
  }

  public newSelectExpr(offset: number, operand: Expr, field: string): Expr {
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "selectExpr",
      value: new Expr_Select({
        operand: operand,
        field: field,
      }),
    };
    return expr;
  }

  public newIndexExpr(offset: number, operand: Expr, index: Expr): Expr {
    return this.newCallExpr(offset, "_[_]", [operand, index]);
  }

  public expandHasMacro(offset: number, target: Expr): Expr {
    if (target.exprKind.case !== "selectExpr") {
      return this.newCallExpr(offset, "has", [target]);
    }

    target.exprKind.value.testOnly = true;
    return target;
  }

  public newListExpr(offset: number, elements: Expr[]): Expr {
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "listExpr",
      value: new Expr_CreateList({
        elements: elements,
      }),
    };
    return expr;
  }

  newBoolMacro(
    offset: number,
    target: Expr,
    x: string,
    init: boolean,
    step: Expr,
    cond: Expr,
  ) {
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "comprehensionExpr",
      value: new Expr_Comprehension({
        accuVar: "__result__",
        accuInit: this.newConstExpr(offset, {
          case: "boolValue",
          value: init,
        }),
        iterVar: x,
        iterRange: target,
        loopStep: step,
        loopCondition: cond,
        result: this.newIdentExpr(offset, "__result__"),
      }),
    };
    return expr;
  }

  newListMacro(offset: number, target: Expr, x: string, step: Expr): Expr {
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "comprehensionExpr",
      value: new Expr_Comprehension({
        accuVar: "__result__",
        accuInit: this.newListExpr(offset, []),
        iterVar: x,
        iterRange: target,
        loopCondition: this.newConstExpr(offset, {
          case: "boolValue",
          value: true,
        }),
        loopStep: step,
        result: this.newIdentExpr(offset, "__result__"),
      }),
    };
    return expr;
  }

  expandExistsMacro(offset: number, target: Expr, x: string, test: Expr): Expr {
    return this.newBoolMacro(
      offset,
      target,
      x,
      false,
      this.newCallExpr(offset, "_||_", [
        this.newIdentExpr(offset, "__result__"),
        test,
      ]),
      this.newCallExpr(offset, "@not_strictly_false", [
        this.newCallExpr(offset, "!_", [
          this.newIdentExpr(offset, "__result__"),
        ]),
      ]),
    );
  }

  expandAllMacro(offset: number, target: Expr, x: string, test: Expr): Expr {
    return this.newBoolMacro(
      offset,
      target,
      x,
      true,
      this.newCallExpr(offset, "_&&_", [
        this.newIdentExpr(offset, "__result__"),
        test,
      ]),
      this.newCallExpr(offset, "@not_strictly_false", [
        this.newIdentExpr(offset, "__result__"),
      ]),
    );
  }

  expandMapMacro(offset: number, target: Expr, x: string, step: Expr): Expr {
    return this.newListMacro(
      offset,
      target,
      x,
      this.newCallExpr(offset, "_+_", [
        this.newIdentExpr(offset, "__result__"),
        this.newListExpr(offset, [step]),
      ]),
    );
  }

  expandFilterMacro(offset: number, target: Expr, x: string, step: Expr): Expr {
    return this.newListMacro(
      offset,
      target,
      x,
      this.newCallExpr(offset, "_?_:_", [
        step,
        this.newCallExpr(offset, "_+_", [
          this.newIdentExpr(offset, "__result__"),
          this.newListExpr(offset, [this.newIdentExpr(offset, x)]),
        ]),
        this.newIdentExpr(offset, "__result__"),
      ]),
    );
  }

  expandExistsOne(offset: number, target: Expr, x: string, step: Expr): Expr {
    const expr = this.nextExpr(offset);
    expr.exprKind = {
      case: "comprehensionExpr",
      value: new Expr_Comprehension({
        accuVar: "__result__",
        accuInit: this.newConstExpr(offset, {
          case: "int64Value",
          value: BigInt(0),
        }),
        iterVar: x,
        iterRange: target,
        loopCondition: this.newConstExpr(offset, {
          case: "boolValue",
          value: true,
        }),
        loopStep: this.newCallExpr(offset, "_?_:_", [
          step,
          this.newCallExpr(offset, "_+_", [
            this.newIdentExpr(offset, "__result__"),
            this.newConstExpr(offset, {
              case: "int64Value",
              value: BigInt(1),
            }),
          ]),
          this.newIdentExpr(offset, "__result__"),
        ]),
        result: this.newCallExpr(offset, "_==_", [
          this.newIdentExpr(offset, "__result__"),
          this.newConstExpr(offset, {
            case: "int64Value",
            value: BigInt(1),
          }),
        ]),
      }),
    };
    return expr;
  }

  public maybeExpand(offset: number, call: Expr): Expr {
    if (call.exprKind.case === "callExpr") {
      const callExpr = call.exprKind.value;
      const varName = callExpr.args[0];
      if (
        call.exprKind.value.target !== undefined &&
        callExpr.args.length === 2 &&
        varName.exprKind.case === "identExpr"
      ) {
        switch (callExpr.function) {
          case "exists":
            return this.expandExistsMacro(
              offset,
              call.exprKind.value.target,
              varName.exprKind.value.name,
              call.exprKind.value.args[1],
            );
          case "all":
            return this.expandAllMacro(
              offset,
              call.exprKind.value.target,
              varName.exprKind.value.name,
              call.exprKind.value.args[1],
            );
          case "map":
            return this.expandMapMacro(
              offset,
              call.exprKind.value.target,
              varName.exprKind.value.name,
              call.exprKind.value.args[1],
            );
          case "filter":
            return this.expandFilterMacro(
              offset,
              call.exprKind.value.target,
              varName.exprKind.value.name,
              call.exprKind.value.args[1],
            );
          case "exists_one":
            return this.expandExistsOne(
              offset,
              call.exprKind.value.target,
              varName.exprKind.value.name,
              call.exprKind.value.args[1],
            );
        }
      }
    }
    return call;
  }

  public newMapEntry(
    offset: number,
    key: Expr,
    value: Expr,
  ): Expr_CreateStruct_Entry {
    const id = ++this.prevId;
    this.sourceInfo.positions[id.toString()] = offset;
    return new Expr_CreateStruct_Entry({
      id: id,
      keyKind: {
        case: "mapKey",
        value: key,
      },
      value: value,
    });
  }

  public newStructEntry(
    offset: number,
    field: string,
    value: Expr,
  ): Expr_CreateStruct_Entry {
    const id = ++this.prevId;
    this.sourceInfo.positions[id.toString()] = offset;
    return new Expr_CreateStruct_Entry({
      id: id,
      keyKind: {
        case: "fieldKey",
        value: field,
      },
      value: value,
    });
  }
}
