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
  type DescMessage,
  type MessageShape,
  type Registry,
} from "@bufbuild/protobuf";
import { nestedTypes, reflect } from "@bufbuild/protobuf/reflect";
import { Cursor } from "./cursor.js";
import { createPlanner } from "./planner.js";
import { updateCelNow } from "./cel.js";
import { file_buf_validate_validate } from "./gen/buf/validate/validate_pb.js";

/**
 * Options for creating a validator.
 */
export type ValidatorOptions = {
  registry?: Registry;
  failFast?: boolean;
};

/**
 * A validator.
 */
export type Validator = {
  /**
   * Checks that message satisfies its constraints. Constraints are defined
   * within the Protobuf file as options from the buf.validate package.
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
  const planner = createPlanner(registry);
  return {
    validate(schema, message) {
      this.for(schema)(message);
    },
    for(schema) {
      registry.add(schema);
      for (const type of nestedTypes(schema)) {
        registry.add(type);
      }
      const plan = planner.plan(schema);
      return function boundValidationFn(message) {
        const msg = reflect(schema, message);
        const cursor = Cursor.create(schema, failFast);
        updateCelNow();
        plan.eval(msg, cursor);
        cursor.throwIfViolated();
      };
    },
  };
}
