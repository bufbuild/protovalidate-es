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

import { isMessage, create } from "@bufbuild/protobuf";
import {
  type Any,
  anyUnpack,
  DurationSchema,
  TimestampSchema,
} from "@bufbuild/protobuf/wkt";
import { ExprValueSchema } from "@bufbuild/cel-spec/cel/expr/eval_pb.js";
import type { ExprValue } from "@bufbuild/cel-spec/cel/expr/eval_pb.js";
import {
  ListValueSchema,
  MapValueSchema,
  MapValue_EntrySchema,
  ValueSchema,
} from "@bufbuild/cel-spec/cel/expr/value_pb.js";
import type { MapValue } from "@bufbuild/cel-spec/cel/expr/value_pb.js";
import type { ListValue } from "@bufbuild/cel-spec/cel/expr/value_pb.js";
import type { Value } from "@bufbuild/cel-spec/cel/expr/value_pb.js";
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
  CelError,
  CelUnknown,
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
    } else if (isMessage(obj, ExprValueSchema)) {
      switch (obj.kind.case) {
        case "value":
          return this.accessValueByIndex(id, obj.kind.value, index);
      }
      throw new Error("Method not implemented.");
    } else if (isMessage(obj, ValueSchema)) {
      return this.accessValueByIndex(id, obj, index);
    } else if (isMessage(obj, ListValueSchema)) {
      return this.accessListByIndex(id, obj, index);
    } else if (isMessage(obj, MapValueSchema)) {
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

  isSetByName(
    id: number,
    obj: ExprType,
    name: string,
  ): boolean | CelError | CelUnknown {
    return this.accessByName(id, obj, name) !== undefined;
  }

  accessByName(
    id: number,
    obj: ExprType,
    name: string,
  ): ExprResult | undefined {
    if (isCelVal(obj)) {
      return CEL_ADAPTER.accessByName(id, obj, name);
    } else if (isMessage(obj, ExprValueSchema)) {
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
    } else if (isMessage(native, ExprValueSchema)) {
      return this.exprResultToCel(native);
    } else if (isMessage(native, ValueSchema)) {
      return this.valToCel(native);
    } else if (isMessage(native, ListValueSchema)) {
      return new CelList(native.values, this, type.LIST);
    } else if (isMessage(native, MapValueSchema)) {
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
    return create(ExprValueSchema, {
      kind: {
        case: "value",
        value: this.celToValue(cel),
      },
    });
  }

  celToValue(cel: CelVal): Value {
    if (typeof cel === "boolean") {
      return create(ValueSchema, { kind: { case: "boolValue", value: cel } });
    } else if (typeof cel === "bigint") {
      return create(ValueSchema, {
        kind: { case: "int64Value", value: cel },
      });
    } else if (cel instanceof CelUint) {
      return create(ValueSchema, {
        kind: { case: "uint64Value", value: cel.value.valueOf() },
      });
    } else if (typeof cel === "number") {
      return create(ValueSchema, {
        kind: { case: "doubleValue", value: cel },
      });
    } else if (typeof cel === "string") {
      return create(ValueSchema, {
        kind: { case: "stringValue", value: cel },
      });
    } else if (cel instanceof Uint8Array) {
      return create(ValueSchema, {
        kind: { case: "bytesValue", value: cel },
      });
    } else if (cel instanceof CelList) {
      const list = create(ListValueSchema);
      cel
        .getItems()
        .forEach((val) => list.values.push(this.celToValue(val as CelVal)));
      return create(ValueSchema, { kind: { case: "listValue", value: list } });
    } else if (cel instanceof CelMap) {
      const map = create(MapValueSchema);
      cel.value.forEach((val, key) => {
        map.entries.push(
          create(MapValue_EntrySchema, {
            key: this.celToValue(key as CelVal),
            value: this.celToValue(val as CelVal),
          }),
        );
      });
      return create(ValueSchema, { kind: { case: "mapValue", value: map } });
    } else if (cel === null) {
      return create(ValueSchema, { kind: { case: "nullValue", value: 0 } });
    } else if (cel instanceof CelType) {
      return create(ValueSchema, {
        kind: { case: "typeValue", value: cel.name },
      });
    }

    throw new Error("Unsupported type: " + cel.constructor.name);
  }

  valueToExprVal(val: Value): ExprValue {
    return create(ExprValueSchema, {
      kind: {
        case: "value",
        value: val,
      },
    });
  }

  celToExprVal(cel: CelVal): ExprValue {
    const val = create(ExprValueSchema);
    if (cel === null) {
      val.kind = {
        case: "value",
        value: create(ValueSchema, { kind: { case: "nullValue", value: 0 } }),
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
      case "enumValue":
        return BigInt(val.kind.value.value);
    }
    throw new Error("unimplemented: " + val.kind.case);
  }
  private objectToCel(value: Any): CelVal {
    const duration = anyUnpack(value, DurationSchema);
    if (duration !== undefined) {
      return duration;
    }
    const ts = anyUnpack(value, TimestampSchema);
    if (ts !== undefined) {
      return ts;
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
