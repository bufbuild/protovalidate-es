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
  Func,
  FuncRegistry,
  type StrictBinaryOp,
  type StrictUnaryOp,
} from "../func.js";
import * as opc from "../gen/dev/cel/expr/operator_const.js";
import * as olc from "../gen/dev/cel/expr/overload_const.js";
import {
  type CelResult,
  type CelVal,
  CelList,
  CelMap,
  CelError,
  CelUnknown,
  CelErrors,
  isCelWrap,
} from "../value/value.js";
import { getCelType } from "../value/type.js";
import { CEL_ADAPTER } from "../adapter/cel.js";

const notStrictlyFalse = Func.newVarArg(
  opc.NOT_STRICTLY_FALSE,
  [olc.NOT_STRICTLY_FALSE],
  (_id: number, args: CelResult[]) => {
    const raw = args[0];
    if (raw instanceof CelUnknown || raw instanceof CelError) {
      // TODO(tstamm) this doesn't look right, investigate
      return true;
    }
    const val = CEL_ADAPTER.unwrap(raw);
    if (val === false) {
      return false;
    }
    return true;
  },
);

const notFunc = Func.unary(
  opc.LOGICAL_NOT,
  [olc.LOGICAL_NOT],
  (id: number, x: CelVal) => {
    if (x === true) {
      return false;
    } else if (x === false) {
      return true;
    }
    return CelErrors.overloadNotFound(id, opc.LOGICAL_NOT, [getCelType(x)]);
  },
);

const andFunc = Func.newVarArg(
  opc.LOGICAL_AND,
  [olc.LOGICAL_AND],
  (_id: number, args: CelResult[]) => {
    let allBools = true;
    const unknowns: CelUnknown[] = [];
    const errors: CelError[] = [];
    for (let i = 0; i < args.length; i++) {
      let arg = args[i];
      if (isCelWrap(arg)) {
        // TODO(tstamm) fix types or investigate extracting into standalone fn
        arg = CEL_ADAPTER.unwrap(arg);
      }
      if (typeof arg === "boolean") {
        if (!arg) return false; // short-circuit
      } else {
        allBools = false;
        if (arg instanceof CelError) {
          errors.push(arg);
        } else if (arg instanceof CelUnknown) {
          unknowns.push(arg);
        }
      }
    }
    if (allBools) {
      return true;
    } else if (unknowns.length > 0) {
      return CelUnknown.merge(unknowns);
    } else if (errors.length > 0) {
      return CelErrors.merge(errors);
    }
    return undefined;
  },
);

const orFunc = Func.newVarArg(
  opc.LOGICAL_OR,
  [olc.LOGICAL_OR],
  (_id: number, args: CelResult[]) => {
    let allBools = true;
    const unknowns: CelUnknown[] = [];
    const errors: CelError[] = [];
    for (let i = 0; i < args.length; i++) {
      let arg = args[i];
      if (isCelWrap(arg)) {
        // TODO(tstamm) fix types or investigate extracting into standalone fn
        arg = CEL_ADAPTER.unwrap(arg);
      }
      if (typeof arg === "boolean") {
        if (arg) return true; // short-circuit
      } else {
        allBools = false;
        if (arg instanceof CelError) {
          errors.push(arg);
        } else if (arg instanceof CelUnknown) {
          unknowns.push(arg);
        }
      }
    }
    if (allBools) {
      return false;
    } else if (unknowns.length > 0) {
      return CelUnknown.merge(unknowns);
    } else if (errors.length > 0) {
      return CelErrors.merge(errors);
    }
    return undefined;
  },
);

const eqFunc = Func.binary(
  opc.EQUALS,
  [olc.EQUALS],
  (_id: number, lhs: CelVal, rhs: CelVal) => {
    return CEL_ADAPTER.equals(lhs, rhs);
  },
);

const neFunc = Func.binary(
  opc.NOT_EQUALS,
  [olc.NOT_EQUALS],
  (_id: number, lhs: CelVal, rhs: CelVal) => {
    const eq = CEL_ADAPTER.equals(lhs, rhs);
    if (eq instanceof CelError || eq instanceof CelUnknown) {
      return eq;
    }
    return !eq;
  },
);

const ltFunc = Func.binary(
  opc.LESS,
  [
    olc.LESS_BOOL,
    olc.LESS_BYTES,
    olc.LESS_DOUBLE,
    olc.LESS_DOUBLE_INT64,
    olc.LESS_DOUBLE_UINT64,
    olc.LESS_DURATION,
    olc.LESS_INT64,
    olc.LESS_INT64_DOUBLE,
    olc.LESS_INT64_UINT64,
    olc.LESS_STRING,
    olc.LESS_TIMESTAMP,
    olc.LESS_UINT64,
    olc.LESS_UINT64_DOUBLE,
    olc.LESS_UINT64_INT64,
  ],
  (_id: number, lhs: CelVal, rhs: CelVal) => {
    const cmp = CEL_ADAPTER.compare(lhs, rhs);
    if (
      cmp instanceof CelError ||
      cmp instanceof CelUnknown ||
      cmp === undefined
    ) {
      return cmp;
    }
    return cmp < 0;
  },
);

const leFunc = Func.binary(
  opc.LESS_EQUALS,
  [
    olc.LESS_EQUALS_BOOL,
    olc.LESS_EQUALS_BYTES,
    olc.LESS_EQUALS_DOUBLE,
    olc.LESS_EQUALS_DOUBLE_INT64,
    olc.LESS_EQUALS_DOUBLE_UINT64,
    olc.LESS_EQUALS_DURATION,
    olc.LESS_EQUALS_INT64,
    olc.LESS_EQUALS_INT64_DOUBLE,
    olc.LESS_EQUALS_INT64_UINT64,
    olc.LESS_EQUALS_STRING,
    olc.LESS_EQUALS_TIMESTAMP,
    olc.LESS_EQUALS_UINT64,
    olc.LESS_EQUALS_UINT64_DOUBLE,
    olc.LESS_EQUALS_UINT64_INT64,
  ],
  (_id: number, lhs: CelVal, rhs: CelVal) => {
    const cmp = CEL_ADAPTER.compare(lhs, rhs);
    if (
      cmp instanceof CelError ||
      cmp instanceof CelUnknown ||
      cmp === undefined
    ) {
      return cmp;
    }
    return cmp <= 0;
  },
);

const gtFunc = Func.binary(
  opc.GREATER,
  [
    olc.GREATER_BOOL,
    olc.GREATER_BYTES,
    olc.GREATER_DOUBLE,
    olc.GREATER_DOUBLE_INT64,
    olc.GREATER_DOUBLE_UINT64,
    olc.GREATER_DURATION,
    olc.GREATER_INT64,
    olc.GREATER_INT64_DOUBLE,
    olc.GREATER_INT64_UINT64,
    olc.GREATER_STRING,
    olc.GREATER_TIMESTAMP,
    olc.GREATER_UINT64,
    olc.GREATER_UINT64_DOUBLE,
    olc.GREATER_UINT64_INT64,
  ],
  (_id: number, lhs: CelVal, rhs: CelVal) => {
    const cmp = CEL_ADAPTER.compare(lhs, rhs);
    if (
      cmp instanceof CelError ||
      cmp instanceof CelUnknown ||
      cmp === undefined
    ) {
      return cmp;
    }
    return cmp > 0;
  },
);

const geFunc = Func.binary(
  opc.GREATER_EQUALS,
  [
    olc.GREATER_EQUALS_BOOL,
    olc.GREATER_EQUALS_BYTES,
    olc.GREATER_EQUALS_DOUBLE,
    olc.GREATER_EQUALS_DOUBLE_INT64,
    olc.GREATER_EQUALS_DOUBLE_UINT64,
    olc.GREATER_EQUALS_DURATION,
    olc.GREATER_EQUALS_INT64,
    olc.GREATER_EQUALS_INT64_DOUBLE,
    olc.GREATER_EQUALS_INT64_UINT64,
    olc.GREATER_EQUALS_STRING,
    olc.GREATER_EQUALS_TIMESTAMP,
    olc.GREATER_EQUALS_UINT64,
    olc.GREATER_EQUALS_UINT64_DOUBLE,
    olc.GREATER_EQUALS_UINT64_INT64,
  ],
  (_id: number, lhs: CelVal, rhs: CelVal) => {
    const cmp = CEL_ADAPTER.compare(lhs, rhs);
    if (
      cmp instanceof CelError ||
      cmp instanceof CelUnknown ||
      cmp === undefined
    ) {
      return cmp;
    }
    return cmp >= 0;
  },
);

const containsStringOp: StrictBinaryOp = (
  _id: number,
  x: CelVal,
  y: CelVal,
) => {
  if (typeof x === "string" && typeof y === "string") {
    return x.includes(y);
  }
  return undefined;
};
const containsStringFunc = Func.binary(
  olc.CONTAINS,
  [olc.CONTAINS_STRING],
  containsStringOp,
);
const containsFunc = Func.binary(
  olc.CONTAINS,
  [],
  (id: number, x: CelVal, y: CelVal) => {
    if (typeof x === "string") {
      return containsStringOp(id, x, y);
    }
    return undefined;
  },
);

const endsWithStringOp: StrictBinaryOp = (
  _id: number,
  x: CelVal,
  y: CelVal,
) => {
  if (typeof x === "string" && typeof y === "string") {
    return x.endsWith(y);
  }
  return undefined;
};
const endsWithStringFunc = Func.binary(
  olc.ENDS_WITH,
  [olc.ENDS_WITH_STRING],
  endsWithStringOp,
);
const endsWithFunc = Func.binary(
  olc.ENDS_WITH,
  [],
  (id: number, x: CelVal, y: CelVal) => {
    if (typeof x === "string") {
      return endsWithStringOp(id, x, y);
    }
    return undefined;
  },
);

const startsWithOp: StrictBinaryOp = (_id: number, x: CelVal, y: CelVal) => {
  if (typeof x === "string" && typeof y === "string") {
    return x.startsWith(y);
  }
  return undefined;
};
const startsWithStringFunc = Func.binary(
  olc.STARTS_WITH,
  [olc.STARTS_WITH_STRING],
  startsWithOp,
);
const startsWithFunc = Func.binary(
  olc.STARTS_WITH,
  [],
  (id: number, x: CelVal, y: CelVal) => {
    if (typeof x === "string") {
      return startsWithOp(id, x, y);
    }
    return undefined;
  },
);

/**
 * Patterns that are supported in ECMAScript RE and not in
 * RE2.
 *
 * ECMAScript Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet
 * RE2: https://github.com/google/re2/wiki/syntax
 */
const invalidPatterns = [
  /\\[1-9]/, // backreference eg: \1
  /\\k<.>/, // backreference eg: \k<name>
  /\(\?\=/, // lookahead eg: Jack(?=Sprat)
  /\(\?\!/, // negative lookahead eg: Jack(?!Sprat)
  /\(\?\<\=/, // lookbehind eg: (?<=Sprat)Jack
  /\(\?\<\!/, // negative lookbehind eg: (?<!Sprat)Jack,
  /\\c[A-Z]/, // control character eg: /\cM\cJ/
  /\\u[0-9a-fA-F]{4}/, // UTF-16 code-unit
  /\\0(?!\d)/, // NUL
  /\[\\b.*\]/, // Backspace eg: [\b]
];

const flagPattern = new RegExp(/^\(\?(?<flags>[ims\-]+)\)/);
const matchesStringOp: StrictBinaryOp = (_id: number, x: CelVal, y: CelVal) => {
  if (typeof x === "string" && typeof y === "string") {
    for (const invalidPattern of invalidPatterns) {
      if (invalidPattern.test(y)) {
        throw new Error(`Error evaluating pattern ${y}, invalid RE2 syntax`);
      }
    }
    // CEL use RE2 syntax which is a subset of Ecmascript RE except for
    // the flags and the ability to change the flags mid sequence.
    //
    // The conformance tests use flags at the very beginning of the sequence, which
    // is likely the most common place where this rare feature will be used.
    //
    // Instead of importing an RE2 engine to be able to support this niche, we
    // can instead just check for the flags at the very beginning and apply them.
    //
    // Unsupported flags and flags mid sequence will fail with to compile the regex.
    //
    // Users can choose to override this function and provide an RE2 engine if they really
    // need to.
    let flags = "";
    const flagMatches = y.match(flagPattern);
    if (flagMatches) {
      for (let flag of flagMatches?.groups?.["flags"] ?? "") {
        if (flag == "-") {
          break;
        }
        flags += flag;
      }
      y = y.substring(flagMatches[0].length);
    }
    const re = new RegExp(y, flags);
    return re.test(x);
  }
  return undefined;
};
const matchesStringFunc = Func.binary(
  olc.MATCHES,
  [olc.MATCHES_STRING],
  matchesStringOp,
);
const matchesFunc = Func.binary(
  olc.MATCHES,
  [],
  (id: number, x: CelVal, y: CelVal) => {
    if (typeof x === "string") {
      return matchesStringOp(id, x, y);
    }
    return undefined;
  },
);

const sizeStringOp: StrictUnaryOp = (_id: number, x: CelVal) => {
  if (typeof x === "string") {
    let size = 0;
    for (const _ of x) {
      size++;
    }
    return BigInt(size);
  }
  return undefined;
};
const sizeStringFunc = Func.unary(
  olc.SIZE,
  [olc.SIZE_STRING, olc.SIZE_STRING_INST],
  sizeStringOp,
);
const sizeBytesOp: StrictUnaryOp = (_id: number, x: CelVal) => {
  if (x instanceof Uint8Array) {
    return BigInt(x.length);
  }
  return undefined;
};
const sizeBytesFunc = Func.unary(
  olc.SIZE,
  [olc.SIZE_BYTES, olc.SIZE_BYTES_INST],
  sizeBytesOp,
);
const sizeListOp: StrictUnaryOp = (_id: number, x: CelVal) => {
  if (x instanceof CelList) {
    return BigInt(x.value.length);
  }
  return undefined;
};
const sizeListFunc = Func.unary(
  olc.SIZE,
  [olc.SIZE_LIST, olc.SIZE_LIST_INST],
  sizeListOp,
);
const sizeMapOp: StrictUnaryOp = (_id: number, x: CelVal) => {
  if (x instanceof CelMap) {
    return BigInt(x.value.size);
  }
  return undefined;
};
const sizeMapFunc = Func.unary(
  olc.SIZE,
  [olc.SIZE_MAP, olc.SIZE_MAP_INST],
  sizeMapOp,
);

const sizeFunc = Func.unary(olc.SIZE, [], (id: number, x: CelVal) => {
  if (typeof x === "string") {
    return sizeStringOp(id, x);
  }
  if (x instanceof Uint8Array) {
    return sizeBytesOp(id, x);
  }
  if (x instanceof CelList) {
    return sizeListOp(id, x);
  }
  if (x instanceof CelMap) {
    return sizeMapOp(id, x);
  }
  return undefined;
});

const inListOp: StrictBinaryOp = (_id: number, x: CelVal, y: CelVal) => {
  if (y instanceof CelList) {
    const val = y.adapter.fromCel(x);
    for (let i = 0; i < y.value.length; i++) {
      if (y.adapter.equals(val, y.value[i])) {
        return true;
      }
    }
    return false;
  }
  return undefined;
};
const inListFunc = Func.binary(opc.IN, [olc.IN_LIST], inListOp);
const inMapOp: StrictBinaryOp = (_id: number, x: CelVal, y: CelVal) => {
  if (y instanceof CelMap) {
    const val = y.adapter.fromCel(x);
    for (const [k, _] of y.value) {
      if (y.adapter.equals(val, k)) {
        return true;
      }
    }
    return false;
  }
  return undefined;
};
const inMapFunc = Func.binary(opc.IN, [olc.IN_MAP], inMapOp);
const inFunc = Func.binary(opc.IN, [], (id: number, x: CelVal, y: CelVal) => {
  if (y instanceof CelList) {
    return inListOp(id, x, y);
  }
  if (y instanceof CelMap) {
    return inMapOp(id, x, y);
  }
  return undefined;
});

export function addLogic(funcs: FuncRegistry) {
  funcs.add(notStrictlyFalse);
  funcs.add(andFunc);
  funcs.add(orFunc);
  funcs.add(notFunc);
  funcs.add(eqFunc);
  funcs.add(neFunc);
  funcs.add(ltFunc);
  funcs.add(leFunc);
  funcs.add(gtFunc);
  funcs.add(geFunc);
  funcs.add(containsFunc, [containsStringFunc]);
  funcs.add(endsWithFunc, [endsWithStringFunc]);
  funcs.add(startsWithFunc, [startsWithStringFunc]);
  funcs.add(matchesFunc, [matchesStringFunc]);
  funcs.add(sizeFunc, [
    sizeStringFunc,
    sizeBytesFunc,
    sizeListFunc,
    sizeMapFunc,
  ]);
  funcs.add(inFunc, [inListFunc, inMapFunc]);
}
