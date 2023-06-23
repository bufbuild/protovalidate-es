/* eslint-disable no-param-reassign */
import {
  Any,
  BoolValue,
  BytesValue,
  DoubleValue,
  Duration,
  Int64Value,
  Message,
  StringValue,
  Timestamp,
  UInt64Value,
} from "@bufbuild/protobuf";

import { type CelValAdapter, type Unwrapper } from "./adapter";
import { CelError, CelUnknown } from "./error";
import { CelList } from "./list";
import { CelMap } from "./map";
import { CelUint, ProtoNull } from "./scalar";
import { CelObject } from "./struct";
import * as type from "./type";

/** Cel Number types, which all existing on the same logical number line. */
export type CelNum = bigint | CelUint | number;
export function isCelNum(val: unknown): val is CelNum {
  return (
    typeof val === "bigint" || val instanceof CelUint || typeof val === "number"
  );
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
    val instanceof Int64Value ||
    val instanceof UInt64Value ||
    val instanceof DoubleValue
  );
}

/** Protobuf wrappers for all primitive types, which can be 'null'  */
export type CelWrap = BoolValue | CelWrapNum | StringValue | BytesValue;
export function isCelWrap(val: unknown): val is CelWrap {
  return (
    val instanceof BoolValue ||
    isCelWrapNum(val) ||
    val instanceof StringValue ||
    val instanceof BytesValue
  );
}

/** All cel types that are also protobuf messages */
export type CelMsg = CelWrap | Timestamp | Duration | Any;
export function isCelMsg(val: unknown): val is CelMsg {
  return (
    isCelWrap(val) ||
    val instanceof Timestamp ||
    val instanceof Duration ||
    val instanceof Any
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
  | type.CelType;

export function isCelVal(val: unknown): val is CelVal {
  return (
    val === null ||
    val instanceof ProtoNull ||
    isCelPrim(val) ||
    isCelMsg(val) ||
    val instanceof CelList ||
    val instanceof CelMap ||
    val instanceof CelObject ||
    val instanceof type.CelType
  );
}

export function getCelType(val: CelVal): type.CelType {
  switch (typeof val) {
    case "boolean":
      return type.BOOL;
    case "bigint":
      return type.INT;
    case "number":
      return type.DOUBLE;
    case "string":
      return type.STRING;
    case "object":
      if (val === null) {
        return type.NULL;
      } else if (val instanceof ProtoNull) {
        return getCelType(val.defaultValue);
      } else if (val instanceof Uint8Array) {
        return type.BYTES;
      } else if (val instanceof Message) {
        if (val instanceof Duration) {
          return type.DURATION;
        } else if (val instanceof Timestamp) {
          return type.TIMESTAMP;
        } else if (val instanceof Any) {
          return type.DYN;
        } else if (val instanceof BoolValue) {
          return type.WRAP_BOOL;
        } else if (val instanceof UInt64Value) {
          return type.WRAP_UINT;
        } else if (val instanceof Int64Value) {
          return type.WRAP_INT;
        } else if (val instanceof DoubleValue) {
          return type.WRAP_DOUBLE;
        } else if (val instanceof StringValue) {
          return type.WRAP_STRING;
        } else if (val instanceof BytesValue) {
          return type.WRAP_BYTES;
        }
      } else if (val instanceof CelList) {
        return val.type_;
      } else if (val instanceof CelUint) {
        return type.UINT;
      } else if (val instanceof CelMap) {
        return val.type_;
      } else if (val instanceof CelObject) {
        return val.type_;
      } else if (val instanceof type.CelType) {
        return new type.TypeType(val);
      }
      break;
    default:
      break;
  }
  throw new Error("Unknown CelVal type");
}

export type CelResult<T = CelVal> = T | CelError | CelUnknown;

export function isCelResult(val: unknown): val is CelResult {
  return isCelVal(val) || val instanceof CelError || val instanceof CelUnknown;
}

export function coerceToBool(
  id: number,
  val: CelResult | undefined
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
  val: CelResult | undefined
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
  return CelError.typeMismatch(id, "integer", val);
}

export function coerceToNumber(
  id: number,
  val: CelResult | undefined
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
  return CelError.typeMismatch(id, "number", val);
}

export function coerceToString(
  id: number,
  val: CelResult | undefined
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
  return CelError.typeMismatch(id, "string", val);
}

export function coerceToBytes(
  id: number,
  val: CelResult | undefined
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
  return CelError.typeMismatch(id, "bytes", val);
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
    return CelError.merge(errors);
  }
  return args as CelVal[];
}

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
