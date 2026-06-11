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

import { RE2JS } from "@bufbuild/re2";
import type { RegexMatcher } from "./func.js";

// Most validators see a fixed set of patterns (they come from schema rules),
// so a simple compile cache makes repeat matches cheap. User CEL rules can
// construct patterns from input data, though, so the cache is reset when it
// grows past this bound to keep pathological inputs from leaking memory.
const cacheLimit = 1024;

const cache = new Map<string, RE2JS>();

/**
 * The default {@link RegexMatcher}, backed by an RE2 engine.
 *
 * Patterns are compiled with RE2 syntax and matched in linear time,
 * fulfilling protovalidate's RE2 contract for `string.pattern`,
 * `bytes.pattern`, and the CEL `matches()` function. Throws on patterns
 * that are not valid RE2 syntax.
 */
export function re2RegexMatch(pattern: string, against: string): boolean {
  let re = cache.get(pattern);
  if (re === undefined) {
    if (cache.size >= cacheLimit) {
      cache.clear();
    }
    re = RE2JS.compile(pattern);
    cache.set(pattern, re);
  }
  return re.test(against);
}
