import { Any, Duration, Timestamp } from "@bufbuild/protobuf";

import { eval_pb, value_pb } from "@bufbuild/cel-es-proto";
import { CelValAdapter } from "../value/adapter";
import { CelError } from "../value/error";
import { CelList } from "../value/list";
import { CelMap } from "../value/map";
import { CelUint } from "../value/scalar";
import * as type from "../value/type";
import {
  CelResult,
  CelVal,
  isCelResult,
  isCelVal,
  isCelWrap,
} from "../value/value";
import { CEL_ADAPTER } from "./cel";

type ExprType =
  | eval_pb.ExprValue
  | value_pb.Value
  | value_pb.ListValue
  | value_pb.MapValue
  | CelVal;
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
    index: number | bigint
  ): ExprResult | undefined {
    if (isCelVal(obj)) {
      return CEL_ADAPTER.accessByIndex(id, obj, index);
    } else if (obj instanceof eval_pb.ExprValue) {
      switch (obj.kind.case) {
        case "value":
          return this.accessValueByIndex(id, obj.kind.value, index);
      }
      throw new Error("Method not implemented.");
    } else if (obj instanceof value_pb.Value) {
      return this.accessValueByIndex(id, obj, index);
    } else if (obj instanceof value_pb.ListValue) {
      return this.accessListByIndex(id, obj, index);
    } else if (obj instanceof value_pb.MapValue) {
      return this.accessMapByIndex(id, obj, index);
    }
    throw new Error("Method not implemented.");
  }

  getFields(_value: object): string[] {
    throw new Error("Method not implemented.");
  }

  accessMapByIndex(
    _id: number,
    _obj: value_pb.MapValue,
    _index: number | bigint
  ): ExprResult | undefined {
    throw new Error("Method not implemented.");
  }

  accessListByIndex(
    _id: number,
    obj: value_pb.ListValue,
    index: number | bigint
  ): ExprResult | undefined {
    const i = Number(index);
    if (i < 0 || i >= obj.values.length) {
      return undefined;
    }
    return obj.values[i];
  }

  accessValueByIndex(
    id: number,
    value: value_pb.Value,
    index: number | bigint
  ) {
    switch (value.kind.case) {
      case "listValue":
        return this.accessListByIndex(id, value.kind.value, index);
      case "mapValue":
        return this.accessMapByIndex(id, value.kind.value, index);
    }
    return CelError.badIndexAccess(id, this.valueToType(value));
  }

  accessByName(
    id: number,
    obj: ExprType,
    name: string
  ): ExprResult | undefined {
    if (isCelVal(obj)) {
      return CEL_ADAPTER.accessByName(id, obj, name);
    } else if (obj instanceof eval_pb.ExprValue) {
      switch (obj.kind.case) {
        case "value":
          return this.accessValueByName(id, obj.kind.value, name);
      }
      throw new Error("Method not implemented.");
    }
    throw new Error("Method not implemented.");
  }

  accessValueByName(
    id: number,
    value: value_pb.Value,
    name: string
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
    return CelError.badStringAccess(id, this.valueToType(value));
  }

  valueToType(value: value_pb.Value): type.CelType {
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
    } else if (native instanceof eval_pb.ExprValue) {
      return this.exprResultToCel(native);
    } else if (native instanceof value_pb.Value) {
      return this.valToCel(native);
    } else if (native instanceof value_pb.ListValue) {
      return new CelList(native.values, this);
    } else if (native instanceof value_pb.MapValue) {
      const map = new Map<value_pb.Value, value_pb.Value>();
      native.entries.forEach((entry) => {
        if (entry.key === undefined || entry.value === undefined) {
          throw new Error("Invalid map entry: " + entry);
        }
        map.set(entry.key, entry.value);
      });

      return new CelMap(map, this);
    }
    throw new Error("Unsupported type: " + native);
  }

  fromCel(cel: CelVal): eval_pb.ExprValue {
    return new eval_pb.ExprValue({
      kind: {
        case: "value",
        value: this.celToValue(cel),
      },
    });
  }

  celToValue(cel: CelVal): value_pb.Value {
    if (typeof cel === "boolean") {
      return new value_pb.Value({ kind: { case: "boolValue", value: cel } });
    } else if (typeof cel === "bigint") {
      return new value_pb.Value({
        kind: { case: "int64Value", value: cel },
      });
    } else if (cel instanceof CelUint) {
      return new value_pb.Value({
        kind: { case: "uint64Value", value: cel.value.valueOf() },
      });
    } else if (typeof cel === "number") {
      return new value_pb.Value({
        kind: { case: "doubleValue", value: cel },
      });
    } else if (typeof cel === "string") {
      return new value_pb.Value({
        kind: { case: "stringValue", value: cel },
      });
    } else if (cel instanceof Uint8Array) {
      return new value_pb.Value({
        kind: { case: "bytesValue", value: cel },
      });
    } else if (cel instanceof CelList) {
      const list = new value_pb.ListValue();
      cel
        .getItems()
        .forEach((val) => list.values.push(this.celToValue(val as CelVal)));
      return new value_pb.Value({ kind: { case: "listValue", value: list } });
    } else if (cel instanceof CelMap) {
      const map = new value_pb.MapValue();
      cel.value.forEach((val, key) => {
        map.entries.push(
          new value_pb.MapValue_Entry({
            key: this.celToValue(key as CelVal),
            value: this.celToValue(val as CelVal),
          })
        );
      });
      return new value_pb.Value({ kind: { case: "mapValue", value: map } });
    } else if (cel === null) {
      return new value_pb.Value({ kind: { case: "nullValue", value: 0 } });
    } else if (cel instanceof type.CelType) {
      return new value_pb.Value({
        kind: { case: "typeValue", value: cel.name },
      });
    }

    throw new Error("Unsupported type: " + cel.constructor.name);
  }

  valueToExprVal(val: value_pb.Value): eval_pb.ExprValue {
    return new eval_pb.ExprValue({
      kind: {
        case: "value",
        value: val,
      },
    });
  }

  celToExprVal(cel: CelVal): eval_pb.ExprValue {
    const val = new eval_pb.ExprValue();
    if (cel === null) {
      val.kind = {
        case: "value",
        value: new value_pb.Value({ kind: { case: "nullValue", value: 0 } }),
      };
    }
    return val;
  }

  exprResultToCel(val: eval_pb.ExprValue): CelResult {
    switch (val.kind.case) {
      case "value":
        return this.valToCel(val.kind.value);
    }
    throw new Error("unimplemented: " + val.kind.case);
  }

  valToCel(val: value_pb.Value): CelVal {
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
        return new CelList(val.kind.value.values, this);
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
        return new CelMap(map, this);
      }
      case "typeValue":
        return new type.CelType(val.kind.value);
    }
    throw new Error("unimplemented: " + val.kind.case);
  }
  objectToCel(value: Any): CelVal {
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

  equals(_lhs: eval_pb.ExprValue, _rhs: eval_pb.ExprValue): boolean {
    throw new Error("Method not implemented.");
  }
  compare(
    _lhs: eval_pb.ExprValue,
    _rhs: eval_pb.ExprValue
  ): number | undefined {
    throw new Error("Method not implemented.");
  }
}

export const EXPR_VAL_ADAPTER = new ExprValAdapter();
