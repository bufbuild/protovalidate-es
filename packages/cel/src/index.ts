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

export { type CelParser, CelPlanner, CelEnv } from "./celenv.js";
export {
  type CelResult,
  type CelVal,
  CelType,
  isCelResult,
  isCelVal,
  CelError,
  CelUnknown,
  CelList,
  CelMap,
  CelUint,
  ProtoNull,
  CelObject,
} from "./value/value.js";
export { getCelType } from "./value/type.js";
export { NATIVE_ADAPTER } from "./adapter/native.js";
export { CEL_ADAPTER } from "./adapter/cel.js";
export { EXPR_VAL_ADAPTER } from "./adapter/exprval.js";
export { ObjectActivation } from "./activation.js";
export { makeStringExtFuncRegistry } from "./ext/strings.js";

import type { Duration, Timestamp } from "@bufbuild/protobuf/wkt";
import {
  CelError,
  newDuration as _newDuration,
  newTimestamp as _newTimestamp,
  parseDuration as _parseDuration,
} from "./value/value.js";

function throwIfError<T>(result: CelError | T): T {
  if (result instanceof CelError) {
    throw result;
  }
  return result;
}

export function newDuration(seconds: bigint, nanos: number): Duration {
  return throwIfError(_newDuration(0, seconds, nanos));
}

export function parseDuration(duration: string): Duration {
  return throwIfError(_parseDuration(0, duration));
}

export function newTimestamp(seconds: bigint, nanos: number): Timestamp {
  return throwIfError(_newTimestamp(0, seconds, nanos));
}
