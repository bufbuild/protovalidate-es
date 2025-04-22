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
  type DescExtension,
  type DescField,
  type DescMessage,
  getOption,
  hasOption,
  type Registry,
} from "@bufbuild/protobuf";
import {
  type CelEnv,
  CelError,
  CelList,
  CelObject,
  type CelResult,
  type CelVal,
  createEnv,
  Func,
  FuncRegistry,
} from "@bufbuild/cel";
import {
  type Constraint,
  type FieldConstraints,
  predefined,
} from "./gen/buf/validate/validate_pb.js";
import { CompilationError, RuntimeError } from "./error.js";
import {
  isReflectList,
  isReflectMap,
  isReflectMessage,
  type ReflectMessageGet,
} from "@bufbuild/protobuf/reflect";
import type { Eval } from "./eval.js";
import type { Path } from "./path.js";
import { Cursor } from "./cursor.js";
import { type Timestamp, timestampNow } from "@bufbuild/protobuf/wkt";
import {
  isEmail,
  isHostAndPort,
  isHostname,
  isInf,
  isIp,
  isIpPrefix,
  isUri,
  isUriRef,
  unique,
} from "./lib.js";

type CelCompiledRules = {
  standard: {
    field: DescField;
    constraint: Constraint;
    compiled: CelCompiledConstraint;
  }[];
  extensions: Map<
    number,
    {
      ext: DescExtension;
      constraint: Constraint;
      compiled: CelCompiledConstraint;
    }[]
  >;
};

export type CelCompiledConstraint =
  | {
      kind: "compilation_error";
      error: CompilationError;
    }
  | {
      kind: "interpretable";
      interpretable: ReturnType<CelEnv["plan"]>;
      constraint: Constraint;
    };

// TODO contains, endsWith, startsWith for bytes

function createCustomFuncs(): FuncRegistry {
  const reg = new FuncRegistry();
  reg.add(
    Func.unary(
      "isNan",
      ["double_is_nan_bool"],
      (_id: number, arg: CelVal): CelResult | undefined => {
        return typeof arg == "number" && Number.isNaN(arg);
      },
    ),
  );
  reg.add(
    Func.newStrict(
      "isInf",
      ["double_is_inf_bool", "double_int_is_inf_bool"],
      (_id: number, args: CelVal[]): CelResult | undefined => {
        if (args.length == 1) {
          return typeof args[0] == "number" && isInf(args[0]);
        }
        if (args.length == 2) {
          return (
            typeof args[0] == "number" &&
            (typeof args[1] == "number" || typeof args[1] == "bigint") &&
            isInf(args[0], args[1])
          );
        }
        return false;
      },
    ),
  );
  reg.add(
    Func.unary(
      "isHostname",
      ["string_is_hostname_bool"],
      (_id: number, arg: CelVal): CelResult | undefined => {
        if (typeof arg != "string") {
          return false;
        }
        return isHostname(arg);
      },
    ),
  );
  reg.add(
    Func.binary(
      "isHostAndPort",
      ["string_bool_is_host_and_port_bool"],
      (_id: number, lhs: CelVal, rhs: CelVal): CelResult | undefined => {
        if (typeof lhs != "string" || typeof rhs != "boolean") {
          return false;
        }
        return isHostAndPort(lhs, rhs);
      },
    ),
  );
  reg.add(
    Func.unary(
      "isEmail",
      ["string_is_email_bool"],
      (_id: number, arg: CelVal): CelResult | undefined => {
        if (typeof arg != "string") {
          return false;
        }
        return isEmail(arg);
      },
    ),
  );
  reg.add(
    Func.newStrict(
      "isIp",
      ["string_is_ip_bool", "string_int_is_ip_bool"],
      (_id: number, args: CelVal[]): CelResult | undefined => {
        if (args.length == 1) {
          return typeof args[0] == "string" && isIp(args[0]);
        }
        if (args.length == 2) {
          return (
            typeof args[0] == "string" &&
            (typeof args[1] == "number" || typeof args[1] == "bigint") &&
            isIp(args[0], args[1])
          );
        }
        return false;
      },
    ),
  );
  reg.add(
    Func.newStrict(
      "isIpPrefix",
      [
        "string_is_ip_prefix_bool",
        "string_int_is_ip_prefix_bool",
        "string_bool_is_ip_prefix_bool",
        "string_int_bool_is_ip_prefix_bool",
      ],
      (_id: number, args: CelVal[]): CelResult | undefined => {
        if (args.length < 1 || typeof args[0] != "string") {
          return undefined;
        }
        if (args.length == 1) {
          return isIpPrefix(args[0]);
        }
        if (args.length == 2) {
          if (typeof args[1] == "boolean") {
            return isIpPrefix(args[0], undefined, args[1]);
          }
          if (typeof args[1] == "number" || typeof args[1] == "bigint") {
            return isIpPrefix(args[0], args[1]);
          }
        }
        if (
          args.length == 3 &&
          (typeof args[1] == "number" || typeof args[1] == "bigint") &&
          typeof args[2] == "boolean"
        ) {
          return isIpPrefix(args[0], args[1], args[2]);
        }
        return undefined;
      },
    ),
  );
  reg.add(
    Func.unary(
      "isUri",
      ["string_is_uri_bool"],
      (_id: number, arg: CelVal): CelResult | undefined => {
        return typeof arg == "string" && isUri(arg);
      },
    ),
  );
  reg.add(
    Func.unary(
      "isUriRef",
      ["string_is_uri_ref_bool"],
      (_id: number, arg: CelVal): CelResult | undefined => {
        return typeof arg == "string" && isUriRef(arg);
      },
    ),
  );
  reg.add(
    Func.unary(
      "unique",
      ["list_unique_bool"],
      (_id: number, arg: CelVal): CelResult | undefined => {
        return arg instanceof CelList && unique(arg);
      },
    ),
  );
  reg.add(
    Func.binary(
      "getField",
      ["dyn_string_get_field_dyn"],
      (id: number, lhs: CelVal, rhs: CelVal): CelResult | undefined => {
        if (typeof rhs == "string" && lhs instanceof CelObject) {
          return lhs.accessByName(id, rhs);
        }
        return undefined;
      },
    ),
  );
  return reg;
}

export class CelManager {
  // CEL environment with extensions for Protovalidate.
  // This includes the variable "now", which must be updated before each evaluation
  // by calling updateCelNow().
  private readonly env: CelEnv;

  // Value of the CEL variable "now"
  private readonly now: Timestamp;

  private readonly rulesCache = new Map<string, CelCompiledRules>();

  constructor(private readonly registry: Registry) {
    this.now = timestampNow();
    this.env = createEnv("", registry);
    this.env.addFuncs(createCustomFuncs());
    this.env.set("now", this.now);
  }

  /**
   * Update the CEL variable "now" to the current time.
   */
  updateCelNow(): void {
    const n2 = timestampNow();
    this.now.seconds = n2.seconds;
    this.now.nanos = n2.nanos;
  }

  setEnv(key: "this" | "rules" | "rule", value: unknown): void {
    this.env.set(key, value);
  }

  eval(compiled: CelCompiledConstraint) {
    if (compiled.kind == "compilation_error") {
      throw compiled.error;
    }
    const constraint = compiled.constraint;
    const result = this.env.eval(compiled.interpretable);
    if (typeof result == "string" || typeof result == "boolean") {
      const success = typeof result == "boolean" ? result : result.length == 0;
      if (success) {
        return undefined;
      }
      // From field buf.validate.Constraint.message:
      // > If a non-empty message is provided, any strings resulting from the CEL
      // > expression evaluation are ignored.
      return {
        message:
          constraint.message.length == 0 && typeof result == "string"
            ? result
            : constraint.message,
        constraintId: constraint.id,
      };
    }
    if (result instanceof CelError) {
      throw new RuntimeError(result.message, { cause: result });
    }
    throw new RuntimeError(
      `expression ${constraint.id} outputs ${typeof result}, wanted either bool or string`,
    );
  }

  compileConstraint(constraint: Constraint): CelCompiledConstraint {
    try {
      return {
        kind: "interpretable",
        interpretable: this.env.plan(this.env.parse(constraint.expression)),
        constraint,
      };
    } catch (cause) {
      return {
        kind: "compilation_error",
        error: new CompilationError(
          `failed to compile ${constraint.id}: ${String(cause)}`,
          { cause },
        ),
      };
    }
  }

  compileRules(descMessage: DescMessage): CelCompiledRules {
    let compiled = this.rulesCache.get(descMessage.typeName);
    if (!compiled) {
      this.rulesCache.set(
        descMessage.typeName,
        (compiled = this.compileRulesUncached(descMessage)),
      );
    }
    return compiled;
  }

  private compileRulesUncached(descMessage: DescMessage): CelCompiledRules {
    const standard: CelCompiledRules["standard"] = [];
    const extensions: CelCompiledRules["extensions"] = new Map();
    for (const field of descMessage.fields) {
      if (!hasOption(field, predefined)) {
        continue;
      }
      for (const constraint of getOption(field, predefined).cel) {
        standard.push({
          field,
          constraint,
          compiled: this.compileConstraint(constraint),
        });
      }
    }
    for (const ext of registryGetExtensionsFor(this.registry, descMessage)) {
      if (!hasOption(ext, predefined)) {
        continue;
      }
      let list = extensions.get(ext.number);
      if (!list) {
        extensions.set(ext.number, (list = []));
      }
      for (const constraint of getOption(ext, predefined).cel) {
        list.push({
          ext,
          constraint,
          compiled: this.compileConstraint(constraint),
        });
      }
    }
    return { standard, extensions };
  }
}

function registryGetExtensionsFor(
  registry: Registry,
  extendee: DescMessage,
): DescExtension[] {
  const result: DescExtension[] = [];
  for (const type of registry) {
    if (
      type.kind == "extension" &&
      type.extendee.typeName == extendee.typeName
    ) {
      result.push(type);
    }
  }
  return result;
}

export class EvalCustomCel implements Eval<ReflectMessageGet> {
  private readonly children: {
    compiled: CelCompiledConstraint;
    rulePath: Path;
  }[] = [];

  constructor(
    private readonly celMan: CelManager,
    private readonly forMapKey: boolean,
  ) {}

  add(compiled: CelCompiledConstraint, rulePath: Path): void {
    this.children.push({ compiled, rulePath });
  }

  eval(val: ReflectMessageGet, cursor: Cursor): void {
    this.celMan.setEnv("this", reflectToCel(val));
    this.celMan.setEnv("rules", undefined);
    this.celMan.setEnv("rule", undefined);
    for (const child of this.children) {
      const vio = this.celMan.eval(child.compiled);
      if (vio) {
        cursor.violate(
          vio.message,
          vio.constraintId,
          child.rulePath,
          this.forMapKey,
        );
      }
    }
  }

  prune(): boolean {
    return this.children.length == 0;
  }
}

export class EvalExtendedRulesCel implements Eval<ReflectMessageGet> {
  private readonly children: {
    compiled: CelCompiledConstraint;
    rulePath: Path;
    ruleValue: unknown;
  }[] = [];

  constructor(
    private readonly celMan: CelManager,
    private readonly rules: Exclude<
      FieldConstraints["type"]["value"],
      undefined
    >,
    private readonly forMapKey: boolean,
  ) {}

  add(
    compiled: CelCompiledConstraint,
    rulePath: Path,
    ruleValue: unknown,
  ): void {
    this.children.push({
      compiled,
      rulePath,
      ruleValue: reflectToCel(ruleValue),
    });
  }

  eval(val: ReflectMessageGet, cursor: Cursor): void {
    this.celMan.setEnv("this", reflectToCel(val));
    this.celMan.setEnv("rules", this.rules);
    for (const child of this.children) {
      this.celMan.setEnv("rule", child.ruleValue);
      const vio = this.celMan.eval(child.compiled);
      if (vio) {
        cursor.violate(
          vio.message,
          vio.constraintId,
          child.rulePath,
          this.forMapKey,
        );
      }
    }
  }

  prune(): boolean {
    return this.children.length == 0;
  }
}

export class EvalStandardRulesCel implements Eval<ReflectMessageGet> {
  private readonly children: {
    compiled: CelCompiledConstraint;
    rulePath: Path;
  }[] = [];

  constructor(
    private readonly celMan: CelManager,
    private readonly rules: Exclude<
      FieldConstraints["type"]["value"],
      undefined
    >,
    private readonly forMapKey: boolean,
  ) {}

  add(compiled: CelCompiledConstraint, rulePath: Path): void {
    this.children.push({ compiled, rulePath });
  }

  eval(val: ReflectMessageGet, cursor: Cursor): void {
    this.celMan.setEnv("this", reflectToCel(val));
    this.celMan.setEnv("rules", this.rules);
    this.celMan.setEnv("rule", undefined);
    for (const child of this.children) {
      const vio = this.celMan.eval(child.compiled);
      if (vio) {
        cursor.violate(
          vio.message,
          vio.constraintId,
          child.rulePath,
          this.forMapKey,
        );
      }
    }
  }

  prune(): boolean {
    return this.children.length == 0;
  }
}

function reflectToCel(val: unknown): unknown {
  if (isReflectMessage(val)) {
    return val.message;
  }
  if (isReflectList(val)) {
    // @ts-expect-error -- TODO provide public access in protobuf-es, or support reflection types in CEL
    return val[Symbol.for("reflect unsafe local")];
  }
  if (isReflectMap(val)) {
    // @ts-expect-error -- TODO provide public access in protobuf-es, or support reflection types in CEL
    return val[Symbol.for("reflect unsafe local")];
  }
  return val;
}
