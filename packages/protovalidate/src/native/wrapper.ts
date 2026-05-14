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

import type { DescField } from "@bufbuild/protobuf";
import type {
  ReflectMessage,
  ReflectMessageGet,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import type { Cursor } from "../cursor.js";
import type { Eval } from "../eval.js";

/**
 * Adapter that bridges a scalar-typed native evaluator to the wrapper message
 * eval site.
 *
 * When a `google.protobuf.{Int32,Int64,...}Value` field is validated against
 * scalar rules (Int32Rules, etc.), the planner hands the eval a
 * `ReflectMessage` rather than a `ScalarValue`. This adapter reads the inner
 * `value` field and delegates to the scalar-typed evaluator.
 */
export class WrappedValueEval implements Eval<ReflectMessage> {
  constructor(
    private readonly valueField: DescField,
    private readonly inner: Eval<ScalarValue>,
  ) {}

  eval(val: ReflectMessage, cursor: Cursor): void {
    this.inner.eval(val.get(this.valueField) as ScalarValue, cursor);
  }

  prune(): boolean {
    return this.inner.prune();
  }
}

/**
 * Cast helper: `Eval<ScalarValue>` and `Eval<ReflectMessage>` are both
 * assignable to `Eval<ReflectMessageGet>` (the union type that the planner
 * stores), but TypeScript doesn't see that directly because Eval is invariant
 * in its parameter. Use this once at each handoff.
 */
export function asReflectGet<V extends ScalarValue | ReflectMessage>(
  e: Eval<V>,
): Eval<ReflectMessageGet> {
  return e as unknown as Eval<ReflectMessageGet>;
}
