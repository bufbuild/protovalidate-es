import { NATIVE_ADAPTER } from "./adapter/native.js";
import { type RawResult, RawVal } from "./value/adapter.js";
import { type CelValAdapter } from "./value/value.js";

export interface Activation {
  resolve(name: string): RawResult | undefined;
}

export class EmptyActivation implements Activation {
  resolve(_: string): RawResult | undefined {
    return undefined;
  }
}

export class MapActivation implements Activation {
  constructor(
    private map: Map<string, unknown>,
    private readonly adapter = NATIVE_ADAPTER,
  ) {}

  resolve(name: string): RawResult | undefined {
    return RawVal.if(this.adapter, this.map.get(name));
  }
}

export class ObjectActivation implements Activation {
  constructor(
    private readonly data: object,
    private readonly adapter: CelValAdapter,
  ) {}

  resolve(name: string): RawResult | undefined {
    return RawVal.if(this.adapter, this.data[name as keyof typeof this.data]);
  }
}

export class VarActivation implements Activation {
  constructor(
    public readonly name: string,
    public value: RawResult,
    public readonly parent: Activation,
  ) {}

  resolve(name: string): RawResult | undefined {
    if (name === this.name) {
      return this.value;
    }
    return this.parent.resolve(name);
  }
}
