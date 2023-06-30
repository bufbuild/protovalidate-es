export { type CelParser, CelEnv } from "./celenv";
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
} from "./value/value";
export { getCelType } from "./value/type";
export { NATIVE_ADAPTER } from "./adapter/native";
export { CEL_ADAPTER } from "./adapter/cel";
export { EXPR_VAL_ADAPTER } from "./adapter/exprval";
export { ObjectActivation } from "./activation";
export { makeStringExtFuncRegistry } from "./ext/strings";
export { ExprBuilder } from "./builder";

import { Duration, Timestamp } from "@bufbuild/protobuf";
import {
  CelError,
  newDuration as _newDuration,
  newTimestamp as _newTimestamp,
  parseDuration as _parseDuration,
} from "./value/value";

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
