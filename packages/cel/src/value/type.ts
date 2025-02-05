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

import { isMessage } from "@bufbuild/protobuf";

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

import {
  CelUint,
  ProtoNull,
  CelObject,
  type CelVal,
  CelType,
  ConcreteType,
  WrapperType,
  CelList,
  CelMap,
} from "./value.js";

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
export const TIMESTAMP = new CelType("google.protobuf.Timestamp");
export const DURATION = new CelType("google.protobuf.Duration");

export class TypeType extends CelType {
  constructor(readonly elemType: CelType | undefined) {
    super(
      "type",
      elemType === undefined ? undefined : "type(" + elemType.fullname() + ")",
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
  constructor(
    readonly keyType: CelType,
    readonly valueType: CelType,
  ) {
    super(
      "map",
      "map(" + keyType.fullname() + ", " + valueType.fullname() + ")",
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
      } else if (isMessage(val)) {
        if (isMessage(val, DurationSchema)) {
          return DURATION;
        } else if (isMessage(val, TimestampSchema)) {
          return TIMESTAMP;
        } else if (isMessage(val, AnySchema)) {
          return DYN;
        } else if (isMessage(val, BoolValueSchema)) {
          return WRAP_BOOL;
        } else if (isMessage(val, UInt64ValueSchema)) {
          return WRAP_UINT;
        } else if (isMessage(val, Int64ValueSchema)) {
          return WRAP_INT;
        } else if (isMessage(val, DoubleValueSchema)) {
          return WRAP_DOUBLE;
        } else if (isMessage(val, StringValueSchema)) {
          return WRAP_STRING;
        } else if (isMessage(val, BytesValueSchema)) {
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

export const WK_PROTO_TYPES = new Map<string, CelType>();
WK_PROTO_TYPES.set("google.protobuf.Value", DYN);
WK_PROTO_TYPES.set("google.protobuf.Struct", JSON_OBJ);
WK_PROTO_TYPES.set("google.protobuf.ListValue", LIST);
WK_PROTO_TYPES.set("google.protobuf.NullValue", NULL);
WK_PROTO_TYPES.set("google.protobuf.BoolValue", BOOL);
WK_PROTO_TYPES.set("google.protobuf.UInt32Value", WRAP_UINT);
WK_PROTO_TYPES.set("google.protobuf.UInt64Value", WRAP_UINT);
WK_PROTO_TYPES.set("google.protobuf.Int32Value", WRAP_INT);
WK_PROTO_TYPES.set("google.protobuf.Int64Value", WRAP_INT);
WK_PROTO_TYPES.set("google.protobuf.FloatValue", WRAP_DOUBLE);
WK_PROTO_TYPES.set("google.protobuf.DoubleValue", WRAP_DOUBLE);
WK_PROTO_TYPES.set("google.protobuf.StringValue", WRAP_STRING);
WK_PROTO_TYPES.set("google.protobuf.BytesValue", WRAP_BYTES);
WK_PROTO_TYPES.set("google.protobuf.Timestamp", TIMESTAMP);
WK_PROTO_TYPES.set("google.protobuf.Duration", DURATION);
WK_PROTO_TYPES.set("google.protobuf.Any", DYN);
