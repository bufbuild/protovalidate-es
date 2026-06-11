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

import {
  createMutableRegistry,
  type DescMessage,
  isMessage,
  type Message,
  type MessageShape,
  type MessageValidType,
  type MutableRegistry,
  type Registry,
} from "@bufbuild/protobuf";
import { reflect, usedTypes } from "@bufbuild/protobuf/reflect";
import { Cursor } from "./cursor.js";
import {
  CompilationError,
  RuntimeError,
  ValidationError,
  type Violation,
} from "./error.js";
import { Planner } from "./planner.js";
import { CelManager } from "./cel.js";
import type { RegexMatcher } from "./func.js";
import { re2RegexMatch } from "./regex.js";
import { file_buf_validate_validate } from "./gen/buf/validate/validate_pb.js";

/**
 * Options for creating a validator.
 */
export type ValidatorOptions = {
  /**
   * To validate messages with user-defined predefined rules, pass the extensions
   * to the validator via the registry.
   *
   * By default, the validator is unaware of any predefined rules, and will raise
   * a compilation error if it sees an unknown extension.
   *
   * The registry is also passed to the CEL environment, where it may be used to
   * unpack google.protobuf.Any messages.
   */
  registry?: Registry;

  /**
   * With this option enabled, validation fails on the first rule violation
   * encountered. By default, all violations are accumulated.
   */
  failFast?: boolean;

  /**
   * RE2 compliant regex matcher to use.
   *
   * By default, regular expressions are evaluated with an RE2 engine
   * (the @bufbuild/re2 package), matching protovalidate's documented RE2
   * contract: RE2 syntax, linear-time matching, no backreferences or
   * lookaround.
   *
   * This option is the bring-your-own-engine hook: a matcher supplied here
   * replaces the default for every regex the validator evaluates — the
   * `string.pattern` and `bytes.pattern` rules, and the CEL `matches()`
   * function.
   */
  regexMatch?: RegexMatcher;

  /**
   * With this option enabled, proto2 fields with the `required` label, and fields
   * with the edition feature `field_presence=LEGACY_REQUIRED` are validated to
   * be set.
   *
   * By default, legacy required field are not validated.
   */
  legacyRequired?: boolean;

  /**
   * Disable the native (non-CEL) implementation of standard rules.
   *
   * By default, validation uses hand-written checks for most standard
   * buf.validate.field rules. Setting this option to true forces every
   * standard rule through CEL instead. Behavior is identical either way;
   * the flag exists to isolate the native path during debugging or to
   * compare conformance.
   */
  disableNativeRules?: boolean;
};

/**
 * A validator.
 */
export type Validator = {
  /**
   * Validate the given message satisfies its rules, and return the result.
   *
   * Rules are defined within the Protobuf file as options from the
   * buf.validate package.
   *
   * The result is one of:
   * - valid: The message passed all validation rules.
   * - invalid: The message violated one or more validation rules.
   * - error: An error occurred while compiling or evaluating a rule.
   */
  validate<Desc extends DescMessage>(
    schema: Desc,
    message: MessageShape<Desc>,
  ): ValidationResult<MessageValidType<Desc>, MessageShape<Desc>>;
};

/**
 * The result of validating a Protobuf message with protovalidate.
 *
 * It is one of:
 * - valid: The message passed all validation rules.
 * - invalid: The message violated one or more validation rules.
 * - error: An error occurred while compiling or evaluating a rule.
 */
export type ValidationResult<Valid = Message, Invalid = Message> =
  | {
      kind: "valid";
      message: Valid;
      error: undefined;
      violations: undefined;
    }
  | {
      kind: "invalid";
      message: Invalid;
      error: ValidationError;
      violations: Violation[];
    }
  | {
      kind: "error";
      message: Invalid;
      error: CompilationError | RuntimeError;
      violations: undefined;
    };

/**
 * Create a validator.
 */
export function createValidator(opt?: ValidatorOptions): Validator {
  const registry = opt?.registry
    ? createMutableRegistry(opt.registry, file_buf_validate_validate)
    : createMutableRegistry(file_buf_validate_validate);
  const failFast = opt?.failFast ?? false;
  const regexMatch = opt?.regexMatch ?? re2RegexMatch;
  const celMan = new CelManager(registry, regexMatch);
  const planner = new Planner(
    celMan,
    opt?.legacyRequired ?? false,
    opt?.disableNativeRules ?? false,
    regexMatch,
  );
  return {
    validate<
      Desc extends DescMessage,
      Shape extends MessageShape<Desc>,
      Valid extends MessageValidType<Desc>,
    >(schema: Desc, message: Shape) {
      try {
        validateUnsafe(registry, celMan, planner, schema, message, failFast);
      } catch (e) {
        if (e instanceof ValidationError) {
          return {
            kind: "invalid",
            message,
            error: e,
            violations: e.violations,
          };
        }
        if (e instanceof CompilationError || e instanceof RuntimeError) {
          return {
            kind: "error",
            message,
            error: e,
          };
        }
        return {
          kind: "error",
          message,
          error: new RuntimeError("unexpected error: " + e, { cause: e }),
        };
      }
      return {
        kind: "valid",
        message: message as unknown as Valid,
      };
    },
  };
}

function validateUnsafe(
  registry: MutableRegistry,
  celMan: CelManager,
  planner: Planner,
  schema: DescMessage,
  message: Message,
  failFast: boolean,
) {
  const messageTypeName = message.$typeName;
  if (!isMessage(message, schema)) {
    throw new RuntimeError(
      `Cannot validate message ${messageTypeName} with schema ${schema.typeName}`,
    );
  }
  if (!registry.get(schema.typeName)) {
    registry.add(schema);
    for (const type of usedTypes(schema)) {
      registry.add(type);
    }
  }
  const plan = planner.plan(schema);
  const msg = reflect(schema, message);
  const cursor = Cursor.create(schema, failFast);
  celMan.updateCelNow();
  plan.eval(msg, cursor);
  cursor.throwIfViolated();
}
