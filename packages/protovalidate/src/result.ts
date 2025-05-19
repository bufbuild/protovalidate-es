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
  CompilationError,
  RuntimeError,
  ValidationError,
  Violation,
} from "./error.js";

/**
 * The result of validating a Protobuf message with protovalidate.
 */
export type ValidationResult =
  | {
      kind: "valid";
      error: undefined;
      violations: undefined;
    }
  | {
      kind: "invalid";
      error: ValidationError;
      violations: Violation[];
    }
  | {
      kind: "error";
      error: CompilationError | RuntimeError;
      violations: undefined;
    };
