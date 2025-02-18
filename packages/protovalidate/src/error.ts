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

import { type Path, pathToString } from "./path.js";
import {
  type FieldPath,
  type FieldPathElement,
  FieldPathElementSchema,
  FieldPathSchema,
  ViolationSchema,
  ViolationsSchema,
} from "./gen/buf/validate/validate_pb.js";
import {
  create,
  type DescField,
  type DescMessage,
  ScalarType,
} from "@bufbuild/protobuf";
import { FieldDescriptorProto_Type } from "@bufbuild/protobuf/wkt";

/**
 * A CompilationError is raised if a CEL expression cannot be compiled, or if
 * invalid standard constraints are applied.
 */
export class CompilationError extends Error {
  override name = "CompilationError";
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * A RuntimeError is returned if a CEL expression errors or returns an
 * unexpected value.
 */
export class RuntimeError extends Error {
  override name = "RuntimeError";
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * A ValidationError is raised if one or more constraint violations were
 * detected.
 */
export class ValidationError extends Error {
  override name = "ValidationError";
  public readonly violations: Violation[];
  constructor(violations: Violation[]) {
    super(validationErrorMessage(violations));
    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    Object.setPrototypeOf(this, new.target.prototype);
    this.violations = violations;
  }
}

function validationErrorMessage(violations: Violation[]): string {
  if (violations.length == 0) {
    return "validation failed";
  }
  if (violations.length == 1) {
    return violations[0].toString();
  }
  return (
    violations[0].toString() +
    `, and ${violations.length - 1} more violation${violations.length > 2 ? "s" : ""}`
  );
}

/**
 * Violation represents a single instance where a validation rule was not met.
 * It provides information about the field that caused the violation, the
 * specific unfulfilled constraint, and a human-readable error message.
 */
export class Violation {
  /**
   * A human-readable error message that describes the nature of the violation.
   *
   * This can be the default error message from the violated `Constraint`, or it
   * can be a custom message that gives more context about the violation.
   */
  public message: string;

  /**
   * The unique identifier of the `Constraint` that was not fulfilled.
   * This is the same `id` that was specified in the `Constraint` message,
   * allowing easy tracing of which rule was violated.
   */
  public constraintId: string;

  /**
   * A machine-readable path to the field that failed validation.
   *
   * This could be a nested field, in which case the path will include all the
   * parent fields leading to the actual field that caused the violation.
   */
  public field: Path;

  /**
   * A machine-readable path that points to the specific constraint rule that
   * failed validation.
   *
   * This will be a nested field starting from the FieldConstraints of the field
   * that failed validation. For custom constraints, this will provide the path
   * of the constraint, e.g. `cel[0]`.
   */
  public rule: Path;

  /**
   * Indicates whether the violation was caused by a map key, rather than a value.
   */
  public forKey: boolean;

  constructor(
    message: string,
    constraintId: string,
    field: Path,
    rule: Path,
    forKey: boolean,
  ) {
    this.message = message;
    this.constraintId = constraintId;
    this.field = field;
    this.rule = rule;
    this.forKey = forKey;
  }

  toString(): string {
    let path = pathToString(this.field);
    if (path.length > 0) {
      path += ": ";
    }
    return path + `${this.message} [${this.constraintId}]`;
  }
}

/**
 * Convert an array of Violation[] to the Protobuf message buf.validate.Violations.
 */
export function violationsToProto(violation: Violation[]) {
  return create(ViolationsSchema, {
    violations: violation.map(violationToProto),
  });
}

/**
 * Convert a Violation to the Protobuf message buf.validate.Violation.
 */
export function violationToProto(violation: Violation) {
  return create(ViolationSchema, {
    field: pathToProto(violation.field),
    rule: pathToProto(violation.rule),
    constraintId: violation.constraintId,
    message: violation.message,
    forKey: violation.forKey,
  });
}

/**
 * Convert a Protobuf message buf.validate.FieldPath to a Path.
 *
 * Raises an error if the Protobuf message cannot be converted because of a schema
 * mismatch, or because it is invalid.
 */
export function pathFromViolationProto(
  schema: DescMessage,
  proto: FieldPath,
): Path {
  const path: Path = [];
  let parent: DescMessage | undefined = schema;
  for (const [i, e] of proto.elements.entries()) {
    if (!parent) {
      throw errInvPathProto(i);
    }
    const field: DescField | undefined = parent.fields.find(
      (f) => f.number === e.fieldNumber || f.name === e.fieldName,
    );
    if (!field) {
      const oneof = parent.oneofs.find((o) => o.name === e.fieldName);
      if (oneof) {
        path.push(oneof);
        parent = undefined;
        continue;
      }
      throw errInvPathProto(i);
    }
    path.push(field);
    parent = field.message;
    if (e.subscript.case == "index") {
      if (field.fieldKind != "list") {
        throw errInvPathProto(i);
      }
      path.push({
        kind: "list_sub",
        index: Number(e.subscript.value),
      });
    } else if (e.subscript.case != undefined) {
      if (field.fieldKind != "map") {
        throw errInvPathProto(i);
      }
      switch (e.subscript.case) {
        case "boolKey":
          if (field.mapKey != ScalarType.BOOL) {
            throw errInvPathProto(i);
          }
          break;
        case "stringKey":
          if (field.mapKey != ScalarType.STRING) {
            throw errInvPathProto(i);
          }
          break;
        case "uintKey":
          switch (field.mapKey) {
            case ScalarType.UINT32:
            case ScalarType.FIXED32:
            case ScalarType.UINT64:
            case ScalarType.FIXED64:
              // ok
              break;
            default:
              throw errInvPathProto(i);
          }
          break;
        case "intKey":
          switch (field.mapKey) {
            case ScalarType.INT32:
            case ScalarType.SINT32:
            case ScalarType.SFIXED32:
            case ScalarType.UINT32:
            case ScalarType.FIXED32:
              // ok
              break;
            default:
              throw errInvPathProto(i);
          }
          break;
      }
      path.push({
        kind: "map_sub",
        key: e.subscript.value,
      });
    }
  }
  return path;
}

function errInvPathProto(index: number) {
  return new Error(`invalid field path element ${index + 1}`);
}

/**
 * Convert a Path to the Protobuf message buf.validate.FieldPath.
 *
 * For an invalid or unsupported Path (buf.validate.FieldPath currently does not
 * support extensions, but Path does), this function will drop data instead of
 * throwing an error.
 */
function pathToProto(path: Path): FieldPath {
  const elements: FieldPathElement[] = [];
  for (const [i, e] of path.entries()) {
    switch (e.kind) {
      case "field":
        elements.push(
          create(FieldPathElementSchema, {
            fieldName: e.name,
            fieldNumber: e.number,
            fieldType: e.proto.type,
            keyType:
              e.fieldKind == "map"
                ? (e.mapKey as number as FieldDescriptorProto_Type)
                : undefined,
            valueType: mapValueType(e),
          }),
        );
        break;
      case "extension":
        // buf.validate.FieldPath does not support extensions at this time
        // elements.push(
        //   create(FieldPathElementSchema, {
        //     fieldName: e.typeName,
        //     fieldNumber: e.number,
        //     fieldType: e.proto.type,
        //   }),
        // );
        break;
      case "oneof":
        elements.push(
          create(FieldPathElementSchema, {
            fieldName: e.name,
          }),
        );
        break;
      case "list_sub": {
        const prevProto = elements[elements.length - 1];
        if (prevProto) {
          const prevPath = path[i - 1];
          prevProto.subscript = getListSub(e.index, prevPath);
        }
        break;
      }
      case "map_sub": {
        const prevProto = elements[elements.length - 1];
        if (prevProto) {
          const prevPath = path[i - 1];
          prevProto.subscript = getMapSub(e.key, prevPath);
        }
        break;
      }
    }
  }
  return create(FieldPathSchema, { elements });
}

function mapValueType(field: DescField): FieldDescriptorProto_Type | undefined {
  if (field.fieldKind == "map") {
    switch (field.mapKind) {
      case "scalar":
        return field.scalar as number as FieldDescriptorProto_Type;
      case "enum":
        return FieldDescriptorProto_Type.ENUM;
      case "message":
        // map fields are always LENGTH_PREFIXED
        return FieldDescriptorProto_Type.MESSAGE;
    }
  }
  return undefined;
}

function getListSub(
  index: number,
  prevPath: Path[number] | undefined,
): FieldPathElement["subscript"] {
  if (prevPath?.kind == "field" && prevPath.fieldKind == "list") {
    return {
      case: "index",
      value: BigInt(index),
    };
  }
  return { case: undefined };
}

function getMapSub(
  key: string | number | bigint | boolean,
  prevPath: Path[number] | undefined,
): FieldPathElement["subscript"] {
  if (prevPath?.kind == "field" && prevPath.fieldKind == "map") {
    switch (typeof key) {
      case "boolean":
        switch (prevPath.mapKey) {
          case ScalarType.BOOL:
            return {
              case: "boolKey",
              value: key,
            };
        }
        break;
      case "string":
        switch (prevPath.mapKey) {
          case ScalarType.STRING:
            return {
              case: "stringKey",
              value: key,
            };
        }
        break;
      case "number":
      case "bigint":
        switch (prevPath.mapKey) {
          case ScalarType.INT32:
          case ScalarType.SINT32:
          case ScalarType.SFIXED32:
          case ScalarType.INT64:
          case ScalarType.SINT64:
          case ScalarType.SFIXED64:
            return {
              case: "intKey",
              value: BigInt(key),
            };
          case ScalarType.UINT32:
          case ScalarType.FIXED32:
          case ScalarType.UINT64:
          case ScalarType.FIXED64:
            return {
              case: "uintKey",
              value: BigInt(key),
            };
        }
        break;
    }
  }
  return { case: undefined };
}
