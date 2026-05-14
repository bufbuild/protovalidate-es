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

import { isFieldSet, type Message } from "@bufbuild/protobuf";
import type {
  Path,
  PathBuilder,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import type { Cursor } from "../cursor.js";
import type { Eval } from "../eval.js";
import {
  DoubleRulesSchema,
  Fixed32RulesSchema,
  Fixed64RulesSchema,
  FloatRulesSchema,
  Int32RulesSchema,
  Int64RulesSchema,
  SFixed32RulesSchema,
  SFixed64RulesSchema,
  SInt32RulesSchema,
  SInt64RulesSchema,
  UInt32RulesSchema,
  UInt64RulesSchema,
} from "../gen/buf/validate/validate_pb.js";
import type { ScalarNativeResult } from "./dispatcher.js";
import { formatList, printFloat } from "./format.js";
import {
  doubleDescs,
  fixed32Descs,
  fixed64Descs,
  floatDescs,
  int32Descs,
  int64Descs,
  type NumericRulesDescs,
  sfixed32Descs,
  sfixed64Descs,
  sint32Descs,
  sint64Descs,
  uint32Descs,
  uint64Descs,
} from "./sites.js";

/**
 * Per-scalar configuration for the numeric native evaluator.
 *
 * `T` is `number` for 32-bit ints + float/double, `bigint` for 64-bit ints.
 */
type NumericConfig<T extends number | bigint> = {
  readonly typeName: string;
  readonly descs: NumericRulesDescs;
  /** Format a value into the user-facing error string. */
  readonly format: (v: T) => string;
  /** True only for float/double: a NaN field value fails every range check. */
  readonly nanFailsRange: boolean;
};

const stringFormat = (v: number | bigint): string => v.toString();
const floatFormat = (v: number): string => printFloat(v);

const int32Config: NumericConfig<number> = {
  typeName: "int32",
  descs: int32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const int64Config: NumericConfig<bigint> = {
  typeName: "int64",
  descs: int64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const uint32Config: NumericConfig<number> = {
  typeName: "uint32",
  descs: uint32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const uint64Config: NumericConfig<bigint> = {
  typeName: "uint64",
  descs: uint64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const sint32Config: NumericConfig<number> = {
  typeName: "sint32",
  descs: sint32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const sint64Config: NumericConfig<bigint> = {
  typeName: "sint64",
  descs: sint64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const fixed32Config: NumericConfig<number> = {
  typeName: "fixed32",
  descs: fixed32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const fixed64Config: NumericConfig<bigint> = {
  typeName: "fixed64",
  descs: fixed64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const sfixed32Config: NumericConfig<number> = {
  typeName: "sfixed32",
  descs: sfixed32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const sfixed64Config: NumericConfig<bigint> = {
  typeName: "sfixed64",
  descs: sfixed64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
const floatConfig: NumericConfig<number> = {
  typeName: "float",
  descs: floatDescs,
  format: floatFormat,
  nanFailsRange: true,
};
const doubleConfig: NumericConfig<number> = {
  typeName: "double",
  descs: doubleDescs,
  format: floatFormat,
  nanFailsRange: true,
};

/**
 * The shape all 12 numeric rules messages share (after accounting for the
 * `greater_than` / `less_than` oneofs).
 */
type NumericRulesShape<T extends number | bigint> = Message<string> & {
  const: T;
  in: readonly T[];
  notIn: readonly T[];
  greaterThan:
    | { case: "gt"; value: T }
    | { case: "gte"; value: T }
    | { case: undefined; value?: undefined };
  lessThan:
    | { case: "lt"; value: T }
    | { case: "lte"; value: T }
    | { case: undefined; value?: undefined };
};

/** Float and Double additionally carry the `finite` flag. */
type NumericRulesWithFinite<T extends number> = NumericRulesShape<T> & {
  finite: boolean;
};

type ConstRule<T> = { readonly val: T; readonly path: Path };
type ListRule<T> = { readonly vals: readonly T[]; readonly path: Path };
type LowerRule<T> = {
  readonly kind: "gt" | "gte";
  readonly val: T;
  readonly path: Path;
};
type UpperRule<T> = {
  readonly kind: "lt" | "lte";
  readonly val: T;
  readonly path: Path;
};

class EvalNativeNumericRules<T extends number | bigint>
  implements Eval<ScalarValue>
{
  constructor(
    private readonly config: NumericConfig<T>,
    private readonly forMapKey: boolean,
    private readonly constRule: ConstRule<T> | undefined,
    private readonly inRule: ListRule<T> | undefined,
    private readonly notInRule: ListRule<T> | undefined,
    private readonly lowerRule: LowerRule<T> | undefined,
    private readonly upperRule: UpperRule<T> | undefined,
    private readonly finitePath: Path | undefined,
  ) {}

  eval(val: ScalarValue, cursor: Cursor): void {
    const v = val as T;

    if (this.constRule !== undefined && v !== this.constRule.val) {
      cursor.violate(
        `must equal ${this.config.format(this.constRule.val)}`,
        `${this.config.typeName}.const`,
        this.constRule.path,
        this.forMapKey,
      );
    }

    if (this.inRule !== undefined && !includesT(this.inRule.vals, v)) {
      cursor.violate(
        `must be in list ${formatList(this.inRule.vals, this.config.format)}`,
        `${this.config.typeName}.in`,
        this.inRule.path,
        this.forMapKey,
      );
    }

    if (this.notInRule !== undefined && includesT(this.notInRule.vals, v)) {
      cursor.violate(
        `must not be in list ${formatList(this.notInRule.vals, this.config.format)}`,
        `${this.config.typeName}.not_in`,
        this.notInRule.path,
        this.forMapKey,
      );
    }

    if (
      this.finitePath !== undefined &&
      typeof v === "number" &&
      (Number.isNaN(v) || !Number.isFinite(v))
    ) {
      cursor.violate(
        "must be finite",
        `${this.config.typeName}.finite`,
        this.finitePath,
        this.forMapKey,
      );
    }

    this.evalRange(v, cursor);
  }

  prune(): boolean {
    return false;
  }

  private evalRange(v: T, cursor: Cursor): void {
    const { lowerRule: lo, upperRule: hi } = this;
    if (lo === undefined && hi === undefined) {
      return;
    }
    const isNaNVal =
      this.config.nanFailsRange && typeof v === "number" && Number.isNaN(v);

    if (lo !== undefined && hi !== undefined) {
      const isNormal = hi.val >= lo.val;
      const fail = isNormal
        ? isNaNVal || aboveHi(v, hi) || belowLo(v, lo)
        : isNaNVal || (aboveHi(v, hi) && belowLo(v, lo));
      if (fail) {
        const suffix = isNormal ? "" : "_exclusive";
        cursor.violate(
          `must be ${loMessage(lo, this.config)} ${
            isNormal ? "and" : "or"
          } ${hiMessage(hi, this.config)}`,
          `${this.config.typeName}.${lo.kind}_${hi.kind}${suffix}`,
          lo.path,
          this.forMapKey,
        );
      }
      return;
    }
    if (lo !== undefined) {
      if (isNaNVal || belowLo(v, lo)) {
        cursor.violate(
          `must be ${loMessage(lo, this.config)}`,
          `${this.config.typeName}.${lo.kind}`,
          lo.path,
          this.forMapKey,
        );
      }
      return;
    }
    // hi must be defined since we returned early when both are undefined.
    if (hi !== undefined && (isNaNVal || aboveHi(v, hi))) {
      cursor.violate(
        `must be ${hiMessage(hi, this.config)}`,
        `${this.config.typeName}.${hi.kind}`,
        hi.path,
        this.forMapKey,
      );
    }
  }
}

function belowLo<T extends number | bigint>(v: T, lo: LowerRule<T>): boolean {
  return lo.kind === "gt" ? v <= lo.val : v < lo.val;
}

function aboveHi<T extends number | bigint>(v: T, hi: UpperRule<T>): boolean {
  return hi.kind === "lt" ? v >= hi.val : v > hi.val;
}

function loMessage<T extends number | bigint>(
  lo: LowerRule<T>,
  config: NumericConfig<T>,
): string {
  return lo.kind === "gt"
    ? `greater than ${config.format(lo.val)}`
    : `greater than or equal to ${config.format(lo.val)}`;
}

function hiMessage<T extends number | bigint>(
  hi: UpperRule<T>,
  config: NumericConfig<T>,
): string {
  return hi.kind === "lt"
    ? `less than ${config.format(hi.val)}`
    : `less than or equal to ${config.format(hi.val)}`;
}

function includesT<T extends number | bigint>(
  arr: readonly T[],
  v: T,
): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === v) return true;
  }
  return false;
}

function isNaNValue(v: number | bigint): boolean {
  return typeof v === "number" && Number.isNaN(v);
}

function build<T extends number | bigint>(
  rules: NumericRulesShape<T>,
  config: NumericConfig<T>,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult | undefined {
  if (rules.$unknown && rules.$unknown.length > 0) {
    return undefined;
  }

  const handled = new Set<import("@bufbuild/protobuf").DescField>();

  let constRule: ConstRule<T> | undefined;
  if (isFieldSet(rules, config.descs.const)) {
    constRule = {
      val: rules.const,
      path: rulePath.clone().field(config.descs.const).toPath(),
    };
    handled.add(config.descs.const);
  }

  let inRule: ListRule<T> | undefined;
  if (rules.in.length > 0) {
    inRule = {
      vals: rules.in,
      path: rulePath.clone().field(config.descs.in).toPath(),
    };
    handled.add(config.descs.in);
  }

  let notInRule: ListRule<T> | undefined;
  if (rules.notIn.length > 0) {
    notInRule = {
      vals: rules.notIn,
      path: rulePath.clone().field(config.descs.notIn).toPath(),
    };
    handled.add(config.descs.notIn);
  }

  let lowerRule: LowerRule<T> | undefined;
  if (rules.greaterThan.case !== undefined) {
    const kind = rules.greaterThan.case;
    const val = rules.greaterThan.value;
    if (isNaNValue(val)) return undefined;
    const desc = kind === "gt" ? config.descs.gt : config.descs.gte;
    lowerRule = {
      kind,
      val,
      path: rulePath.clone().field(desc).toPath(),
    };
    handled.add(desc);
  }

  let upperRule: UpperRule<T> | undefined;
  if (rules.lessThan.case !== undefined) {
    const kind = rules.lessThan.case;
    const val = rules.lessThan.value;
    if (isNaNValue(val)) return undefined;
    const desc = kind === "lt" ? config.descs.lt : config.descs.lte;
    upperRule = {
      kind,
      val,
      path: rulePath.clone().field(desc).toPath(),
    };
    handled.add(desc);
  }

  let finitePath: Path | undefined;
  if (config.descs.finite && isFieldSet(rules, config.descs.finite)) {
    const finite = (rules as unknown as NumericRulesWithFinite<number>).finite;
    if (finite) {
      finitePath = rulePath.clone().field(config.descs.finite).toPath();
    }
    handled.add(config.descs.finite);
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeNumericRules<T>(
      config,
      forMapKey,
      constRule,
      inRule,
      notInRule,
      lowerRule,
      upperRule,
      finitePath,
    ),
    handledFields: handled,
  };
}

/**
 * Build a native evaluator for any of the 12 numeric rules messages.
 * Returns `undefined` for any unrecognized type or for rules that bail out
 * (NaN bound, unknown extensions, no fields set).
 */
export function tryBuildNativeNumericRules(
  rules: Message<string>,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult | undefined {
  switch (rules.$typeName) {
    case Int32RulesSchema.typeName:
      return build<number>(
        rules as NumericRulesShape<number>,
        int32Config,
        rulePath,
        forMapKey,
      );
    case Int64RulesSchema.typeName:
      return build<bigint>(
        rules as NumericRulesShape<bigint>,
        int64Config,
        rulePath,
        forMapKey,
      );
    case UInt32RulesSchema.typeName:
      return build<number>(
        rules as NumericRulesShape<number>,
        uint32Config,
        rulePath,
        forMapKey,
      );
    case UInt64RulesSchema.typeName:
      return build<bigint>(
        rules as NumericRulesShape<bigint>,
        uint64Config,
        rulePath,
        forMapKey,
      );
    case SInt32RulesSchema.typeName:
      return build<number>(
        rules as NumericRulesShape<number>,
        sint32Config,
        rulePath,
        forMapKey,
      );
    case SInt64RulesSchema.typeName:
      return build<bigint>(
        rules as NumericRulesShape<bigint>,
        sint64Config,
        rulePath,
        forMapKey,
      );
    case Fixed32RulesSchema.typeName:
      return build<number>(
        rules as NumericRulesShape<number>,
        fixed32Config,
        rulePath,
        forMapKey,
      );
    case Fixed64RulesSchema.typeName:
      return build<bigint>(
        rules as NumericRulesShape<bigint>,
        fixed64Config,
        rulePath,
        forMapKey,
      );
    case SFixed32RulesSchema.typeName:
      return build<number>(
        rules as NumericRulesShape<number>,
        sfixed32Config,
        rulePath,
        forMapKey,
      );
    case SFixed64RulesSchema.typeName:
      return build<bigint>(
        rules as NumericRulesShape<bigint>,
        sfixed64Config,
        rulePath,
        forMapKey,
      );
    case FloatRulesSchema.typeName:
      return build<number>(
        rules as NumericRulesShape<number>,
        floatConfig,
        rulePath,
        forMapKey,
      );
    case DoubleRulesSchema.typeName:
      return build<number>(
        rules as NumericRulesShape<number>,
        doubleConfig,
        rulePath,
        forMapKey,
      );
    default:
      return undefined;
  }
}
