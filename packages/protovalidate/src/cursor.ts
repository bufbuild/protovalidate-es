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
  DescExtension,
  DescField,
  DescMessage,
  DescOneof,
} from "@bufbuild/protobuf";
import { ValidationError, Violation } from "./error.js";
import { buildPath, type PathBuilder, type Path } from "./path.js";

/**
 * Cursor maintains a field path and tracks violations.
 */
export class Cursor {
  static create(root: DescMessage, failFast: boolean) {
    return new Cursor(root, failFast, [], buildPath(root));
  }

  private constructor(
    private readonly root: DescMessage,
    private readonly failFast: boolean,
    private readonly violations: Violation[],
    private readonly builder: PathBuilder,
  ) {}

  get violated(): boolean {
    return this.violations.length > 0;
  }

  violate(
    message: string,
    constraintId: string,
    rulePath: Path,
    forMapKey = false,
  ): void {
    this.violations.push(
      new Violation(
        message,
        constraintId,
        this.builder.toPath(),
        rulePath,
        forMapKey,
      ),
    );
    if (this.failFast) {
      this.throwIfViolated();
    }
  }

  throwIfViolated(): void {
    if (this.violated) {
      throw new ValidationError(this.violations);
    }
  }

  getPath(): Path {
    return this.builder.toPath();
  }

  add(path: Path): Cursor {
    return this.cloneWith(this.builder.clone().add(path));
  }

  field(field: DescField): Cursor {
    return this.cloneWith(this.builder.clone().field(field));
  }

  oneof(oneof: DescOneof): Cursor {
    return this.cloneWith(this.builder.clone().oneof(oneof));
  }

  extension(ext: DescExtension): Cursor {
    return this.cloneWith(this.builder.clone().extension(ext));
  }

  list(index: number): Cursor {
    return this.cloneWith(this.builder.clone().list(index));
  }

  mapKey(key: string | number | bigint | boolean): Cursor {
    return this.cloneWith(this.builder.clone().mapKey(key));
  }

  private cloneWith(path: PathBuilder) {
    return new Cursor(this.root, this.failFast, this.violations, path);
  }
}
