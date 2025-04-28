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
  type ReflectMessage,
  scalarEquals,
  type ScalarValue,
  scalarZeroValue,
} from "@bufbuild/protobuf/reflect";
import { type DescEnum, type DescField, ScalarType } from "@bufbuild/protobuf";
import { Ignore } from "./gen/buf/validate/validate_pb.js";
import { FeatureSet_FieldPresence } from "@bufbuild/protobuf/wkt";

export type Condition<V> = {
  check(val: V): boolean;
  always: boolean;
  never: boolean;
};

const always: Condition<unknown> = {
  check(): boolean {
    return true;
  },
  always: true,
  never: false,
};

const never: Condition<unknown> = {
  check(): boolean {
    return false;
  },
  always: false,
  never: true,
};

export function ignoreListOrMapField(
  field: DescField & { fieldKind: "map" | "list" },
  ignore: Ignore | undefined,
): Condition<ReflectMessage> {
  switch (ignore) {
    case undefined:
    case Ignore.UNSPECIFIED:
      return always as Condition<ReflectMessage>;
    case Ignore.IF_UNPOPULATED:
    case Ignore.IF_DEFAULT_VALUE:
      return new FieldIsSet(field);
    case Ignore.ALWAYS:
      return never as Condition<ReflectMessage>;
  }
}

export function ignoreMessageField(
  field: DescField & { fieldKind: "message" },
  ignore: Ignore | undefined,
): Condition<ReflectMessage> {
  switch (ignore) {
    case undefined:
    case Ignore.UNSPECIFIED:
    case Ignore.IF_UNPOPULATED:
      return new FieldIsSet(field);
    case Ignore.IF_DEFAULT_VALUE:
      return new FieldMessageNotEmpty(field);
    case Ignore.ALWAYS:
      return never as Condition<ReflectMessage>;
  }
}

export function ignoreScalarOrEnumField(
  field: DescField & { fieldKind: "enum" | "scalar" },
  ignore: Ignore | undefined,
): Condition<ReflectMessage> {
  if (ignore == Ignore.ALWAYS) {
    return never as Condition<ReflectMessage>;
  }
  if (field.presence == FeatureSet_FieldPresence.IMPLICIT) {
    switch (ignore) {
      case undefined:
      case Ignore.UNSPECIFIED:
        return always as Condition<ReflectMessage>;
      case Ignore.IF_UNPOPULATED:
      case Ignore.IF_DEFAULT_VALUE:
        return new FieldIsSet(field);
    }
  }
  // field presence EXPLICIT or LEGACY_REQUIRED
  switch (ignore) {
    case undefined:
    case Ignore.UNSPECIFIED:
    case Ignore.IF_UNPOPULATED:
      return new FieldIsSet(field);
    case Ignore.IF_DEFAULT_VALUE:
      if (field.fieldKind == "scalar") {
        return new FieldScalarNot(
          field,
          field.scalar,
          field.getDefaultValue() ?? scalarZeroValue(field.scalar, false),
        );
      }
      return new FieldScalarNot(
        field,
        ScalarType.INT32,
        field.getDefaultValue() ?? field.enum.values[0].number,
      );
  }
}

export function ignoreEnumValue(
  enu: DescEnum,
  ignore: Ignore | undefined,
): Condition<ScalarValue> {
  switch (ignore) {
    case undefined:
    case Ignore.UNSPECIFIED:
      return always as Condition<ScalarValue>;
    case Ignore.IF_DEFAULT_VALUE:
    case Ignore.IF_UNPOPULATED:
      return new ScalarNot(ScalarType.INT32, enu.values[0].number);
    case Ignore.ALWAYS:
      return never as Condition<ScalarValue>;
  }
}

export function ignoreScalarValue(
  scalar: ScalarType,
  ignore: Ignore | undefined,
): Condition<ScalarValue> {
  switch (ignore) {
    case undefined:
    case Ignore.UNSPECIFIED:
      return always as Condition<ScalarValue>;
    case Ignore.IF_DEFAULT_VALUE:
    case Ignore.IF_UNPOPULATED:
      return new ScalarNot(scalar, scalarZeroValue(scalar, false));
    case Ignore.ALWAYS:
      return never as Condition<ScalarValue>;
  }
}

export function ignoreMessageValue(
  ignore: Ignore | undefined,
): Condition<ReflectMessage> {
  switch (ignore) {
    case undefined:
    case Ignore.UNSPECIFIED:
    case Ignore.IF_UNPOPULATED:
      return always as Condition<ReflectMessage>;
    case Ignore.IF_DEFAULT_VALUE:
      return new MessageNotEmpty();
    case Ignore.ALWAYS:
      return never as Condition<ReflectMessage>;
  }
}

class MessageNotEmpty implements Condition<ReflectMessage> {
  readonly always = false;
  readonly never = false;
  check(val: ReflectMessage): boolean {
    return val.fields.some((f) => val.isSet(f));
  }
}

class ScalarNot implements Condition<ScalarValue> {
  readonly always = false;
  readonly never = false;
  constructor(
    private readonly scalar: ScalarType,
    private readonly not: ScalarValue,
  ) {}
  check(val: ScalarValue): boolean {
    return !scalarEquals(this.scalar, this.not, val);
  }
}

class FieldIsSet implements Condition<ReflectMessage> {
  readonly always = false;
  readonly never = false;
  constructor(private readonly field: DescField) {}
  check(val: ReflectMessage): boolean {
    return val.isSet(this.field);
  }
}

class FieldMessageNotEmpty implements Condition<ReflectMessage> {
  readonly always = false;
  readonly never = false;
  constructor(private readonly field: DescField & { fieldKind: "message" }) {}
  check(val: ReflectMessage): boolean {
    if (!val.isSet(this.field)) {
      return false;
    }
    const fieldVal = val.get(this.field);
    return fieldVal.fields.some((f) => fieldVal.isSet(f));
  }
}

class FieldScalarNot implements Condition<ReflectMessage> {
  readonly always = false;
  readonly never = false;
  constructor(
    private readonly field: DescField & { fieldKind: "scalar" | "enum" },
    private readonly scalar: ScalarType,
    private readonly not: ScalarValue,
  ) {}
  check(val: ReflectMessage): boolean {
    return (
      val.isSet(this.field) &&
      !scalarEquals(this.scalar, this.not, val.get(this.field))
    );
  }
}
