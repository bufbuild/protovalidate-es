import { Any, Duration, isMessage, Timestamp } from "@bufbuild/protobuf";

import { unwrapResults } from "../value/adapter.js";
import {
  CelList,
  type CelValAdapter,
  type FieldAccess,
  type CelResult,
  type CelVal,
  CelMap,
  coerceToValues,
  isCelWrap,
  CelType,
  CelError,
  CelUnknown,
  CelObject,
  CelUint,
  ProtoNull,
} from "../value/value.js";

function compareBytes(lhs: Uint8Array, rhs: Uint8Array): number {
  const minLen = Math.min(lhs.length, rhs.length);
  for (let i = 0; i < minLen; i++) {
    if (lhs[i] < rhs[i]) {
      return -1;
    } else if (lhs[i] > rhs[i]) {
      return 1;
    }
  }
  return lhs.length - rhs.length;
}

/** How CelVal are converted (noop), compared, and accessed. */
export class CelAdapter implements CelValAdapter<CelVal> {
  toCel(native: CelResult) {
    return native;
  }
  fromCel(cel: CelResult) {
    return cel;
  }

  unwrap(val: CelVal): CelVal {
    if (isCelWrap(val)) {
      return val.value;
    }
    return val;
  }

  equals(lhs: CelVal, rhs: CelVal) {
    if (lhs === null) {
      return rhs === null || rhs instanceof ProtoNull;
    } else if (rhs === null) {
      return lhs instanceof ProtoNull;
    } else if (lhs instanceof ProtoNull) {
      if (rhs instanceof ProtoNull) {
        return lhs.messageType === rhs.messageType;
      }
      return false;
    }

    if (lhs instanceof CelUint) {
      lhs = lhs.value;
    }
    if (rhs instanceof CelUint) {
      rhs = rhs.value;
    }

    if (
      (typeof lhs === "number" || typeof lhs === "bigint") &&
      (typeof rhs === "number" || typeof rhs === "bigint")
    ) {
      if (typeof lhs !== typeof rhs) {
        lhs = Number(lhs);
        rhs = Number(rhs);
      }
      return lhs === rhs;
    } else if (typeof lhs === "boolean" && typeof rhs === "boolean") {
      return lhs === rhs;
    } else if (typeof lhs === "string" && typeof rhs === "string") {
      return lhs === rhs;
    } else if (typeof lhs === "object" && typeof rhs === "object") {
      if (lhs === rhs) {
        return true;
      } else if (lhs instanceof CelList) {
        if (rhs instanceof CelList) {
          return this.equalsList(lhs, rhs);
        }
        return false;
      } else if (lhs instanceof CelMap) {
        if (rhs instanceof CelMap) {
          return this.equalsMap(lhs, rhs);
        }
        return false;
      } else if (lhs instanceof CelObject) {
        if (rhs instanceof CelObject) {
          return this.equalsObject(0, lhs, rhs);
        }
        return false;
      } else if (lhs instanceof CelType) {
        return lhs.equals(rhs);
      } else if (lhs instanceof Uint8Array && rhs instanceof Uint8Array) {
        return compareBytes(lhs, rhs) === 0;
      } else if (isMessage(lhs) && isMessage(rhs)) {
        // TODO(afuller): Figure out why this is needed.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument
        return lhs.getType() === rhs.getType() && lhs.equals(rhs as any);
      }
    }
    return false;
  }

  equalsObject(id: number, lhs: CelObject, rhs: CelObject) {
    if (!lhs.type_.equals(rhs.type_)) {
      return false;
    }
    return equalsStruct(id, lhs.adapter, lhs, rhs, lhs.getFields());
  }

  compare(lhs: CelVal, rhs: CelVal): CelResult<number> | undefined {
    if (isCelWrap(lhs) || lhs instanceof CelUint) {
      lhs = lhs.value;
    }
    if (isCelWrap(rhs) || rhs instanceof CelUint) {
      rhs = rhs.value;
    }

    if (
      (typeof lhs === "number" || typeof lhs === "bigint") &&
      (typeof rhs === "number" || typeof rhs === "bigint")
    ) {
      if (typeof lhs !== typeof rhs) {
        lhs = Number(lhs);
        rhs = Number(rhs);
      }
      if (lhs < rhs) {
        return -1;
      }
      return lhs > rhs ? 1 : 0;
    } else if (
      lhs instanceof CelList ||
      lhs instanceof CelMap ||
      lhs instanceof CelObject
    ) {
      return undefined;
    } else if (typeof lhs === "boolean" && typeof rhs === "boolean") {
      if (lhs === rhs) {
        return 0;
      }
      return lhs ? 1 : -1;
    } else if (lhs instanceof Uint8Array && rhs instanceof Uint8Array) {
      return compareBytes(lhs, rhs);
    } else if (typeof lhs === "string" && typeof rhs === "string") {
      return lhs < rhs ? -1 : lhs > rhs ? 1 : 0;
    } else if (isMessage(lhs, Duration) && isMessage(rhs, Duration)) {
      const cmp = lhs.seconds - rhs.seconds;
      if (cmp == 0n) {
        return lhs.nanos - rhs.nanos;
      }
      return cmp < 0n ? -1 : 1;
    } else if (isMessage(lhs, Timestamp) && isMessage(rhs, Timestamp)) {
      const cmp = lhs.seconds - rhs.seconds;
      if (cmp == 0n) {
        return lhs.nanos - rhs.nanos;
      }
      return cmp < 0n ? -1 : 1;
    }
    return undefined;
  }

  getFields(obj: object) {
    return Object.keys(obj);
  }

  accessByName(id: number, obj: CelVal, name: string): CelResult | undefined {
    if (isMessage(obj, Any)) {
      throw new Error("not implemented");
    }

    if (typeof obj === "object" && obj !== null) {
      if (obj instanceof CelMap || obj instanceof CelObject) {
        return obj.accessByName(id, name);
      } else if (obj instanceof ProtoNull) {
        return this.accessByName(id, obj.defaultValue, name);
      } else if (obj.constructor.name === "Object") {
        return obj[name as keyof typeof obj];
      }
    }
    return undefined;
  }
  accessByIndex(
    id: number,
    obj: CelVal,
    index: number | bigint,
  ): CelVal | undefined {
    if (obj instanceof CelMap || obj instanceof CelList) {
      return obj.accessByIndex(id, index) as CelVal;
    }
    return undefined;
  }

  private equalsList(lhs: CelList, rhs: CelList) {
    if (lhs.value.length !== rhs.value.length) {
      return false;
    }
    if (lhs.adapter === rhs.adapter) {
      for (let i = 0; i < lhs.value.length; i++) {
        if (!lhs.adapter.equals(lhs.value[i], rhs.value[i])) {
          return false;
        }
      }
      return true;
    }
    // Convert each item to cel, then compare
    for (let i = 0; i < lhs.value.length; i++) {
      const args = coerceToValues([
        lhs.adapter.toCel(lhs.value[i]),
        rhs.adapter.toCel(rhs.value[i]),
      ]);
      if (args instanceof CelError || args instanceof CelUnknown) {
        return args;
      }
      if (!this.equals(args[0], args[1])) {
        return false;
      }
    }

    return true;
  }

  private equalsMap(lhs: CelMap, rhs: CelMap) {
    if (lhs.value.size !== rhs.value.size) {
      return false;
    }
    if (lhs.adapter === rhs.adapter) {
      for (const [nativeKey, value] of lhs.nativeKeyMap) {
        const rhsValue = rhs.nativeKeyMap.get(nativeKey);
        if (rhsValue === undefined) {
          return false;
        }
        if (!lhs.adapter.equals(value, rhsValue)) {
          return false;
        }
      }
      return true;
    }
    // Convert each item to cel, then compare
    for (const [nativeKey, lhsValue] of lhs.nativeKeyMap) {
      const rhsValue = rhs.nativeKeyMap.get(nativeKey);
      if (rhsValue === undefined) {
        return false;
      }
      const args = coerceToValues([
        lhs.adapter.toCel(lhsValue),
        rhs.adapter.toCel(rhsValue),
      ]);
      if (args instanceof CelError || args instanceof CelUnknown) {
        return args;
      }
      if (!this.equals(args[0], args[1])) {
        return false;
      }
    }
    return true;
  }
}

export const CEL_ADAPTER = new CelAdapter();

export function equalsStruct<K = unknown>(
  id: number,
  adapter: CelValAdapter,
  a: FieldAccess<K>,
  b: FieldAccess<K>,
  fields: K[],
): CelResult<boolean> {
  for (const field of fields) {
    let va = a.accessByName(id, field);
    let vb = b.accessByName(id, field);
    if (va === undefined || vb === undefined) {
      if (va === vb) {
        continue;
      }
      return false;
    }
    const args = unwrapResults([va, vb], adapter);
    if (args instanceof CelError || args instanceof CelUnknown) {
      return args;
    }
    va = args[0];
    vb = args[1];
    if (va === vb) {
      continue;
    }
    if (!va || !vb) {
      return false;
    }
    if (!adapter.equals(va, vb)) {
      return false;
    }
  }
  return true;
}
