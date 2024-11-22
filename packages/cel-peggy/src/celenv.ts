import {
  createRegistry,
  type IMessageTypeRegistry,
  isMessage,
} from "@bufbuild/protobuf";

import { Expr, ParsedExpr } from "./pb/cel/expr/syntax_pb.js";
import { CheckedExpr } from "./pb/cel/expr/checked_pb.js";
import { ObjectActivation } from "./activation.js";
import { CEL_ADAPTER } from "./adapter/cel.js";
import { NATIVE_ADAPTER } from "./adapter/native.js";
import {
  isProtoMsg,
  ProtoValAdapter,
  ProtoValProvider,
} from "./adapter/proto.js";
import { OrderedDispatcher, type Dispatcher } from "./func.js";
import { Planner, type Interpretable } from "./planner.js";
import { STD_FUNCS } from "./std/std.js";
import {
  CelError,
  CelUnknown,
  isCelVal,
  type CelResult,
} from "./value/value.js";
import { Namespace } from "./value/namespace.js";

/**
 * A CEL parser interface
 *
 * CelParsers are responsible for parsing CEL expressions into a ParsedExpr
 * and are implemented differently depending on the environment.
 */
export interface CelParser {
  parse(text: string): ParsedExpr;
}

/**
 * A CEL planner
 *
 * CelPlanners are responsible for planning CEL expressions into an Interpretable
 */
export class CelPlanner {
  private protoProvider: ProtoValProvider;
  private dispatcher: OrderedDispatcher;
  private planner: Planner;

  public constructor(
    namespace: string | undefined = undefined,
    registry: IMessageTypeRegistry = createRegistry(),
  ) {
    this.protoProvider = new ProtoValProvider(new ProtoValAdapter(registry));
    this.dispatcher = new OrderedDispatcher([STD_FUNCS]);
    this.planner = new Planner(
      this.dispatcher,
      this.protoProvider,
      namespace === undefined ? undefined : new Namespace(namespace),
    );
  }

  public plan(
    expr: Expr | ParsedExpr | CheckedExpr | undefined,
  ): Interpretable {
    let maybeExpr: Expr | undefined = undefined;
    if (isMessage(expr, CheckedExpr)) {
      maybeExpr = expr.expr;
    } else if (isMessage(expr, ParsedExpr)) {
      maybeExpr = expr.expr;
    } else {
      maybeExpr = expr;
    }
    return this.planner.plan(maybeExpr ?? new Expr());
  }

  public addFuncs(funcs: Dispatcher): void {
    this.dispatcher.add(funcs);
  }

  public setProtoRegistry(registry: IMessageTypeRegistry): void {
    this.protoProvider.adapter = new ProtoValAdapter(registry);
  }

  getAdapter(): ProtoValAdapter {
    return this.protoProvider.adapter;
  }
}

/**
 * A CEL environment binds together a CEL parser, planner and memory.
 *
 * This environment stores data in a name -> CelResult Record.
 *
 * 'set' is provided as a helper function that supports CEL values, protobufr
 * messages and native values.
 */
export class CelEnv {
  public readonly data: Record<string, CelResult> = {};
  private readonly ctx = new ObjectActivation(this.data, CEL_ADAPTER);
  private planner: CelPlanner;
  private parser: CelParser | undefined;

  public constructor(
    namespace: string | undefined = undefined,
    registry: IMessageTypeRegistry = createRegistry(),
  ) {
    this.planner = new CelPlanner(namespace, registry);
  }

  public parse(expr: string): ParsedExpr {
    if (this.parser === undefined) {
      throw new Error("parser not set");
    }
    return this.parser.parse(expr);
  }

  public plan(
    expr: Expr | ParsedExpr | CheckedExpr | undefined,
  ): Interpretable {
    return this.planner.plan(expr);
  }

  public eval(expr: Interpretable): CelResult {
    return expr.eval(this.ctx);
  }

  /** Parses, plans, and evals the given expr. */
  public run(expr: string): CelResult {
    return this.eval(this.plan(this.parse(expr)));
  }

  public set(name: string, value: unknown): void {
    if (
      isCelVal(value) ||
      value instanceof CelError ||
      value instanceof CelUnknown
    ) {
      this.data[name] = value;
    } else if (isProtoMsg(value)) {
      this.data[name] = this.planner.getAdapter().toCel(value);
    } else {
      this.data[name] = NATIVE_ADAPTER.toCel(value);
    }
  }

  public setParser(parser: CelParser): void {
    this.parser = parser;
  }

  public setPlanner(planner: CelPlanner): void {
    this.planner = planner;
  }

  public setProtoRegistry(registry: IMessageTypeRegistry): void {
    this.planner.setProtoRegistry(registry);
  }

  public addFuncs(funcs: Dispatcher): void {
    this.planner.addFuncs(funcs);
  }
}
