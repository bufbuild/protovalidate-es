import { type CelValAdapter } from "./adapter";
import { CelMap } from "./map";
import { CelObject } from "./struct";
import * as type from "./type";
import { CelType, type CelResult } from "./value";

export interface CelValProvider {
  /** The adapter used to produce values from this provider. */
  readonly adapter: CelValAdapter;
  /** Create a new value of the given type, from the given obj. */
  newValue(
    id: number,
    typeName: string,
    obj: CelObject | CelMap
  ): CelResult | undefined;
  findType(candidate: string): CelType | undefined;
  findIdent(id: number, ident: string): CelResult | undefined;
}

export const WK_PROTO_TYPES = new Map<string, CelType>();
WK_PROTO_TYPES.set("google.protobuf.Value", type.DYN);
WK_PROTO_TYPES.set("google.protobuf.Struct", type.JSON_OBJ);
WK_PROTO_TYPES.set("google.protobuf.ListValue", type.LIST);
WK_PROTO_TYPES.set("google.protobuf.NullValue", type.NULL);
WK_PROTO_TYPES.set("google.protobuf.BoolValue", type.BOOL);
WK_PROTO_TYPES.set("google.protobuf.UInt32Value", type.WRAP_UINT);
WK_PROTO_TYPES.set("google.protobuf.UInt64Value", type.WRAP_UINT);
WK_PROTO_TYPES.set("google.protobuf.Int32Value", type.WRAP_INT);
WK_PROTO_TYPES.set("google.protobuf.Int64Value", type.WRAP_INT);
WK_PROTO_TYPES.set("google.protobuf.FloatValue", type.WRAP_DOUBLE);
WK_PROTO_TYPES.set("google.protobuf.DoubleValue", type.WRAP_DOUBLE);
WK_PROTO_TYPES.set("google.protobuf.StringValue", type.WRAP_STRING);
WK_PROTO_TYPES.set("google.protobuf.BytesValue", type.WRAP_BYTES);
WK_PROTO_TYPES.set("google.protobuf.Timestamp", type.TIMESTAMP);
WK_PROTO_TYPES.set("google.protobuf.Duration", type.DURATION);
WK_PROTO_TYPES.set("google.protobuf.Any", type.DYN);
