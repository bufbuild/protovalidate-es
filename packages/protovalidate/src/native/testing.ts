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

import { readFileSync } from "node:fs";
import * as assert from "node:assert/strict";
import type { DescMessage, Message } from "@bufbuild/protobuf";
import { compileFile } from "@bufbuild/protocompile";
import { createValidator } from "../validator.js";
import type { Violation } from "../error.js";

/**
 * Shared compile options that hand the inline-proto compiler the
 * `buf.validate.validate.proto` from this package's `proto/` directory.
 */
export const bufCompileOptions = {
  imports: {
    "buf/validate/validate.proto": readFileSync(
      "proto/buf/validate/validate.proto",
      "utf-8",
    ),
  },
};

/** Validator running the native path (default). */
export const native = createValidator();

/** Validator with native rules disabled — i.e., the pure-CEL reference. */
export const cel = createValidator({ disableNativeRules: true });

/**
 * Validate a fixture under both the native and CEL paths and assert their
 * Violation arrays are byte-identical (message + ruleId + rule path + field
 * path, via `Violation.toString()`).
 *
 * This is the workhorse assertion for native-rule unit tests — every native
 * handler must reproduce CEL output exactly, and the simplest way to prove
 * that is to run the same input through both paths and compare.
 */
export function diff(schema: DescMessage, msg: Message): void {
  const a = native.validate(schema, msg);
  const b = cel.validate(schema, msg);
  assert.equal(a.kind, b.kind, "kind mismatch");
  const fmt = (v: Violation) => v.toString();
  assert.deepEqual(a.violations?.map(fmt), b.violations?.map(fmt));
}

/**
 * Compile an inline proto3 schema and return the message named `M`.
 *
 * The supplied `definition` must declare a `message M { ... }`. Tests that
 * need helper types (extra messages, enums) declare them via `preamble`.
 * Imports for `buf.validate.validate.proto` and the WKT scalar wrappers are
 * always included; they are harmless when unused.
 */
export function compile(
  definition: string,
  opts?: { preamble?: string },
): DescMessage {
  const file = compileFile(
    `
      syntax = "proto3";
      import "buf/validate/validate.proto";
      import "google/protobuf/wrappers.proto";
      ${opts?.preamble ?? ""}
      ${definition}
    `,
    bufCompileOptions,
  );
  const m = file.messages.find((m) => m.name === "M");
  if (!m) {
    throw new Error(
      "native-rule tests must define `message M { ... }` as the validation target",
    );
  }
  return m;
}
