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
export { ExprBuilder } from "./builder.js";

import { Duration, Timestamp } from "@bufbuild/protobuf";
import {
  CelError,
  newDuration as _newDuration,
  newTimestamp as _newTimestamp,
  parseDuration as _parseDuration,
} from "./value/value.js";
import { Antrl4Parser } from "./parser.js";

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

export const CEL_PARSER = new Antrl4Parser();
