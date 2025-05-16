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

import {
  createMutableRegistry,
  isMessage,
  type DescMessage,
  type MessageShape,
  type Registry,
} from "@bufbuild/protobuf";
import { reflect, usedTypes } from "@bufbuild/protobuf/reflect";
import { Cursor } from "./cursor.js";
import { RuntimeError } from "./error.js";
import { Planner } from "./planner.js";
import { CelManager, type RegexMatcher } from "./cel.js";
import { file_buf_validate_validate } from "./gen/buf/validate/validate_pb.js";

/**
 * Options for creating a validator.
 */
export type ValidatorOptions = {
  /**
   * To validate messages with user-defined predefined rules, pass the extensions
   * to the validator via the registry.
   *
   * By default, the validator is unaware of any predefined rules, and will not
   * validate them.
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
   * ECMAScript supports most, but not all RE expressions. You can use a custom
   * regex engine to support the unsupported features of RE2.
   *
   * Know limitations of default RE (ECMAScript) matcher:
   *  * Cannot change flags mid-sequence e.g. 'John(?i)Doe'.
   *  * Doesn't support the 'U' flag.
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
};

/**
 * A validator.
 */
export type Validator = {
  /**
   * Checks that message satisfies its rules. Rules are defined within the
   * Protobuf file as options from the buf.validate package.
   */
  validate<Desc extends DescMessage>(
    schema: Desc,
    message: MessageShape<Desc>,
  ): void;
  /**
   * Returns a validation function for the given message type.
   */
  for<Desc extends DescMessage>(
    schema: Desc,
  ): BoundValidationFn<MessageShape<Desc>>;
};

/**
 * A validator for one specific message type.
 */
export type BoundValidationFn<T> = (message: T) => void;

/**
 * Create a validator.
 */
export function createValidator(opt?: ValidatorOptions): Validator {
  const registry = opt?.registry
    ? createMutableRegistry(opt.registry, file_buf_validate_validate)
    : createMutableRegistry(file_buf_validate_validate);
  const failFast = opt?.failFast ?? false;
  const celMan = new CelManager(registry, opt?.regexMatch);
  const planner = new Planner(celMan, opt?.legacyRequired ?? false);
  return {
    validate(schema, message) {
      this.for(schema)(message);
    },
    for(schema) {
      if (!registry.get(schema.typeName)) {
        registry.add(schema);
        for (const type of usedTypes(schema)) {
          registry.add(type);
        }
      }
      const plan = planner.plan(schema);
      return function boundValidationFn(message) {
        if (!isMessage(message, schema)) {
          throw new RuntimeError(
            `Cannot validate message ${message.$typeName} with schema ${schema.typeName}`,
          );
        }
        const msg = reflect(schema, message);
        const cursor = Cursor.create(schema, failFast);
        celMan.updateCelNow();
        plan.eval(msg, cursor);
        cursor.throwIfViolated();
      };
    },
  };
}
