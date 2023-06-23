/* eslint-disable @typescript-eslint/no-unused-vars */
import { Any } from "@bufbuild/protobuf";

import { CelType, NumType, type CelVal } from "./value";

export class CelError {
  static invalidArgument(id: number, func: string, issue: string): CelError {
    return new CelError(id, `invalid argument to function ${func}: ${issue}`);
  }
  static unrecognizedAny(id: number, any: Any): CelError {
    return new CelError(id, `unrecognized any type: ${any.typeUrl}`);
  }
  static typeMismatch(id: number, arg0: string, val: unknown): CelError {
    return new CelError(id, `type mismatch: ${arg0} vs ${typeof val}`);
  }
  static typeNotFound(id: number, type: string): CelError {
    return new CelError(id, `type not found: ${type}`);
  }
  static unresolvedAttr(id: number): CelError {
    return new CelError(id, "unresolved attribute");
  }
  static badStringBytes(id: number, e: string): CelError {
    return new CelError(Number(id), `Failed to decode bytes as string: ${e}`);
  }
  static badTimeStr(id: number, e: string): CelError {
    return new CelError(Number(id), `Failed to parse timestamp: ${e}`);
  }
  static badDurationStr(id: number, e: string): CelError {
    return new CelError(Number(id), `Failed to parse duration: ${e}`);
  }
  static invalidTz(id: number, timezone: string): CelError {
    return new CelError(Number(id), `invalid timezone: ${timezone}`);
  }
  static badTimestamp(id: number, seconds: bigint, nanos: number): CelError {
    return new CelError(Number(id), "timestamp out of range");
  }
  static badDuration(id: number, seconds: bigint, nanos: number): CelError {
    return new CelError(Number(id), "duration out of range");
  }
  static badIndexAccess(id: number, type: CelType): CelError {
    return new CelError(
      Number(id),
      `index access not supported for ${type.fullname()}`
    );
  }
  static badStringAccess(id: number, typ: CelType): CelError {
    return new CelError(
      Number(id),
      `${typ.fullname()} cannot be accessed by string`
    );
  }
  static mapKeyConflict(id: number, key: CelVal): CelError {
    return new CelError(id, `map key conflict: ${String(key)}`);
  }
  static funcNotFound(id: number, func: string): CelError {
    return new CelError(id, `unbound function: ${func}`);
  }
  static identNotFound(id: number, ident: string, namespace: string): CelError {
    return new CelError(
      Number(id),
      `undeclared reference to '${ident}' (in container '${namespace}')`
    );
  }
  static indexOutOfBounds(id: number, index: number, length: number): CelError {
    return new CelError(id, `index ${index} out of bounds [0, ${length})`);
  }
  static fieldNotFound(
    id: number,
    name: unknown,
    fields: unknown = undefined
  ): CelError {
    if (fields !== undefined) {
      return new CelError(
        id,
        `field not found: ${String(name)} in ${String(fields)}`
      );
    }
    return new CelError(id, `field not found: ${String(name)}`);
  }
  static keyNotFound(id: number): CelError {
    return new CelError(id, "key not found");
  }
  static unsupportedKeyType(id: number): CelError {
    return new CelError(id, `unsupported key type`);
  }
  static divisionByZero(id: number, type: NumType): CelError {
    return new CelError(Number(id), `${type.name} divide by zero`);
  }
  static moduloByZero(id: number, type: NumType): CelError {
    return new CelError(Number(id), `${type.name} modulus by zero`);
  }

  static overflow(id: number, op: string, type: CelType): CelError {
    return new CelError(
      Number(id),
      `${type.name} return error for overflow during ${op}`
    );
  }
  public static overloadNotFound(
    id: number,
    name: string,
    types: CelType[]
  ): CelError {
    return new CelError(
      id,
      `found no matching overload for '${name}' applied to '(${types
        .map((x) => x.name)
        .join(", ")})'`
    );
  }

  static merge(errors: CelError[]): CelError {
    for (let i = 1; i < errors.length; i++) {
      errors[0].add(errors[i]);
    }
    return errors[0];
  }

  public additional?: CelError[];
  constructor(public id: number, public message: string) {}

  public add(additional: CelError) {
    if (this.additional === undefined) {
      this.additional = [];
    }
    this.additional.push(additional);
  }
}

export class CelUnknown {
  constructor(public ids: bigint[]) {}

  public static merge(unknowns: CelUnknown[]): CelUnknown {
    if (unknowns.length === 0) {
      return new CelUnknown([]);
    }
    if (unknowns.length === 1) {
      return unknowns[0];
    }
    let ids: bigint[] = [];
    for (const unknown of unknowns) {
      ids = ids.concat(unknown.ids);
    }
    return new CelUnknown(ids);
  }
}
