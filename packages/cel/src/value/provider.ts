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

import {
  type CelValAdapter,
  CelType,
  type CelResult,
  CelMap,
  CelObject,
} from "./value.js";

export interface CelValProvider<V = any> {
  /** The adapter used to produce values from this provider. */
  readonly adapter: CelValAdapter<V>;

  /** Create a new value of the given type, from the given obj. */
  newValue(
    id: number,
    typeName: string,
    obj: CelObject | CelMap,
  ): CelResult<V> | undefined;

  findType(candidate: string): CelType | undefined;
  findIdent(id: number, ident: string): CelResult<V> | undefined;
}
