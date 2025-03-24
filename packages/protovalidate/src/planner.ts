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
  type DescEnum,
  type DescField,
  type DescMessage,
  getOption,
  isMessage,
  type Registry,
  type ScalarType,
} from "@bufbuild/protobuf";
import {
  type FieldConstraints,
  field as ext_field,
  message as ext_message,
  oneof as ext_oneof,
  FieldConstraintsSchema,
  AnyRulesSchema,
} from "./gen/buf/validate/validate_pb.js";
import type {
  ReflectList,
  ReflectMap,
  ReflectMessage,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import { buildPath, type PathBuilder } from "./path.js";
import {
  type Eval,
  EvalAnyRules,
  EvalEnumDefinedOnly,
  EvalFieldRequired,
  EvalListItems,
  EvalListRulesCel,
  EvalMany,
  EvalMapEntries,
  EvalMapRulesCel,
  EvalMessageCel,
  EvalMessageRulesCel,
  EvalNoop,
  EvalOneofRequired,
  EvalScalarRulesCel,
  EvalField,
  EvalFieldCel,
} from "./eval.js";
import {
  getEnumRules,
  getListRules,
  getMapRules,
  getMessageRules,
  getScalarRules,
} from "./rules.js";
import { RuleCelCache } from "./cel.js";
import {
  ignoreScalarValue,
  ignoreMessageField,
  ignoreListOrMapField,
  ignoreScalarOrEnumField,
  ignoreEnumValue,
  ignoreMessageValue,
} from "./condition.js";

export type Planner = {
  plan(message: DescMessage): Eval<ReflectMessage>;
};

export function createPlanner(registry: Registry): Planner {
  const messageCache = new Map<DescMessage, Eval<ReflectMessage>>();
  const ruleCelCache = new RuleCelCache(registry);
  return {
    plan(message) {
      const existing = messageCache.get(message);
      if (existing) {
        return existing;
      }
      const constraints = getOption(message, ext_message);
      if (constraints.disabled) {
        return EvalNoop.get();
      }
      const e = new EvalMany<ReflectMessage>();
      messageCache.set(message, e);
      if (!constraints.disabled) {
        e.add(planFields(message.fields, registry, this, ruleCelCache));
        if (constraints.cel.length > 0) {
          e.add(new EvalMessageCel(constraints.cel, registry));
        }
        e.add(
          ...message.oneofs
            .filter((o) => getOption(o, ext_oneof).required)
            .map((o) => new EvalOneofRequired(o)),
        );
      }
      e.prune();
      return e;
    },
  } satisfies Planner;
}

// TODO support user-defined shared rules - extensions to any of the buf.validate.*Rules messages

function planFields(
  fields: DescField[],
  registry: Registry,
  planner: Planner,
  ruleCelCache: RuleCelCache,
): Eval<ReflectMessage> {
  const evals = new EvalMany<ReflectMessage>();
  for (const field of fields) {
    const constraints = getOption(field, ext_field);
    if (constraints.required) {
      evals.add(new EvalFieldRequired(field));
    }
    const baseRulePath = buildPath(FieldConstraintsSchema);
    switch (field.fieldKind) {
      case "message": {
        evals.add(
          new EvalField(
            field,
            ignoreMessageField(field, constraints.ignore),
            planMessage(
              field.message,
              constraints,
              baseRulePath,
              field,
              ruleCelCache,
              registry,
              planner,
            ),
          ),
        );
        break;
      }
      case "list": {
        evals.add(
          new EvalField(
            field,
            ignoreListOrMapField(field, constraints.ignore),
            planList(
              field,
              constraints,
              baseRulePath,
              ruleCelCache,
              planner,
              registry,
            ),
          ),
        );
        break;
      }
      case "map": {
        evals.add(
          new EvalField(
            field,
            ignoreListOrMapField(field, constraints.ignore),
            planMap(
              field,
              constraints,
              baseRulePath,
              ruleCelCache,
              planner,
              registry,
            ),
          ),
        );
        break;
      }
      case "enum": {
        evals.add(
          new EvalField(
            field,
            ignoreScalarOrEnumField(field, constraints.ignore),
            planEnum(
              field.enum,
              constraints,
              baseRulePath,
              field,
              ruleCelCache,
              registry,
            ),
          ),
        );
        break;
      }
      case "scalar": {
        evals.add(
          new EvalField(
            field,
            ignoreScalarOrEnumField(field, constraints.ignore),
            planScalar(
              field.scalar,
              constraints,
              baseRulePath,
              false,
              field,
              ruleCelCache,
              registry,
            ),
          ),
        );
        break;
      }
    }
  }
  return evals;
}

function planList(
  field: DescField & { fieldKind: "list" },
  constraints: FieldConstraints | undefined,
  baseRulePath: PathBuilder,
  ruleCelCache: RuleCelCache,
  planner: Planner,
  registry: Registry,
): Eval<ReflectList> {
  const evals = new EvalMany<ReflectList>();
  if (constraints) {
    evals.add(new EvalFieldCel(constraints.cel, baseRulePath, false, registry));
  }
  const [rules, rulePath, rulePathItems] = getListRules(
    baseRulePath,
    constraints,
    field,
  );
  if (rules) {
    evals.add(new EvalListRulesCel(ruleCelCache.getPlans(rules), rulePath));
  }
  const itemsRules = rules?.items;
  switch (field.listKind) {
    case "enum": {
      evals.add(
        new EvalListItems<number>(
          ignoreEnumValue(field.enum, itemsRules?.ignore),
          planEnum(
            field.enum,
            itemsRules,
            rulePathItems,
            field,
            ruleCelCache,
            registry,
          ),
        ),
      );
      break;
    }
    case "scalar": {
      evals.add(
        new EvalListItems<ScalarValue>(
          ignoreScalarValue(field.scalar, itemsRules?.ignore),
          planScalar(
            field.scalar,
            itemsRules,
            rulePathItems,
            false,
            field,
            ruleCelCache,
            registry,
          ),
        ),
      );
      break;
    }
    case "message": {
      evals.add(
        new EvalListItems<ReflectMessage>(
          ignoreMessageValue(itemsRules?.ignore),
          planMessage(
            field.message,
            itemsRules,
            rulePathItems,
            field,
            ruleCelCache,
            registry,
            planner,
          ),
        ),
      );
      break;
    }
  }
  return evals;
}

function planMap(
  field: DescField & { fieldKind: "map" },
  constraints: FieldConstraints | undefined,
  baseRulePath: PathBuilder,
  ruleCelCache: RuleCelCache,
  planner: Planner,
  registry: Registry,
): Eval<ReflectMap> {
  const evals = new EvalMany<ReflectMap>();
  if (constraints) {
    evals.add(new EvalFieldCel(constraints.cel, baseRulePath, false, registry));
  }
  const [rules, rulePath, rulePathKeys, rulePathValues] = getMapRules(
    baseRulePath,
    constraints,
    field,
  );
  if (rules) {
    evals.add(new EvalMapRulesCel(ruleCelCache.getPlans(rules), rulePath));
  }
  const ignoreKey = ignoreScalarValue(field.mapKey, rules?.keys?.ignore);
  const evalKey = planScalar(
    field.mapKey,
    rules?.keys,
    rulePathKeys,
    true,
    field,
    ruleCelCache,
    registry,
  );
  const valuesRules = rules?.values;
  switch (field.mapKind) {
    case "message": {
      evals.add(
        new EvalMapEntries<ReflectMessage>(
          ignoreKey,
          evalKey,
          ignoreMessageValue(valuesRules?.ignore),
          planMessage(
            field.message,
            valuesRules,
            rulePathValues,
            field,
            ruleCelCache,
            registry,
            planner,
          ),
        ),
      );
      break;
    }
    case "enum": {
      evals.add(
        new EvalMapEntries<number>(
          ignoreKey,
          evalKey,
          ignoreEnumValue(field.enum, valuesRules?.ignore),
          planEnum(
            field.enum,
            valuesRules,
            rulePathValues,
            field,
            ruleCelCache,
            registry,
          ),
        ),
      );
      break;
    }
    case "scalar": {
      evals.add(
        new EvalMapEntries<ScalarValue>(
          ignoreKey,
          evalKey,
          ignoreScalarValue(field.scalar, valuesRules?.ignore),
          planScalar(
            field.scalar,
            valuesRules,
            rulePathValues,
            false,
            field,
            ruleCelCache,
            registry,
          ),
        ),
      );
      break;
    }
  }
  return evals;
}

function planEnum(
  descEnum: DescEnum,
  constraints: FieldConstraints | undefined,
  baseRulePath: PathBuilder,
  fieldContext: { toString(): string },
  ruleCelCache: RuleCelCache,
  registry: Registry,
): Eval<number> {
  const evals = new EvalMany<number>();
  if (constraints) {
    evals.add(new EvalFieldCel(constraints.cel, baseRulePath, false, registry));
  }
  const [rules, rulePath] = getEnumRules(
    baseRulePath,
    constraints,
    fieldContext,
  );
  if (rules) {
    evals.add(new EvalEnumDefinedOnly(descEnum, rulePath, rules));
    evals.add(
      new EvalScalarRulesCel(ruleCelCache.getPlans(rules), false, rulePath),
    );
  }
  return evals;
}

function planScalar(
  scalar: ScalarType,
  constraints: FieldConstraints | undefined,
  baseRulePath: PathBuilder,
  forMapKey: boolean,
  fieldContext: { toString(): string },
  ruleCelCache: RuleCelCache,
  registry: Registry,
): Eval<ScalarValue> {
  const evals = new EvalMany<ScalarValue>();
  if (constraints) {
    evals.add(
      new EvalFieldCel(constraints.cel, baseRulePath, forMapKey, registry),
    );
  }
  const [rules, rulePath] = getScalarRules(
    scalar,
    baseRulePath,
    constraints,
    fieldContext,
  );
  if (rules) {
    evals.add(
      new EvalScalarRulesCel(ruleCelCache.getPlans(rules), forMapKey, rulePath),
    );
  }
  return evals;
}

function planMessage(
  descMessage: DescMessage,
  constraints: FieldConstraints | undefined,
  baseRulePath: PathBuilder,
  fieldContext: { toString(): string },
  ruleCelCache: RuleCelCache,
  registry: Registry,
  planner: Planner,
): Eval<ReflectMessage> {
  const evals = new EvalMany<ReflectMessage>();
  if (constraints) {
    evals.add(new EvalFieldCel(constraints.cel, baseRulePath, false, registry));
  }
  evals.add(planner.plan(descMessage));
  const [rules, rulePath] = getMessageRules(
    descMessage,
    baseRulePath,
    constraints,
    fieldContext,
  );
  if (rules) {
    if (isMessage(rules, AnyRulesSchema)) {
      evals.add(new EvalAnyRules(rulePath, rules));
    }
    evals.add(new EvalMessageRulesCel(ruleCelCache.getPlans(rules), rulePath));
  }
  return evals;
}
