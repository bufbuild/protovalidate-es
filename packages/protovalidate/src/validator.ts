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
  createRegistry,
  type DescMessage,
  type MessageShape,
  type Registry,
} from "@bufbuild/protobuf";
import { reflect } from "@bufbuild/protobuf/reflect";
import { Cursor } from "./cursor.js";
import { createPlanner } from "./planner.js";
import { updateCelNow } from "./cel.js";

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
  const userRegistry = opt?.registry ?? createRegistry();
  const failFast = opt?.failFast ?? false;
  const planner = createPlanner(userRegistry);
  return {
    validate(schema, message) {
      this.for(schema)(message);
    },
    for(schema) {
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
