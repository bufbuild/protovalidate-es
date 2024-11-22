import { Duration, isMessage, Timestamp } from "@bufbuild/protobuf";
import { utcToZonedTime } from "date-fns-tz";

import {
  Func,
  FuncRegistry,
  type StrictOp,
  type StrictUnaryOp,
} from "../func.js";
import * as olc from "../gen/dev/cel/expr/overload_const.js";
import { CelErrors } from "../value/value.js";

type TimeFunc = (val: Date) => number;

function makeTimeOp(_op: string, t: TimeFunc): StrictOp {
  return (id, args) => {
    if (!isMessage(args[0], Timestamp)) {
      return undefined;
    }
    let val = args[0].toDate();
    if (args.length >= 2) {
      if (typeof args[1] !== "string") {
        return undefined;
      }
      val = utcToZonedTime(val, args[1]);
      // check if InvalidDate was returned
      if (isNaN(val.getTime())) {
        // Try with a leading '+' as a workaround for date-fns-tz bug.
        val = utcToZonedTime(args[0].toDate(), "+" + args[1]);
        if (isNaN(val.getTime())) {
          return CelErrors.invalidTz(id, args[1]);
        }
      }
    } else {
      val = utcToZonedTime(val, "UTC");
    }
    const result = t(val);
    try {
      return BigInt(result);
    } catch (_e) {
      throw new Error(
        `Error converting ${result} of ${String(val)} of ${String(
          args[0].toJson(),
        )} to BigInt`,
      );
    }
  };
}
function makeTimeFunc(name: string, overloads: string[], t: TimeFunc): Func {
  return Func.newStrict(name, overloads, makeTimeOp(name, t));
}

const timeGeFullYearFunc = makeTimeFunc(
  olc.TIME_GET_FULL_YEAR,
  [olc.TIMESTAMP_TO_YEAR, olc.TIMESTAMP_TO_YEAR_WITH_TZ],
  (val) => val.getFullYear(),
);

const timeGetMonthFunc = makeTimeFunc(
  olc.TIME_GET_MONTH,
  [olc.TIMESTAMP_TO_MONTH, olc.TIMESTAMP_TO_MONTH_WITH_TZ],
  (val) => val.getMonth(),
);

const timeGetDateFunc = makeTimeFunc(
  olc.TIME_GET_DATE,
  [
    olc.TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED,
    olc.TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_WITH_TZ,
  ],
  (val) => val.getDate(),
);

const timeGetDayOfMonthFunc = makeTimeFunc(
  olc.TIME_GET_DAY_OF_MONTH,
  [
    olc.TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED,
    olc.TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_WITH_TZ,
  ],
  (val) => val.getDate() - 1,
);

const timeGetDayOfYearFunc = makeTimeFunc(
  olc.TIME_GET_DAY_OF_YEAR,
  [olc.TIMESTAMP_TO_DAY_OF_YEAR, olc.TIMESTAMP_TO_DAY_OF_YEAR_WITH_TZ],
  (val) => {
    const start = new Date(0, 0, 1);
    start.setFullYear(val.getFullYear());
    const diff = val.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  },
);

const timeGetDayOfWeekFunc = makeTimeFunc(
  olc.TIME_GET_DAY_OF_WEEK,
  [olc.TIMESTAMP_TO_DAY_OF_WEEK, olc.TIMESTAMP_TO_DAY_OF_WEEK_WITH_TZ],
  (val) => val.getDay(),
);

// TimeGetSeconds
const timestampToSecondsOp: StrictOp = makeTimeOp(
  olc.TIMESTAMP_TO_SECONDS,
  (val) => val.getSeconds(),
);
const timestampToSecondsFunc = Func.newStrict(
  olc.TIME_GET_SECONDS,
  [olc.TIMESTAMP_TO_SECONDS, olc.TIMESTAMP_TO_SECONDS_WITH_TZ],
  timestampToSecondsOp,
);
const durationToSecondsOp: StrictUnaryOp = (_id, val) => {
  if (isMessage(val, Duration)) {
    return val.seconds;
  }
  return undefined;
};
const durationToSecondsFunc = Func.unary(
  olc.TIME_GET_SECONDS,
  [olc.DURATION_TO_SECONDS],
  durationToSecondsOp,
);
const timeGetSecondsFunc = Func.newStrict(
  olc.TIME_GET_SECONDS,
  [],
  (id, args) => {
    if (isMessage(args[0], Timestamp)) {
      return timestampToSecondsOp(id, args);
    } else if (isMessage(args[0], Duration)) {
      return durationToSecondsOp(id, args[0]);
    }
    return undefined;
  },
);

// TimeGetHours
const timestampToHoursOp: StrictOp = makeTimeOp(olc.TIMESTAMP_TO_HOURS, (val) =>
  val.getHours(),
);
const timestampToHoursFunc = Func.newStrict(
  olc.TIME_GET_HOURS,
  [olc.TIMESTAMP_TO_HOURS, olc.TIMESTAMP_TO_HOURS_WITH_TZ],
  timestampToHoursOp,
);
const durationToHoursOp: StrictUnaryOp = (_id, val) => {
  if (isMessage(val, Duration)) {
    return val.seconds / 3600n;
  }
  return undefined;
};
const DurationToHoursFunc = Func.unary(
  olc.TIME_GET_HOURS,
  [olc.DURATION_TO_HOURS],
  durationToHoursOp,
);
const timeGetHoursFunc = Func.newStrict(olc.TIME_GET_HOURS, [], (id, args) => {
  if (isMessage(args[0], Timestamp)) {
    return timestampToHoursOp(id, args);
  } else if (isMessage(args[0], Duration)) {
    return durationToHoursOp(id, args[0]);
  }
  return undefined;
});

// TimeGetMinutes
const timestampToMinutesOp: StrictOp = makeTimeOp(
  olc.TIMESTAMP_TO_MINUTES,
  (val) => val.getMinutes(),
);
const timestampToMinutesFunc = Func.newStrict(
  olc.TIME_GET_MINUTES,
  [olc.TIMESTAMP_TO_MINUTES, olc.TIMESTAMP_TO_MINUTES_WITH_TZ],
  timestampToMinutesOp,
);
const durationToMinutesOp: StrictUnaryOp = (_id, val) => {
  if (isMessage(val, Duration)) {
    return val.seconds / 60n;
  }
  return undefined;
};
const durationToMinutesFunc = Func.unary(
  olc.TIME_GET_MINUTES,
  [olc.DURATION_TO_MINUTES],
  durationToMinutesOp,
);
const timeGetMinutesFunc = Func.newStrict(
  olc.TIME_GET_MINUTES,
  [],
  (id, args) => {
    if (isMessage(args[0], Timestamp)) {
      return timestampToMinutesOp(id, args);
    } else if (isMessage(args[0], Duration)) {
      return durationToMinutesOp(id, args[0]);
    }
    return undefined;
  },
);

// TimeGetMilliseconds
const timestampToMillisecondsOp: StrictOp = makeTimeOp(
  olc.TIMESTAMP_TO_MILLISECONDS,
  (val) => val.getMilliseconds(),
);
const timestampToMillisecondsFunc = Func.newStrict(
  olc.TIME_GET_MILLISECONDS,
  [olc.TIMESTAMP_TO_MILLISECONDS, olc.TIMESTAMP_TO_MILLISECONDS_WITH_TZ],
  timestampToMillisecondsOp,
);
const durationToMillisecondsOp: StrictUnaryOp = (_id, val) => {
  if (isMessage(val, Duration)) {
    return BigInt(val.nanos) / 1000000n;
  }
  return undefined;
};
const durationToMillisecondsFunc = Func.unary(
  olc.TIME_GET_MILLISECONDS,
  [olc.DURATION_TO_MILLISECONDS],
  durationToMillisecondsOp,
);

const timeGetMillisecondsFunc = Func.newStrict(
  olc.TIME_GET_MILLISECONDS,
  [],
  (id, args) => {
    if (isMessage(args[0], Timestamp)) {
      return timestampToMillisecondsOp(id, args);
    } else if (isMessage(args[0], Duration)) {
      return durationToMillisecondsOp(id, args[0]);
    }
    return undefined;
  },
);

export function addTime(funcs: FuncRegistry): void {
  funcs.add(timeGeFullYearFunc);
  funcs.add(timeGetMonthFunc);
  funcs.add(timeGetDateFunc);
  funcs.add(timeGetDayOfWeekFunc);
  funcs.add(timeGetDayOfMonthFunc);
  funcs.add(timeGetDayOfYearFunc);
  funcs.add(timeGetSecondsFunc, [
    durationToSecondsFunc,
    timestampToSecondsFunc,
  ]);
  funcs.add(timeGetMinutesFunc, [
    durationToMinutesFunc,
    timestampToMinutesFunc,
  ]);
  funcs.add(timeGetHoursFunc, [DurationToHoursFunc, timestampToHoursFunc]);
  funcs.add(timeGetMillisecondsFunc, [
    durationToMillisecondsFunc,
    timestampToMillisecondsFunc,
  ]);
}
