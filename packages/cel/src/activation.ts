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
