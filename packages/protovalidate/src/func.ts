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
  celMethod,
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

const isNanFn = celMethod(
  "isNan",
  CelScalar.DOUBLE,
  [],
  CelScalar.BOOL,
  function () {
    return Number.isNaN(this);
  },
);

const isInfFn = [
  celMethod("isInf", CelScalar.DOUBLE, [], CelScalar.BOOL, isInf),
  celMethod("isInf", CelScalar.DOUBLE, [CelScalar.INT], CelScalar.BOOL, isInf),
];

const isHostnameFn = celMethod(
  "isHostname",
  CelScalar.STRING,
  [],
  CelScalar.BOOL,
  isHostname,
);

const isHostAndPortFn = celMethod(
  "isHostAndPort",
  CelScalar.STRING,
  [CelScalar.BOOL],
  CelScalar.BOOL,
  isHostAndPort,
);

const isEmailFn = celMethod(
  "isEmail",
  CelScalar.STRING,
  [],
  CelScalar.BOOL,
  isEmail,
);

const isIpFn = [
  celMethod("isIp", CelScalar.STRING, [], CelScalar.BOOL, isIp),
  celMethod("isIp", CelScalar.STRING, [CelScalar.INT], CelScalar.BOOL, isIp),
];

const isIpPrefixFn = [
  celMethod("isIpPrefix", CelScalar.STRING, [], CelScalar.BOOL, isIpPrefix),
  celMethod(
    "isIpPrefix",
    CelScalar.STRING,
    [CelScalar.INT],
    CelScalar.BOOL,
    isIpPrefix,
  ),
  celMethod(
    "isIpPrefix",
    CelScalar.STRING,
    [CelScalar.BOOL],
    CelScalar.BOOL,
    function (strict) {
      return isIpPrefix.call(this, undefined, strict);
    },
  ),
  celMethod(
    "isIpPrefix",
    CelScalar.STRING,
    [CelScalar.INT, CelScalar.BOOL],
    CelScalar.BOOL,
    isIpPrefix,
  ),
];

const isUriFn = celMethod("isUri", CelScalar.STRING, [], CelScalar.BOOL, isUri);

const isUriRefFn = celMethod(
  "isUriRef",
  CelScalar.STRING,
  [],
  CelScalar.BOOL,
  isUriRef,
);

const uniqueFn = [
  CelScalar.UINT,
  CelScalar.INT,
  CelScalar.STRING,
  CelScalar.BOOL,
  CelScalar.DOUBLE,
  CelScalar.BYTES,
].map((elem) =>
  celMethod("unique", listType(elem), [], CelScalar.BOOL, unique),
);

const getFieldFn = celFunc(
  "getField",
  [CelScalar.DYN, CelScalar.STRING],
  CelScalar.DYN,
  (msg, name) => {
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
  },
);

const containsFn = [
  celMethod(
    "contains",
    CelScalar.BYTES,
    [CelScalar.BYTES],
    CelScalar.BOOL,
    bytesContains,
  ),
  celMethod(
    "contains",
    CelScalar.STRING,
    [CelScalar.STRING],
    CelScalar.BOOL,
    String.prototype.includes,
  ),
];

const endsWithFn = [
  celMethod(
    "endsWith",
    CelScalar.BYTES,
    [CelScalar.BYTES],
    CelScalar.BOOL,
    bytesEndsWith,
  ),
  celMethod(
    "endsWith",
    CelScalar.STRING,
    [CelScalar.STRING],
    CelScalar.BOOL,
    String.prototype.endsWith,
  ),
];

const startsWithFn = [
  celMethod(
    "startsWith",
    CelScalar.BYTES,
    [CelScalar.BYTES],
    CelScalar.BOOL,
    bytesStartsWith,
  ),
  celMethod(
    "startsWith",
    CelScalar.STRING,
    [CelScalar.STRING],
    CelScalar.BOOL,
    String.prototype.startsWith,
  ),
];

export type RegexMatcher = (pattern: string, against: string) => boolean;
export function createCustomFuncions(regexMatcher?: RegexMatcher): CelFunc[] {
  const funcs: CelFunc[] = [
    isNanFn,
    ...isInfFn,
    isHostnameFn,
    isHostAndPortFn,
    isEmailFn,
    ...isIpFn,
    ...isIpPrefixFn,
    isUriFn,
    isUriRefFn,
    ...uniqueFn,
    getFieldFn,
    ...containsFn,
    ...endsWithFn,
    ...startsWithFn,
  ];
  if (regexMatcher) {
    funcs.push(
      celMethod(
        "matches",
        CelScalar.STRING,
        [CelScalar.STRING],
        CelScalar.BOOL,
        function (pattern) {
          return regexMatcher(pattern, this);
        },
      ),
    );
  }
  return funcs;
}
