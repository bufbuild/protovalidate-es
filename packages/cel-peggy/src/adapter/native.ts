import { isOverflowInt, isOverflowUint } from "../std/math.js";
import { EMPTY_LIST, EMPTY_MAP } from "../value/empty.js";
import * as type from "../value/type.js";
import {
  type CelVal,
  isCelVal,
  CelError,
  CelMap,
  CelUnknown,
  type CelValAdapter,
  CelList,
  CelObject,
  CelUint,
  CelErrors,
} from "../value/value.js";
import { type CelResult, isCelResult } from "../value/value.js";
import { CEL_ADAPTER } from "./cel.js";

export class NativeValAdapter implements CelValAdapter {
  unwrap(val: CelVal): CelVal {
    return CEL_ADAPTER.unwrap(val);
  }
  toCel(val: unknown): CelResult {
    switch (typeof val) {
      case "boolean":
        return val;
      case "bigint":
        if (!isOverflowInt(val)) {
          return val;
        } else if (!isOverflowUint(val)) {
          return new CelUint(val);
        } else {
          return CelErrors.overflow(0, "bigint to cel", type.INT);
        }
      case "number":
        return val;
      case "string":
        return val;
      case "object":
        if (val === null) {
          return null;
        } else if (isCelResult(val)) {
          return val; // cel rep == native rep
        } else if (val instanceof Uint8Array) {
          return val;
        } else if (Array.isArray(val)) {
          if (val.length === 0) {
            return EMPTY_LIST;
          }
          return new CelList(val, this, type.LIST);
        } else if (val instanceof Map) {
          if (val.size === 0) {
            return EMPTY_MAP;
          }
          return new CelMap(val, this, type.DYN_MAP);
        } else if (val.constructor.name === "Object") {
          if (Object.keys(val).length === 0) {
            return EMPTY_MAP;
          }
          return new CelObject(val, this, type.DYN_MAP);
        }
        throw new Error("Unsupported type: " + val.constructor.name);
      default:
        throw new Error("Unsupported type: " + typeof val);
    }
  }

  fromCel(cel: CelVal): unknown {
    if (cel instanceof CelList) {
      if (cel.adapter === this) {
        return cel.value;
      }
      return cel.value.map((v) => {
        const tmp = cel.adapter.toCel(v);
        if (tmp instanceof CelError || tmp instanceof CelUnknown) {
          return tmp;
        }
        return this.fromCel(tmp);
      });
    } else if (cel instanceof CelMap) {
      if (cel.adapter === this) {
        return cel.value;
      }
      const map = new Map();
      cel.value.forEach((v, k) => {
        const key = cel.adapter.toCel(k);
        if (key instanceof CelError || key instanceof CelUnknown) {
          return key;
        }
        const val = cel.adapter.toCel(v);
        if (val instanceof CelError || val instanceof CelUnknown) {
          return val;
        }
        map.set(this.fromCel(key), this.fromCel(val));
        return undefined;
      });
      return map;
    } else if (cel instanceof CelObject) {
      if (cel.adapter === this) {
        return cel.value;
      }
      const obj: { [key: string]: unknown } = {};
      for (const k of cel.getFields()) {
        const val = cel.accessByName(0, k);
        if (val instanceof CelError || val instanceof CelUnknown) {
          return val;
        } else if (val !== undefined) {
          obj[k] = this.fromCel(val);
        }
      }
      return obj;
    } else if (cel instanceof CelUint) {
      return cel.value;
    }
    return cel;
  }

  equals(lhs: unknown, rhs: unknown): boolean {
    return lhs === rhs;
  }

  compare(lhs: unknown, rhs: unknown): number | undefined {
    if (
      (typeof lhs === "number" || typeof lhs === "bigint") &&
      (typeof rhs === "number" || typeof rhs === "bigint")
    ) {
      if (typeof lhs !== typeof rhs) {
        lhs = Number(lhs);
        rhs = Number(rhs);
      }
      if (lhs === rhs) {
        return 0;
      }
      return (lhs as number | bigint) < (rhs as number | bigint) ? -1 : 1;
    } else if (
      (typeof lhs === "string" && typeof rhs === "string") ||
      (typeof lhs === "boolean" && typeof rhs === "boolean") ||
      (lhs instanceof Uint8Array && rhs instanceof Uint8Array)
    ) {
      if (lhs === rhs) {
        return 0;
      }
      return lhs < rhs ? -1 : 1;
    }

    return undefined;
  }

  getFields(value: object): string[] {
    return Object.keys(value);
  }

  accessByName(id: number, obj: unknown, name: string) {
    if (obj instanceof Map) {
      return obj.get(name);
    } else if (isCelVal(obj)) {
      return CEL_ADAPTER.accessByName(id, obj, name);
    } else if (obj instanceof Object) {
      return obj[name as keyof typeof obj];
    }
    return undefined;
  }

  accessByIndex(id: number, obj: unknown, index: number | bigint) {
    if (obj instanceof Array) {
      return obj[Number(index)];
    } else if (isCelVal(obj)) {
      return CEL_ADAPTER.accessByIndex(id, obj, index);
    } else if (obj instanceof Object) {
      return obj[String(index) as keyof typeof obj];
    } else if (obj instanceof Map) {
      return obj.get(index);
    }
    return undefined;
  }
}

export const NATIVE_ADAPTER = new NativeValAdapter();
