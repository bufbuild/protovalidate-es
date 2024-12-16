import { isMessage, type Message, create } from "@bufbuild/protobuf";

import {
  AnySchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  DurationSchema,
  Int64ValueSchema,
  StringValueSchema,
  TimestampSchema,
  UInt64ValueSchema,
} from "@bufbuild/protobuf/wkt";

import type { Any } from "@bufbuild/protobuf/wkt";
import type { BytesValue } from "@bufbuild/protobuf/wkt";
import type { StringValue } from "@bufbuild/protobuf/wkt";
import type { BoolValue } from "@bufbuild/protobuf/wkt";
import type { DoubleValue } from "@bufbuild/protobuf/wkt";
import type { UInt64Value } from "@bufbuild/protobuf/wkt";
import type { Int64Value } from "@bufbuild/protobuf/wkt";
import type { Duration } from "@bufbuild/protobuf/wkt";
import type { Timestamp } from "@bufbuild/protobuf/wkt";

/** Cel Number types, which all existing on the same logical number line. */
export type CelNum = bigint | CelUint | number;
export function isCelNum(val: unknown): val is CelNum {
  return (
    typeof val === "bigint" || val instanceof CelUint || typeof val === "number"
  );
}

export function newTimestamp(
  id: number,
  seconds: bigint,
  nanos: number,
): Timestamp | CelError {
  if (nanos >= 1000000000) {
    seconds += BigInt(nanos / 1000000000);
    nanos = nanos % 1000000000;
  } else if (nanos < 0) {
    const negSeconds = Math.floor(-nanos / 1000000000);
    seconds -= BigInt(negSeconds);
    nanos = nanos + negSeconds * 1000000000;
  }
  if (seconds > 253402300799n || seconds < -62135596800n) {
    return CelErrors.badTimestamp(id, seconds, nanos);
  }
  return create(TimestampSchema, { seconds: seconds, nanos: nanos });
}

export function newDuration(
  id: number,
  seconds: bigint,
  nanos: number,
): Duration | CelError {
  if (nanos >= 1000000000) {
    seconds += BigInt(nanos / 1000000000);
    nanos = nanos % 1000000000;
  } else if (nanos < 0) {
    const negSeconds = Math.ceil(-nanos / 1000000000);
    seconds -= BigInt(negSeconds);
    nanos = nanos + negSeconds * 1000000000;
  }
  // Must fit in 64 bits of nanoseconds for compatibility with golang
  const totalNanos = seconds * 1000000000n + BigInt(nanos);
  if (totalNanos > 9223372036854775807n || totalNanos < -9223372036854775808n) {
    return CelErrors.badDuration(id, seconds, nanos);
  }

  return create(DurationSchema, { seconds: seconds, nanos: nanos });
}

// A duration string is a possibly signed sequence of
// decimal numbers, each with optional fraction and a unit suffix,
// such as "300ms", "-1.5h" or "2h45m".
// Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h".
export function parseDuration(id: number, str: string): Duration | CelError {
  // The regex grouping the number and the unit is:
  const re = /([-+]?(?:\d+|\d+\.\d*|\d*\.\d+))(ns|us|µs|ms|s|m|h)/;
  // Loop over the string matching the regex.
  let seconds = 0n;
  let nanos = 0;
  let remaining = str;
  while (remaining.length > 0) {
    const match = re.exec(remaining);
    if (match === null) {
      return CelErrors.badDurationStr(id, "invalid syntax");
    }
    const [, numStr, unit] = match;
    const num = Number(numStr);
    if (isNaN(num)) {
      return CelErrors.badDurationStr(id, "invalid syntax");
    }
    switch (unit) {
      case "ns":
        nanos += num;
        break;
      case "us":
      case "µs":
        nanos += num * 1000;
        break;
      case "ms":
        nanos += num * 1000000;
        break;
      case "s":
        seconds += BigInt(num);
        break;
      case "m":
        seconds += BigInt(num * 60);
        break;
      case "h":
        seconds += BigInt(num * 3600);
        break;
      default:
        return CelErrors.badDurationStr(id, "invalid syntax");
    }
    remaining = remaining.slice(match[0].length);
  }
  return newDuration(id, seconds, nanos);
}

/** Cel Primitive types, which are the basic types that can be stored in a CelVal.  */
export type CelPrim = boolean | CelNum | string | Uint8Array;
export function isCelPrim(val: unknown): val is CelPrim {
  return (
    typeof val === "boolean" ||
    isCelNum(val) ||
    typeof val === "string" ||
    val instanceof Uint8Array
  );
}

/** Protobuf wrappers for number types, which can be 'null'  */
export type CelWrapNum = Int64Value | UInt64Value | DoubleValue;
export function isCelWrapNum(val: unknown): val is CelWrapNum {
  return (
    isMessage(val, Int64ValueSchema) ||
    isMessage(val, UInt64ValueSchema) ||
    isMessage(val, DoubleValueSchema)
  );
}

/** Protobuf wrappers for all primitive types, which can be 'null'  */
export type CelWrap = BoolValue | CelWrapNum | StringValue | BytesValue;
export function isCelWrap(val: unknown): val is CelWrap {
  return (
    isMessage(val, BoolValueSchema) ||
    isCelWrapNum(val) ||
    isMessage(val, StringValueSchema) ||
    isMessage(val, BytesValueSchema)
  );
}

/** All cel types that are also protobuf messages */
export type CelMsg = CelWrap | Timestamp | Duration | Any;
export function isCelMsg(val: unknown): val is CelMsg {
  return (
    isCelWrap(val) ||
    isMessage(val, TimestampSchema) ||
    isMessage(val, DurationSchema) ||
    isMessage(val, AnySchema)
  );
}

/** All types Cel understands natively */
export type CelVal =
  | null
  | ProtoNull
  | CelPrim
  | CelMsg
  | CelList
  | CelMap
  | CelObject
  | CelType;

export function isCelVal(val: unknown): val is CelVal {
  return (
    val === null ||
    val instanceof ProtoNull ||
    isCelPrim(val) ||
    isCelMsg(val) ||
    val instanceof CelList ||
    val instanceof CelMap ||
    val instanceof CelObject ||
    val instanceof CelType
  );
}

export interface Unwrapper<V = unknown> {
  unwrap(val: V): V;
}

export interface CelValAdapter<V = unknown> extends Unwrapper<V> {
  toCel(native: CelResult<V>): CelResult;
  fromCel(cel: CelVal): CelResult<V>;

  equals(lhs: V, rhs: V): CelResult<boolean>;
  compare(lhs: V, rhs: V): CelResult<number> | undefined;

  accessByName(id: number, obj: V, name: string): CelResult<V> | undefined;
  isSetByName(id: number, obj: V, name: string): CelResult<boolean>;
  accessByIndex(
    id: number,
    obj: V,
    index: number | bigint,
  ): CelResult<V> | undefined;
  getFields(value: object): string[];
}

export interface IterAccess {
  getItems(): CelResult[];
}

export interface IndexAccess {
  accessByIndex(id: number, index: number | bigint): CelResult | undefined;
}

export interface FieldAccess<K> {
  getFields(): K[];
  accessByName(id: number, name: K): CelResult | undefined;
}

export type ListAccess = IterAccess & IndexAccess;
export type StructAccess<K = unknown> = IterAccess &
  FieldAccess<K> &
  IndexAccess;

// proto3 has typed nulls.
export class ProtoNull {
  constructor(
    public readonly messageTypeName: string,
    public readonly defaultValue: CelVal,
    public readonly value: CelVal = null,
  ) {}
}

// TODO(tstamm) Object.prototype.valueOf()
export class CelUint {
  public static EMPTY: CelUint = new CelUint(BigInt(0));
  public static ONE: CelUint = new CelUint(BigInt(1));
  public static of(value: bigint): CelUint {
    switch (value) {
      case 0n:
        return CelUint.EMPTY;
      case 1n:
        return CelUint.ONE;
      default:
        return new CelUint(value);
    }
  }
  constructor(public readonly value: bigint) {}
}

export class CelList implements ListAccess {
  constructor(
    public readonly value: readonly unknown[],
    public readonly adapter: CelValAdapter,
    public readonly type_: CelType,
  ) {}

  getItems(): CelResult[] {
    const result: CelResult[] = [];
    for (const item of this.value) {
      result.push(this.adapter.toCel(item));
    }
    return result;
  }

  accessByIndex(id: number, index: number | bigint): CelResult {
    const i = Number(index);
    if (i < 0 || i >= this.value.length) {
      return CelErrors.indexOutOfBounds(Number(id), i, this.value.length);
    }
    return this.adapter.toCel(this.value[i]);
  }
}

export class CelMap<K = unknown, V = unknown> implements StructAccess<CelVal> {
  public readonly nativeKeyMap: ReadonlyMap<unknown, V>;

  constructor(
    public readonly value: ReadonlyMap<K, V>,
    public readonly adapter: CelValAdapter,
    public readonly type_: CelType,
  ) {
    const nativeKeys = new Map<unknown, V>();
    for (const [key, value] of this.value) {
      const celKey = this.adapter.toCel(key);
      if (typeof celKey === "string" || typeof celKey === "bigint") {
        nativeKeys.set(celKey, value);
      } else if (isCelWrap(celKey) || celKey instanceof CelUint) {
        nativeKeys.set(celKey.value, value);
      } else if (celKey instanceof Uint8Array) {
        nativeKeys.set(celKey, value);
      } else if (typeof celKey === "number" && Number.isInteger(celKey)) {
        nativeKeys.set(BigInt(celKey), value);
      } else if (typeof celKey === "boolean") {
        nativeKeys.set(celKey ? 1n : 0n, value);
      } else {
        nativeKeys.set(key, value);
      }
    }
    this.nativeKeyMap = nativeKeys;
  }

  getItems(): CelResult[] {
    const result: CelResult[] = [];
    for (const [key] of this.value) {
      result.push(this.adapter.toCel(key));
    }
    return result;
  }

  accessByIndex(_id: number, index: number | bigint): CelResult | undefined {
    let result = this.nativeKeyMap.get(index);
    if (result === undefined) {
      if (typeof index === "number" && Number.isInteger(index)) {
        result = this.nativeKeyMap.get(BigInt(index));
      }
    }
    if (result === undefined) {
      return undefined;
    }
    return this.adapter.toCel(result);
  }

  isSetByName(_id: number, name: unknown): CelResult<boolean> {
    return this.nativeKeyMap.has(name);
  }

  accessByName(_id: number, name: unknown): CelResult | undefined {
    return this.adapter.toCel(this.nativeKeyMap.get(name));
  }

  getFields(): CelVal[] {
    return [...this.value.keys()].map((k) => this.adapter.toCel(k) as CelVal);
  }
}

export class CelObject implements StructAccess<unknown> {
  constructor(
    public readonly value: object,
    public readonly adapter: CelValAdapter,
    public readonly type_: CelType,
  ) {
    if (isCelVal(value)) {
      throw new Error("Cannot wrap CelVal in CelObject");
    }
  }

  getItems(): CelResult[] {
    const result: CelResult[] = [];
    for (const item of Object.keys(this.value)) {
      result.push(this.adapter.toCel(item));
    }
    return result;
  }

  getFields(): string[] {
    return this.adapter.getFields(this.value);
  }

  isSetByName(id: number, name: string): CelResult<boolean> {
    return this.adapter.isSetByName(id, this.value, name);
  }

  accessByName(id: number, name: string): CelResult | undefined {
    const result = this.adapter.accessByName(id, this.value, name);
    if (result === undefined) {
      return undefined;
    }
    return this.adapter.toCel(result);
  }
  accessByIndex(id: number, index: number | bigint): CelResult | undefined {
    const result = this.adapter.accessByIndex(id, this.value, index);
    if (result === undefined) {
      return undefined;
    }
    return this.adapter.toCel(result);
  }
}

/**
 * The base class for all Cel types.
 *
 * A type is also a value, and can be used as a value in expressions.
 *
 * Two types are equal if they have the same name, and identical if they have
 * the same fullname. For example, the type 'list(int)' is equal, but not
 * identical, to the type 'list(string)', as they both have the same name, 'list'.
 *
 * @abstract
 */
export class CelType {
  readonly fullname_: string | undefined;
  constructor(
    readonly name: string,
    fullname?: string,
  ) {
    if (fullname !== undefined) {
      this.fullname_ = fullname;
    }
  }

  fullname(): string {
    return this.fullname_ === undefined ? this.name : this.fullname_;
  }

  identical(other: CelVal): boolean {
    if (other instanceof CelType) {
      return this.name === other.name && this.fullname_ === other.fullname_;
    }
    return false;
  }

  equals(other: CelVal): boolean {
    if (other instanceof CelType) {
      return this.name === other.name;
    }
    return false;
  }

  compare(other: CelVal): number | undefined {
    if (!(other instanceof CelType)) {
      return undefined;
    }
    if (this.name === other.name) {
      return 0;
    }
    return this.name < other.name ? -1 : 1;
  }
}

export class NumType extends CelType {}

export class ConcreteType extends CelType {
  constructor(
    name: string,
    public readonly EMPTY: CelVal,
  ) {
    super(name);
  }
}

export class WrapperType<_T extends Message> extends CelType {
  constructor(public readonly wrapped: CelType) {
    super(
      "wrapper(" + wrapped.name + ")",
      wrapped.fullname_ === undefined
        ? undefined
        : "wrapper(" + wrapped.fullname_ + ")",
    );
  }
}

export class CelError {
  public additional?: CelError[];
  constructor(
    public readonly id: number,
    public readonly message: string,
  ) {}

  public add(additional: CelError) {
    if (this.additional === undefined) {
      this.additional = [];
    }
    this.additional.push(additional);
  }
}

export class CelUnknown {
  constructor(public readonly ids: readonly bigint[]) {}

  public static merge(unknowns: CelUnknown[]): CelUnknown {
    if (unknowns.length === 0) {
      return new CelUnknown([]);
    }
    if (unknowns.length === 1) {
      return unknowns[0];
    }
    let ids: bigint[] = [];
    for (const unknown of unknowns) {
      ids = ids.concat(unknown.ids);
    }
    return new CelUnknown(ids);
  }
}

export type CelResult<T = CelVal> = T | CelError | CelUnknown;

export function isCelResult(val: unknown): val is CelResult {
  return isCelVal(val) || val instanceof CelError || val instanceof CelUnknown;
}

export function coerceToBool(
  _id: number,
  val: CelResult | undefined,
): CelResult<boolean> {
  if (val instanceof CelError || val instanceof CelUnknown) {
    return val;
  }
  if (
    val === undefined ||
    (typeof val === "boolean" && val === false) ||
    (typeof val === "number" && val === 0) ||
    (typeof val === "bigint" && val === 0n) ||
    (val instanceof CelUint && val.value === 0n)
  ) {
    return false;
  }
  return true;
}

export function coerceToBigInt(
  id: number,
  val: CelResult | undefined,
): CelResult<bigint> {
  if (val instanceof CelError || val instanceof CelUnknown) {
    return val;
  } else if (val === undefined || val === null || val instanceof ProtoNull) {
    return 0n;
  } else if (isCelWrap(val) || val instanceof CelUint) {
    val = val.value;
  }
  if (typeof val === "bigint") {
    return val;
  } else if (typeof val === "number") {
    return BigInt(val);
  }
  return CelErrors.typeMismatch(id, "integer", val);
}

export function coerceToNumber(
  id: number,
  val: CelResult | undefined,
): CelResult<number> {
  if (val instanceof CelError || val instanceof CelUnknown) {
    return val;
  } else if (val === undefined || val === null || val instanceof ProtoNull) {
    return 0;
  } else if (isCelWrap(val) || val instanceof CelUint) {
    val = val.value;
  }
  if (typeof val === "bigint") {
    return Number(val);
  } else if (typeof val === "number") {
    return val;
  }
  return CelErrors.typeMismatch(id, "number", val);
}

export function coerceToString(
  id: number,
  val: CelResult | undefined,
): CelResult<string> {
  if (val instanceof CelError || val instanceof CelUnknown) {
    return val;
  } else if (val === undefined || val === null || val instanceof ProtoNull) {
    return "";
  } else if (isCelWrap(val) || val instanceof CelUint) {
    val = val.value;
  }
  if (typeof val === "string") {
    return val;
  }
  return CelErrors.typeMismatch(id, "string", val);
}

export function coerceToBytes(
  id: number,
  val: CelResult | undefined,
): CelResult<Uint8Array> {
  if (val instanceof CelError || val instanceof CelUnknown) {
    return val;
  } else if (val === undefined || val === null || val instanceof ProtoNull) {
    return new Uint8Array();
  } else if (isCelWrap(val) || val instanceof CelUint) {
    val = val.value;
  }
  if (val instanceof Uint8Array) {
    return val;
  }
  return CelErrors.typeMismatch(id, "bytes", val);
}

export function coerceToValues(args: CelResult[]): CelResult<CelVal[]> {
  const unknowns: CelUnknown[] = [];
  const errors: CelError[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg instanceof CelUnknown) {
      unknowns.push(arg);
    } else if (arg instanceof CelError) {
      errors.push(arg);
    }
  }
  if (unknowns.length > 0) {
    return CelUnknown.merge(unknowns);
  }
  if (errors.length > 0) {
    return CelErrors.merge(errors);
  }
  return args as CelVal[];
}

export class CelErrors {
  static merge(errors: CelError[]): CelError {
    for (let i = 1; i < errors.length; i++) {
      errors[0].add(errors[i]);
    }
    return errors[0];
  }

  static invalidArgument(id: number, func: string, issue: string): CelError {
    return new CelError(id, `invalid argument to function ${func}: ${issue}`);
  }
  static unrecognizedAny(id: number, any: Any): CelError {
    return new CelError(id, `unrecognized any type: ${any.typeUrl}`);
  }
  static typeMismatch(id: number, arg0: string, val: unknown): CelError {
    return new CelError(id, `type mismatch: ${arg0} vs ${typeof val}`);
  }
  static typeNotFound(id: number, type: string): CelError {
    return new CelError(id, `type not found: ${type}`);
  }
  static unresolvedAttr(id: number): CelError {
    return new CelError(id, "unresolved attribute");
  }
  static badStringBytes(id: number, e: string): CelError {
    return new CelError(Number(id), `Failed to decode bytes as string: ${e}`);
  }
  static badTimeStr(id: number, e: string): CelError {
    return new CelError(Number(id), `Failed to parse timestamp: ${e}`);
  }
  static badDurationStr(id: number, e: string): CelError {
    return new CelError(Number(id), `Failed to parse duration: ${e}`);
  }
  static invalidTz(id: number, timezone: string): CelError {
    return new CelError(Number(id), `invalid timezone: ${timezone}`);
  }
  static badTimestamp(id: number, _seconds: bigint, _nanos: number): CelError {
    return new CelError(Number(id), "timestamp out of range");
  }
  static badDuration(id: number, _seconds: bigint, _nanos: number): CelError {
    return new CelError(Number(id), "duration out of range");
  }
  static badIndexAccess(id: number, type: CelType): CelError {
    return new CelError(
      Number(id),
      `index access not supported for ${type.fullname()}`,
    );
  }
  static badStringAccess(id: number, typ: CelType): CelError {
    return new CelError(
      Number(id),
      `${typ.fullname()} cannot be accessed by string`,
    );
  }
  static mapKeyConflict(id: number, key: CelVal): CelError {
    return new CelError(id, `map key conflict: ${String(key)}`);
  }
  static funcNotFound(id: number, func: string): CelError {
    return new CelError(id, `unbound function: ${func}`);
  }
  static identNotFound(id: number, ident: string, namespace: string): CelError {
    return new CelError(
      Number(id),
      `undeclared reference to '${ident}' (in container '${namespace}')`,
    );
  }
  static indexOutOfBounds(id: number, index: number, length: number): CelError {
    return new CelError(id, `index ${index} out of bounds [0, ${length})`);
  }
  static fieldNotFound(
    id: number,
    name: unknown,
    fields: unknown = undefined,
  ): CelError {
    if (fields !== undefined) {
      return new CelError(
        id,
        `field not found: ${String(name)} in ${String(fields)}`,
      );
    }
    return new CelError(id, `field not found: ${String(name)}`);
  }
  static keyNotFound(id: number): CelError {
    return new CelError(id, "key not found");
  }
  static unsupportedKeyType(id: number): CelError {
    return new CelError(id, `unsupported key type`);
  }
  static divisionByZero(id: number, type: NumType): CelError {
    return new CelError(Number(id), `${type.name} divide by zero`);
  }
  static moduloByZero(id: number, type: NumType): CelError {
    return new CelError(Number(id), `${type.name} modulus by zero`);
  }

  static overflow(id: number, op: string, type: CelType): CelError {
    return new CelError(
      Number(id),
      `${type.name} return error for overflow during ${op}`,
    );
  }
  static overloadNotFound(
    id: number,
    name: string,
    types: CelType[],
  ): CelError {
    return new CelError(
      id,
      `found no matching overload for '${name}' applied to '(${types
        .map((x) => x.name)
        .join(", ")})'`,
    );
  }
}
