import { type CelResult, type CelVal, CelError, CelUnknown } from "./value";

export interface Unwrapper<V = unknown> {
  unwrap(val: V): V;
}

export interface CelValAdapter<V = unknown> extends Unwrapper<V> {
  toCel(native: CelResult<V>): CelResult;
  fromCel: (cel: CelVal) => CelResult<V>;

  equals(lhs: V, rhs: V): CelResult<boolean>;
  compare(lhs: V, rhs: V): CelResult<number> | undefined;

  accessByName(id: number, obj: V, name: string): CelResult<V> | undefined;
  accessByIndex(
    id: number,
    obj: V,
    index: number | bigint
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

/** A value bundled with it's associated adapter. */
export class RawVal<V = unknown> {
  constructor(public readonly adapter: CelValAdapter<V>, public value: V) {
    if (adapter === undefined) {
      throw new Error("Adapter cannot be undefined");
    }
    if (value === undefined) {
      throw new Error("RawVal cannot be undefined");
    }
  }

  static unwrap<V = unknown>(
    raw: RawResult<V> | undefined
  ): CelResult<V> | undefined {
    if (
      raw instanceof CelError ||
      raw instanceof CelUnknown ||
      raw === undefined
    ) {
      return raw;
    }
    return raw.value;
  }

  static of<V>(adapter: CelValAdapter<V>, value: CelResult<V>): RawResult<V> {
    if (value instanceof CelError || value instanceof CelUnknown) {
      return value;
    }
    return new RawVal(adapter, value);
  }

  static if<V>(
    adapter: CelValAdapter<V>,
    value: CelResult<V> | undefined
  ): RawResult<V> | undefined {
    if (value === undefined) {
      return undefined;
    }
    return RawVal.of(adapter, value);
  }
}

export type RawResult<V = unknown> = CelResult<RawVal<V>>;

export function unwrapValues<V = CelVal>(
  args: V[],
  adapter: CelValAdapter<V>
): V[] {
  return args.map((arg) => {
    return adapter.unwrap(arg);
  });
}

export function unwrapResults<V = CelVal>(
  args: CelResult<V>[],
  unwrapper: Unwrapper
) {
  const unknowns: CelUnknown[] = [];
  const errors: CelError[] = [];
  const vals: V[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg instanceof CelUnknown) {
      unknowns.push(arg);
    } else if (arg instanceof CelError) {
      errors.push(arg);
    } else {
      vals.push(unwrapper.unwrap(arg) as V);
    }
  }
  if (unknowns.length > 0) {
    return CelUnknown.merge(unknowns);
  }
  if (errors.length > 0) {
    return CelError.merge(errors);
  }
  return vals;
}
