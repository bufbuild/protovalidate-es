// Copyright 2024-2026 Buf Technologies, Inc.
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
  celFromScalar,
  celFunc,
  celOverload,
  CelScalar,
  listType,
  type CelFunc,
} from "@bufbuild/cel";
import {
  isInf,
  isHostname,
  isHostAndPort,
  isEmail,
  isIp,
  isIpPrefix,
  isUri,
  isUriRef,
  unique,
  bytesContains,
  bytesEndsWith,
  bytesStartsWith,
} from "./lib.js";
import { isReflectMessage } from "@bufbuild/protobuf/reflect";
import { isWrapperDesc } from "@bufbuild/protobuf/wkt";
import { create } from "@bufbuild/protobuf";

const isNanFn = celFunc("isNan", [
  celOverload([CelScalar.DOUBLE], CelScalar.BOOL, Number.isNaN),
]);

const isInfFn = celFunc("isInf", [
  celOverload([CelScalar.DOUBLE], CelScalar.BOOL, isInf),
  celOverload([CelScalar.DOUBLE, CelScalar.INT], CelScalar.BOOL, isInf),
]);

const isHostnameFn = celFunc("isHostname", [
  celOverload([CelScalar.STRING], CelScalar.BOOL, isHostname),
]);

const isHostAndPortFn = celFunc("isHostAndPort", [
  celOverload(
    [CelScalar.STRING, CelScalar.BOOL],
    CelScalar.BOOL,
    isHostAndPort,
  ),
]);

const isEmailFn = celFunc("isEmail", [
  celOverload([CelScalar.STRING], CelScalar.BOOL, isEmail),
]);

const isIpFn = celFunc("isIp", [
  celOverload([CelScalar.STRING], CelScalar.BOOL, isIp),
  celOverload([CelScalar.STRING, CelScalar.INT], CelScalar.BOOL, isIp),
]);

const isIpPrefixFn = celFunc("isIpPrefix", [
  celOverload([CelScalar.STRING], CelScalar.BOOL, isIpPrefix),
  celOverload([CelScalar.STRING, CelScalar.INT], CelScalar.BOOL, isIpPrefix),
  celOverload(
    [CelScalar.STRING, CelScalar.BOOL],
    CelScalar.BOOL,
    (str, strict) => isIpPrefix(str, undefined, strict),
  ),
  celOverload(
    [CelScalar.STRING, CelScalar.INT, CelScalar.BOOL],
    CelScalar.BOOL,
    isIpPrefix,
  ),
]);

const isUriFn = celFunc("isUri", [
  celOverload([CelScalar.STRING], CelScalar.BOOL, isUri),
]);

const isUriRefFn = celFunc("isUriRef", [
  celOverload([CelScalar.STRING], CelScalar.BOOL, isUriRef),
]);

const uniqueFn = celFunc("unique", [
  celOverload([listType(CelScalar.DYN)], CelScalar.BOOL, unique),
]);

const getFieldFn = celFunc("getField", [
  celOverload([CelScalar.DYN, CelScalar.STRING], CelScalar.DYN, (msg, name) => {
    if (!isReflectMessage(msg)) {
      throw new Error("getField can only be applied to messages");
    }
    const field = msg.fields.find((f) => f.name === name);
    if (field === undefined) {
      throw new Error(`field ${name} not found on ${msg.desc}`);
    }
    switch (field.fieldKind) {
      case "list":
      case "map":
        return msg.get(field);
      case "enum":
        return BigInt(msg.get(field));
      case "scalar":
        return celFromScalar(field.scalar, msg.get(field));
      case "message":
        if (msg.isSet(field)) {
          return msg.get(field);
        }
        if (isWrapperDesc(field.message)) {
          return null;
        }
        return create(field.message);
    }
  }),
]);

const containsFn = celFunc("contains", [
  celOverload(
    [CelScalar.BYTES, CelScalar.BYTES],
    CelScalar.BOOL,
    bytesContains,
  ),
  celOverload([CelScalar.STRING, CelScalar.STRING], CelScalar.BOOL, (l, r) =>
    l.includes(r),
  ),
]);

const endsWithFn = celFunc("endsWith", [
  celOverload(
    [CelScalar.BYTES, CelScalar.BYTES],
    CelScalar.BOOL,
    bytesEndsWith,
  ),
  celOverload([CelScalar.STRING, CelScalar.STRING], CelScalar.BOOL, (l, r) =>
    l.endsWith(r),
  ),
]);

const startsWithFn = celFunc("startsWith", [
  celOverload(
    [CelScalar.BYTES, CelScalar.BYTES],
    CelScalar.BOOL,
    bytesStartsWith,
  ),
  celOverload([CelScalar.STRING, CelScalar.STRING], CelScalar.BOOL, (l, r) =>
    l.startsWith(r),
  ),
]);

export type RegexMatcher = (pattern: string, against: string) => boolean;
export function createCustomFuncions(regexMatcher?: RegexMatcher): CelFunc[] {
  const funcs = [
    isNanFn,
    isInfFn,
    isHostnameFn,
    isHostAndPortFn,
    isEmailFn,
    isIpFn,
    isIpPrefixFn,
    isUriFn,
    isUriRefFn,
    uniqueFn,
    getFieldFn,
    containsFn,
    endsWithFn,
    startsWithFn,
  ];
  if (regexMatcher) {
    funcs.push(
      celFunc("matches", [
        celOverload(
          [CelScalar.STRING, CelScalar.STRING],
          CelScalar.BOOL,
          (against, pattern) => regexMatcher(pattern, against),
        ),
      ]),
    );
  }
  return funcs;
}
