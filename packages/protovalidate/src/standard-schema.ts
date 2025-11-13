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

import type {
  DescMessage,
  MessageShape,
  MessageValidType,
} from "@bufbuild/protobuf";
import { createValidator, type ValidatorOptions } from "./validator.js";
import type { Violation } from "./error.js";

/**
 * Convert a Violation to a StandardSchemaV1.Issue.
 */
function violationToIssue(violation: Violation): StandardSchemaV1.Issue {
  const path: Array<PropertyKey> = [];

  for (const segment of violation.field) {
    switch (segment.kind) {
      case "field":
        if (segment.oneof !== undefined) {
          path.push(segment.oneof.localName);
          path.push("value");
        } else {
          path.push(segment.localName);
        }
        continue;
      case "oneof":
        path.push(segment.localName);
        continue;
      case "list_sub":
        path.push(segment.index);
        continue;
      case "map_sub":
        const key = segment.key;
        if (typeof key === "string" || typeof key === "number") {
          path.push(key);
        } else {
          path.push(String(key));
        }
        continue;
      case "extension":
        // Extensions are represented as field names with brackets
        path.push(`[${segment.typeName}]`);
        continue;
    }
  }

  if (path.length > 0) {
    return {
      message: violation.message,
      path: path,
    };
  }

  return {
    message: violation.message,
  };
}

/**
 * Create a Standard Schema compliant validator for a Protobuf message type.
 *
 * @param messageDesc - The Protobuf message descriptor
 * @param options - Optional validator configuration
 * @returns A StandardSchemaV1 compliant validator
 */
export function createStandardSchema<Desc extends DescMessage>(
  messageDesc: Desc,
  options?: ValidatorOptions,
): StandardSchemaV1<MessageShape<Desc>, MessageValidType<Desc>> {
  const validator = createValidator(options);

  return {
    "~standard": {
      version: 1,
      vendor: "protovalidate-es",
      validate: (value: unknown) => {
        // Type guard to ensure value is an object
        if (typeof value !== "object" || value === null) {
          return {
            issues: [
              {
                message: "Expected an object",
              },
            ],
          };
        }

        const result = validator.validate(
          messageDesc,
          value as MessageShape<Desc>,
        );

        switch (result.kind) {
          case "valid":
            return {
              value: result.message,
            };

          case "invalid":
            return {
              issues: result.violations.map(violationToIssue),
            };

          case "error":
            // For compilation/runtime errors, we return them as issues
            return {
              issues: [
                {
                  message: result.error.message,
                },
              ],
            };
        }
      },
      // Standard Schema types property for static analysis and type inference.
      // This property provides type information to external tools and libraries
      // for extracting input/output types using InferInput<T> and InferOutput<T>.
      // Runtime values are intentionally set to undefined to minimize overhead
      // while maintaining full TypeScript type information.
      types: {
        input: undefined as unknown as MessageShape<Desc>,
        output: undefined as unknown as MessageValidType<Desc>,
      },
    },
  };
}

/*
 * The Standard Schema interface.
 *
 * Derived from Standard Schema (MIT)
 * https://github.com/standard-schema/standard-schema
 *
 * Copyright (c) 2024 Colin McDonnell
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

/*
 * The Standard Schema namespace.
 *
 * Derived from Standard Schema (MIT)
 * https://github.com/standard-schema/standard-schema
 *
 * Copyright (c) 2024 Colin McDonnell
 */
export declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Validates unknown input values. */
    readonly validate: (
      value: unknown,
    ) => Result<Output> | Promise<Result<Output>>;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The result interface of the validate function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /** The result interface if validation succeeds. */
  export interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** The non-existent issues. */
    readonly issues?: undefined;
  }

  /** The result interface if validation fails. */
  export interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }

  /** The issue interface of the failure output. */
  export interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }

  /** The path segment interface of the issue. */
  export interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }

  /** The Standard Schema types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }

  /** Infers the input type of a Standard Schema. */
  export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
    Schema["~standard"]["types"]
  >["input"];

  /** Infers the output type of a Standard Schema. */
  export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
    Schema["~standard"]["types"]
  >["output"];

  // biome-ignore lint/complexity/noUselessEmptyExport: needed for granular visibility control of TS namespace
  export {};
}
