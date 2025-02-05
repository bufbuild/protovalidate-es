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

import { type Activation } from "./activation.js";
import { CEL_ADAPTER } from "./adapter/cel.js";
import { EvalAttr, type Interpretable } from "./planner.js";
import { type RawResult, RawVal } from "./value/adapter.js";
import { Namespace } from "./value/namespace.js";
import { type CelValProvider } from "./value/provider.js";
import {
  CelUint,
  type CelResult,
  type CelVal,
  CelError,
  CelUnknown,
  type Unwrapper,
  CelErrors,
} from "./value/value.js";
import { getCelType } from "./value/type.js";

export interface AttributeFactory {
  createAbsolute(id: number, names: string[]): NamespacedAttribute;
  createConditional(
    id: number,
    cond: Interpretable,
    t: Attribute,
    f: Attribute,
    unwrap: Unwrapper,
  ): Attribute;
  createMaybe(id: number, name: string): Attribute;
  createRelative(id: number, operand: Interpretable): Attribute;
  newAccess(id: number, val: unknown, opt: boolean): Access;
}

// The access of a sub value.
export interface Access<T = unknown> {
  // The expr id of the access.
  readonly id: number;

  // Performs the access on the provided object.
  access(vars: Activation, obj: RawVal<T>): RawResult<T> | undefined;

  isPresent(_vars: Activation, obj: RawVal): CelResult<boolean>;

  accessIfPresent(
    vars: Activation,
    obj: RawVal<T>,
    presenceOnly: boolean,
  ): RawResult<T> | undefined;

  // If the access is optional.
  isOptional(): boolean;
}

// Attribute values can be additionally accessed.
export interface Attribute<T = unknown> extends Access<T> {
  resolve(vars: Activation): RawResult<T> | undefined;
  addAccess(access: Access): void;
}

// An attribute within a namespace.
export interface NamespacedAttribute extends Attribute {
  candidateNames(): string[];
  accesses(): Access[];
}

function attrAccess<T = unknown>(
  factory: AttributeFactory,
  vars: Activation,
  obj: RawVal<T>,
  accAttr: Attribute,
): RawResult<T> | undefined {
  const val = accAttr.resolve(vars);
  if (val === undefined) {
    return undefined;
  } else if (val instanceof CelError || val instanceof CelUnknown) {
    return val;
  }
  const access = factory.newAccess(accAttr.id, val.value, accAttr.isOptional());
  return access.access(vars, obj) as RawResult<T>;
}

function attrIsPresent<T = unknown>(
  factory: AttributeFactory,
  vars: Activation,
  obj: RawVal<T>,
  accAttr: Attribute,
): CelResult<boolean> {
  const val = accAttr.resolve(vars);
  if (val === undefined) {
    return false;
  }
  if (val instanceof CelError || val instanceof CelUnknown) {
    return val;
  }
  const access = factory.newAccess(accAttr.id, val.value, accAttr.isOptional());
  return access.isPresent(vars, obj);
}

function attrAccessIfPresent<T = unknown>(
  factory: AttributeFactory,
  vars: Activation,
  obj: RawVal<T>,
  accAttr: Attribute,
  presenceOnly: boolean,
): RawResult<T> | undefined {
  const val = accAttr.resolve(vars);
  if (val === undefined) {
    return undefined;
  } else if (val instanceof CelError || val instanceof CelUnknown) {
    return val;
  }
  const access = factory.newAccess(accAttr.id, val.value, accAttr.isOptional());
  if (access instanceof CelError) {
    return access;
  }
  return access.accessIfPresent(vars, obj, presenceOnly) as RawResult<T>;
}

function applyAccesses<T = unknown>(
  vars: Activation,
  obj: RawVal<T>,
  accesses: Access[],
): RawResult<T> | undefined {
  if (accesses.length === 0) {
    return obj;
  }
  let cur = obj;
  for (const access of accesses) {
    const result = access.access(vars, cur) as RawResult<T>;
    if (result === undefined) {
      return undefined;
    } else if (result instanceof CelError || result instanceof CelUnknown) {
      return result;
    }
    cur = result;
  }
  return cur;
}

class AbsoluteAttr implements NamespacedAttribute {
  constructor(
    public readonly id: number,
    readonly nsNames: string[],
    public accesses_: Access[],
    readonly provider: CelValProvider,
    readonly factory: AttributeFactory,
  ) {
    if (nsNames.length === 0) {
      throw new Error("No names provided");
    }
  }

  isOptional(): boolean {
    return false;
  }

  addAccess(access: Access): void {
    this.accesses_.push(access);
  }

  candidateNames(): string[] {
    return this.nsNames;
  }

  accesses(): Access[] {
    return this.accesses_;
  }

  access(vars: Activation, obj: RawVal): RawResult | undefined {
    return attrAccess(this.factory, vars, obj, this);
  }

  isPresent(vars: Activation, obj: RawVal): CelResult<boolean> {
    return attrIsPresent(this.factory, vars, obj, this);
  }

  accessIfPresent(
    vars: Activation,
    obj: RawVal,
    presenceOnly: boolean,
  ): RawResult | undefined {
    return attrAccessIfPresent(this.factory, vars, obj, this, presenceOnly);
  }

  resolve(vars: Activation): RawResult | undefined {
    for (const name of this.nsNames) {
      const raw = vars.resolve(name);
      if (raw !== undefined) {
        if (raw instanceof CelError || raw instanceof CelUnknown) {
          return raw;
        }
        return applyAccesses(vars, raw, this.accesses_);
      }
      const typ = this.provider.findIdent(this.id, name);
      if (typ !== undefined && this.accesses_.length === 0) {
        return new RawVal(CEL_ADAPTER, typ);
      }
    }
    return undefined;
  }
}

class ConditionalAttr implements Attribute {
  constructor(
    public readonly id: number,
    readonly cond: Interpretable,
    readonly t: Attribute,
    readonly f: Attribute,
    readonly factory: AttributeFactory,
    readonly unwrap: Unwrapper,
  ) {}

  isOptional(): boolean {
    return false;
  }

  addAccess(access: Access): void {
    this.t.addAccess(access);
    this.f.addAccess(access);
  }

  access(vars: Activation, obj: RawVal): RawResult | undefined {
    return attrAccess(this.factory, vars, obj, this);
  }

  isPresent(vars: Activation, obj: RawVal): CelResult<boolean> {
    return attrIsPresent(this.factory, vars, obj, this);
  }

  accessIfPresent(
    vars: Activation,
    obj: RawVal,
    presenceOnly: boolean,
  ): RawResult | undefined {
    return attrAccessIfPresent(this.factory, vars, obj, this, presenceOnly);
  }

  resolve(vars: Activation): RawResult | undefined {
    const cond = this.unwrap.unwrap(this.cond.eval(vars)) as CelResult;
    if (cond === true) {
      return this.t.resolve(vars);
    } else if (cond === false) {
      return this.f.resolve(vars);
    } else if (cond instanceof CelError || cond instanceof CelUnknown) {
      return cond;
    }
    return CelErrors.overloadNotFound(this.id, "_?_:_", [getCelType(cond)]);
  }
}

class MaybeAttr implements Attribute {
  constructor(
    public readonly id: number,
    public readonly attrs: NamespacedAttribute[],
    public readonly provider: CelValProvider,
    public readonly factory: AttributeFactory,
  ) {}

  isOptional(): boolean {
    return false;
  }

  addAccess(access: Access): void {
    const augmentedNames: string[] = [];
    let str: string | undefined;
    if (access instanceof StringAccess) {
      str = access.name;
    }
    // Add the access to all existing attributes.
    for (const attr of this.attrs) {
      if (str !== undefined && attr.accesses().length === 0) {
        for (const name of attr.candidateNames()) {
          augmentedNames.push(name + "." + str);
        }
      }
      attr.addAccess(access);
    }
    if (augmentedNames.length > 0) {
      // Next, ensure the most specific variable / type reference is searched first.
      const newAttr = this.factory.createAbsolute(this.id, augmentedNames);
      // Insert it as the first attribute to search.
      this.attrs.unshift(newAttr);
    }
  }

  access(vars: Activation, obj: RawVal): RawResult | undefined {
    return attrAccess(this.factory, vars, obj, this);
  }

  isPresent(vars: Activation, obj: RawVal): CelResult<boolean> {
    return attrIsPresent(this.factory, vars, obj, this);
  }

  accessIfPresent(
    vars: Activation,
    obj: RawVal,
    presenceOnly: boolean,
  ): RawResult | undefined {
    return attrAccessIfPresent(this.factory, vars, obj, this, presenceOnly);
  }

  resolve(vars: Activation): RawResult | undefined {
    for (const attr of this.attrs) {
      const val = attr.resolve(vars);
      if (val !== undefined) {
        return val;
      }
    }
    return undefined;
  }
}

class RelativeAttr implements Attribute {
  constructor(
    public readonly id: number,
    public readonly operand: Interpretable,
    private accesses_: Access[],
    public readonly factory: AttributeFactory,
  ) {}

  isOptional(): boolean {
    return false;
  }

  addAccess(access: Access): void {
    this.accesses_.push(access);
  }

  access(vars: Activation, obj: RawVal): RawResult | undefined {
    return attrAccess(this.factory, vars, obj, this);
  }

  isPresent(vars: Activation, obj: RawVal): CelResult<boolean> {
    return attrIsPresent(this.factory, vars, obj, this);
  }

  accessIfPresent(
    vars: Activation,
    obj: RawVal,
    presenceOnly: boolean,
  ): RawResult | undefined {
    return attrAccessIfPresent(this.factory, vars, obj, this, presenceOnly);
  }

  resolve(vars: Activation): RawResult | undefined {
    const v = this.operand.eval(vars);
    if (v instanceof CelError || v instanceof CelUnknown) {
      return v;
    }
    return applyAccesses(vars, new RawVal(CEL_ADAPTER, v), this.accesses_);
  }
}

class StringAccess implements Access {
  constructor(
    public readonly id: number,
    readonly name: string,
    readonly celVal: CelVal,
    readonly optional: boolean,
  ) {}

  isOptional(): boolean {
    return this.optional;
  }

  access<T>(_vars: Activation, obj: RawVal<T>): RawResult<T> | undefined {
    const val = obj.adapter.accessByName(this.id, obj.value, this.name);
    if (val === undefined && !this.optional) {
      return CelErrors.fieldNotFound(this.id, this.name);
    }
    return RawVal.if(obj.adapter, val);
  }

  isPresent(_vars: Activation, obj: RawVal): CelResult<boolean> {
    return obj.adapter.isSetByName(this.id, obj.value, this.name);
  }

  accessIfPresent(
    _vars: Activation,
    obj: RawVal,
    presenceOnly: boolean,
  ): RawResult | undefined {
    const val = obj.adapter.accessByName(this.id, obj.value, this.name);
    // TODO(tstamm) obj.adapter.toCel(val) ?
    if (val === undefined && !this.optional && !presenceOnly) {
      return CelErrors.fieldNotFound(this.id, this.name);
    }
    return RawVal.if(obj.adapter, val);
  }
}

class NumAccess implements Access {
  constructor(
    public readonly id: number,
    readonly index: number,
    readonly celVal: CelVal,
    readonly optional: boolean,
  ) {}

  isOptional(): boolean {
    return this.optional;
  }

  access(_vars: Activation, obj: RawVal): RawResult | undefined {
    if (obj === undefined) {
      return obj;
    }
    const raw = obj.adapter.accessByIndex(this.id, obj.value, this.index);
    if (raw === undefined && !this.optional) {
      return CelErrors.indexOutOfBounds(this.id, this.index, -1);
    }
    return RawVal.if(obj.adapter, raw);
  }

  isPresent(_vars: Activation, obj: RawVal): CelResult<boolean> {
    const raw = obj.adapter.accessByIndex(this.id, obj.value, this.index);
    if (raw === undefined && !this.optional) {
      return CelErrors.indexOutOfBounds(this.id, this.index, -1);
    }
    return true;
  }

  accessIfPresent(
    _vars: Activation,
    obj: RawVal,
    _presenceOnly: boolean,
  ): RawResult | undefined {
    const raw = obj.adapter.accessByIndex(this.id, obj.value, this.index);
    if (raw === undefined && !this.optional) {
      return CelErrors.indexOutOfBounds(this.id, this.index, -1);
    }
    return RawVal.if(obj.adapter, raw);
  }
}

class IntAccess implements Access {
  constructor(
    public readonly id: number,
    public readonly index: bigint,
    public readonly celVal: CelVal,
    public readonly optional: boolean,
  ) {}

  access(_vars: Activation, obj: RawVal): RawResult | undefined {
    if (obj === undefined) {
      return obj;
    }
    const raw = obj.adapter.accessByIndex(this.id, obj.value, this.index);
    if (raw === undefined && !this.optional) {
      return CelErrors.indexOutOfBounds(this.id, Number(this.index), -1);
    }
    return RawVal.if(obj.adapter, raw);
  }

  isPresent(_vars: Activation, obj: RawVal): CelResult<boolean> {
    const raw = obj.adapter.accessByIndex(this.id, obj.value, this.index);
    if (raw === undefined && !this.optional) {
      return CelErrors.indexOutOfBounds(this.id, Number(this.index), -1);
    }
    return true;
  }

  accessIfPresent(
    _vars: Activation,
    obj: RawVal,
    _presenceOnly: boolean,
  ): RawResult | undefined {
    const raw = obj.adapter.accessByIndex(this.id, obj.value, this.index);
    if (raw === undefined && !this.optional) {
      return CelErrors.indexOutOfBounds(this.id, Number(this.index), -1);
    }
    return RawVal.if(obj.adapter, raw);
  }

  isOptional(): boolean {
    return this.optional;
  }
}

class ErrorAttr implements Attribute {
  constructor(
    public readonly id: number,
    public readonly error: CelError,
    private readonly opt: boolean,
  ) {}

  addAccess(_access: Access): void {
    // Do nothing
  }

  resolve(_vars: Activation): RawResult | undefined {
    return this.error;
  }

  isOptional(): boolean {
    return this.opt;
  }

  access(_vars: Activation, _obj: RawVal): RawResult | undefined {
    return this.error;
  }

  isPresent(_vars: Activation, _obj: RawVal): CelResult<boolean> {
    return this.error;
  }

  accessIfPresent(
    _vars: Activation,
    _obj: RawVal,
    _presenceOnly: boolean,
  ): RawResult | undefined {
    return this.error;
  }
}

class EvalAccess implements Access {
  constructor(
    public readonly id: number,
    readonly key: Interpretable,
    readonly factory: AttributeFactory,
    readonly optional: boolean,
  ) {}

  access(vars: Activation, obj: RawVal): RawResult | undefined {
    if (obj === undefined) {
      return obj;
    }
    const key = this.key.eval(vars);
    if (key instanceof CelError || key instanceof CelUnknown) {
      return key;
    }
    const access = this.factory.newAccess(this.id, key, this.optional);
    return access.access(vars, obj);
  }

  isPresent(vars: Activation, obj: RawVal): CelResult<boolean> {
    if (obj === undefined) {
      return false;
    }
    const key = this.key.eval(vars);
    if (key instanceof CelError || key instanceof CelUnknown) {
      return key;
    }
    const access = this.factory.newAccess(this.id, key, this.optional);
    return access.isPresent(vars, obj);
  }

  accessIfPresent(
    vars: Activation,
    obj: RawVal,
    presenceOnly: boolean,
  ): RawResult | undefined {
    const key = this.key.eval(vars);
    if (key instanceof CelError || key instanceof CelUnknown) {
      return key;
    }
    const access = this.factory.newAccess(this.id, key, this.optional);
    return access.accessIfPresent(vars, obj, presenceOnly);
  }

  isOptional(): boolean {
    return this.optional;
  }
}

export class ConcreteAttributeFactory implements AttributeFactory {
  constructor(
    public provider: CelValProvider,
    public container: Namespace,
  ) {}

  createAbsolute(id: number, names: string[]): NamespacedAttribute {
    return new AbsoluteAttr(id, names, [], this.provider, this);
  }

  createConditional(
    id: number,
    cond: Interpretable,
    t: Attribute,
    f: Attribute,
    unwrap: Unwrapper,
  ): Attribute {
    return new ConditionalAttr(id, cond, t, f, this, unwrap);
  }

  createMaybe(id: number, name: string): Attribute {
    return new MaybeAttr(
      id,
      [this.createAbsolute(id, this.container.resolveCandidateNames(name))],
      this.provider,
      this,
    );
  }

  createRelative(id: number, operand: Interpretable): Attribute {
    return new RelativeAttr(id, operand, [], this);
  }

  newAccess(id: number, val: unknown, opt: boolean): Access {
    switch (typeof val) {
      case "boolean":
        return new NumAccess(id, val ? 1 : 0, val, opt);
      case "number":
        return new NumAccess(id, val, val, opt);
      case "bigint":
        return new IntAccess(id, val, val, opt);
      case "string":
        return new StringAccess(id, val, val, opt);
      case "object":
        if (val instanceof EvalAttr) {
          return new EvalAccess(id, val, this, opt);
        }
        if (typeof val === "string") {
          return new StringAccess(id, val, val, opt);
        } else if (val instanceof CelUint) {
          return new IntAccess(id, val.value, val, opt);
        }
        break;
      default:
        break;
    }
    return new ErrorAttr(id, CelErrors.unsupportedKeyType(id), opt);
  }
}
