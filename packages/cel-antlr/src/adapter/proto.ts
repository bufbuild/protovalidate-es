import {
  Any,
  type AnyMessage,
  BoolValue,
  BytesValue,
  DoubleValue,
  type EnumType,
  type FieldInfo,
  FloatValue,
  Int32Value,
  Int64Value,
  Message,
  type MessageType,
  ScalarType,
  StringValue,
  UInt32Value,
  UInt64Value,
  Value,
  type IMessageTypeRegistry,
  isMessage,
} from "@bufbuild/protobuf";

import { EMPTY_PROVIDER } from "../value/empty.js";
import { type CelValProvider } from "../value/provider.js";
import * as type from "../value/type.js";
import {
  type CelValAdapter,
  type StructAccess,
  CelList,
  type CelResult,
  type CelVal,
  CelMap,
  coerceToBigInt,
  coerceToBool,
  coerceToBytes,
  coerceToNumber,
  coerceToString,
  isCelMsg,
  isCelWrap,
  CelType,
  CelError,
  CelUnknown,
  CelObject,
  CelUint,
  ProtoNull,
  CelErrors,
} from "../value/value.js";
import { CEL_ADAPTER } from "./cel.js";
import { NATIVE_ADAPTER } from "./native.js";

type ProtoValue = CelVal | Message;
type ProtoResult = CelResult<ProtoValue>;

export function isProtoMsg(val: unknown): val is Message {
  return isMessage(val) && !isCelMsg(val);
}

/** Extends the Cel type system to include arbitrary protobuf messages. */
export class ProtoValAdapter implements CelValAdapter {
  private readonly metadataCache = new Map<string, ProtoMetadata>();

  constructor(public readonly registry: IMessageTypeRegistry) {}

  unwrap(val: ProtoValue): ProtoValue {
    if (isCelWrap(val)) {
      return CEL_ADAPTER.unwrap(val);
    }
    return val;
  }

  public getMetadata(messageTypeName: string) {
    const messageSchema = this.registry.findMessage(messageTypeName);
    if (!messageSchema) {
      throw new Error(`Message ${messageTypeName} not found in registry`);
    }
    let metadata = this.metadataCache.get(messageTypeName);
    if (metadata === undefined) {
      metadata = new ProtoMetadata(messageSchema, this);
      this.metadataCache.set(messageTypeName, metadata);
    }
    return metadata;
  }

  equals(lhs: ProtoValue, rhs: ProtoValue): CelResult<boolean> {
    if (isProtoMsg(lhs)) {
      if (!isMessage(rhs)) {
        return false;
      }
      if (lhs.getType().typeName !== rhs.getType().typeName) {
        return false;
      }
      const messageTypeName = lhs.getType().typeName;
      const messageSchema = this.registry.findMessage(messageTypeName);
      if (!messageSchema) {
        throw new Error(`Message ${messageTypeName} not found in registry`);
      }
      // TODO(tstamm) for equality following the CEL-spec, use protobuf-es v2.2.3 options, see https://github.com/bufbuild/protobuf-es/pull/1029
      return messageSchema.equals(lhs, rhs);
    } else if (isProtoMsg(rhs)) {
      return false;
    }
    return CEL_ADAPTER.equals(lhs, rhs);
  }

  compare(lhs: ProtoValue, rhs: ProtoValue): CelResult<number> | undefined {
    if (isProtoMsg(lhs) || isProtoMsg(rhs)) {
      return undefined;
    }
    return CEL_ADAPTER.compare(lhs, rhs);
  }

  toCel(native: ProtoValue): CelResult {
    if (isMessage(native, Any)) {
      if (native.typeUrl === "") {
        // TODO(tstamm) defer unpacking so we can provide an id
        return new CelError(-1, `Unpack Any failed: invalid empty type_url`);
      }
      const unpacked = native.unpack(this.registry);
      if (!unpacked) {
        // TODO(tstamm) defer unpacking so we can provide an id
        return new CelError(
          -1,
          `Unpack Any failed: type_url ${native.typeUrl} not in registry`,
        );
      }
      return this.toCel(unpacked);
    }

    if (isProtoMsg(native) && !isCelMsg(native)) {
      if (isMessage(native, UInt32Value)) {
        return new UInt64Value({
          value: BigInt(native.value),
        });
      }
      if (isMessage(native, Int32Value)) {
        return new Int64Value({
          value: BigInt(native.value),
        });
      }
      if (isMessage(native, FloatValue)) {
        return new DoubleValue({
          value: native.value,
        });
      }
      return new CelObject(
        native,
        this,
        this.getMetadata(native.getType().typeName).TYPE,
      );
    }
    return CEL_ADAPTER.toCel(native);
  }

  fromCel(cel: CelVal): ProtoResult {
    return cel;
  }

  accessByName(
    id: number,
    obj: AnyMessage,
    name: string,
  ): ProtoResult | undefined {
    if (isProtoMsg(obj)) {
      const fields = this.getMetadata(obj.getType().typeName).FIELDS;
      const field = fields.get(name);
      if (field === undefined) {
        return CelErrors.fieldNotFound(id, name, fields.keys());
      }
      let result: ProtoResult | undefined;
      if (field.oneof !== undefined) {
        const oneofVal = obj[field.oneof.localName];
        if (oneofVal !== undefined && oneofVal.case === field.localName) {
          result = oneofVal[field.localName];
        }
      } else {
        result = obj[field.localName];
      }
      return this.accessProtoField(field, result);
    }
    return CEL_ADAPTER.accessByName(id, obj, name);
  }

  getFields(value: object): string[] {
    if (isProtoMsg(value)) {
      return this.getMetadata(value.getType().typeName).FIELD_NAMES;
    }
    return CEL_ADAPTER.getFields(value);
  }

  accessByIndex(
    id: number,
    obj: ProtoValue,
    index: number | bigint,
  ): ProtoResult | undefined {
    if (isProtoMsg(obj)) {
      return undefined;
    }
    return CEL_ADAPTER.accessByIndex(id, obj, index);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- proto type system too complex
  accessProtoField(field: FieldInfo, value: any): ProtoResult | undefined {
    if (field.repeated) {
      return this.accessProtoRepeatedField(field, value);
    }
    switch (field.kind) {
      case "scalar":
        switch (field.T) {
          case ScalarType.UINT32:
          case ScalarType.UINT64:
          case ScalarType.FIXED32:
          case ScalarType.FIXED64:
            return new CelUint(BigInt(value ?? 0n));
          case ScalarType.INT32:
          case ScalarType.INT64:
          case ScalarType.SINT32:
          case ScalarType.SINT64:
          case ScalarType.SFIXED32:
          case ScalarType.SFIXED64:
            return BigInt(value ?? 0n);
          default:
            return value;
        }
      case "enum":
        return value;
      case "message":
        if (value === undefined) {
          return this.getMetadata(field.T.typeName).NULL;
        } else if (isMessage(value)) {
          return value;
        } else if (value instanceof CelObject) {
          return value;
        }
        throw new Error("Unexpected message type: " + value.constructor.name);
      case "map":
        return new CelObject(
          value ?? {},
          this,
          new type.MapType(getScalarType(field.K), getType(field.V)),
        );
      default:
        throw new Error("Unexpected field kind");
    }
  }
  private accessProtoRepeatedField(
    field: FieldInfo,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- proto type system too complex
    value: any[] | undefined,
  ): ProtoResult | undefined {
    switch (field.kind) {
      case "scalar":
        switch (field.T) {
          case ScalarType.BOOL:
            return new CelList(value || [], this, type.LIST_BOOL);
          case ScalarType.UINT32:
          case ScalarType.UINT64:
          case ScalarType.FIXED32:
          case ScalarType.FIXED64:
            return new CelList(
              value?.map((v) => new CelUint(BigInt(v))) ?? [],
              this,
              type.LIST_UINT,
            );
          case ScalarType.INT32:
          case ScalarType.SINT32:
          case ScalarType.SFIXED32:
            return new CelList(
              value?.map((v) => BigInt(v)) ?? [],
              this,
              type.LIST_INT,
            );
          case ScalarType.INT64:
          case ScalarType.SINT64:
          case ScalarType.SFIXED64:
            return new CelList(value ?? [], this, type.LIST_INT);
          case ScalarType.FLOAT:
          case ScalarType.DOUBLE:
            return new CelList(value ?? [], this, type.LIST_DOUBLE);
          case ScalarType.STRING:
            return new CelList(value ?? [], this, type.LIST_STRING);
          case ScalarType.BYTES:
            return new CelList(value ?? [], this, type.LIST_BYTES);
          default:
            break;
        }
        break;
      case "message":
        return new CelList(
          value ?? [],
          this,
          new type.ListType(new CelType(field.T.typeName)),
        );
      case "enum":
        return new CelList(
          value ?? [],
          this,
          new type.ListType(new CelType(field.T.typeName)),
        );
      default:
        throw new Error("Method not implemented.");
    }
    return undefined;
  }

  messageFromCel(id: number, mtype: MessageType, val: CelResult): CelResult {
    if (val instanceof CelError || val instanceof CelUnknown) {
      return val;
    }

    switch (mtype.typeName) {
      case Any.typeName:
      case Value.typeName:
        return val;
      case BoolValue.typeName: {
        const cval = coerceToBool(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new BoolValue({ value: cval });
      }
      case UInt32Value.typeName: {
        const cval = coerceToNumber(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new UInt32Value({ value: cval });
      }
      case UInt64Value.typeName: {
        const cval = coerceToBigInt(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new UInt64Value({ value: cval.valueOf() });
      }
      case Int32Value.typeName: {
        const cval = coerceToNumber(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new Int32Value({ value: cval });
      }
      case Int64Value.typeName: {
        const cval = coerceToBigInt(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new Int64Value({ value: cval.valueOf() });
      }
      case FloatValue.typeName: {
        const cval = coerceToNumber(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new FloatValue({ value: cval });
      }
      case DoubleValue.typeName: {
        const cval = coerceToNumber(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new DoubleValue({ value: cval });
      }
      case StringValue.typeName: {
        const cval = coerceToString(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new StringValue({ value: cval });
      }
      case BytesValue.typeName: {
        const cval = coerceToBytes(id, val);
        if (cval instanceof CelError || cval instanceof CelUnknown) {
          return cval;
        }
        return new BytesValue({ value: cval });
      }
      default:
        break;
    }

    if (val instanceof CelObject || val instanceof CelMap) {
      return this.messageFromStruct(id, mtype, val);
    } else if (val instanceof ProtoNull) {
      return val;
    }
    throw new Error("not implemented.");
  }

  // @ts-expect-error unused
  private valueFromCel(_id: number, celVal: CelVal): CelResult<CelObject> {
    const val = new Value();
    switch (typeof celVal) {
      case "boolean":
        val.kind = { case: "boolValue", value: celVal };
        break;
      case "number":
        val.kind = { case: "numberValue", value: celVal };
        break;
      case "bigint":
        val.kind = { case: "numberValue", value: Number(celVal) };
        break;
      case "string":
        val.kind = { case: "stringValue", value: celVal };
        break;
      case "object":
        if (celVal === null) {
          val.kind = { case: "nullValue", value: 0 };
        }
        break;
      default:
        throw new Error("not implemented.");
    }
    return new CelObject(val, this, type.DYN);
  }

  private messageFromStruct(
    id: number,
    mtype: MessageType,
    obj: StructAccess,
  ): CelResult {
    const fields = this.getMetadata(mtype.typeName).FIELDS;
    const result = new mtype();
    const keys = obj.getFields();
    for (const key of keys) {
      const field = fields.get(key as string);
      if (field === undefined) {
        return CelErrors.fieldNotFound(id, key, Array.from(fields.keys()));
      }
      const val = obj.accessByName(id, key);
      if (val === undefined) {
        continue;
      } else if (val instanceof CelError || val instanceof CelUnknown) {
        return val;
      }
      const fval = field.repeated
        ? this.valueFromRepeated(id, field, val)
        : this.valueFromSingle(id, field, val);
      if (fval instanceof CelError || fval instanceof CelUnknown) {
        return fval;
      } else if (!(fval instanceof ProtoNull)) {
        result[field.localName] = fval;
      }
    }
    if (isCelMsg(result)) {
      return result;
    }
    return new CelObject(
      result,
      this,
      this.getMetadata(result.getType().typeName).TYPE,
    );
  }

  private valueFromRepeated(
    _id: number,
    _field: FieldInfo,
    val: CelResult,
  ): CelResult<unknown[]> {
    if (val instanceof CelList) {
      const result: unknown[] = [];
      for (const item of val.value) {
        const fval = val.adapter.toCel(item);
        if (fval instanceof CelError || fval instanceof CelUnknown) {
          return fval;
        }
        result.push(this.fromCel(fval));
      }
      return result;
    }
    throw new Error("Method not implemented.");
  }

  private valueFromSingle(id: number, field: FieldInfo, val: CelVal): unknown {
    switch (field.kind) {
      case "scalar":
        return NATIVE_ADAPTER.fromCel(val);
      case "enum":
        return NATIVE_ADAPTER.fromCel(val);
      case "message":
        return this.messageFromCel(id, field.T, val);
      case "map":
        return this.mapFromCel(id, field, val);
      default:
        throw new Error("Method not implemented.");
    }
  }

  private mapFromCel(id: number, field: FieldInfo, val: CelVal): object {
    if (field.kind !== "map") {
      throw new Error("unexpected field kind: " + field.kind);
    }
    if (val instanceof CelMap || val instanceof CelObject) {
      const result: { [key: string | number]: unknown } = {};
      const keys = val.getFields();
      for (const key of keys) {
        const fval = val.accessByName(id, key as string);
        if (fval === undefined) {
          continue;
        } else if (fval instanceof CelError || fval instanceof CelUnknown) {
          return fval;
        }
        const pkey = this.fromCel(key) as number | string;
        const pval = this.fromCel(fval);
        result[pkey] = pval;
      }
      return result;
    }
    throw new Error("not implemented.");
  }
}

class ProtoMetadata {
  public readonly DEFAULT_PROTO: AnyMessage;
  public readonly DEFAULT_CEL: CelVal;
  public readonly TYPE: CelType;
  NULL: ProtoNull;

  public readonly FIELDS: Map<string, FieldInfo>;
  public readonly FIELD_NAMES: string[];

  constructor(
    public readonly messageType: MessageType,
    adapter: ProtoValAdapter,
  ) {
    this.DEFAULT_PROTO = new messageType();
    const wk_type = type.WK_PROTO_TYPES.get(messageType.typeName);
    if (wk_type !== undefined) {
      this.TYPE = wk_type;
      switch (messageType.typeName) {
        case FloatValue.typeName:
          this.DEFAULT_CEL = new DoubleValue();
          break;
        case UInt32Value.typeName:
          this.DEFAULT_CEL = new UInt64Value();
          break;
        case Int32Value.typeName:
          this.DEFAULT_CEL = new Int64Value();
          break;
        default:
          this.DEFAULT_CEL = this.DEFAULT_PROTO as CelVal;
          break;
      }
    } else {
      this.TYPE = new CelType(messageType.typeName);
      this.DEFAULT_CEL = new CelObject(this.DEFAULT_PROTO, adapter, this.TYPE);
    }

    this.NULL = new ProtoNull(messageType.typeName, this.DEFAULT_CEL);
    this.FIELD_NAMES = messageType.fields.list().map((f) => f.name);
    this.FIELDS = new Map();
    for (const field of messageType.fields.list()) {
      this.FIELDS.set(field.name, field);
    }
  }
}

export class ProtoValProvider implements CelValProvider<ProtoValue> {
  constructor(public adapter: ProtoValAdapter) {}

  newValue(
    id: number,
    typeName: string,
    obj: CelObject | CelMap,
  ): CelResult | undefined {
    const result = EMPTY_PROVIDER.newValue(id, typeName, obj);
    if (result !== undefined) {
      return result;
    }
    const messageType = this.adapter.registry.findMessage(typeName);
    if (messageType === undefined) {
      return undefined;
    }
    return this.adapter.messageFromCel(id, messageType, obj);
  }

  findType(candidate: string): CelType | undefined {
    const result = EMPTY_PROVIDER.findType(candidate);
    if (result !== undefined) {
      return result;
    }
    if (this.adapter.registry.findMessage(candidate) !== undefined) {
      return new CelType(candidate);
    }
    return undefined;
  }

  findIdent(id: number, ident: string): CelResult | undefined {
    return EMPTY_PROVIDER.findIdent(id, ident);
  }
}

function getScalarType(K: ScalarType): CelType {
  switch (K) {
    case ScalarType.BOOL:
      return type.BOOL;
    case ScalarType.UINT32:
    case ScalarType.UINT64:
    case ScalarType.FIXED32:
    case ScalarType.FIXED64:
      return type.UINT;
    case ScalarType.INT32:
    case ScalarType.INT64:
    case ScalarType.SINT32:
    case ScalarType.SINT64:
    case ScalarType.SFIXED32:
    case ScalarType.SFIXED64:
      return type.INT;
    case ScalarType.FLOAT:
    case ScalarType.DOUBLE:
      return type.DOUBLE;
    case ScalarType.STRING:
      return type.STRING;
    case ScalarType.BYTES:
      return type.BYTES;
    default:
      throw new Error("not implemented.");
  }
}

function getType(
  V:
    | { readonly kind: "scalar"; readonly T: ScalarType }
    | { readonly kind: "enum"; readonly T: EnumType }
    | { readonly kind: "message"; readonly T: MessageType<AnyMessage> },
): CelType {
  switch (V.kind) {
    case "scalar":
      return getScalarType(V.T);
    case "enum":
      return new CelType(V.T.typeName);
    case "message":
      return new CelType(V.T.typeName);
    default:
      throw new Error("not implemented.");
  }
}
