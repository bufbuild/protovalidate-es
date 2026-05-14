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

type BytesConstRule = { readonly val: Uint8Array; readonly path: Path };
type SizeRule = { readonly val: bigint; readonly path: Path };
type BytesValRule = { readonly val: Uint8Array; readonly path: Path };
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
type WellKnownRule = {
  readonly kind: WellKnownKind;
  readonly path: Path;
};

/**
 * Sizes (in bytes) accepted for each well-known format. Matches Go's
 * bytesWellKnown.validSizes — see `native_bytes.go`.
 */
const WELL_KNOWN_VALID_SIZES: Record<WellKnownKind, readonly number[]> = {
  ip: [4, 16],
  ipv4: [4],
  ipv6: [16],
  uuid: [16],
};

const WELL_KNOWN_MSG: Record<WellKnownKind, string> = {
  ip: "must be a valid IP address",
  ipv4: "must be a valid IPv4 address",
  ipv6: "must be a valid IPv6 address",
  uuid: "must be a valid UUID",
};

const WELL_KNOWN_EMPTY_MSG: Record<WellKnownKind, string> = {
  ip: "value is empty, which is not a valid IP address",
  ipv4: "value is empty, which is not a valid IPv4 address",
  ipv6: "value is empty, which is not a valid IPv6 address",
  uuid: "value is empty, which is not a valid UUID",
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

class EvalNativeBytesRules implements Eval<ScalarValue> {
  constructor(
    private readonly forMapKey: boolean,
    private readonly constRule: BytesConstRule | undefined,
    private readonly exactLen: SizeRule | undefined,
    private readonly minLen: SizeRule | undefined,
    private readonly maxLen: SizeRule | undefined,
    private readonly pattern: PatternRule | undefined,
    private readonly prefix: BytesValRule | undefined,
    private readonly suffix: BytesValRule | undefined,
    private readonly containsRule: BytesValRule | undefined,
    private readonly inRule: BytesListRule | undefined,
    private readonly notInRule: BytesListRule | undefined,
    private readonly wellKnown: WellKnownRule | undefined,
  ) {}

  eval(val: ScalarValue, cursor: Cursor): void {
    const v = val as Uint8Array;
    const len = BigInt(v.length);

    if (this.constRule !== undefined && !bytesEqual(v, this.constRule.val)) {
      cursor.violate(
        `must be ${toHex(this.constRule.val)}`,
        "bytes.const",
        this.constRule.path,
        this.forMapKey,
      );
    }

    if (this.exactLen !== undefined && len !== this.exactLen.val) {
      cursor.violate(
        `must be ${this.exactLen.val} bytes`,
        "bytes.len",
        this.exactLen.path,
        this.forMapKey,
      );
    }

    if (this.minLen !== undefined && len < this.minLen.val) {
      cursor.violate(
        `must be at least ${this.minLen.val} bytes`,
        "bytes.min_len",
        this.minLen.path,
        this.forMapKey,
      );
    }

    if (this.maxLen !== undefined && len > this.maxLen.val) {
      cursor.violate(
        `must be at most ${this.maxLen.val} bytes`,
        "bytes.max_len",
        this.maxLen.path,
        this.forMapKey,
      );
    }

    if (this.pattern !== undefined) {
      let decoded: string;
      try {
        decoded = utf8FatalDecoder.decode(v);
      } catch (cause) {
        throw new RuntimeError("must be valid UTF-8 to apply regexp", {
          cause,
        });
      }
      if (!this.pattern.test(decoded)) {
        cursor.violate(
          `must match regex pattern \`${this.pattern.src}\``,
          "bytes.pattern",
          this.pattern.path,
          this.forMapKey,
        );
      }
    }

    if (this.prefix !== undefined && !startsWith(v, this.prefix.val)) {
      cursor.violate(
        `does not have prefix ${toHex(this.prefix.val)}`,
        "bytes.prefix",
        this.prefix.path,
        this.forMapKey,
      );
    }

    if (this.suffix !== undefined && !endsWith(v, this.suffix.val)) {
      cursor.violate(
        `does not have suffix ${toHex(this.suffix.val)}`,
        "bytes.suffix",
        this.suffix.path,
        this.forMapKey,
      );
    }

    if (
      this.containsRule !== undefined &&
      !containsBytes(v, this.containsRule.val)
    ) {
      cursor.violate(
        `does not contain ${toHex(this.containsRule.val)}`,
        "bytes.contains",
        this.containsRule.path,
        this.forMapKey,
      );
    }

    if (this.inRule !== undefined && !bytesListContains(this.inRule.vals, v)) {
      cursor.violate(
        `must be in list ${formatList(this.inRule.vals, bytesToCelString)}`,
        "bytes.in",
        this.inRule.path,
        this.forMapKey,
      );
    }

    if (
      this.notInRule !== undefined &&
      bytesListContains(this.notInRule.vals, v)
    ) {
      cursor.violate(
        `must not be in list ${formatList(this.notInRule.vals, bytesToCelString)}`,
        "bytes.not_in",
        this.notInRule.path,
        this.forMapKey,
      );
    }

    if (this.wellKnown !== undefined) {
      const size = v.length;
      const kind = this.wellKnown.kind;
      if (size === 0) {
        cursor.violate(
          WELL_KNOWN_EMPTY_MSG[kind],
          `bytes.${kind}_empty`,
          this.wellKnown.path,
          this.forMapKey,
        );
      } else if (!WELL_KNOWN_VALID_SIZES[kind].includes(size)) {
        cursor.violate(
          WELL_KNOWN_MSG[kind],
          `bytes.${kind}`,
          this.wellKnown.path,
          this.forMapKey,
        );
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
 * Format a Uint8Array the way cel-es's `%s` does — non-fatal UTF-8
 * decode, with U+FFFD substitution for invalid sequences. Used inside
 * `bytes.in` / `bytes.not_in` list formatting.
 */
function bytesToCelString(b: Uint8Array): string {
  return utf8NonFatalDecoder.decode(b);
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

  let constRule: BytesConstRule | undefined;
  if (isFieldSet(rules, bytesDescs.const)) {
    constRule = {
      val: rules.const,
      path: rulePath.clone().field(bytesDescs.const).toPath(),
    };
    handled.add(bytesDescs.const);
  }

  let exactLen: SizeRule | undefined;
  if (isFieldSet(rules, bytesDescs.len)) {
    exactLen = {
      val: rules.len,
      path: rulePath.clone().field(bytesDescs.len).toPath(),
    };
    handled.add(bytesDescs.len);
  }

  let minLen: SizeRule | undefined;
  if (isFieldSet(rules, bytesDescs.minLen)) {
    minLen = {
      val: rules.minLen,
      path: rulePath.clone().field(bytesDescs.minLen).toPath(),
    };
    handled.add(bytesDescs.minLen);
  }

  let maxLen: SizeRule | undefined;
  if (isFieldSet(rules, bytesDescs.maxLen)) {
    maxLen = {
      val: rules.maxLen,
      path: rulePath.clone().field(bytesDescs.maxLen).toPath(),
    };
    handled.add(bytesDescs.maxLen);
  }

  let pattern: PatternRule | undefined;
  if (isFieldSet(rules, bytesDescs.pattern)) {
    const src = rules.pattern;
    let test: ((against: string) => boolean) | undefined;
    try {
      test = regexMatch
        ? (against: string) => regexMatch(src, against)
        : defaultRegexTest(src);
    } catch {
      // Invalid pattern. Let CEL produce the CompilationError it already
      // emits today.
      return undefined;
    }
    pattern = {
      src,
      test,
      path: rulePath.clone().field(bytesDescs.pattern).toPath(),
    };
    handled.add(bytesDescs.pattern);
  }

  let prefix: BytesValRule | undefined;
  if (isFieldSet(rules, bytesDescs.prefix)) {
    prefix = {
      val: rules.prefix,
      path: rulePath.clone().field(bytesDescs.prefix).toPath(),
    };
    handled.add(bytesDescs.prefix);
  }

  let suffix: BytesValRule | undefined;
  if (isFieldSet(rules, bytesDescs.suffix)) {
    suffix = {
      val: rules.suffix,
      path: rulePath.clone().field(bytesDescs.suffix).toPath(),
    };
    handled.add(bytesDescs.suffix);
  }

  let containsRule: BytesValRule | undefined;
  if (isFieldSet(rules, bytesDescs.contains)) {
    containsRule = {
      val: rules.contains,
      path: rulePath.clone().field(bytesDescs.contains).toPath(),
    };
    handled.add(bytesDescs.contains);
  }

  let inRule: BytesListRule | undefined;
  if (rules.in.length > 0) {
    inRule = {
      vals: rules.in,
      path: rulePath.clone().field(bytesDescs.in).toPath(),
    };
    handled.add(bytesDescs.in);
  }

  let notInRule: BytesListRule | undefined;
  if (rules.notIn.length > 0) {
    notInRule = {
      vals: rules.notIn,
      path: rulePath.clone().field(bytesDescs.notIn).toPath(),
    };
    handled.add(bytesDescs.notIn);
  }

  // Well-known: at most one of ip/ipv4/ipv6/uuid is set (oneof). Only emit
  // a violation when the corresponding bool is `true`.
  let wellKnown: WellKnownRule | undefined;
  const wk = rules.wellKnown;
  if (wk.case === "ip" && wk.value) {
    wellKnown = {
      kind: "ip",
      path: rulePath.clone().field(bytesDescs.ip).toPath(),
    };
    handled.add(bytesDescs.ip);
  } else if (wk.case === "ipv4" && wk.value) {
    wellKnown = {
      kind: "ipv4",
      path: rulePath.clone().field(bytesDescs.ipv4).toPath(),
    };
    handled.add(bytesDescs.ipv4);
  } else if (wk.case === "ipv6" && wk.value) {
    wellKnown = {
      kind: "ipv6",
      path: rulePath.clone().field(bytesDescs.ipv6).toPath(),
    };
    handled.add(bytesDescs.ipv6);
  } else if (wk.case === "uuid" && wk.value) {
    wellKnown = {
      kind: "uuid",
      path: rulePath.clone().field(bytesDescs.uuid).toPath(),
    };
    handled.add(bytesDescs.uuid);
  }

  if (handled.size === 0) {
    return undefined;
  }

  return {
    eval: new EvalNativeBytesRules(
      forMapKey,
      constRule,
      exactLen,
      minLen,
      maxLen,
      pattern,
      prefix,
      suffix,
      containsRule,
      inRule,
      notInRule,
      wellKnown,
    ),
    handledFields: handled,
  };
}
