import { type MessageType } from "@bufbuild/protobuf";

import { type CelVal } from "./value";

// proto3 has typed nulls.
export class ProtoNull {
  constructor(
    public readonly messageType: MessageType,
    public readonly defaultValue: CelVal,
    public value: CelVal = null
  ) {}
}

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
