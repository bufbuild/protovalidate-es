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

import {
  createRegistry,
  type Registry,
  isMessage,
  create,
} from "@bufbuild/protobuf";
import {
  ExprSchema,
  ParsedExprSchema,
} from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";
import type { ParsedExpr } from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";
import type { Expr } from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";
import { CheckedExprSchema } from "@bufbuild/cel-spec/cel/expr/checked_pb.js";
import type { CheckedExpr } from "@bufbuild/cel-spec/cel/expr/checked_pb.js";
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
    registry: Registry = createRegistry(),
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
    if (isMessage(expr, CheckedExprSchema)) {
      maybeExpr = expr.expr;
    } else if (isMessage(expr, ParsedExprSchema)) {
      maybeExpr = expr.expr;
    } else {
      maybeExpr = expr;
    }
    return this.planner.plan(maybeExpr ?? create(ExprSchema));
  }

  public addFuncs(funcs: Dispatcher): void {
    this.dispatcher.add(funcs);
  }

  public setProtoRegistry(registry: Registry): void {
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
    registry: Registry = createRegistry(),
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

  /**
   * Define a variable.
   *
   * Passing `undefined` as a value removes any previous definition.
   */
  public set(name: string, value: unknown): void {
    if (value === undefined) {
      delete this.data[name];
    } else if (
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

  public setProtoRegistry(registry: Registry): void {
    this.planner.setProtoRegistry(registry);
  }

  public addFuncs(funcs: Dispatcher): void {
    this.planner.addFuncs(funcs);
  }
}
