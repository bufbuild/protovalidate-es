import { createRegistry, type IMessageTypeRegistry } from "@bufbuild/protobuf";
import { type IEnumTypeRegistry } from "@bufbuild/protobuf/dist/types/type-registry";

import { ObjectActivation } from "./activation";
import { CEL_ADAPTER } from "./adapter/cel";
import { NATIVE_ADAPTER } from "./adapter/native";
import { isProtoMsg, ProtoValAdapter, ProtoValProvider } from "./adapter/proto";
import { type Dispatcher, OrderedDispatcher } from "./func";
import { checked_pb, syntax_pb } from "@bufbuild/cel-es-proto";
import { type Interpretable, Planner } from "./planner";
import { STD_FUNCS } from "./std/std";
import { CelError, CelUnknown } from "./value/error";
import { type CelResult, isCelVal } from "./value/value";

export interface CelParser {
  parse(text: string): syntax_pb.ParsedExpr;
}

export class CelEnv {
  private readonly data: Record<string, CelResult> = {};
  private readonly ctx = new ObjectActivation(this.data, CEL_ADAPTER);
  private protoProvider: ProtoValProvider;
  private dispatcher: OrderedDispatcher;
  private planner: Planner;

  public constructor(
    private parser: CelParser,
    registry: IMessageTypeRegistry & IEnumTypeRegistry = createRegistry()
  ) {
    this.protoProvider = new ProtoValProvider(new ProtoValAdapter(registry));
    this.dispatcher = new OrderedDispatcher([STD_FUNCS]);
    this.planner = new Planner(this.dispatcher, this.protoProvider);
  }

  public setProtoRegistry(
    registry: IMessageTypeRegistry & IEnumTypeRegistry
  ): void {
    this.protoProvider.adapter = new ProtoValAdapter(registry);
  }

  public addFuncs(funcs: Dispatcher): void {
    this.dispatcher.add(funcs);
  }

  public set(name: string, value: unknown): void {
    if (
      isCelVal(value) ||
      value instanceof CelError ||
      value instanceof CelUnknown
    ) {
      this.data[name] = value;
    } else if (isProtoMsg(value)) {
      this.data[name] = this.protoProvider.adapter.toCel(value);
    } else {
      this.data[name] = NATIVE_ADAPTER.toCel(value);
    }
  }

  public parse(expr: string): syntax_pb.ParsedExpr {
    return this.parser.parse(expr);
  }

  public plan(
    expr:
      | syntax_pb.Expr
      | syntax_pb.ParsedExpr
      | checked_pb.CheckedExpr
      | undefined
  ): Interpretable {
    let maybeExpr: syntax_pb.Expr | undefined = undefined;
    if (expr instanceof checked_pb.CheckedExpr) {
      maybeExpr = expr.expr;
    } else if (expr instanceof syntax_pb.ParsedExpr) {
      maybeExpr = expr.expr;
    } else {
      maybeExpr = expr;
    }
    return this.planner.plan(maybeExpr ?? new syntax_pb.Expr());
  }

  public eval(expr: Interpretable): CelResult {
    return expr.eval(this.ctx);
  }

  /** Parses, plans, evals, and converts the given expr into a native value. */
  public run(expr: string): CelResult<unknown> {
    const result = this.eval(this.plan(this.parse(expr)));
    if (result instanceof CelError || result instanceof CelUnknown) {
      return result;
    }
    return NATIVE_ADAPTER.fromCel(result);
  }
}
