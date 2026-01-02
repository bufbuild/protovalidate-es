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

import {
  create,
  type DescExtension,
  type DescField,
  type DescMessage,
  getOption,
  hasOption,
  type Registry,
  type ScalarType,
} from "@bufbuild/protobuf";
import type {
  Path,
  ReflectMessageGet,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import { timestampNow } from "@bufbuild/protobuf/wkt";
import {
  celEnv,
  type CelEnv,
  celFromScalar,
  type CelInput,
  isCelError,
  parse,
  plan,
} from "@bufbuild/cel";
import {
  type Rule,
  type FieldRules,
  predefined,
  RuleSchema,
} from "./gen/buf/validate/validate_pb.js";
import { CompilationError, RuntimeError } from "./error.js";
import type { Eval } from "./eval.js";
import type { Cursor } from "./cursor.js";
import { getRuleScalarType } from "./rules.js";
import { createCustomFuncions, type RegexMatcher } from "./func.js";
import { STRINGS_EXT_FUNCS } from "@bufbuild/cel/ext/strings";
import { isReflectMessage } from "@bufbuild/protobuf/reflect";

type CelCompiledRules = {
  standard: {
    field: DescField;
    rule: Rule;
    compiled: CelCompiledRule;
  }[];
  extensions: Map<
    number,
    {
      ext: DescExtension;
      rule: Rule;
      compiled: CelCompiledRule;
    }[]
  >;
};

export type CelCompiledRule =
  | {
      kind: "compilation_error";
      error: CompilationError;
    }
  | {
      kind: "interpretable";
      interpretable: ReturnType<typeof plan>;
      rule: Rule;
    };

export class CelManager {
  // CEL environment with extensions for Protovalidate.
  // This includes the variable "now", which must be updated before each evaluation
  // by calling updateCelNow().
  private readonly env: CelEnv;
  private readonly rulesCache = new Map<string, CelCompiledRules>();
  private readonly bindings: Partial<
    Record<"this" | "rules" | "rule" | "now", CelInput>
  > = {};

  constructor(
    private readonly registry: Registry,
    regexMatcher: RegexMatcher | undefined,
  ) {
    this.env = celEnv({
      registry,
      funcs: [...STRINGS_EXT_FUNCS, ...createCustomFuncions(regexMatcher)],
    });
    this.bindings.now = timestampNow();
  }

  /**
   * Update the CEL variable "now" to the current time.
   */
  updateCelNow(): void {
    this.bindings.now = timestampNow();
  }

  setEnv(
    key: Exclude<keyof typeof this.bindings, "now">,
    value: CelInput | undefined,
  ): void {
    if (value === undefined) {
      delete this.bindings[key];
      return;
    }
    this.bindings[key] = value;
  }

  eval(compiled: CelCompiledRule) {
    if (compiled.kind == "compilation_error") {
      throw compiled.error;
    }
    const rule = compiled.rule;
    const result = compiled.interpretable(this.bindings);
    if (typeof result == "string" || typeof result == "boolean") {
      const success = typeof result == "boolean" ? result : result.length == 0;
      if (success) {
        return undefined;
      }
      // From field buf.validate.Rule.message:
      // > If a non-empty message is provided, any strings resulting from the CEL
      // > expression evaluation are ignored.
      let message = rule.message;
      if (message === "") {
        message =
          typeof result === "string"
            ? result
            : `"${rule.expression}" returned false`;
      }
      return {
        message,
        ruleId: rule.id,
      };
    }
    if (isCelError(result)) {
      throw new RuntimeError(result.message, { cause: result });
    }
    throw new RuntimeError(
      `expression ${rule.id} outputs ${typeof result}, wanted either bool or string`,
    );
  }

  compileRule(ruleOrExpr: Rule | string): CelCompiledRule {
    const rule =
      typeof ruleOrExpr == "string"
        ? create(RuleSchema, { id: ruleOrExpr, expression: ruleOrExpr })
        : ruleOrExpr;
    try {
      return {
        kind: "interpretable",
        interpretable: plan(this.env, parse(rule.expression)),
        rule,
      };
    } catch (cause) {
      return {
        kind: "compilation_error",
        error: new CompilationError(
          `failed to compile ${rule.id}: ${String(cause)}`,
          { cause },
        ),
      };
    }
  }

  compileRules(descMessage: DescMessage): CelCompiledRules {
    let compiled = this.rulesCache.get(descMessage.typeName);
    if (!compiled) {
      compiled = this.compileRulesUncached(descMessage);
      this.rulesCache.set(descMessage.typeName, compiled);
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
      for (const rule of getOption(field, predefined).cel) {
        standard.push({
          field,
          rule,
          compiled: this.compileRule(rule),
        });
      }
    }
    for (const ext of registryGetExtensionsFor(this.registry, descMessage)) {
      if (!hasOption(ext, predefined)) {
        continue;
      }
      let list = extensions.get(ext.number);
      if (!list) {
        list = [];
        extensions.set(ext.number, list);
      }
      for (const rule of getOption(ext, predefined).cel) {
        list.push({
          ext,
          rule,
          compiled: this.compileRule(rule),
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
    compiled: CelCompiledRule;
    rulePath: Path;
  }[] = [];

  constructor(
    private readonly celMan: CelManager,
    private readonly forMapKey: boolean,
    private readonly thisScalarType: ScalarType | undefined,
  ) {}

  add(compiled: CelCompiledRule, rulePath: Path): void {
    this.children.push({ compiled, rulePath });
  }

  eval(val: ReflectMessageGet, cursor: Cursor): void {
    this.celMan.setEnv("this", reflectToCel(val, this.thisScalarType));
    this.celMan.setEnv("rules", undefined);
    this.celMan.setEnv("rule", undefined);
    for (const child of this.children) {
      const vio = this.celMan.eval(child.compiled);
      if (vio) {
        cursor.violate(vio.message, vio.ruleId, child.rulePath, this.forMapKey);
      }
    }
  }

  prune(): boolean {
    return this.children.length == 0;
  }
}

export class EvalExtendedRulesCel implements Eval<ReflectMessageGet> {
  private readonly children: {
    compiled: CelCompiledRule;
    rulePath: Path;
    ruleCelValue: CelInput;
  }[] = [];

  private readonly thisScalarType: ScalarType | undefined;

  constructor(
    private readonly celMan: CelManager,
    private readonly rules: Exclude<FieldRules["type"]["value"], undefined>,
    private readonly forMapKey: boolean,
  ) {
    this.thisScalarType = getRuleScalarType(rules);
  }

  add(
    compiled: CelCompiledRule,
    rulePath: Path,
    ruleValue: ReflectMessageGet,
    ruleScalarType: ScalarType | undefined,
  ): void {
    this.children.push({
      compiled,
      rulePath,
      ruleCelValue: reflectToCel(ruleValue, ruleScalarType),
    });
  }

  eval(val: ReflectMessageGet, cursor: Cursor): void {
    this.celMan.setEnv("rules", this.rules);
    this.celMan.setEnv("this", reflectToCel(val, this.thisScalarType));
    for (const child of this.children) {
      this.celMan.setEnv("rule", child.ruleCelValue);
      const vio = this.celMan.eval(child.compiled);
      if (vio) {
        cursor.violate(vio.message, vio.ruleId, child.rulePath, this.forMapKey);
      }
    }
  }

  prune(): boolean {
    return this.children.length == 0;
  }
}

export class EvalStandardRulesCel implements Eval<ReflectMessageGet> {
  private readonly children: {
    compiled: CelCompiledRule;
    rulePath: Path;
  }[] = [];

  private readonly thisScalarType: ScalarType | undefined;

  constructor(
    private readonly celMan: CelManager,
    private readonly rules: Exclude<FieldRules["type"]["value"], undefined>,
    private readonly forMapKey: boolean,
  ) {
    this.thisScalarType = getRuleScalarType(rules);
  }

  add(compiled: CelCompiledRule, rulePath: Path): void {
    this.children.push({ compiled, rulePath });
  }

  eval(val: ReflectMessageGet, cursor: Cursor): void {
    this.celMan.setEnv("this", reflectToCel(val, this.thisScalarType));
    this.celMan.setEnv("rules", this.rules);
    this.celMan.setEnv("rule", undefined);
    for (const child of this.children) {
      const vio = this.celMan.eval(child.compiled);
      if (vio) {
        cursor.violate(vio.message, vio.ruleId, child.rulePath, this.forMapKey);
      }
    }
  }

  prune(): boolean {
    return this.children.length == 0;
  }
}

function reflectToCel(
  val: CelInput,
  scalarType: ScalarType | undefined,
): CelInput {
  // Wrappers are treated as scalars in standard rules so we let CEL handle them.
  if (isReflectMessage(val)) {
    return val;
  }
  if (scalarType) {
    return celFromScalar(scalarType, val as ScalarValue);
  }
  return val;
}
