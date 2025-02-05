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
  Expr_Call,
  Expr_Comprehension,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_Select,
} from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";
import { create } from "@bufbuild/protobuf";

import {
  AnySchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  Int64ValueSchema,
  StringValueSchema,
  UInt64ValueSchema,
} from "@bufbuild/protobuf/wkt";

import {
  ConcreteAttributeFactory,
  type Access,
  type Attribute,
  type AttributeFactory,
} from "./access.js";
import { VarActivation, type Activation } from "./activation.js";
import { CEL_ADAPTER } from "./adapter/cel.js";
import { type CallDispatch, type Dispatcher } from "./func.js";
import * as opc from "./gen/dev/cel/expr/operator_const.js";
import { RawVal, type RawResult } from "./value/adapter.js";
import { EMPTY_LIST, EMPTY_MAP, EMPTY_PROVIDER } from "./value/empty.js";
import { Namespace } from "./value/namespace.js";
import { type CelValProvider } from "./value/provider.js";
import * as type from "./value/type.js";
import {
  CelError,
  CelList,
  CelMap,
  CelObject,
  CelType,
  CelUint,
  CelUnknown,
  coerceToBigInt,
  coerceToBool,
  coerceToBytes,
  coerceToNumber,
  coerceToString,
  coerceToValues,
  type CelResult,
  type CelVal,
  type CelValAdapter,
  CelErrors,
} from "./value/value.js";

export class Planner {
  private readonly factory: AttributeFactory;
  constructor(
    private readonly functions: Dispatcher,
    private readonly provider: CelValProvider = EMPTY_PROVIDER,
    private readonly namespace: Namespace = Namespace.ROOT,
  ) {
    this.factory = new ConcreteAttributeFactory(this.provider, this.namespace);
  }

  public plan(expr: Expr): Interpretable {
    const id = Number(expr.id);
    switch (expr.exprKind.case) {
      case "identExpr":
        return new EvalAttr(
          this.factory.createMaybe(id, expr.exprKind.value.name),
          false,
        );
      case "constExpr":
        return new EvalConst(id, this.constVal(expr.exprKind.value));
      case "callExpr":
        return this.planCall(id, expr.exprKind.value);
      case "listExpr":
        return this.planCreateList(id, expr.exprKind.value);
      case "structExpr":
        return this.planCreateStruct(id, expr.exprKind.value);
      case "selectExpr":
        return this.planSelect(id, expr.exprKind.value);
      case "comprehensionExpr":
        return this.planComprehension(id, expr.exprKind.value);
      default:
        return new EvalError(id, "invalid expression");
    }
  }

  private planComprehension(
    id: number,
    value: Expr_Comprehension,
  ): Interpretable {
    if (
      value.accuInit === undefined ||
      value.iterRange === undefined ||
      value.loopCondition === undefined ||
      value.loopStep === undefined ||
      value.result === undefined
    ) {
      throw new Error("invalid comprehension");
    }
    const accu = this.plan(value.accuInit);
    const iterRange = this.plan(value.iterRange);
    const cond = this.plan(value.loopCondition);
    const step = this.plan(value.loopStep);
    const result = this.plan(value.result);

    return new EvalFold(
      id,
      value.accuVar,
      value.iterVar,
      iterRange,
      accu,
      cond,
      step,
      result,
    );
  }

  private planSelect(id: number, expr: Expr_Select): Interpretable {
    if (expr.operand === undefined) {
      throw new Error("invalid select");
    }
    const operand = this.plan(expr.operand);
    const attr = this.relativeAttr(id, operand, false);
    const acc = this.factory.newAccess(id, expr.field, false);
    if (acc instanceof CelError) {
      throw new Error(`invalid select: ${acc.message}`);
    }
    if (expr.testOnly) {
      return new EvalHas(id, attr, acc, expr.field);
    }
    attr.addAccess(acc);
    return attr;
  }

  private planCreateObj(id: number, expr: Expr_CreateStruct): Interpretable {
    const typeName = this.resolveType(expr.messageName);
    if (typeName === undefined) {
      return new EvalError(id, "unknown type: " + expr.messageName);
    }
    let optionals: boolean[] | undefined = undefined;
    const keys: string[] = [];
    const values: Interpretable[] = [];
    for (let i = 0; i < expr.entries.length; i++) {
      const entry = expr.entries[i];
      if (entry.optionalEntry) {
        if (optionals === undefined) {
          optionals = new Array(expr.entries.length).fill(false);
        }
        optionals[i] = true;
      }
      switch (entry.keyKind.case) {
        case "fieldKey":
          keys.push(entry.keyKind.value);
          break;
        case "mapKey":
          throw new Error("invalid entry");
        default:
          break;
      }
      if (entry.value === undefined) {
        throw new Error("invalid entry");
      }
      values.push(this.plan(entry.value));
    }
    return new EvalObj(id, typeName, keys, values, optionals, this.provider);
  }

  private planCreateStruct(id: number, expr: Expr_CreateStruct): Interpretable {
    if (expr.messageName !== "") {
      return this.planCreateObj(id, expr);
    }
    let optionals: boolean[] | undefined = undefined;
    const keys: Interpretable[] = [];
    const values: Interpretable[] = [];
    for (let i = 0; i < expr.entries.length; i++) {
      const entry = expr.entries[i];
      if (entry.optionalEntry) {
        if (optionals === undefined) {
          optionals = new Array(expr.entries.length).fill(false);
        }
        optionals[i] = true;
      }
      switch (entry.keyKind.case) {
        case "fieldKey":
          throw new Error("unimplemented");
        case "mapKey":
          keys.push(this.plan(entry.keyKind.value));
          break;
        default:
          break;
      }
      if (entry.value === undefined) {
        return new EvalError(id, "map entry missing value");
      }
      values.push(this.plan(entry.value));
    }
    return new EvalMap(id, keys, values, optionals);
  }

  private planCreateList(id: number, expr: Expr_CreateList): Interpretable {
    const optionals = undefined;
    if (expr.optionalIndices.length > 0) {
      // set optionals to an array of booleans the same length as the list
      const optionals = new Array(expr.elements.length).fill(false);
      for (let i = 0; i < expr.optionalIndices.length; i++) {
        const index = expr.optionalIndices[i];
        if (index < 0 || index >= expr.elements.length) {
          throw new Error("invalid optional index");
        }
        optionals[index] = true;
      }
    }
    return new EvalList(
      id,
      expr.elements.map((arg) => this.plan(arg)),
      optionals,
    );
  }

  private planCall(id: number, call: Expr_Call): Interpretable {
    // Check if the function is a qualified name.
    if (call.target !== undefined) {
      const qualName = toQualifiedName(call.target);
      if (qualName !== undefined) {
        const funcName = qualName + "." + call.function;
        for (const candidate of this.namespace.resolveCandidateNames(
          funcName,
        )) {
          const func = this.functions.find(candidate);
          if (func !== undefined) {
            return new EvalCall(
              id,
              candidate,
              "",
              func,
              call.args.map((arg) => this.plan(arg)),
              this.provider.adapter,
            );
          }
        }
      }
    }

    const args = call.target
      ? [this.plan(call.target), ...call.args.map((arg) => this.plan(arg))]
      : call.args.map((arg) => this.plan(arg));

    switch (call.function) {
      case opc.INDEX:
        return this.planCallIndex(call, args, false);
      case opc.OPT_INDEX:
      case opc.OPT_SELECT:
        return this.planCallIndex(call, args, true);
      case opc.CONDITIONAL:
        return this.planCallConditional(id, call, args);
      default:
        break;
    }
    return new EvalCall(
      id,
      call.function,
      "",
      this.functions.find(call.function),
      args,
      this.provider.adapter,
    );
  }

  private planCallConditional(
    id: number,
    _call: Expr_Call,
    args: Interpretable[],
  ): Interpretable {
    const cond = args[0];
    const t = args[1];
    const f = args[2];
    const tAttr = this.relativeAttr(t.id, t, false);
    const fAttr = this.relativeAttr(f.id, f, false);
    return new EvalAttr(
      this.factory.createConditional(
        id,
        cond,
        tAttr,
        fAttr,
        this.provider.adapter,
      ),
      false,
    );
  }

  private planCallIndex(
    _call: Expr_Call,
    args: Interpretable[],
    opt: boolean,
  ): Interpretable {
    const op = args[0];
    const ind = args[1];

    const attr = this.relativeAttr(op.id, op, false);
    let acc: Access;
    if (ind instanceof EvalConst) {
      acc = this.factory.newAccess(op.id, ind.value, opt);
    } else if (ind instanceof EvalAttr) {
      acc = this.factory.newAccess(op.id, ind, opt);
    } else {
      acc = this.relativeAttr(op.id, ind, opt);
    }
    attr.addAccess(acc);
    return attr;
  }

  private constVal(val: Constant): CelVal {
    switch (val.constantKind.case) {
      case "stringValue":
        return val.constantKind.value;
      case "bytesValue":
        return val.constantKind.value;
      case "doubleValue":
        return val.constantKind.value;
      case "boolValue":
        return val.constantKind.value;
      case "int64Value":
        return val.constantKind.value;
      case "uint64Value":
        return CelUint.of(val.constantKind.value);
      case "nullValue":
        return null;
      case undefined:
        throw new Error("invalid constant");
      default:
        throw new Error(`unimplemented: ${val.constantKind.case}`);
    }
  }

  private relativeAttr(id: number, e: Interpretable, opt: boolean): EvalAttr {
    if (e instanceof EvalAttr) {
      return e;
    }
    return new EvalAttr(this.factory.createRelative(id, e), opt);
  }

  private resolveType(name: string): string | undefined {
    for (const candidate of this.namespace.resolveCandidateNames(name)) {
      const t = this.provider.findType(candidate);
      if (t !== undefined) {
        return candidate;
      }
    }
    return undefined;
  }
}

export interface Interpretable {
  readonly id: number;
  eval(ctx: Activation): CelResult;
}

export interface InterpretableCall extends Interpretable {
  function(): string;
  overloadId(): number;
  args(): Interpretable[];
}

export interface InterpretableCtor extends Interpretable {
  type(): CelType;
  args(): Interpretable[];
}

export class EvalHas implements Interpretable {
  constructor(
    public readonly id: number,
    private attr: Interpretable & Attribute,
    private access: Access,
    readonly field: string,
  ) {}

  eval(ctx: Activation): CelResult {
    const raw = this.attr.resolve(ctx);
    if (raw === undefined) {
      return false;
    } else if (raw instanceof CelError || raw instanceof CelUnknown) {
      return raw;
    }
    return this.access.isPresent(ctx, raw);
  }
}

export class EvalError implements Interpretable {
  constructor(
    public readonly id: number,
    private readonly msg: string,
  ) {}

  eval(_ctx: Activation): CelResult {
    return new CelError(this.id, this.msg);
  }
}

export class EvalConst implements Interpretable {
  constructor(
    public readonly id: number,
    public readonly value: CelVal,
  ) {}
  eval(_ctx: Activation): CelResult {
    return this.value;
  }
}

export class EvalAttr implements Attribute, Interpretable {
  public readonly id: number;
  constructor(
    readonly attr: Attribute,
    readonly opt: boolean,
  ) {
    this.id = attr.id;
  }
  access(vars: Activation, obj: RawVal): RawResult | undefined {
    return this.attr.access(vars, obj);
  }

  isPresent(vars: Activation, obj: RawVal): CelResult<boolean> {
    return this.attr.isPresent(vars, obj);
  }

  accessIfPresent(
    vars: Activation,
    obj: RawVal,
    presenceOnly: boolean,
  ): RawResult | undefined {
    return this.attr.accessIfPresent(vars, obj, presenceOnly);
  }

  isOptional(): boolean {
    return this.opt;
  }

  eval(ctx: Activation) {
    const val = this.attr.resolve(ctx);
    if (val === undefined) {
      return CelErrors.unresolvedAttr(this.id);
    } else if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }

    return val.adapter.toCel(val.value);
  }

  resolve(vars: Activation): RawResult<unknown> | undefined {
    return this.attr.resolve(vars);
  }

  addAccess(acc: Access) {
    this.attr.addAccess(acc);
  }
}

export class EvalCall implements Interpretable {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly overload: string,
    private readonly call: CallDispatch | undefined,
    public readonly args: Interpretable[],
    public readonly adapter: CelValAdapter,
  ) {}

  public eval(ctx: Activation): CelResult {
    if (this.call === undefined) {
      return CelErrors.funcNotFound(this.id, this.name);
    }
    const argVals = this.args.map((x) => x.eval(ctx));
    const result = this.call.dispatch(this.id, argVals, this.adapter);
    if (result !== undefined) {
      return result;
    }

    const vals = coerceToValues(argVals);
    if (vals instanceof CelError || vals instanceof CelUnknown) {
      return vals;
    }
    return CelErrors.overloadNotFound(
      this.id,
      this.name,
      vals.map((x) => type.getCelType(x)),
    );
  }
}

export class EvalObj implements InterpretableCtor {
  constructor(
    public readonly id: number,
    public readonly typeName: string,
    public fields: string[],
    public values: Interpretable[],
    public optionals: boolean[] | undefined,
    public provider: CelValProvider,
  ) {}
  type(): CelType {
    return this.provider.findType(this.typeName) as CelType;
  }
  args(): Interpretable[] {
    return this.values;
  }
  eval(ctx: Activation): CelResult {
    const vals = coerceToValues(this.values.map((x) => x.eval(ctx)));
    if (vals instanceof CelError || vals instanceof CelUnknown) {
      return vals;
    }
    const obj: { [key: string]: CelVal } = {};
    for (let i = 0; i < vals.length; i++) {
      if (obj[this.fields[i]] !== undefined) {
        return CelErrors.mapKeyConflict(this.id, this.fields[i]);
      }
      obj[this.fields[i]] = vals[i];
    }
    if (type.WK_PROTO_TYPES.has(this.typeName)) {
      switch (this.typeName) {
        case "google.protobuf.Any": {
          const typeUrl = coerceToString(this.id, obj.type_url);
          if (typeUrl instanceof CelError || typeUrl instanceof CelUnknown) {
            return typeUrl;
          }
          const value = coerceToBytes(this.id, obj.value);
          if (value instanceof CelError || value instanceof CelUnknown) {
            return value;
          }
          return create(AnySchema, { typeUrl: typeUrl, value: value });
        }
        case "google.protobuf.BoolValue": {
          const val = coerceToBool(this.id, obj.value);
          if (val instanceof CelError || val instanceof CelUnknown) {
            return val;
          }
          return create(BoolValueSchema, { value: val });
        }
        case "google.protobuf.UInt32Value":
        case "google.protobuf.UInt64Value": {
          const val = coerceToBigInt(this.id, obj.value);
          if (val instanceof CelError || val instanceof CelUnknown) {
            return val;
          }
          return create(UInt64ValueSchema, { value: val.valueOf() });
        }
        case "google.protobuf.Int32Value":
        case "google.protobuf.Int64Value": {
          const val = coerceToBigInt(this.id, obj.value);
          if (val instanceof CelError || val instanceof CelUnknown) {
            return val;
          }
          return create(Int64ValueSchema, { value: val.valueOf() });
        }
        case "google.protobuf.FloatValue":
        case "google.protobuf.DoubleValue": {
          const val = coerceToNumber(this.id, obj.value);
          if (val instanceof CelError || val instanceof CelUnknown) {
            return val;
          }
          return create(DoubleValueSchema, { value: val });
        }
        case "google.protobuf.StringValue": {
          const val = coerceToString(this.id, obj.value);
          if (val instanceof CelError || val instanceof CelUnknown) {
            return val;
          }
          return create(StringValueSchema, { value: val });
        }
        case "google.protobuf.BytesValue": {
          const val = coerceToBytes(this.id, obj.value);
          if (val instanceof CelError || val instanceof CelUnknown) {
            return val;
          }
          return create(BytesValueSchema, { value: val });
        }
        case "google.protobuf.Value": {
          return null;
        }
        default:
          throw new Error("not implemented: " + this.typeName);
      }
    }

    const celObj = new CelObject(obj, CEL_ADAPTER, new CelType(this.typeName));
    const result = this.provider.newValue(this.id, this.typeName, celObj);
    if (result === undefined) {
      return CelErrors.typeNotFound(this.id, this.typeName);
    }
    return result;
  }
}

export class EvalList implements InterpretableCtor {
  constructor(
    public readonly id: number,
    private readonly elems: Interpretable[],
    _: boolean[] | undefined,
  ) {}

  eval(ctx: Activation): CelResult {
    if (this.elems.length === 0) {
      return EMPTY_LIST;
    }
    const first = this.elems[0].eval(ctx);
    if (first instanceof CelError) {
      return first;
    } else if (first instanceof CelUnknown) {
      return first;
    }
    let elemType = type.getCelType(first);
    const elemVals: CelVal[] = [first];
    for (let i = 1; i < this.elems.length; i++) {
      const elemVal = this.elems[i].eval(ctx);
      if (elemVal instanceof CelError || elemVal instanceof CelUnknown) {
        return elemVal;
      }
      if (elemType !== type.DYN && type.getCelType(elemVal) !== elemType) {
        elemType = type.DYN;
      }
      elemVals.push(elemVal);
    }
    return new CelList(elemVals, CEL_ADAPTER, new type.ListType(elemType));
  }

  type(): CelType {
    return type.LIST;
  }
  args(): Interpretable[] {
    return this.elems;
  }
}

export class EvalMap implements InterpretableCtor {
  constructor(
    public readonly id: number,
    private readonly keys: Interpretable[],
    private readonly values: Interpretable[],
    _: boolean[] | undefined,
  ) {}

  type(): CelType {
    return type.DYN_MAP;
  }
  args(): Interpretable[] {
    return this.keys.concat(this.values);
  }

  eval(ctx: Activation): CelResult {
    if (this.keys.length === 0) {
      return EMPTY_MAP;
    }
    const entries: Map<CelVal, CelVal> = new Map();
    const firstKey = this.keys[0].eval(ctx);
    if (firstKey instanceof CelError || firstKey instanceof CelUnknown) {
      return firstKey;
    }
    const firstVal = this.values[0].eval(ctx);
    if (firstVal instanceof CelError || firstVal instanceof CelUnknown) {
      return firstVal;
    }
    let keyType = type.getCelType(firstKey);
    let valType = type.getCelType(firstVal);
    if (typeof firstKey === "number" && !Number.isInteger(firstKey)) {
      return CelErrors.unsupportedKeyType(this.id);
    }
    entries.set(firstKey, firstVal);
    for (let i = 1; i < this.keys.length; i++) {
      const key = this.keys[i].eval(ctx);
      if (key instanceof CelError || key instanceof CelUnknown) {
        return key;
      }
      if (keyType !== type.DYN && type.getCelType(key) !== keyType) {
        keyType = type.DYN;
      }
      const val = this.values[i].eval(ctx);
      if (val instanceof CelError || val instanceof CelUnknown) {
        return val;
      }
      if (valType !== type.DYN && type.getCelType(val) !== valType) {
        valType = type.DYN;
      }
      if (entries.has(key)) {
        return CelErrors.mapKeyConflict(this.id, key);
      } else if (typeof key === "number" && !Number.isInteger(key)) {
        return CelErrors.unsupportedKeyType(this.id);
      }
      entries.set(key, val);
    }
    return new CelMap(entries, CEL_ADAPTER, new type.MapType(keyType, valType));
  }
}

export class EvalFold implements Interpretable {
  constructor(
    public readonly id: number,
    public readonly accuVar: string,
    public readonly iterVar: string,
    public readonly iterRange: Interpretable,
    public readonly accu: Interpretable,
    public readonly cond: Interpretable,
    public readonly step: Interpretable,
    public readonly result: Interpretable,
  ) {}

  eval(ctx: Activation): CelResult {
    const foldRange = this.iterRange.eval(ctx);
    if (foldRange instanceof CelError || foldRange instanceof CelUnknown) {
      return foldRange;
    }
    const accuInit = this.accu.eval(ctx);
    if (accuInit instanceof CelError || accuInit instanceof CelUnknown) {
      return accuInit;
    }
    const accuCtx = new VarActivation(
      this.accuVar,
      new RawVal(CEL_ADAPTER, accuInit),
      ctx,
    );
    const iterRange = this.iterRange.eval(ctx);
    if (iterRange instanceof CelError || iterRange instanceof CelUnknown) {
      return iterRange;
    }

    let items: CelResult[] = [];
    if (
      iterRange instanceof CelMap ||
      iterRange instanceof CelObject ||
      iterRange instanceof CelList
    ) {
      items = iterRange.getItems();
    } else {
      return CelErrors.typeMismatch(this.id, "iterable", iterRange);
    }

    // Fold the items.
    for (const item of items) {
      if (item instanceof CelError || item instanceof CelUnknown) {
        return item;
      }
      const iterCtx = new VarActivation(
        this.iterVar,
        new RawVal(CEL_ADAPTER, item),
        accuCtx,
      );
      const cond = this.cond.eval(iterCtx);
      if (cond instanceof CelError || cond instanceof CelUnknown) {
        return cond;
      }
      if (cond !== true) {
        break;
      }
      // Update the result.
      accuCtx.value = new RawVal(CEL_ADAPTER, this.step.eval(iterCtx));
    }
    // Compute the result
    return this.result.eval(accuCtx);
  }
}

function toQualifiedName(expr: Expr): string | undefined {
  switch (expr.exprKind.case) {
    case "identExpr":
      return expr.exprKind.value.name;
    case "selectExpr": {
      if (
        expr.exprKind.value.testOnly ||
        expr.exprKind.value.operand === undefined
      ) {
        return undefined;
      }
      const parent = toQualifiedName(expr.exprKind.value.operand);
      if (parent === undefined) {
        return undefined;
      }
      return parent + "." + expr.exprKind.value.field;
    }
    default:
      return undefined;
  }
}
