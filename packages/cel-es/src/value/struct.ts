import { type CelValAdapter, type StructAccess } from "./adapter";
import { WK_PROTO_TYPES } from "./provider";
import * as type from "./type";
import { type CelResult, isCelVal } from "./value";

export class CelObject implements StructAccess<unknown> {
  constructor(
    public value: object,
    public readonly adapter: CelValAdapter,
    public type_: type.CelType
  ) {
    if (WK_PROTO_TYPES.has(type_.name)) {
      throw new Error("Cannot wrap well known proto in CelObject");
    }
    if (isCelVal(value)) {
      throw new Error("Cannot wrap CelVal in CelObject");
    }
  }

  getItems(): CelResult[] {
    const result: CelResult[] = [];
    for (const item of Object.keys(this.value)) {
      result.push(this.adapter.toCel(item));
    }
    return result;
  }

  getFields(): string[] {
    return this.adapter.getFields(this.value);
  }

  accessByName(id: number, name: string): CelResult | undefined {
    const result = this.adapter.accessByName(id, this.value, name);
    if (result === undefined) {
      return undefined;
    }
    return this.adapter.toCel(result);
  }
  accessByIndex(id: number, index: number | bigint): CelResult | undefined {
    const result = this.adapter.accessByIndex(id, this.value, index);
    if (result === undefined) {
      return undefined;
    }
    return this.adapter.toCel(result);
  }
}
