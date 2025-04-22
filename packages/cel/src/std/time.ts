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

import { isMessage, toJson } from "@bufbuild/protobuf";
import {
  DurationSchema,
  timestampDate,
  TimestampSchema,
} from "@bufbuild/protobuf/wkt";

import {
  Func,
  FuncRegistry,
  type StrictOp,
  type StrictUnaryOp,
} from "../func.js";
import * as olc from "../gen/dev/cel/expr/overload_const.js";
import { type CelVal } from "../value/value.js";

type TimeFunc = (val: Date) => number;
function makeTimeOp(_op: string, t: TimeFunc): StrictOp {
  return (id: number, args: CelVal[]) => {
    if (!isMessage(args[0], TimestampSchema)) {
      return undefined;
    }
    let val = timestampDate(args[0]);
    if (args.length >= 2) {
      if (typeof args[1] !== "string") {
        return undefined;
      }
      // Timezone can either be Fixed or IANA or "UTC".
      // We first check for the fixed offset case.
      //
      // Ref: https://github.com/google/cel-spec/blob/master/doc/langdef.md#timezones
      const timeOffset = args[1].match(
        /^(?<sign>[+-]?)(?<hours>\d\d):(?<minutes>\d\d)$/,
      );
      if (timeOffset && timeOffset.groups) {
        const sign = timeOffset.groups["sign"] == "-" ? 1 : -1;
        const hours = parseInt(timeOffset.groups["hours"]);
        const minutes = parseInt(timeOffset.groups["minutes"]);
        const offset = sign * (hours * 60 * 60 * 1000 + minutes * 60 * 1000);
        val = new Date(val.getTime() - offset);
        val = new Date(
          val.getUTCFullYear(),
          val.getUTCMonth(),
          val.getUTCDate(),
          val.getUTCHours(),
          val.getUTCMinutes(),
          val.getUTCSeconds(),
          val.getUTCMilliseconds(),
        );
      } else {
        // Must be an IANA timezone, so we use the Intl API to format the string
        // in the desired timezone and extract the parts from that.
        //
        // The APIs are part of baseline 2020.
        const format = new Intl.DateTimeFormat("en-US", {
          hourCycle: "h23",
          hour12: false,
          timeZone: args[1],
          year: "numeric",
          month: "numeric",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        let year, month, day, hour, minute, second;
        for (const part of format.formatToParts(val)) {
          switch (part.type) {
            case "year":
              year = parseInt(part.value);
              break;
            case "month":
              month = parseInt(part.value) - 1;
              break;
            case "day":
              day = parseInt(part.value);
              break;
            case "hour":
              hour = parseInt(part.value);
              break;
            case "minute":
              minute = parseInt(part.value);
              break;
            case "second":
              second = parseInt(part.value);
              break;
          }
        }
        if (
          year === undefined ||
          month === undefined ||
          day === undefined ||
          hour === undefined ||
          minute === undefined ||
          second === undefined
        ) {
          throw new Error(
            `Error converting ${toJson(TimestampSchema, args[0])} to IANA timezone ${args[1]}`,
          );
        }
        val = new Date(
          year,
          month,
          day,
          hour,
          minute,
          second,
          val.getUTCMilliseconds(),
        );
      }
    } else {
      val = new Date(
        val.getUTCFullYear(),
        val.getUTCMonth(),
        val.getUTCDate(),
        val.getUTCHours(),
        val.getUTCMinutes(),
        val.getUTCSeconds(),
        val.getUTCMilliseconds(),
      );
    }
    const result = t(val);
    try {
      return BigInt(result);
    } catch (_e) {
      throw new Error(
        `Error converting ${result} of ${String(val)} of ${toJson(TimestampSchema, args[0])} to BigInt`,
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
const durationToSecondsOp: StrictUnaryOp = (_id: number, val: CelVal) => {
  if (isMessage(val, DurationSchema)) {
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
  (id: number, args: CelVal[]) => {
    if (isMessage(args[0], TimestampSchema)) {
      return timestampToSecondsOp(id, args);
    } else if (isMessage(args[0], DurationSchema)) {
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
const durationToHoursOp: StrictUnaryOp = (_id: number, val: CelVal) => {
  if (isMessage(val, DurationSchema)) {
    return val.seconds / 3600n;
  }
  return undefined;
};
const DurationToHoursFunc = Func.unary(
  olc.TIME_GET_HOURS,
  [olc.DURATION_TO_HOURS],
  durationToHoursOp,
);
const timeGetHoursFunc = Func.newStrict(
  olc.TIME_GET_HOURS,
  [],
  (id: number, args: CelVal[]) => {
    if (isMessage(args[0], TimestampSchema)) {
      return timestampToHoursOp(id, args);
    } else if (isMessage(args[0], DurationSchema)) {
      return durationToHoursOp(id, args[0]);
    }
    return undefined;
  },
);

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
const durationToMinutesOp: StrictUnaryOp = (_id: number, val: CelVal) => {
  if (isMessage(val, DurationSchema)) {
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
  (id: number, args: CelVal[]) => {
    if (isMessage(args[0], TimestampSchema)) {
      return timestampToMinutesOp(id, args);
    } else if (isMessage(args[0], DurationSchema)) {
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
const durationToMillisecondsOp: StrictUnaryOp = (_id: number, val: CelVal) => {
  if (isMessage(val, DurationSchema)) {
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
  (id: number, args: CelVal[]) => {
    if (isMessage(args[0], TimestampSchema)) {
      return timestampToMillisecondsOp(id, args);
    } else if (isMessage(args[0], DurationSchema)) {
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
