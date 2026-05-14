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

import { type DescField, isFieldSet, type Message } from "@bufbuild/protobuf";
import type {
  Path,
  PathBuilder,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import type { Cursor } from "../cursor.js";
import type { Eval } from "../eval.js";
import type {
  DoubleRules,
  FloatRules,
  Fixed32Rules,
  Fixed64Rules,
  Int32Rules,
  Int64Rules,
  SFixed32Rules,
  SFixed64Rules,
  SInt32Rules,
  SInt64Rules,
  UInt32Rules,
  UInt64Rules,
} from "../gen/buf/validate/validate_pb.js";
import type { ScalarNativeResult } from "./dispatcher.js";
import { printFloat } from "./format.js";
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

export const int32Config: NumericConfig<number> = {
  typeName: "int32",
  descs: int32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const int64Config: NumericConfig<bigint> = {
  typeName: "int64",
  descs: int64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const uint32Config: NumericConfig<number> = {
  typeName: "uint32",
  descs: uint32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const uint64Config: NumericConfig<bigint> = {
  typeName: "uint64",
  descs: uint64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const sint32Config: NumericConfig<number> = {
  typeName: "sint32",
  descs: sint32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const sint64Config: NumericConfig<bigint> = {
  typeName: "sint64",
  descs: sint64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const fixed32Config: NumericConfig<number> = {
  typeName: "fixed32",
  descs: fixed32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const fixed64Config: NumericConfig<bigint> = {
  typeName: "fixed64",
  descs: fixed64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const sfixed32Config: NumericConfig<number> = {
  typeName: "sfixed32",
  descs: sfixed32Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const sfixed64Config: NumericConfig<bigint> = {
  typeName: "sfixed64",
  descs: sfixed64Descs,
  format: stringFormat,
  nanFailsRange: false,
};
export const floatConfig: NumericConfig<number> = {
  typeName: "float",
  descs: floatDescs,
  format: floatFormat,
  nanFailsRange: true,
};
export const doubleConfig: NumericConfig<number> = {
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

type LowerBound = "none" | "gt" | "gte";
type UpperBound = "none" | "lt" | "lte";

class EvalNativeNumericRules<T extends number | bigint>
  implements Eval<ScalarValue>
{
  constructor(
    private readonly config: NumericConfig<T>,
    private readonly forMapKey: boolean,
    private readonly constVal: T | undefined,
    private readonly inVals: readonly T[],
    private readonly notInVals: readonly T[],
    private readonly lower: LowerBound,
    private readonly lo: T,
    private readonly upper: UpperBound,
    private readonly hi: T,
    private readonly finite: boolean,
    private readonly paths: {
      const: Path | undefined;
      in: Path | undefined;
      notIn: Path | undefined;
      lo: Path | undefined;
      hi: Path | undefined;
      finite: Path | undefined;
    },
  ) {}

  eval(val: ScalarValue, cursor: Cursor): void {
    const v = val as T;

    if (this.constVal !== undefined && v !== this.constVal) {
      cursor.violate(
        `must equal ${this.config.format(this.constVal)}`,
        `${this.config.typeName}.const`,
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever constVal is set
        this.paths.const!,
        this.forMapKey,
      );
    }

    if (this.inVals.length > 0 && !contains(this.inVals, v)) {
      cursor.violate(
        `must be in list ${this.formatList(this.inVals)}`,
        `${this.config.typeName}.in`,
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever inVals is non-empty
        this.paths.in!,
        this.forMapKey,
      );
    }

    if (this.notInVals.length > 0 && contains(this.notInVals, v)) {
      cursor.violate(
        `must not be in list ${this.formatList(this.notInVals)}`,
        `${this.config.typeName}.not_in`,
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever notInVals is non-empty
        this.paths.notIn!,
        this.forMapKey,
      );
    }

    if (
      this.finite &&
      typeof v === "number" &&
      (Number.isNaN(v) || !Number.isFinite(v))
    ) {
      cursor.violate(
        "must be finite",
        `${this.config.typeName}.finite`,
        // biome-ignore lint/style/noNonNullAssertion: path is set whenever finite=true
        this.paths.finite!,
        this.forMapKey,
      );
    }

    this.evalRange(v, cursor);
  }

  prune(): boolean {
    return false;
  }

  private evalRange(v: T, cursor: Cursor): void {
    if (this.lower === "none" && this.upper === "none") {
      return;
    }
    const isNaNVal =
      this.config.nanFailsRange && typeof v === "number" && Number.isNaN(v);

    if (this.lower === "none") {
      if (isNaNVal || this.aboveHi(v)) {
        cursor.violate(
          `must be ${this.hiMessage()}`,
          this.rangeRuleId(),
          // biome-ignore lint/style/noNonNullAssertion: path set when upper != none
          this.paths.hi!,
          this.forMapKey,
        );
      }
      return;
    }
    if (this.upper === "none") {
      if (isNaNVal || this.belowLo(v)) {
        cursor.violate(
          `must be ${this.loMessage()}`,
          this.rangeRuleId(),
          // biome-ignore lint/style/noNonNullAssertion: path set when lower != none
          this.paths.lo!,
          this.forMapKey,
        );
      }
      return;
    }
    let fail: boolean;
    if (this.isNormalRange()) {
      fail = isNaNVal || this.aboveHi(v) || this.belowLo(v);
    } else {
      fail = isNaNVal || (this.aboveHi(v) && this.belowLo(v));
    }
    if (fail) {
      cursor.violate(
        `must be ${this.loMessage()} ${this.conjunction()} ${this.hiMessage()}`,
        this.rangeRuleId(),
        // biome-ignore lint/style/noNonNullAssertion: path set when lower != none
        this.paths.lo!,
        this.forMapKey,
      );
    }
  }

  private belowLo(v: T): boolean {
    return this.lower === "gt" ? v <= this.lo : v < this.lo;
  }

  private aboveHi(v: T): boolean {
    return this.upper === "lt" ? v >= this.hi : v > this.hi;
  }

  private isNormalRange(): boolean {
    return this.hi >= this.lo;
  }

  private loMessage(): string {
    return this.lower === "gt"
      ? `greater than ${this.config.format(this.lo)}`
      : `greater than or equal to ${this.config.format(this.lo)}`;
  }

  private hiMessage(): string {
    return this.upper === "lt"
      ? `less than ${this.config.format(this.hi)}`
      : `less than or equal to ${this.config.format(this.hi)}`;
  }

  private conjunction(): string {
    return this.isNormalRange() ? "and" : "or";
  }

  private rangeRuleId(): string {
    const t = this.config.typeName;
    if (this.lower === "none") {
      return `${t}.${this.upper}`;
    }
    if (this.upper === "none") {
      return `${t}.${this.lower}`;
    }
    const suffix = this.isNormalRange() ? "" : "_exclusive";
    return `${t}.${this.lower}_${this.upper}${suffix}`;
  }

  private formatList(vs: readonly T[]): string {
    let out = "[";
    for (let i = 0; i < vs.length; i++) {
      if (i > 0) out += ", ";
      out += this.config.format(vs[i] as T);
    }
    return `${out}]`;
  }
}

function contains<T extends number | bigint>(arr: readonly T[], v: T): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === v) return true;
  }
  return false;
}

function buildNumeric<T extends number | bigint>(
  rules:
    | NumericRulesShape<T>
    | NumericRulesWithFinite<T extends number ? T : never>,
  config: NumericConfig<T>,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  if (rules.$unknown && rules.$unknown.length > 0) {
    return { kind: "none" };
  }
  const handled = new Set<DescField>();
  const paths: {
    const: Path | undefined;
    in: Path | undefined;
    notIn: Path | undefined;
    lo: Path | undefined;
    hi: Path | undefined;
    finite: Path | undefined;
  } = {
    const: undefined,
    in: undefined,
    notIn: undefined,
    lo: undefined,
    hi: undefined,
    finite: undefined,
  };

  let constVal: T | undefined;
  if (isFieldSet(rules, config.descs.const)) {
    constVal = rules.const;
    paths.const = rulePath.clone().field(config.descs.const).toPath();
    handled.add(config.descs.const);
  }

  let inVals: readonly T[] = [];
  if (rules.in.length > 0) {
    inVals = rules.in;
    paths.in = rulePath.clone().field(config.descs.in).toPath();
    handled.add(config.descs.in);
  }

  let notInVals: readonly T[] = [];
  if (rules.notIn.length > 0) {
    notInVals = rules.notIn;
    paths.notIn = rulePath.clone().field(config.descs.notIn).toPath();
    handled.add(config.descs.notIn);
  }

  let lower: LowerBound = "none";
  let lo: T = 0 as T;
  if (rules.greaterThan.case === "gt") {
    if (isNaNValue(rules.greaterThan.value)) return { kind: "none" };
    lower = "gt";
    lo = rules.greaterThan.value;
    paths.lo = rulePath.clone().field(config.descs.gt).toPath();
    handled.add(config.descs.gt);
  } else if (rules.greaterThan.case === "gte") {
    if (isNaNValue(rules.greaterThan.value)) return { kind: "none" };
    lower = "gte";
    lo = rules.greaterThan.value;
    paths.lo = rulePath.clone().field(config.descs.gte).toPath();
    handled.add(config.descs.gte);
  }

  let upper: UpperBound = "none";
  let hi: T = 0 as T;
  if (rules.lessThan.case === "lt") {
    if (isNaNValue(rules.lessThan.value)) return { kind: "none" };
    upper = "lt";
    hi = rules.lessThan.value;
    paths.hi = rulePath.clone().field(config.descs.lt).toPath();
    handled.add(config.descs.lt);
  } else if (rules.lessThan.case === "lte") {
    if (isNaNValue(rules.lessThan.value)) return { kind: "none" };
    upper = "lte";
    hi = rules.lessThan.value;
    paths.hi = rulePath.clone().field(config.descs.lte).toPath();
    handled.add(config.descs.lte);
  }

  let finite = false;
  if (config.descs.finite && isFieldSet(rules, config.descs.finite)) {
    finite = (rules as NumericRulesWithFinite<number>).finite;
    if (finite) {
      paths.finite = rulePath.clone().field(config.descs.finite).toPath();
    }
    handled.add(config.descs.finite);
  }

  if (handled.size === 0) {
    return { kind: "none" };
  }

  return {
    kind: "full",
    eval: new EvalNativeNumericRules<T>(
      config,
      forMapKey,
      constVal,
      inVals,
      notInVals,
      lower,
      lo,
      upper,
      hi,
      finite,
      paths,
    ),
    handledFields: handled,
  };
}

function isNaNValue(v: number | bigint): boolean {
  return typeof v === "number" && Number.isNaN(v);
}

export function tryBuildNativeInt32Rules(
  rules: Int32Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<number>(
    rules as unknown as NumericRulesShape<number>,
    int32Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeInt64Rules(
  rules: Int64Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<bigint>(
    rules as unknown as NumericRulesShape<bigint>,
    int64Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeUint32Rules(
  rules: UInt32Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<number>(
    rules as unknown as NumericRulesShape<number>,
    uint32Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeUint64Rules(
  rules: UInt64Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<bigint>(
    rules as unknown as NumericRulesShape<bigint>,
    uint64Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeSint32Rules(
  rules: SInt32Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<number>(
    rules as unknown as NumericRulesShape<number>,
    sint32Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeSint64Rules(
  rules: SInt64Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<bigint>(
    rules as unknown as NumericRulesShape<bigint>,
    sint64Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeFixed32Rules(
  rules: Fixed32Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<number>(
    rules as unknown as NumericRulesShape<number>,
    fixed32Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeFixed64Rules(
  rules: Fixed64Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<bigint>(
    rules as unknown as NumericRulesShape<bigint>,
    fixed64Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeSfixed32Rules(
  rules: SFixed32Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<number>(
    rules as unknown as NumericRulesShape<number>,
    sfixed32Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeSfixed64Rules(
  rules: SFixed64Rules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<bigint>(
    rules as unknown as NumericRulesShape<bigint>,
    sfixed64Config,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeFloatRules(
  rules: FloatRules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<number>(
    rules as unknown as NumericRulesWithFinite<number>,
    floatConfig,
    rulePath,
    forMapKey,
  );
}

export function tryBuildNativeDoubleRules(
  rules: DoubleRules,
  rulePath: PathBuilder,
  forMapKey: boolean,
): ScalarNativeResult {
  return buildNumeric<number>(
    rules as unknown as NumericRulesWithFinite<number>,
    doubleConfig,
    rulePath,
    forMapKey,
  );
}
