import { Duration, isMessage, Timestamp } from "@bufbuild/protobuf";

import {
  Func,
  FuncRegistry,
  type StrictBinaryOp,
  type StrictOp,
  type StrictUnaryOp,
} from "../func.js";
import * as opc from "../gen/dev/cel/expr/operator_const.js";
import * as olc from "../gen/dev/cel/expr/overload_const.js";
import * as type from "../value/type.js";
import {
  type CelVal,
  CelError,
  CelUnknown,
  CelList,
  CelUint,
  newDuration,
  newTimestamp,
  CelErrors,
} from "../value/value.js";

const MAX_INT = 9223372036854775807n;
// eslint-disable-next-line no-loss-of-precision
const MAX_INT_NUM = 9223372036854775807.0;
const MIN_INT = -9223372036854775808n;
const MIN_INT_NUM = -9223372036854775808.0;
const MAX_UINT = 18446744073709551615n;
const MAX_UINT_NUM = 18446744073709551616.0;
const MIN_UINT = 0n;
const MIN_UINT_NUM = 0.0;

export function isOverflowInt(val: bigint): boolean {
  return val < MIN_INT || val > MAX_INT;
}
export function isOverflowIntNum(val: number): boolean {
  return isNaN(val) || val <= MIN_INT_NUM || val >= MAX_INT_NUM;
}

export function isOverflowUint(val: bigint): boolean {
  return val < MIN_UINT || val > MAX_UINT;
}
export function isOverflowUintNum(val: number): boolean {
  return isNaN(val) || val < MIN_UINT_NUM || val > MAX_UINT_NUM;
}

export function addMath(funcs: FuncRegistry) {
  funcs.add(addFunc, [
    addIntFunc,
    addUintFunc,
    addDoubleFunc,
    addStringFunc,
    addBytesFunc,
    addListFunc,
    addTimeFunc,
  ]);
  funcs.add(subFunc, [subIntFunc, subUintFunc, subDoubleFunc, subTimeFunc]);
  funcs.add(mulFunc, [mulIntFunc, mulUintFunc, mulDoubleFunc]);
  funcs.add(divFunc, [divIntFunc, divUintFunc, divDoubleFunc]);
  funcs.add(modFunc, [modIntFunc, modUintFunc]);
  funcs.add(negFunc, [negIntFunc, negDoubleFunc]);
}

const addIntOp: StrictOp = (id: number, args: CelVal[]) => {
  let sum = 0n;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg !== "bigint") {
      return undefined;
    }
    sum += arg;
    if (isOverflowInt(sum)) {
      return CelErrors.overflow(id, opc.ADD, type.INT);
    }
  }
  return sum;
};
const addIntFunc = Func.newStrict(opc.ADD, [olc.ADD_INT64], addIntOp);

const addUintOp: StrictOp = (id: number, args: CelVal[]) => {
  let sum = 0n;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof CelUint)) {
      return undefined;
    }
    sum += arg.value.valueOf();
    if (isOverflowUint(sum)) {
      return CelErrors.overflow(id, opc.ADD, type.UINT);
    }
  }
  return new CelUint(sum);
};
const addUintFunc = Func.newStrict(opc.ADD, [olc.ADD_UINT64], addUintOp);

const addDoubleOp: StrictOp = (_id: number, args: CelVal[]) => {
  let sum = 0;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg !== "number") {
      return undefined;
    }
    sum += arg;
  }
  return sum;
};
const addDoubleFunc = Func.newStrict(opc.ADD, [olc.ADD_DOUBLE], addDoubleOp);

const addStringOp: StrictOp = (_id: number, args: CelVal[]) => {
  let sum = "";
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg !== "string") {
      return undefined;
    }
    sum += arg;
  }
  return sum;
};
const addStringFunc = Func.newStrict(opc.ADD, [olc.ADD_STRING], addStringOp);

const addBytesOp: StrictOp = (_id: number, args: CelVal[]) => {
  let length = 0;
  const data: Uint8Array[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof Uint8Array)) {
      return undefined;
    }
    const bytes = arg;
    length += bytes.length;
    data.push(bytes);
  }
  const sum = Buffer.alloc(length);
  let offset = 0;
  for (let i = 0; i < data.length; i++) {
    const bytes = data[i];
    sum.set(bytes, offset);
    offset += bytes.length;
  }
  return sum;
};
const addBytesFunc = Func.newStrict(opc.ADD, [olc.ADD_BYTES], addBytesOp);

const addListOp: StrictOp = (_id: number, args: CelVal[]) => {
  const first = args[0];
  if (!(first instanceof CelList)) {
    return undefined;
  }
  let listType = type.getCelType(first) as type.ListType;
  const adapter = first.adapter;
  let values = first.value.slice();
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof CelList)) {
      return undefined;
    }
    const argType = type.getCelType(arg) as type.ListType;
    if (
      listType.elemType !== type.DYN &&
      !listType.elemType.identical(argType.elemType)
    ) {
      listType = type.LIST;
    }
    if (adapter === arg.adapter) {
      values = values.concat(arg.value);
      continue;
    }
    // Convert to the same adapter.
    const argValues = arg.value;
    for (let j = 0; j < argValues.length; j++) {
      const val = argValues[j];
      const celVal = arg.adapter.toCel(val);
      if (celVal instanceof CelError || celVal instanceof CelUnknown) {
        return celVal;
      }
      const converted = adapter.fromCel(celVal);
      if (converted instanceof CelError || converted instanceof CelUnknown) {
        return converted;
      }
      values.push(converted);
    }
  }
  return new CelList(values, adapter, listType);
};
const addListFunc = Func.newStrict(opc.ADD, [olc.ADD_LIST], addListOp);

function sumTimeOp(id: number, times: CelVal[]) {
  let tsCount = 0;
  let seconds = BigInt(0);
  let nanos = 0;
  for (let i = 0; i < times.length; i++) {
    const time = times[i];
    if (isMessage(time, Timestamp)) {
      tsCount++;
      seconds += time.seconds;
      nanos += time.nanos;
    } else if (isMessage(time, Duration)) {
      seconds += time.seconds;
      nanos += time.nanos;
    } else {
      return undefined;
    }
  }
  if (nanos > 999999999) {
    seconds += BigInt(Math.floor(nanos / 1000000000));
    nanos = nanos % 1000000000;
  }

  switch (tsCount) {
    case 0:
      if (seconds > 315576000000 || seconds < -315576000000) {
        return CelErrors.overflow(id, opc.ADD, type.DURATION);
      }
      return new Duration({ seconds: seconds, nanos: nanos });
    case 1:
      if (seconds > 253402300799 || seconds < -62135596800) {
        return CelErrors.overflow(id, opc.ADD, type.TIMESTAMP);
      }
      return new Timestamp({ seconds: seconds, nanos: nanos });
    default:
      return undefined;
  }
}

const addTimeFunc = Func.newStrict(
  opc.ADD,
  [
    olc.ADD_DURATION_DURATION,
    olc.ADD_TIMESTAMP_DURATION,
    olc.ADD_DURATION_TIMESTAMP,
  ],
  sumTimeOp,
);

const addFunc = Func.newStrict(opc.ADD, [], (id: number, args: CelVal[]) => {
  switch (type.getCelType(args[0])) {
    case type.INT:
      return addIntOp(id, args);
    case type.UINT:
      return addUintOp(id, args);
    case type.DOUBLE:
      return addDoubleOp(id, args);
    case type.STRING:
      return addStringOp(id, args);
    case type.BYTES:
      return addBytesOp(id, args);
    case type.DURATION:
      return sumTimeOp(id, args);
    case type.TIMESTAMP:
      return sumTimeOp(id, args);
    default:
      break;
  }
  if (args[0] instanceof CelList) {
    return addListOp(id, args);
  }
  return undefined;
});

const subIntOp: StrictBinaryOp = (id: number, lhs: CelVal, rhs: CelVal) => {
  if (typeof lhs === "bigint" && typeof rhs === "bigint") {
    const val = lhs - rhs;
    if (isOverflowInt(val)) {
      return CelErrors.overflow(id, opc.SUBTRACT, type.INT);
    }
    return val;
  }
  return undefined;
};
const subIntFunc = Func.binary(opc.SUBTRACT, [olc.SUBTRACT_INT64], subIntOp);

const subUintOp: StrictBinaryOp = (id: number, lhs: CelVal, rhs: CelVal) => {
  if (lhs instanceof CelUint && rhs instanceof CelUint) {
    const val = lhs.value.valueOf() - rhs.value.valueOf();
    if (isOverflowUint(val)) {
      return CelErrors.overflow(id, opc.SUBTRACT, type.UINT);
    }
    return new CelUint(val);
  }
  return undefined;
};
const subUintFunc = Func.binary(opc.SUBTRACT, [olc.SUBTRACT_UINT64], subUintOp);
const subDoubleOp: StrictBinaryOp = (_id: number, lhs: CelVal, rhs: CelVal) => {
  if (typeof lhs === "number" && typeof rhs === "number") {
    return lhs - rhs;
  }
  return undefined;
};
const subDoubleFunc = Func.binary(
  opc.SUBTRACT,
  [olc.SUBTRACT_DOUBLE],
  subDoubleOp,
);
const subTimeOp: StrictBinaryOp = (id: number, lhs: CelVal, rhs: CelVal) => {
  if (isMessage(lhs, Timestamp)) {
    if (isMessage(rhs, Timestamp)) {
      return newDuration(id, lhs.seconds - rhs.seconds, lhs.nanos - rhs.nanos);
    } else if (isMessage(rhs, Duration)) {
      return newTimestamp(id, lhs.seconds - rhs.seconds, lhs.nanos - rhs.nanos);
    } else {
      return undefined;
    }
  } else if (isMessage(lhs, Duration) && isMessage(rhs, Duration)) {
    return newDuration(id, lhs.seconds - rhs.seconds, lhs.nanos - rhs.nanos);
  }
  return undefined;
};
const subTimeFunc = Func.binary(
  opc.SUBTRACT,
  [
    olc.SUBTRACT_TIMESTAMP_TIMESTAMP,
    olc.SUBTRACT_DURATION_DURATION,
    olc.SUBTRACT_TIMESTAMP_DURATION,
  ],
  subTimeOp,
);

const subFunc = Func.binary(
  opc.SUBTRACT,
  [],
  (id: number, lhs: CelVal, rhs: CelVal) => {
    switch (type.getCelType(lhs)) {
      case type.INT:
        return subIntOp(id, lhs, rhs);
      case type.UINT:
        return subUintOp(id, lhs, rhs);
      case type.DOUBLE:
        return subDoubleOp(id, lhs, rhs);
      case type.DURATION:
        return subTimeOp(id, lhs, rhs);
      case type.TIMESTAMP:
        return subTimeOp(id, lhs, rhs);
      default:
        return undefined;
    }
  },
);

const mulIntOp: StrictOp = (id: number, args: CelVal[]) => {
  let product = 1n;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg !== "bigint") {
      return undefined;
    }
    product *= arg;
    if (isOverflowInt(product)) {
      return CelErrors.overflow(id, opc.MULTIPLY, type.INT);
    }
  }
  return product;
};
const mulIntFunc = Func.newStrict(opc.MULTIPLY, [olc.MULTIPLY_INT64], mulIntOp);

const mulUintOp: StrictOp = (id: number, args: CelVal[]) => {
  let product = 1n;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof CelUint)) {
      return undefined;
    }
    product *= arg.value.valueOf();
    if (isOverflowUint(product)) {
      return CelErrors.overflow(id, opc.MULTIPLY, type.UINT);
    }
  }
  return new CelUint(product);
};
const mulUintFunc = Func.newStrict(
  opc.MULTIPLY,
  [olc.MULTIPLY_UINT64],
  mulUintOp,
);

const mulDoubleOp: StrictOp = (_id: number, args: CelVal[]) => {
  let product = 1;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg !== "number") {
      return undefined;
    }
    product *= arg;
  }
  return product;
};
const mulDoubleFunc = Func.newStrict(
  opc.MULTIPLY,
  [olc.MULTIPLY_DOUBLE],
  mulDoubleOp,
);

const mulFunc = Func.newStrict(
  opc.MULTIPLY,
  [],
  (id: number, args: CelVal[]) => {
    switch (type.getCelType(args[0])) {
      case type.INT:
        return mulIntOp(id, args);
      case type.UINT:
        return mulUintOp(id, args);
      case type.DOUBLE:
        return mulDoubleOp(id, args);
      default:
        return undefined;
    }
  },
);

const divIntOp: StrictBinaryOp = (id: number, lhs: CelVal, rhs: CelVal) => {
  if (typeof lhs === "bigint" && typeof rhs === "bigint") {
    if (rhs === 0n) {
      return CelErrors.divisionByZero(id, type.INT);
    } else if (rhs === -1n && lhs === -(2n ** 63n)) {
      return CelErrors.overflow(id, opc.DIVIDE, type.INT);
    }
    return lhs / rhs;
  }
  return undefined;
};
const divIntFunc = Func.binary(opc.DIVIDE, [olc.DIVIDE_INT64], divIntOp);
const divUintOp: StrictBinaryOp = (id: number, lhs: CelVal, rhs: CelVal) => {
  if (lhs instanceof CelUint && rhs instanceof CelUint) {
    if (rhs.value.valueOf() === 0n) {
      return CelErrors.divisionByZero(id, type.UINT);
    }
    return new CelUint(lhs.value.valueOf() / rhs.value.valueOf());
  }
  return undefined;
};
const divUintFunc = Func.binary(opc.DIVIDE, [olc.DIVIDE_UINT64], divUintOp);
const divDoubleOp: StrictBinaryOp = (_id: number, lhs: CelVal, rhs: CelVal) => {
  if (typeof lhs === "number" && typeof rhs === "number") {
    return lhs / rhs;
  }
  return undefined;
};
const divDoubleFunc = Func.binary(opc.DIVIDE, [olc.DIVIDE_DOUBLE], divDoubleOp);
const divFunc = Func.binary(
  opc.DIVIDE,
  [],
  (id: number, lhs: CelVal, rhs: CelVal) => {
    switch (type.getCelType(lhs)) {
      case type.INT:
        return divIntOp(id, lhs, rhs);
      case type.UINT:
        return divUintOp(id, lhs, rhs);
      case type.DOUBLE:
        return divDoubleOp(id, lhs, rhs);
      default:
        return undefined;
    }
  },
);

const modIntOp: StrictBinaryOp = (id: number, lhs: CelVal, rhs: CelVal) => {
  if (typeof lhs === "bigint" && typeof rhs === "bigint") {
    if (rhs === 0n) {
      return CelErrors.moduloByZero(id, type.INT);
    }
    return lhs % rhs;
  }
  return undefined;
};
const modIntFunc = Func.binary(opc.MODULO, [olc.MODULO_INT64], modIntOp);
const modUintOp: StrictBinaryOp = (id: number, lhs: CelVal, rhs: CelVal) => {
  if (lhs instanceof CelUint && rhs instanceof CelUint) {
    if (rhs.value.valueOf() === 0n) {
      return CelErrors.moduloByZero(id, type.UINT);
    }
    return new CelUint(lhs.value.valueOf() % rhs.value.valueOf());
  }
  return undefined;
};
const modUintFunc = Func.binary(opc.MODULO, [olc.MODULO_UINT64], modUintOp);
const modFunc = Func.binary(
  opc.MODULO,
  [],
  (id: number, lhs: CelVal, rhs: CelVal) => {
    switch (type.getCelType(lhs)) {
      case type.INT:
        return modIntOp(id, lhs, rhs);
      case type.UINT:
        return modUintOp(id, lhs, rhs);
      default:
        return undefined;
    }
  },
);

const negIntOp: StrictUnaryOp = (id: number, arg: CelVal) => {
  if (typeof arg === "bigint") {
    const val = -arg;
    if (isOverflowInt(val)) {
      return CelErrors.overflow(id, opc.NEGATE, type.INT);
    }
    return val;
  }
  return undefined;
};
const negIntFunc = Func.unary(opc.NEGATE, [olc.NEGATE_INT64], negIntOp);
const negDoubleOp: StrictUnaryOp = (_id: number, arg: CelVal) => {
  if (typeof arg === "number") {
    return -arg;
  }
  return undefined;
};
const negDoubleFunc = Func.unary(opc.NEGATE, [olc.NEGATE_DOUBLE], negDoubleOp);
const negFunc = Func.unary(opc.NEGATE, [], (id: number, arg: CelVal) => {
  switch (type.getCelType(arg)) {
    case type.INT:
      return negIntOp(id, arg);
    case type.DOUBLE:
      return negDoubleOp(id, arg);
    default:
      return undefined;
  }
});
