import { Any, Duration, isMessage, Timestamp } from "@bufbuild/protobuf";

import { ExprValue } from "@bufbuild/cel-spec/cel/expr/eval_pb.js";
import {
  ListValue,
  MapValue,
  MapValue_Entry,
  Value,
} from "@bufbuild/cel-spec/cel/expr/value_pb.js";
import * as type from "../value/type.js";
import {
  CelErrors,
  CelList,
  CelMap,
  CelType,
  CelUint,
  isCelResult,
  isCelVal,
  isCelWrap,
  type CelResult,
  type CelVal,
  type CelValAdapter,
} from "../value/value.js";
import { CEL_ADAPTER } from "./cel.js";

type ExprType = ExprValue | Value | ListValue | MapValue | CelVal;
type ExprResult = CelResult<ExprType>;

export class ExprValAdapter implements CelValAdapter<ExprType> {
  unwrap(val: ExprType): ExprType {
    if (isCelWrap(val)) {
      return CEL_ADAPTER.unwrap(val);
    }
    return val;
  }

  accessByIndex(
    id: number,
    obj: ExprType,
    index: number | bigint,
  ): ExprResult | undefined {
    if (isCelVal(obj)) {
      return CEL_ADAPTER.accessByIndex(id, obj, index);
    } else if (isMessage(obj, ExprValue)) {
      switch (obj.kind.case) {
        case "value":
          return this.accessValueByIndex(id, obj.kind.value, index);
      }
      throw new Error("Method not implemented.");
    } else if (isMessage(obj, Value)) {
      return this.accessValueByIndex(id, obj, index);
    } else if (isMessage(obj, ListValue)) {
      return this.accessListByIndex(id, obj, index);
    } else if (isMessage(obj, MapValue)) {
      return this.accessMapByIndex(id, obj, index);
    }
    throw new Error("Method not implemented.");
  }

  getFields(_value: object): string[] {
    throw new Error("Method not implemented.");
  }

  private accessMapByIndex(
    _id: number,
    _obj: MapValue,
    _index: number | bigint,
  ): ExprResult | undefined {
    throw new Error("Method not implemented.");
  }

  private accessListByIndex(
    _id: number,
    obj: ListValue,
    index: number | bigint,
  ): ExprResult | undefined {
    const i = Number(index);
    if (i < 0 || i >= obj.values.length) {
      return undefined;
    }
    return obj.values[i];
  }

  private accessValueByIndex(id: number, value: Value, index: number | bigint) {
    switch (value.kind.case) {
      case "listValue":
        return this.accessListByIndex(id, value.kind.value, index);
      case "mapValue":
        return this.accessMapByIndex(id, value.kind.value, index);
    }
    return CelErrors.badIndexAccess(id, this.valueToType(value));
  }

  accessByName(
    id: number,
    obj: ExprType,
    name: string,
  ): ExprResult | undefined {
    if (isCelVal(obj)) {
      return CEL_ADAPTER.accessByName(id, obj, name);
    } else if (isMessage(obj, ExprValue)) {
      switch (obj.kind.case) {
        case "value":
          return this.accessValueByName(id, obj.kind.value, name);
      }
      throw new Error("Method not implemented.");
    }
    throw new Error("Method not implemented.");
  }

  private accessValueByName(
    id: number,
    value: Value,
    name: string,
  ): ExprResult | undefined {
    switch (value.kind.case) {
      case "mapValue":
        for (const entry of value.kind.value.entries) {
          if (entry.key?.kind.case === "stringValue") {
            if (entry.key.kind.value === name) {
              return entry.value;
            }
          }
        }
        return undefined;
    }
    return CelErrors.badStringAccess(id, this.valueToType(value));
  }

  private valueToType(value: Value): CelType {
    switch (value.kind.case) {
      case "boolValue":
        return type.BOOL;
      case "int64Value":
        return type.INT;
      case "uint64Value":
        return type.UINT;
      case "doubleValue":
        return type.DOUBLE;
      case "stringValue":
        return type.STRING;
      case "bytesValue":
        return type.BYTES;
      case "mapValue":
        return type.DYN_MAP;
      case "listValue":
        return type.LIST;
      case "nullValue":
        return type.NULL;
      case "typeValue":
        return type.TYPE;
    }
    throw new Error("Method not implemented.");
  }

  toCel(native: ExprType): CelResult {
    if (isCelResult(native)) {
      return native;
    } else if (isMessage(native, ExprValue)) {
      return this.exprResultToCel(native);
    } else if (isMessage(native, Value)) {
      return this.valToCel(native);
    } else if (isMessage(native, ListValue)) {
      return new CelList(native.values, this, type.LIST);
    } else if (isMessage(native, MapValue)) {
      const map = new Map<Value, Value>();
      native.entries.forEach((entry) => {
        if (entry.key === undefined || entry.value === undefined) {
          throw new Error("Invalid map entry: " + entry);
        }
        map.set(entry.key, entry.value);
      });

      return new CelMap(map, this, type.DYN_MAP);
    }
    throw new Error("Unsupported type: " + native);
  }

  fromCel(cel: CelVal): ExprValue {
    return new ExprValue({
      kind: {
        case: "value",
        value: this.celToValue(cel),
      },
    });
  }

  celToValue(cel: CelVal): Value {
    if (typeof cel === "boolean") {
      return new Value({ kind: { case: "boolValue", value: cel } });
    } else if (typeof cel === "bigint") {
      return new Value({
        kind: { case: "int64Value", value: cel },
      });
    } else if (cel instanceof CelUint) {
      return new Value({
        kind: { case: "uint64Value", value: cel.value.valueOf() },
      });
    } else if (typeof cel === "number") {
      return new Value({
        kind: { case: "doubleValue", value: cel },
      });
    } else if (typeof cel === "string") {
      return new Value({
        kind: { case: "stringValue", value: cel },
      });
    } else if (cel instanceof Uint8Array) {
      return new Value({
        kind: { case: "bytesValue", value: cel },
      });
    } else if (cel instanceof CelList) {
      const list = new ListValue();
      cel
        .getItems()
        .forEach((val) => list.values.push(this.celToValue(val as CelVal)));
      return new Value({ kind: { case: "listValue", value: list } });
    } else if (cel instanceof CelMap) {
      const map = new MapValue();
      cel.value.forEach((val, key) => {
        map.entries.push(
          new MapValue_Entry({
            key: this.celToValue(key as CelVal),
            value: this.celToValue(val as CelVal),
          }),
        );
      });
      return new Value({ kind: { case: "mapValue", value: map } });
    } else if (cel === null) {
      return new Value({ kind: { case: "nullValue", value: 0 } });
    } else if (cel instanceof CelType) {
      return new Value({
        kind: { case: "typeValue", value: cel.name },
      });
    }

    throw new Error("Unsupported type: " + cel.constructor.name);
  }

  valueToExprVal(val: Value): ExprValue {
    return new ExprValue({
      kind: {
        case: "value",
        value: val,
      },
    });
  }

  celToExprVal(cel: CelVal): ExprValue {
    const val = new ExprValue();
    if (cel === null) {
      val.kind = {
        case: "value",
        value: new Value({ kind: { case: "nullValue", value: 0 } }),
      };
    }
    return val;
  }

  private exprResultToCel(val: ExprValue): CelResult {
    switch (val.kind.case) {
      case "value":
        return this.valToCel(val.kind.value);
    }
    throw new Error("unimplemented: " + val.kind.case);
  }

  valToCel(val: Value): CelVal {
    switch (val.kind.case) {
      case "nullValue":
        return null;
      case "boolValue":
        return val.kind.value;
      case "bytesValue":
        return val.kind.value;
      case "doubleValue":
        return val.kind.value;
      case "int64Value":
        return val.kind.value;
      case "uint64Value":
        return CelUint.of(val.kind.value);
      case "stringValue":
        return val.kind.value;
      case "listValue":
        return new CelList(val.kind.value.values, this, type.LIST);
      case "objectValue":
        return this.objectToCel(val.kind.value);
      case "mapValue": {
        const map = new Map<CelVal, unknown>();
        for (const entry of val.kind.value.entries) {
          if (entry.key === undefined || entry.value === undefined) {
            throw new Error("Invalid map entry");
          }
          map.set(this.valToCel(entry.key), entry.value);
        }
        return new CelMap(map, this, type.DYN_MAP);
      }
      case "typeValue":
        return new CelType(val.kind.value);
    }
    throw new Error("unimplemented: " + val.kind.case);
  }
  private objectToCel(value: Any): CelVal {
    switch (value.typeUrl) {
      case "type.googleapis.com/google.protobuf.Duration": {
        const val = new Duration();
        value.unpackTo(val);
        return val;
      }
      case "type.googleapis.com/google.protobuf.Timestamp": {
        const ts = new Timestamp();
        value.unpackTo(ts);
        return ts;
      }
    }
    throw new Error("unimplemented: " + value.typeUrl);
  }

  equals(_lhs: ExprValue, _rhs: ExprValue): boolean {
    throw new Error("Method not implemented.");
  }
  compare(_lhs: ExprValue, _rhs: ExprValue): number | undefined {
    throw new Error("Method not implemented.");
  }
}

export const EXPR_VAL_ADAPTER = new ExprValAdapter();
