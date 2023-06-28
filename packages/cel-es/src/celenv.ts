import { createRegistry, type IMessageTypeRegistry } from "@bufbuild/protobuf";

import {
  Expr,
  ParsedExpr,
} from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/syntax_pb";
import { CheckedExpr } from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/checked_pb";
import { ObjectActivation } from "./activation";
import { CEL_ADAPTER } from "./adapter/cel";
import { NATIVE_ADAPTER } from "./adapter/native";
import { isProtoMsg, ProtoValAdapter, ProtoValProvider } from "./adapter/proto";
import { OrderedDispatcher, type Dispatcher } from "./func";
import { Planner, type Interpretable } from "./planner";
import { STD_FUNCS } from "./std/std";
import { CelError, CelUnknown, isCelVal, type CelResult } from "./value/value";
import { Namespace } from "./value/namespace";

export interface CelParser {
  parse(text: string): ParsedExpr;
}

export class CelEnv {
  public readonly data: Record<string, CelResult> = {};
  private readonly ctx = new ObjectActivation(this.data, CEL_ADAPTER);
  private protoProvider: ProtoValProvider;
  private dispatcher: OrderedDispatcher;
  private planner: Planner;
  private parser: CelParser | undefined;

  public constructor(
    namespace: string | undefined = undefined,
    parser: CelParser | undefined = undefined,
    registry: IMessageTypeRegistry = createRegistry()
  ) {
    this.protoProvider = new ProtoValProvider(new ProtoValAdapter(registry));
    this.dispatcher = new OrderedDispatcher([STD_FUNCS]);
    this.planner = new Planner(
      this.dispatcher,
      this.protoProvider,
      namespace === undefined ? undefined : new Namespace(namespace)
    );
    this.parser = parser;
  }

  public setParser(parser: CelParser): void {
    this.parser = parser;
  }
  public setProtoRegistry(registry: IMessageTypeRegistry): void {
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

  public parse(expr: string): ParsedExpr {
    if (this.parser === undefined) {
      throw new Error("parser not set");
    }
    return this.parser.parse(expr);
  }

  public plan(
    expr: Expr | ParsedExpr | CheckedExpr | undefined
  ): Interpretable {
    let maybeExpr: Expr | undefined = undefined;
    if (expr instanceof CheckedExpr) {
      maybeExpr = expr.expr;
    } else if (expr instanceof ParsedExpr) {
      maybeExpr = expr.expr;
    } else {
      maybeExpr = expr;
    }
    return this.planner.plan(maybeExpr ?? new Expr());
  }

  public eval(expr: Interpretable): CelResult {
    return expr.eval(this.ctx);
  }

  /** Parses, plans, and evals the given expr. */
  public run(expr: string): CelResult {
    return this.eval(this.plan(this.parse(expr)));
  }
}
