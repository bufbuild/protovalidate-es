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
import {
  KnownRegex,
  type StringRules,
  StringRulesSchema,
} from "../gen/buf/validate/validate_pb.js";
import {
  isEmail,
  isHostAndPort,
  isHostname,
  isIp,
  isIpPrefix,
  isUri,
  isUriRef,
} from "../lib.js";
import type { RegexMatcher } from "../func.js";
import type { ScalarNativeResult } from "./dispatcher.js";
import { codepointLength, formatList, utf8ByteLength } from "./format.js";

const F = StringRulesSchema.field;

/** A rule with a string operand: const, prefix, suffix, contains, not_contains. */
type StrRule = { readonly val: string; readonly path: Path };
/** A rule with a numeric size operand: len, min_len, max_len, len_bytes, min_bytes, max_bytes. */
type SizeRule = { readonly val: bigint; readonly path: Path };
/** A rule with a string list operand: in, not_in. */
type StrListRule = { readonly vals: readonly string[]; readonly path: Path };
type PatternRule = {
  readonly src: string;
  readonly test: (against: string) => boolean;
  readonly path: Path;
};

/**
 * Spec carried alongside an active well-known constraint, so `eval()` does
 * no per-call table lookups.
 */
type WellKnownRule = {
  readonly check: (s: string) => boolean;
  readonly ruleId: string;
  readonly msg: string;
  /**
   * When set, an empty input emits this violation instead of running
   * `check`, matching the dedicated `*_empty` CEL rules. Unset for
   * `uri_ref` and `well_known_regex.header_value`, which validate the
   * empty string like any other input.
   */
  readonly empty?: { readonly ruleId: string; readonly msg: string };
  readonly path: Path;
};

/**
 * The boolean members of the StringRules `well_known` oneof —
 * everything except `well_known_regex`, which carries a KnownRegex enum
 * and is dispatched separately.
 */
type BoolWellKnownCase = Exclude<
  StringRules["wellKnown"]["case"],
  "wellKnownRegex" | undefined
>;

/**
 * Per-kind specs for the boolean well-known string formats. Messages and
 * rule ids mirror the predefined CEL annotations on the corresponding
 * `StringRules` fields. Kinds backed by a fixed regex carry the exact
 * pattern string the CEL expression compiles, so both paths share one
 * compiled regex and one behavior under any engine; the rest call the same
 * `lib.ts` helpers CEL's custom functions are built on.
 */
const WELL_KNOWN: Record<
  BoolWellKnownCase,
  {
    readonly msg: string;
    /** Unset for uri_ref, which has no `*_empty` CEL rule. */
    readonly emptyMsg?: string;
    /** Exactly one of check / pattern is set. */
    readonly check?: (s: string) => boolean;
    readonly pattern?: string;
  }
> = {
  email: {
    msg: "must be a valid email address",
    emptyMsg: "value is empty, which is not a valid email address",
    check: (s) => isEmail.call(s),
  },
  hostname: {
    msg: "must be a valid hostname",
    emptyMsg: "value is empty, which is not a valid hostname",
    check: (s) => isHostname.call(s),
  },
  ip: {
    msg: "must be a valid IP address",
    emptyMsg: "value is empty, which is not a valid IP address",
    check: (s) => isIp.call(s),
  },
  ipv4: {
    msg: "must be a valid IPv4 address",
    emptyMsg: "value is empty, which is not a valid IPv4 address",
    check: (s) => isIp.call(s, 4),
  },
  ipv6: {
    msg: "must be a valid IPv6 address",
    emptyMsg: "value is empty, which is not a valid IPv6 address",
    check: (s) => isIp.call(s, 6),
  },
  uri: {
    msg: "must be a valid URI",
    emptyMsg: "value is empty, which is not a valid URI",
    check: (s) => isUri.call(s),
  },
  uriRef: {
    msg: "must be a valid URI Reference",
    check: (s) => isUriRef.call(s),
  },
  address: {
    msg: "must be a valid hostname, or ip address",
    emptyMsg: "value is empty, which is not a valid hostname, or ip address",
    check: (s) => isHostname.call(s) || isIp.call(s),
  },
  uuid: {
    msg: "must be a valid UUID",
    emptyMsg: "value is empty, which is not a valid UUID",
    pattern:
      "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
  },
  tuuid: {
    msg: "must be a valid trimmed UUID",
    emptyMsg: "value is empty, which is not a valid trimmed UUID",
    pattern: "^[0-9a-fA-F]{32}$",
  },
  ipWithPrefixlen: {
    msg: "must be a valid IP prefix",
    emptyMsg: "value is empty, which is not a valid IP prefix",
    check: (s) => isIpPrefix.call(s),
  },
  ipv4WithPrefixlen: {
    msg: "must be a valid IPv4 address with prefix length",
    emptyMsg:
      "value is empty, which is not a valid IPv4 address with prefix length",
    check: (s) => isIpPrefix.call(s, 4),
  },
  ipv6WithPrefixlen: {
    msg: "must be a valid IPv6 address with prefix length",
    emptyMsg:
      "value is empty, which is not a valid IPv6 address with prefix length",
    check: (s) => isIpPrefix.call(s, 6),
  },
  ipPrefix: {
    msg: "must be a valid IP prefix",
    emptyMsg: "value is empty, which is not a valid IP prefix",
    check: (s) => isIpPrefix.call(s, undefined, true),
  },
  ipv4Prefix: {
    msg: "must be a valid IPv4 prefix",
    emptyMsg: "value is empty, which is not a valid IPv4 prefix",
    check: (s) => isIpPrefix.call(s, 4, true),
  },
  ipv6Prefix: {
    msg: "must be a valid IPv6 prefix",
    emptyMsg: "value is empty, which is not a valid IPv6 prefix",
    check: (s) => isIpPrefix.call(s, 6, true),
  },
  hostAndPort: {
    msg: "must be a valid host (hostname or IP address) and port pair",
    emptyMsg: "value is empty, which is not a valid host and port pair",
    check: (s) => isHostAndPort.call(s, true),
  },
  ulid: {
    msg: "must be a valid ULID",
    emptyMsg: "value is empty, which is not a valid ULID",
    pattern: "^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$",
  },
  protobufFqn: {
    msg: "must be a valid fully-qualified Protobuf name",
    emptyMsg:
      "value is empty, which is not a valid fully-qualified Protobuf name",
    pattern: "^[A-Za-z_][A-Za-z_0-9]*(\\.[A-Za-z_][A-Za-z_0-9]*)*$",
  },
  protobufDotFqn: {
    msg: "must be a valid fully-qualified Protobuf name with a leading dot",
    emptyMsg:
      "value is empty, which is not a valid fully-qualified Protobuf name with a leading dot",
    pattern: "^\\.[A-Za-z_][A-Za-z_0-9]*(\\.[A-Za-z_][A-Za-z_0-9]*)*$",
  },
};

// The `well_known_regex` patterns, byte-identical to the strings the CEL
// expressions on `StringRules.well_known_regex` compile (after CEL string
// unescaping — `\\x60` becomes a literal backtick, `\\u0000` a literal NUL).
// The loose patterns differ between header name (`+`) and header value
// (`*`); CEL is the source of truth here, not protovalidate-go's shared
// loose regex.
const headerNameStrictPattern = "^:?[0-9a-zA-Z!#$%&'*+-.^_|~`]+$";
const headerNameLoosePattern = "^[^\\u0000\\u000A\\u000D]+$";
const headerValueStrictPattern = "^[^\\u0000-\\u0008\\u000A-\\u001F\\u007F]*$";
const headerValueLoosePattern = "^[^\\u0000\\u000A\\u000D]*$";

/**
 * Configuration for {@link EvalNativeStringRules}. Bundled into a single
 * object so callers don't have to track ~15 positional constructor args.
 */
type StringRulesConfig = {
  readonly forMapKey: boolean;
  readonly constRule?: StrRule;
  readonly exactLen?: SizeRule;
  readonly minLen?: SizeRule;
  readonly maxLen?: SizeRule;
  readonly exactBytes?: SizeRule;
  readonly minBytes?: SizeRule;
  readonly maxBytes?: SizeRule;
  readonly pattern?: PatternRule;
  readonly prefix?: StrRule;
  readonly suffix?: StrRule;
  readonly containsRule?: StrRule;
  readonly notContainsRule?: StrRule;
  readonly inRule?: StrListRule;
  readonly notInRule?: StrListRule;
  readonly wellKnown?: WellKnownRule;
};

// Checks run in the declaration order of the StringRules fields, which is
// the order the CEL path evaluates the predefined rules in — keeping the
// violation order identical between the two paths.
class EvalNativeStringRules implements Eval<ScalarValue> {
  constructor(private readonly cfg: StringRulesConfig) {}

  eval(val: ScalarValue, cursor: Cursor): void {
    const v = val as string;
    const c = this.cfg;

    if (c.constRule !== undefined && v !== c.constRule.val) {
      cursor.violate(
        `must equal \`${c.constRule.val}\``,
        "string.const",
        c.constRule.path,
        c.forMapKey,
      );
    }

    if (
      c.exactLen !== undefined ||
      c.minLen !== undefined ||
      c.maxLen !== undefined
    ) {
      const len = BigInt(codepointLength(v));
      if (c.exactLen !== undefined && len !== c.exactLen.val) {
        cursor.violate(
          `must be ${c.exactLen.val} characters`,
          "string.len",
          c.exactLen.path,
          c.forMapKey,
        );
      }
      if (c.minLen !== undefined && len < c.minLen.val) {
        cursor.violate(
          `must be at least ${c.minLen.val} characters`,
          "string.min_len",
          c.minLen.path,
          c.forMapKey,
        );
      }
      if (c.maxLen !== undefined && len > c.maxLen.val) {
        cursor.violate(
          `must be at most ${c.maxLen.val} characters`,
          "string.max_len",
          c.maxLen.path,
          c.forMapKey,
        );
      }
    }

    if (
      c.exactBytes !== undefined ||
      c.minBytes !== undefined ||
      c.maxBytes !== undefined
    ) {
      const len = BigInt(utf8ByteLength(v));
      if (c.exactBytes !== undefined && len !== c.exactBytes.val) {
        cursor.violate(
          `must be ${c.exactBytes.val} bytes`,
          "string.len_bytes",
          c.exactBytes.path,
          c.forMapKey,
        );
      }
      if (c.minBytes !== undefined && len < c.minBytes.val) {
        cursor.violate(
          `must be at least ${c.minBytes.val} bytes`,
          "string.min_bytes",
          c.minBytes.path,
          c.forMapKey,
        );
      }
      if (c.maxBytes !== undefined && len > c.maxBytes.val) {
        cursor.violate(
          `must be at most ${c.maxBytes.val} bytes`,
          "string.max_bytes",
          c.maxBytes.path,
          c.forMapKey,
        );
      }
    }

    if (c.pattern !== undefined) {
      // Wrap test() — if a user-supplied regexMatch throws, surface it as a
      // RuntimeError so CEL's behavior is preserved end-to-end. The default
      // RE2 engine doesn't throw at match time.
      let matched: boolean;
      try {
        matched = c.pattern.test(v);
      } catch (cause) {
        throw new RuntimeError(`regex match failed for ${c.pattern.src}`, {
          cause,
        });
      }
      if (!matched) {
        cursor.violate(
          `does not match regex pattern \`${c.pattern.src}\``,
          "string.pattern",
          c.pattern.path,
          c.forMapKey,
        );
      }
    }

    if (c.prefix !== undefined && !v.startsWith(c.prefix.val)) {
      cursor.violate(
        `does not have prefix \`${c.prefix.val}\``,
        "string.prefix",
        c.prefix.path,
        c.forMapKey,
      );
    }

    if (c.suffix !== undefined && !v.endsWith(c.suffix.val)) {
      cursor.violate(
        `does not have suffix \`${c.suffix.val}\``,
        "string.suffix",
        c.suffix.path,
        c.forMapKey,
      );
    }

    if (c.containsRule !== undefined && !v.includes(c.containsRule.val)) {
      cursor.violate(
        `does not contain substring \`${c.containsRule.val}\``,
        "string.contains",
        c.containsRule.path,
        c.forMapKey,
      );
    }

    if (c.notContainsRule !== undefined && v.includes(c.notContainsRule.val)) {
      cursor.violate(
        `contains substring \`${c.notContainsRule.val}\``,
        "string.not_contains",
        c.notContainsRule.path,
        c.forMapKey,
      );
    }

    if (c.inRule !== undefined && !c.inRule.vals.includes(v)) {
      cursor.violate(
        `must be in list ${formatList(c.inRule.vals, (s) => s)}`,
        "string.in",
        c.inRule.path,
        c.forMapKey,
      );
    }

    if (c.notInRule?.vals.includes(v)) {
      cursor.violate(
        `must not be in list ${formatList(c.notInRule.vals, (s) => s)}`,
        "string.not_in",
        c.notInRule.path,
        c.forMapKey,
      );
    }

    if (c.wellKnown !== undefined) {
      const wk = c.wellKnown;
      if (wk.empty !== undefined && v === "") {
        cursor.violate(wk.empty.msg, wk.empty.ruleId, wk.path, c.forMapKey);
      } else if (!wk.check(v)) {
        cursor.violate(wk.msg, wk.ruleId, wk.path, c.forMapKey);
      }
    }
  }

  prune(): boolean {
    return false;
  }
}

/**
 * Build a match predicate for a pattern under the active regex engine.
 * Returns `undefined` if the pattern doesn't compile — the caller falls
 * through to CEL, which surfaces the same failure the way it already does
 * today.
 */
function makePatternTest(
  src: string,
  regexMatch: RegexMatcher | undefined,
): ((against: string) => boolean) | undefined {
  try {
    if (regexMatch) {
      // Probe the engine at plan time so an invalid pattern surfaces here,
      // symmetric with the default engine's eager compile. Empty input is
      // the contract-safe probe — a regex engine must be able to test any
      // pattern against the empty string.
      regexMatch(src, "");
      return (against) => regexMatch(src, against);
    }
    const re = new RegExp(src);
    return (against) => re.test(against);
  } catch {
    return undefined;
  }
}

/**
 * Try to build a native evaluator for StringRules. Returns `undefined` if
 * no native handler applies (no fields set, unknown extensions, or an
 * uncompilable pattern that we let CEL surface).
 *
 * String rules are handled all-or-nothing: a single set field the native
 * path can't take falls the entire rules message through to CEL, so the
 * violation order always matches the pure-CEL path.
 */
export function tryBuildNativeStringRules(
  rules: StringRules,
  rulePath: PathBuilder,
  forMapKey: boolean,
  regexMatch: RegexMatcher | undefined,
): ScalarNativeResult | undefined {
  if (rules.$unknown && rules.$unknown.length > 0) {
    return undefined;
  }

  const handled = new Set<DescField>();
  const cfg: {
    -readonly [K in keyof StringRulesConfig]: StringRulesConfig[K];
  } = { forMapKey };

  if (isFieldSet(rules, F.const)) {
    cfg.constRule = {
      val: rules.const,
      path: rulePath.clone().field(F.const).toPath(),
    };
    handled.add(F.const);
  }

  if (isFieldSet(rules, F.len)) {
    cfg.exactLen = {
      val: rules.len,
      path: rulePath.clone().field(F.len).toPath(),
    };
    handled.add(F.len);
  }

  if (isFieldSet(rules, F.minLen)) {
    cfg.minLen = {
      val: rules.minLen,
      path: rulePath.clone().field(F.minLen).toPath(),
    };
    handled.add(F.minLen);
  }

  if (isFieldSet(rules, F.maxLen)) {
    cfg.maxLen = {
      val: rules.maxLen,
      path: rulePath.clone().field(F.maxLen).toPath(),
    };
    handled.add(F.maxLen);
  }

  if (isFieldSet(rules, F.lenBytes)) {
    cfg.exactBytes = {
      val: rules.lenBytes,
      path: rulePath.clone().field(F.lenBytes).toPath(),
    };
    handled.add(F.lenBytes);
  }

  if (isFieldSet(rules, F.minBytes)) {
    cfg.minBytes = {
      val: rules.minBytes,
      path: rulePath.clone().field(F.minBytes).toPath(),
    };
    handled.add(F.minBytes);
  }

  if (isFieldSet(rules, F.maxBytes)) {
    cfg.maxBytes = {
      val: rules.maxBytes,
      path: rulePath.clone().field(F.maxBytes).toPath(),
    };
    handled.add(F.maxBytes);
  }

  if (isFieldSet(rules, F.pattern)) {
    const test = makePatternTest(rules.pattern, regexMatch);
    if (test === undefined) {
      return undefined;
    }
    cfg.pattern = {
      src: rules.pattern,
      test,
      path: rulePath.clone().field(F.pattern).toPath(),
    };
    handled.add(F.pattern);
  }

  if (isFieldSet(rules, F.prefix)) {
    cfg.prefix = {
      val: rules.prefix,
      path: rulePath.clone().field(F.prefix).toPath(),
    };
    handled.add(F.prefix);
  }

  if (isFieldSet(rules, F.suffix)) {
    cfg.suffix = {
      val: rules.suffix,
      path: rulePath.clone().field(F.suffix).toPath(),
    };
    handled.add(F.suffix);
  }

  if (isFieldSet(rules, F.contains)) {
    cfg.containsRule = {
      val: rules.contains,
      path: rulePath.clone().field(F.contains).toPath(),
    };
    handled.add(F.contains);
  }

  if (isFieldSet(rules, F.notContains)) {
    cfg.notContainsRule = {
      val: rules.notContains,
      path: rulePath.clone().field(F.notContains).toPath(),
    };
    handled.add(F.notContains);
  }

  if (rules.in.length > 0) {
    cfg.inRule = {
      vals: rules.in,
      path: rulePath.clone().field(F.in).toPath(),
    };
    handled.add(F.in);
  }

  if (rules.notIn.length > 0) {
    cfg.notInRule = {
      vals: rules.notIn,
      path: rulePath.clone().field(F.notIn).toPath(),
    };
    handled.add(F.notIn);
  }

  const wk = rules.wellKnown;
  if (wk.case === "wellKnownRegex") {
    // Claim the field on isFieldSet regardless of value — for UNSPECIFIED
    // (or an unrecognized enum number) the CEL predicates `!= 1` / `!= 2`
    // never fire, so the claim is a no-op, matching `bytes.ip: false`.
    handled.add(F.wellKnownRegex);
    const path = rulePath.clone().field(F.wellKnownRegex).toPath();
    // strict is on by default; only an explicit `strict: false` loosens.
    const strict = !isFieldSet(rules, F.strict) || rules.strict;
    if (wk.value === KnownRegex.HTTP_HEADER_NAME) {
      const test = makePatternTest(
        strict ? headerNameStrictPattern : headerNameLoosePattern,
        regexMatch,
      );
      if (test === undefined) {
        return undefined;
      }
      cfg.wellKnown = {
        check: test,
        ruleId: "string.well_known_regex.header_name",
        msg: "must be a valid HTTP header name",
        empty: {
          ruleId: "string.well_known_regex.header_name_empty",
          msg: "value is empty, which is not a valid HTTP header name",
        },
        path,
      };
    } else if (wk.value === KnownRegex.HTTP_HEADER_VALUE) {
      const test = makePatternTest(
        strict ? headerValueStrictPattern : headerValueLoosePattern,
        regexMatch,
      );
      if (test === undefined) {
        return undefined;
      }
      cfg.wellKnown = {
        check: test,
        ruleId: "string.well_known_regex.header_value",
        msg: "must be a valid HTTP header value",
        path,
      };
    }
  } else if (wk.case !== undefined) {
    // Claim the leaf field on isFieldSet regardless of value — explicit
    // `email: false` is a no-op rule, matching `bytes.ip: false`
    // (`bytes.ts`) and `float.finite: false` (`numeric.ts`).
    const desc = F[wk.case];
    handled.add(desc);
    if (wk.value) {
      const spec = WELL_KNOWN[wk.case];
      let check = spec.check;
      if (check === undefined) {
        check = makePatternTest(spec.pattern as string, regexMatch);
        if (check === undefined) {
          return undefined;
        }
      }
      cfg.wellKnown = {
        check,
        ruleId: `string.${desc.name}`,
        msg: spec.msg,
        empty:
          spec.emptyMsg === undefined
            ? undefined
            : {
                ruleId: `string.${desc.name}_empty`,
                msg: spec.emptyMsg,
              },
        path: rulePath.clone().field(desc).toPath(),
      };
    }
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeStringRules(cfg),
    handledFields: handled,
  };
}
