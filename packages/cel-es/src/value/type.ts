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

import { CelError } from "./error";
import { CelUint, ProtoNull } from "./scalar";
import { type CelVal, CelType, ConcreteType, WrapperType } from "./value";
import { CelList } from "./list";
import { CelMap } from "./map";
import { CelObject } from "./struct";

export const DYN = new CelType("dyn");
export const NULL = new ConcreteType("null_type", null);
export const BOOL = new ConcreteType("bool", false);
export const WRAP_BOOL = new WrapperType(BOOL);
export const UINT = new ConcreteType("uint", new CelUint(0n));
export const WRAP_UINT = new WrapperType(UINT);
export const INT = new ConcreteType("int", 0n);
export const WRAP_INT = new WrapperType(INT);
export const DOUBLE = new ConcreteType("double", 0);
export const WRAP_DOUBLE = new WrapperType(DOUBLE);
export const STRING = new ConcreteType("string", "");
export const WRAP_STRING = new WrapperType(STRING);
export const BYTES = new ConcreteType("bytes", new Uint8Array());
export const WRAP_BYTES = new WrapperType(BYTES);

class TimestampType extends CelType {
  constructor() {
    super("google.protobuf.Timestamp");
  }

  public from(
    id: number,
    seconds: bigint,
    nanos: number
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
      return CelError.badTimestamp(id, seconds, nanos);
    }
    return new Timestamp({ seconds: seconds, nanos: nanos });
  }
}

export const TIMESTAMP = new TimestampType();

class DurationType extends CelType {
  constructor() {
    super("google.protobuf.Duration");
  }
  public from(id: number, seconds: bigint, nanos: number): Duration | CelError {
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
    if (
      totalNanos > 9223372036854775807n ||
      totalNanos < -9223372036854775808n
    ) {
      return CelError.badDuration(id, seconds, nanos);
    }

    return new Duration({ seconds: seconds, nanos: nanos });
  }
}

export const DURATION = new DurationType();

export class TypeType extends CelType {
  constructor(readonly elemType: CelType | undefined) {
    super(
      "type",
      elemType === undefined ? undefined : "type(" + elemType.fullname() + ")"
    );
  }
}
export const TYPE = new TypeType(undefined);

export class ListType extends CelType {
  constructor(readonly elemType: CelType) {
    super("list", "list(" + elemType.fullname() + ")");
  }
}

export const LIST = new ListType(DYN);
export const LIST_UINT = new ListType(UINT);
export const LIST_INT = new ListType(INT);
export const LIST_DOUBLE = new ListType(DOUBLE);
export const LIST_BOOL = new ListType(BOOL);
export const LIST_STRING = new ListType(STRING);
export const LIST_BYTES = new ListType(BYTES);
export const LIST_TIMESTAMP = new ListType(TIMESTAMP);
export const LIST_DURATION = new ListType(DURATION);
export const LIST_TYPE = new ListType(TYPE);

export class MapType extends CelType {
  constructor(readonly keyType: CelType, readonly valueType: CelType) {
    super(
      "map",
      "map(" + keyType.fullname() + ", " + valueType.fullname() + ")"
    );
  }
}

export const DYN_MAP = new MapType(DYN, DYN);
export const JSON_OBJ = new MapType(STRING, DYN);

export function getCelType(val: CelVal): CelType {
  switch (typeof val) {
    case "boolean":
      return BOOL;
    case "bigint":
      return INT;
    case "number":
      return DOUBLE;
    case "string":
      return STRING;
    case "object":
      if (val === null) {
        return NULL;
      } else if (val instanceof ProtoNull) {
        return getCelType(val.defaultValue);
      } else if (val instanceof Uint8Array) {
        return BYTES;
      } else if (val instanceof Message) {
        if (val instanceof Duration) {
          return DURATION;
        } else if (val instanceof Timestamp) {
          return TIMESTAMP;
        } else if (val instanceof Any) {
          return DYN;
        } else if (val instanceof BoolValue) {
          return WRAP_BOOL;
        } else if (val instanceof UInt64Value) {
          return WRAP_UINT;
        } else if (val instanceof Int64Value) {
          return WRAP_INT;
        } else if (val instanceof DoubleValue) {
          return WRAP_DOUBLE;
        } else if (val instanceof StringValue) {
          return WRAP_STRING;
        } else if (val instanceof BytesValue) {
          return WRAP_BYTES;
        }
      } else if (val instanceof CelList) {
        return val.type_;
      } else if (val instanceof CelUint) {
        return UINT;
      } else if (val instanceof CelMap) {
        return val.type_;
      } else if (val instanceof CelObject) {
        return val.type_;
      } else if (val instanceof CelType) {
        return new TypeType(val);
      }
      break;
    default:
      break;
  }
  throw new Error("Unknown CelVal type");
}
