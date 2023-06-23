import { type CelValAdapter, type IndexAccess } from "./adapter";
import { CelError } from "./error";
import * as type from "./type";
import { type CelResult } from "./value";

export class CelList implements IndexAccess {
  constructor(
    public value: unknown[],
    public readonly adapter: CelValAdapter,
    public readonly type_: type.CelType = type.LIST
  ) {}

  getItems(): CelResult[] {
    const result: CelResult[] = [];
    for (const item of this.value) {
      result.push(this.adapter.toCel(item));
    }
    return result;
  }

  accessByIndex(id: number, index: number | bigint): CelResult {
    const i = Number(index);
    if (i < 0 || i >= this.value.length) {
      return CelError.indexOutOfBounds(Number(id), i, this.value.length);
    }
    return this.adapter.toCel(this.value[i]);
  }
}
