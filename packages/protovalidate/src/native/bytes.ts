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

import { type DescField, isFieldSet } from "@bufbuild/protobuf";
import type {
  Path,
  PathBuilder,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import type { Cursor } from "../cursor.js";
import type { Eval } from "../eval.js";
import { RuntimeError } from "../error.js";
import type { BytesRules } from "../gen/buf/validate/validate_pb.js";
import type { ScalarNativeResult } from "./dispatcher.js";
import { formatList } from "./format.js";
import { bytesDescs } from "./sites.js";
import type { RegexMatcher } from "../func.js";

/** A rule with a Uint8Array operand: const, prefix, suffix, contains. */
type BytesRule = { readonly val: Uint8Array; readonly path: Path };
/** A rule with a numeric size operand: len, min_len, max_len. */
type SizeRule = { readonly val: bigint; readonly path: Path };
/** A rule with a Uint8Array list operand: in, not_in. */
type BytesListRule = {
  readonly vals: readonly Uint8Array[];
  readonly path: Path;
};
type PatternRule = {
  readonly src: string;
  readonly test: (against: string) => boolean;
  readonly path: Path;
};

type WellKnownKind = "ip" | "ipv4" | "ipv6" | "uuid";

/**
 * Spec carried alongside an active well-known constraint, so `eval()` does
 * no per-call table lookups.
 */
type WellKnownRule = {
  readonly kind: WellKnownKind;
  readonly validSizes: readonly number[];
  readonly msg: string;
  readonly emptyMsg: string;
  readonly path: Path;
};

/**
 * Per-kind specs for the well-known bytes formats. Matches Go's
 * `bytesWellKnown` structs in `native_bytes.go` and CEL's predefined
 * annotations on the corresponding `BytesRules` fields.
 */
const WELL_KNOWN: Record<
  WellKnownKind,
  {
    readonly validSizes: readonly number[];
    readonly msg: string;
    readonly emptyMsg: string;
  }
> = {
  ip: {
    validSizes: [4, 16],
    msg: "must be a valid IP address",
    emptyMsg: "value is empty, which is not a valid IP address",
  },
  ipv4: {
    validSizes: [4],
    msg: "must be a valid IPv4 address",
    emptyMsg: "value is empty, which is not a valid IPv4 address",
  },
  ipv6: {
    validSizes: [16],
    msg: "must be a valid IPv6 address",
    emptyMsg: "value is empty, which is not a valid IPv6 address",
  },
  uuid: {
    validSizes: [16],
    msg: "must be a valid UUID",
    emptyMsg: "value is empty, which is not a valid UUID",
  },
};

/**
 * Strict UTF-8 decoder. `bytes.pattern` requires valid UTF-8 — non-UTF-8
 * input surfaces as a RuntimeError to match CEL's `string(bytes)` cast,
 * which uses `TextDecoder` with `fatal: true`.
 */
const utf8FatalDecoder = new TextDecoder("utf-8", { fatal: true });

/**
 * Non-fatal UTF-8 decoder for formatting bytes in error messages. Matches
 * CEL-TS's `formatString` on a Uint8Array, which uses a default
 * `new TextDecoder()` (non-fatal — invalid sequences become U+FFFD).
 */
const utf8NonFatalDecoder = new TextDecoder();

/**
 * Configuration for {@link EvalNativeBytesRules}. Bundled into a single
 * object so callers don't have to track ~12 positional constructor args.
 */
type BytesRulesConfig = {
  readonly forMapKey: boolean;
  readonly constRule?: BytesRule;
  readonly exactLen?: SizeRule;
  readonly minLen?: SizeRule;
  readonly maxLen?: SizeRule;
  readonly pattern?: PatternRule;
  readonly prefix?: BytesRule;
  readonly suffix?: BytesRule;
  readonly containsRule?: BytesRule;
  readonly inRule?: BytesListRule;
  readonly notInRule?: BytesListRule;
  readonly wellKnown?: WellKnownRule;
};

class EvalNativeBytesRules implements Eval<ScalarValue> {
  constructor(private readonly cfg: BytesRulesConfig) {}

  eval(val: ScalarValue, cursor: Cursor): void {
    const v = val as Uint8Array;
    const len = BigInt(v.length);
    const c = this.cfg;

    if (c.constRule !== undefined && !bytesEqual(v, c.constRule.val)) {
      cursor.violate(
        `must be ${toHex(c.constRule.val)}`,
        "bytes.const",
        c.constRule.path,
        c.forMapKey,
      );
    }

    if (c.exactLen !== undefined && len !== c.exactLen.val) {
      cursor.violate(
        `must be ${c.exactLen.val} bytes`,
        "bytes.len",
        c.exactLen.path,
        c.forMapKey,
      );
    }

    if (c.minLen !== undefined && len < c.minLen.val) {
      cursor.violate(
        `must be at least ${c.minLen.val} bytes`,
        "bytes.min_len",
        c.minLen.path,
        c.forMapKey,
      );
    }

    if (c.maxLen !== undefined && len > c.maxLen.val) {
      cursor.violate(
        `must be at most ${c.maxLen.val} bytes`,
        "bytes.max_len",
        c.maxLen.path,
        c.forMapKey,
      );
    }

    if (c.pattern !== undefined) {
      let decoded: string;
      try {
        decoded = utf8FatalDecoder.decode(v);
      } catch (cause) {
        throw new RuntimeError("must be valid UTF-8 to apply regexp", {
          cause,
        });
      }
      // Wrap test() — if a user-supplied regexMatch throws, surface it as a
      // RuntimeError so CEL's behavior is preserved end-to-end. The default
      // RegExp engine doesn't throw at match time.
      let matched: boolean;
      try {
        matched = c.pattern.test(decoded);
      } catch (cause) {
        throw new RuntimeError(`regex match failed for ${c.pattern.src}`, {
          cause,
        });
      }
      if (!matched) {
        cursor.violate(
          `must match regex pattern \`${c.pattern.src}\``,
          "bytes.pattern",
          c.pattern.path,
          c.forMapKey,
        );
      }
    }

    if (c.prefix !== undefined && !startsWith(v, c.prefix.val)) {
      cursor.violate(
        `does not have prefix ${toHex(c.prefix.val)}`,
        "bytes.prefix",
        c.prefix.path,
        c.forMapKey,
      );
    }

    if (c.suffix !== undefined && !endsWith(v, c.suffix.val)) {
      cursor.violate(
        `does not have suffix ${toHex(c.suffix.val)}`,
        "bytes.suffix",
        c.suffix.path,
        c.forMapKey,
      );
    }

    if (c.containsRule !== undefined && !containsBytes(v, c.containsRule.val)) {
      cursor.violate(
        `does not contain ${toHex(c.containsRule.val)}`,
        "bytes.contains",
        c.containsRule.path,
        c.forMapKey,
      );
    }

    if (c.inRule !== undefined && !bytesListContains(c.inRule.vals, v)) {
      cursor.violate(
        `must be in list ${formatList(c.inRule.vals, (b) => utf8NonFatalDecoder.decode(b))}`,
        "bytes.in",
        c.inRule.path,
        c.forMapKey,
      );
    }

    if (c.notInRule !== undefined && bytesListContains(c.notInRule.vals, v)) {
      cursor.violate(
        `must not be in list ${formatList(c.notInRule.vals, (b) => utf8NonFatalDecoder.decode(b))}`,
        "bytes.not_in",
        c.notInRule.path,
        c.forMapKey,
      );
    }

    if (c.wellKnown !== undefined) {
      const wk = c.wellKnown;
      const size = v.length;
      if (size === 0) {
        cursor.violate(
          wk.emptyMsg,
          `bytes.${wk.kind}_empty`,
          wk.path,
          c.forMapKey,
        );
      } else if (!wk.validSizes.includes(size)) {
        cursor.violate(wk.msg, `bytes.${wk.kind}`, wk.path, c.forMapKey);
      }
    }
  }

  prune(): boolean {
    return false;
  }
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function startsWith(haystack: Uint8Array, needle: Uint8Array): boolean {
  if (needle.length > haystack.length) return false;
  for (let i = 0; i < needle.length; i++) {
    if (haystack[i] !== needle[i]) return false;
  }
  return true;
}

function endsWith(haystack: Uint8Array, needle: Uint8Array): boolean {
  if (needle.length > haystack.length) return false;
  const offset = haystack.length - needle.length;
  for (let i = 0; i < needle.length; i++) {
    if (haystack[offset + i] !== needle[i]) return false;
  }
  return true;
}

function containsBytes(haystack: Uint8Array, needle: Uint8Array): boolean {
  // Empty needle is contained in every byte slice — matches Go's
  // `bytes.Contains(_, []byte{})` (returns true).
  if (needle.length === 0) return true;
  if (needle.length > haystack.length) return false;
  const limit = haystack.length - needle.length;
  outer: for (let i = 0; i <= limit; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

function bytesListContains(
  list: readonly Uint8Array[],
  v: Uint8Array,
): boolean {
  for (let i = 0; i < list.length; i++) {
    if (bytesEqual(list[i] as Uint8Array, v)) return true;
  }
  return false;
}

/**
 * Format bytes as concatenated lowercase hex pairs without separators or
 * prefix. Matches Go's `%x` formatter for `[]byte` and cel-es's `%x`
 * formatting for Uint8Array.
 */
function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] as number).toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * Default regex test using the platform `RegExp` engine. Used when no
 * `regexMatch` override is supplied. Phase 4 swaps this for the cel-es
 * `re2` package.
 */
function defaultRegexTest(pattern: string): (against: string) => boolean {
  const re = new RegExp(pattern);
  return (against) => re.test(against);
}

/**
 * Try to build a native evaluator for BytesRules. Returns `undefined` if no
 * native handler applies (no fields set, unknown extensions, or an
 * uncompilable pattern that we let CEL surface as a CompilationError).
 */
export function tryBuildNativeBytesRules(
  rules: BytesRules,
  rulePath: PathBuilder,
  forMapKey: boolean,
  regexMatch: RegexMatcher | undefined,
): ScalarNativeResult | undefined {
  if (rules.$unknown && rules.$unknown.length > 0) {
    return undefined;
  }

  const handled = new Set<DescField>();
  const cfg: { -readonly [K in keyof BytesRulesConfig]: BytesRulesConfig[K] } =
    { forMapKey };

  if (isFieldSet(rules, bytesDescs.const)) {
    cfg.constRule = {
      val: rules.const,
      path: rulePath.clone().field(bytesDescs.const).toPath(),
    };
    handled.add(bytesDescs.const);
  }

  if (isFieldSet(rules, bytesDescs.len)) {
    cfg.exactLen = {
      val: rules.len,
      path: rulePath.clone().field(bytesDescs.len).toPath(),
    };
    handled.add(bytesDescs.len);
  }

  if (isFieldSet(rules, bytesDescs.minLen)) {
    cfg.minLen = {
      val: rules.minLen,
      path: rulePath.clone().field(bytesDescs.minLen).toPath(),
    };
    handled.add(bytesDescs.minLen);
  }

  if (isFieldSet(rules, bytesDescs.maxLen)) {
    cfg.maxLen = {
      val: rules.maxLen,
      path: rulePath.clone().field(bytesDescs.maxLen).toPath(),
    };
    handled.add(bytesDescs.maxLen);
  }

  if (isFieldSet(rules, bytesDescs.pattern)) {
    const src = rules.pattern;
    let test: (against: string) => boolean;
    try {
      test = regexMatch
        ? (against) => regexMatch(src, against)
        : defaultRegexTest(src);
    } catch {
      // Invalid pattern at plan time. Let CEL produce the CompilationError
      // it already emits today.
      return undefined;
    }
    cfg.pattern = {
      src,
      test,
      path: rulePath.clone().field(bytesDescs.pattern).toPath(),
    };
    handled.add(bytesDescs.pattern);
  }

  if (isFieldSet(rules, bytesDescs.prefix)) {
    cfg.prefix = {
      val: rules.prefix,
      path: rulePath.clone().field(bytesDescs.prefix).toPath(),
    };
    handled.add(bytesDescs.prefix);
  }

  if (isFieldSet(rules, bytesDescs.suffix)) {
    cfg.suffix = {
      val: rules.suffix,
      path: rulePath.clone().field(bytesDescs.suffix).toPath(),
    };
    handled.add(bytesDescs.suffix);
  }

  if (isFieldSet(rules, bytesDescs.contains)) {
    cfg.containsRule = {
      val: rules.contains,
      path: rulePath.clone().field(bytesDescs.contains).toPath(),
    };
    handled.add(bytesDescs.contains);
  }

  if (rules.in.length > 0) {
    cfg.inRule = {
      vals: rules.in,
      path: rulePath.clone().field(bytesDescs.in).toPath(),
    };
    handled.add(bytesDescs.in);
  }

  // Note: `bytes.not_in`'s CEL expression doesn't include a `size() > 0`
  // guard like `bytes.in` does, but `this in []` is always false in CEL,
  // so an empty `not_in` list never fires. We treat both the same — skip
  // when the list is empty.
  if (rules.notIn.length > 0) {
    cfg.notInRule = {
      vals: rules.notIn,
      path: rulePath.clone().field(bytesDescs.notIn).toPath(),
    };
    handled.add(bytesDescs.notIn);
  }

  // Well-known: at most one of ip/ipv4/ipv6/uuid is set (oneof). Claim the
  // leaf field on isFieldSet regardless of value — explicit `ip: false` is
  // a no-op rule, matching `repeated.unique: false` (`repeated.ts`) and
  // `float.finite: false` (`numeric.ts`).
  const wkCase = rules.wellKnown.case;
  if (wkCase !== undefined) {
    const desc = bytesDescs[wkCase];
    handled.add(desc);
    if (rules.wellKnown.value) {
      const spec = WELL_KNOWN[wkCase];
      cfg.wellKnown = {
        kind: wkCase,
        validSizes: spec.validSizes,
        msg: spec.msg,
        emptyMsg: spec.emptyMsg,
        path: rulePath.clone().field(desc).toPath(),
      };
    }
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeBytesRules(cfg),
    handledFields: handled,
  };
}
