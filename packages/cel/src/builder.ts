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
  Expr_CreateStruct_Entry,
  SourceInfo,
} from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";

const encoder = new TextEncoder();

export type Eventual<T> = () => T;

export default class Builder {
  #prevId = 0n;

  sourceInfo: SourceInfo = {
    $typeName: "cel.expr.SourceInfo",
    syntaxVersion: "",
    location: "",
    lineOffsets: [],
    positions: {},
    macroCalls: {},
    extensions: [],
  };

  nextExpr(offset: number, exprKind: Expr["exprKind"]): Expr {
    this.sourceInfo.positions[(++this.#prevId).toString()] = offset;

    return {
      $typeName: "cel.expr.Expr",
      id: this.#prevId,
      exprKind,
    };
  }

  nextEntry(
    offset: number,
    keyKind: Expr_CreateStruct_Entry["keyKind"],
    value: Expr,
  ): Expr_CreateStruct_Entry {
    this.sourceInfo.positions[(++this.#prevId).toString()] = offset;

    return {
      $typeName: "cel.expr.Expr.CreateStruct.Entry",
      id: this.#prevId,
      keyKind,
      value,
      optionalEntry: false,
    };
  }

  newConstExpr(offset: number, constantKind: Constant["constantKind"]): Expr {
    return this.nextExpr(offset, {
      case: "constExpr",
      value: { $typeName: "cel.expr.Constant", constantKind },
    });
  }

  newCallExpr(offset: number, functionName: string, args: Expr[]): Expr {
    if (
      functionName === "has" &&
      args.length === 1 &&
      args[0].exprKind?.case === "selectExpr"
    ) {
      return this.expandHasMacro(offset, args[0]);
    } else {
      return this.nextExpr(offset, {
        case: "callExpr",
        value: {
          $typeName: "cel.expr.Expr.Call",
          function: functionName,
          args,
        },
      });
    }
  }

  newMemberCallExpr(
    offset: number,
    target: Expr,
    functionName: string,
    args: Expr[],
  ): Expr {
    return this.maybeExpand(
      offset,
      this.nextExpr(offset, {
        case: "callExpr",
        value: {
          $typeName: "cel.expr.Expr.Call",
          function: functionName,
          target,
          args,
        },
      }),
    );
  }

  newStringExpr(offset: number, sequence: (string | number[])[]): Expr {
    return this.newConstExpr(offset, {
      case: "stringValue",
      value: sequence.reduce<string>(
        (string: string, chunk: string | number[]) => {
          if (typeof chunk !== "string") {
            if (chunk.some((cp) => cp >= 0xd800 && cp < 0xe000)) {
              // surrogates, whether paired or not, are not allowed in UTF-8
              throw new Error("surrogate code points are not allowed");
            }

            return string + String.fromCodePoint(...chunk);
          }

          return string + chunk;
        },
        "",
      ),
    });
  }

  newBytesExpr(offset: number, sequence: (string | number[])[]): Expr {
    return this.newConstExpr(offset, {
      case: "bytesValue",
      value: new Uint8Array(
        sequence.reduce<number[]>(
          (bytes: number[], chunk: string | number[]) => {
            if (typeof chunk === "string") {
              return [...bytes, ...encoder.encode(chunk)];
            }

            return [...bytes, ...chunk];
          },
          [],
        ),
      ),
    });
  }

  newBoolExpr(offset: number, keyword: "true" | "false"): Expr {
    return this.newConstExpr(offset, {
      case: "boolValue",
      value: keyword === "true",
    });
  }

  newInt64Expr(offset: number, digits: string) {
    return this.newConstExpr(offset, {
      case: "int64Value",
      value: digits[0] === "-" ? -BigInt(digits.slice(1)) : BigInt(digits),
    });
  }

  newUnsignedInt64Expr(offset: number, digits: string) {
    return this.newConstExpr(offset, {
      case: "uint64Value",
      value: BigInt(digits),
    });
  }

  newDoubleExpr(offset: number, digits: string) {
    return this.newConstExpr(offset, {
      case: "doubleValue",
      value: parseFloat(digits),
    });
  }

  newNullExpr(offset: number) {
    return this.newConstExpr(offset, {
      case: "nullValue",
      value: 0,
    });
  }

  newIdentExpr(offset: number, name: string): Expr {
    const expr = this.nextExpr(offset, {
      case: "identExpr",
      value: { $typeName: "cel.expr.Expr.Ident", name },
    });
    return expr;
  }

  newInfixExpr(offset: number, op: string, args: Expr[]): Expr {
    return this.newCallExpr(offset, op === "in" ? "@in" : `_${op}_`, args);
  }

  newSelectExpr(offset: number, operand: Expr, field: string): Expr {
    return this.nextExpr(offset, {
      case: "selectExpr",
      value: {
        $typeName: "cel.expr.Expr.Select",
        operand,
        field,
        testOnly: false,
      },
    });
  }

  newIndexExpr(offset: number, operand: Expr, index: Expr): Expr {
    return this.newCallExpr(offset, "_[_]", [operand, index]);
  }

  expandHasMacro(offset: number, target: Expr): Expr {
    if (target.exprKind.case !== "selectExpr") {
      return this.newCallExpr(offset, "has", [target]);
    }

    target.exprKind.value.testOnly = true;
    return target;
  }

  newListExpr(offset: number, elements: Expr[]): Expr {
    return this.nextExpr(offset, {
      case: "listExpr",
      value: {
        $typeName: "cel.expr.Expr.CreateList",
        elements,
        optionalIndices: [],
      },
    });
  }

  newBoolMacro(
    offset: number,
    iterRange: Expr,
    iterVar: string,
    init: boolean,
    loopStep: Expr,
    loopCondition: Expr,
  ) {
    return this.nextExpr(offset, {
      case: "comprehensionExpr",
      value: {
        $typeName: "cel.expr.Expr.Comprehension",
        accuVar: "__result__",
        accuInit: this.newConstExpr(offset, {
          case: "boolValue",
          value: init,
        }),
        iterVar,
        iterVar2: "", // not yet supported
        iterRange,
        loopStep,
        loopCondition,
        result: this.newIdentExpr(offset, "__result__"),
      },
    });
  }

  newListMacro(
    offset: number,
    iterRange: Expr,
    iterVar: string,
    loopStep: Expr,
  ): Expr {
    return this.nextExpr(offset, {
      case: "comprehensionExpr",
      value: {
        $typeName: "cel.expr.Expr.Comprehension",
        accuVar: "__result__",
        accuInit: this.newListExpr(offset, []),
        iterVar,
        iterVar2: "", // not yet supported
        iterRange,
        loopCondition: this.newConstExpr(offset, {
          case: "boolValue",
          value: true,
        }),
        loopStep,
        result: this.newIdentExpr(offset, "__result__"),
      },
    });
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

  expandMapFilterMacro(
    offset: number,
    target: Expr,
    x: string,
    test: Expr,
    step: Expr,
  ): Expr {
    return this.newListMacro(
      offset,
      target,
      x,
      this.newCallExpr(offset, "_?_:_", [
        test,
        this.newCallExpr(offset, "_+_", [
          this.newIdentExpr(offset, "__result__"),
          this.newListExpr(offset, [step]),
        ]),
        this.newIdentExpr(offset, "__result__"),
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

  expandExistsOne(
    offset: number,
    iterRange: Expr,
    iterVar: string,
    step: Expr,
  ): Expr {
    return this.nextExpr(offset, {
      case: "comprehensionExpr",
      value: {
        $typeName: "cel.expr.Expr.Comprehension",
        accuVar: "__result__",
        accuInit: this.newConstExpr(offset, {
          case: "int64Value",
          value: BigInt(0),
        }),
        iterVar,
        iterVar2: "", // not yet supported
        iterRange,
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
      },
    });
  }

  maybeExpand(offset: number, call: Expr): Expr {
    if (call.exprKind.case === "callExpr") {
      const callExpr = call.exprKind.value;
      const varName = callExpr.args[0];
      // const varIndex = callExpr.args.length > 1 ? callExpr.args[1] : "";
      if (
        varName !== undefined &&
        call.exprKind.value.target !== undefined &&
        varName.exprKind?.case === "identExpr"
      ) {
        if (callExpr.args.length === 2) {
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
            case "existsOne":
              return this.expandExistsOne(
                offset,
                call.exprKind.value.target,
                varName.exprKind.value.name,
                call.exprKind.value.args[1],
              );
          }
        } else if (callExpr.args.length === 3 && callExpr.function == "map") {
          return this.expandMapFilterMacro(
            offset,
            call.exprKind.value.target,
            varName.exprKind.value.name,
            call.exprKind.value.args[1],
            call.exprKind.value.args[2],
          );
        }
      }
    }
    return call;
  }

  newMapEntry(offset: number, key: Expr, value: Expr): Expr_CreateStruct_Entry {
    return this.nextEntry(
      offset,
      {
        case: "mapKey",
        value: key,
      },
      value,
    );
  }

  newStructExpr(
    offset: number,
    entries: Expr_CreateStruct_Entry[],
    messageName: string = "",
  ): Expr {
    return this.nextExpr(offset, {
      case: "structExpr",
      value: {
        $typeName: "cel.expr.Expr.CreateStruct",
        entries,
        messageName,
      },
    });
  }

  newStructEntry(
    offset: number,
    field: string,
    value: Expr,
  ): Expr_CreateStruct_Entry {
    return this.nextEntry(
      offset,
      {
        case: "fieldKey",
        value: field,
      },
      value,
    );
  }
}
