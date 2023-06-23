import { type CelValAdapter, type IndexAccess } from "./adapter";
import { CelType, type CelResult, CelError } from "./value";

export class CelList implements IndexAccess {
  constructor(
    public value: unknown[],
    public readonly adapter: CelValAdapter,
    public readonly type_: CelType
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
