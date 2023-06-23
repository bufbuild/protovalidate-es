/* eslint-disable no-param-reassign */
import { Duration, Message, Timestamp } from "@bufbuild/protobuf";

import { CelError } from "./error";
import { CelUint } from "./scalar";
import { type CelVal } from "./value";

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
  constructor(readonly name: string, fullname?: string) {
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

export const DYN = new CelType("dyn");

export class ConcreteType extends CelType {
  constructor(name: string, public readonly EMPTY: CelVal) {
    super(name);
  }
}

export class WrapperType<T extends Message<T>> extends CelType {
  constructor(public wrapped: CelType) {
    super(
      "wrapper(" + wrapped.name + ")",
      wrapped.fullname_ === undefined
        ? undefined
        : "wrapper(" + wrapped.fullname_ + ")"
    );
  }
}

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
