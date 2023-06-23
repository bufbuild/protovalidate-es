import { type CelValAdapter, type StructAccess } from "./adapter";
import { CelUint } from "./scalar";
import * as type from "./type";
import { type CelResult, type CelVal, isCelWrap, CelType } from "./value";

export class CelMap<K = unknown, V = unknown> implements StructAccess<CelVal> {
  public nativeKeyMap: Map<unknown, V>;

  constructor(
    public value: Map<K, V>,
    public readonly adapter: CelValAdapter,
    public type_: CelType = type.DYN_MAP
  ) {
    this.nativeKeyMap = new Map();
    for (const [key, value] of this.value) {
      const celKey = this.adapter.toCel(key);
      if (typeof celKey === "string" || typeof celKey === "bigint") {
        this.nativeKeyMap.set(celKey, value);
      } else if (isCelWrap(celKey) || celKey instanceof CelUint) {
        this.nativeKeyMap.set(celKey.value, value);
      } else if (celKey instanceof Uint8Array) {
        this.nativeKeyMap.set(celKey, value);
      } else if (typeof celKey === "number" && Number.isInteger(celKey)) {
        this.nativeKeyMap.set(BigInt(celKey), value);
      } else if (typeof celKey === "boolean") {
        this.nativeKeyMap.set(celKey ? 1n : 0n, value);
      } else {
        this.nativeKeyMap.set(key, value);
      }
    }
  }

  getItems(): CelResult[] {
    const result: CelResult[] = [];
    for (const [key] of this.value) {
      result.push(this.adapter.toCel(key));
    }
    return result;
  }

  accessByIndex(id: number, index: number | bigint): CelResult | undefined {
    let result = this.nativeKeyMap.get(index);
    if (result === undefined) {
      if (typeof index === "number" && Number.isInteger(index)) {
        result = this.nativeKeyMap.get(BigInt(index));
      }
    }
    if (result === undefined) {
      return undefined;
    }
    return this.adapter.toCel(result);
  }

  accessByName(id: number, name: unknown): CelResult | undefined {
    return this.adapter.toCel(this.nativeKeyMap.get(name));
  }

  getFields(): CelVal[] {
    return [...this.value.keys()].map((k) => this.adapter.toCel(k) as CelVal);
  }
}
