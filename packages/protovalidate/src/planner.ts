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
  type DescOneof,
  getOption,
  isMessage,
  type Registry,
} from "@bufbuild/protobuf";
import {
  type Constraint,
  type EnumRules,
  type MapRules,
  type RepeatedRules,
  field as ext_field,
  message as ext_message,
  oneof as ext_oneof,
  FieldConstraintsSchema,
  RepeatedRulesSchema,
  MapRulesSchema,
  AnyRulesSchema,
} from "./gen/buf/validate/validate_pb.js";
import type {
  ReflectList,
  ReflectMap,
  ReflectMessage,
  ReflectMessageGet,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import { buildPath, type PathBuilder } from "./path.js";
import {
  type Eval,
  EvalAnyRules,
  EvalEnumDefinedOnly,
  EvalFieldCel,
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
} from "./eval.js";
import {
  getEnumRules,
  getListRules,
  getMapRules,
  getMessageRules,
  getScalarRules,
  type MessageRules,
  type ScalarRules,
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

export function createPlanner(userRegistry: Registry): Planner {
  const messageCache = new Map<DescMessage, Eval<ReflectMessage>>();
  const ruleCelCache = new RuleCelCache(userRegistry);
  return {
    plan(message) {
      return planMessage(
        message,
        this,
        userRegistry,
        messageCache,
        ruleCelCache,
      );
    },
  } satisfies Planner;
}

function planMessage(
  message: DescMessage,
  planner: Planner,
  userRegistry: Registry,
  messageCache: Map<DescMessage, Eval<ReflectMessage>>,
  ruleCelCache: RuleCelCache,
): Eval<ReflectMessage> {
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
    e.add(
      planOneofs(message.oneofs),
      planFields(message.fields, userRegistry, planner, ruleCelCache),
      planMessageCels(message, constraints.cel, userRegistry),
    );
  }
  e.prune();
  return e;
}

function planOneofs(oneofs: DescOneof[]): Eval<ReflectMessage> {
  return new EvalMany(
    oneofs
      .filter((oneof) => getOption(oneof, ext_oneof).required)
      .map((oneof) => new EvalOneofRequired(oneof)),
  );
}

// TODO support user-defined shared rules - extensions to any of the buf.validate.*Rules messages

function planFields(
  fields: DescField[],
  userRegistry: Registry,
  planner: Planner,
  ruleCelCache: RuleCelCache,
): Eval<ReflectMessage> {
  const evals = new EvalMany<ReflectMessage>();
  for (const field of fields) {
    const constraints = getOption(field, ext_field);
    if (constraints.required) {
      evals.add(new EvalFieldRequired(field));
    }
    const evalFieldCels = planFieldCels(
      field,
      constraints?.cel ?? [],
      userRegistry,
    );
    const baseRulePath = buildPath(FieldConstraintsSchema);
    switch (field.fieldKind) {
      case "message": {
        const [rules, rulePath] = getMessageRules(
          field.message,
          baseRulePath,
          constraints,
          field,
        );
        evals.add(
          new EvalField(
            field,
            ignoreMessageField(field, constraints.ignore),
            new EvalMany<ReflectMessage>(
              evalFieldCels,
              planMessageValue(
                field.message,
                rules,
                rulePath,
                ruleCelCache,
                planner,
              ),
            ),
          ),
        );
        break;
      }
      case "list": {
        const [rules, rulePath] = getListRules(
          baseRulePath,
          constraints,
          field,
        );
        evals.add(
          new EvalField(
            field,
            ignoreListOrMapField(field, constraints.ignore),
            new EvalMany<ReflectList>(
              evalFieldCels,
              planListValue(field, rules, rulePath, ruleCelCache, planner),
            ),
          ),
        );
        break;
      }
      case "map": {
        const [rules, rulePath] = getMapRules(baseRulePath, constraints, field);
        evals.add(
          new EvalField(
            field,
            ignoreListOrMapField(field, constraints.ignore),
            new EvalMany<ReflectMap>(
              evalFieldCels,
              planMapValue(field, rules, rulePath, ruleCelCache, planner),
            ),
          ),
        );
        break;
      }
      case "enum": {
        const [rules, rulePath] = getEnumRules(
          baseRulePath,
          constraints,
          field,
        );
        evals.add(
          new EvalField(
            field,
            ignoreScalarOrEnumField(field, constraints.ignore),
            new EvalMany<ScalarValue>(
              evalFieldCels,
              planEnumValue(field.enum, rules, rulePath, ruleCelCache),
            ),
          ),
        );
        break;
      }
      case "scalar": {
        const [rules, rulePath] = getScalarRules(
          field.scalar,
          baseRulePath,
          constraints,
          field,
        );
        evals.add(
          new EvalField(
            field,
            ignoreScalarOrEnumField(field, constraints.ignore),
            new EvalMany<ScalarValue>(
              evalFieldCels,
              planScalarValue(rules, rulePath, ruleCelCache),
            ),
          ),
        );
        break;
      }
    }
  }
  return evals;
}

function planListValue(
  field: DescField & { fieldKind: "list" },
  rules: RepeatedRules | undefined,
  rulePath: PathBuilder,
  ruleCelCache: RuleCelCache,
  planner: Planner,
): Eval<ReflectList> {
  const evals = new EvalMany<ReflectList>();
  if (rules) {
    evals.add(new EvalListRulesCel(ruleCelCache.getPlans(rules), rulePath));
  }
  const baseRulePath = rulePath.clone().field(RepeatedRulesSchema.field.items);
  switch (field.listKind) {
    case "enum": {
      const [itemRules, itemRulePath] = getEnumRules(
        baseRulePath,
        rules?.items,
        field,
      );
      evals.add(
        new EvalListItems<number>(
          ignoreEnumValue(field.enum, rules?.items?.ignore),
          planEnumValue(field.enum, itemRules, itemRulePath, ruleCelCache),
        ),
      );
      break;
    }
    case "scalar": {
      const [itemRules, itemRulePath] = getScalarRules(
        field.scalar,
        baseRulePath,
        rules?.items,
        field,
      );
      evals.add(
        new EvalListItems<ScalarValue>(
          ignoreScalarValue(field.scalar, rules?.items?.ignore),
          planScalarValue(itemRules, itemRulePath, ruleCelCache),
        ),
      );
      break;
    }
    case "message": {
      const [itemRules, itemRulePath] = getMessageRules(
        field.message,
        baseRulePath,
        rules?.items,
        field,
      );
      evals.add(
        new EvalListItems<ReflectMessage>(
          ignoreMessageValue(rules?.items?.ignore),
          planMessageValue(
            field.message,
            itemRules,
            itemRulePath,
            ruleCelCache,
            planner,
          ),
        ),
      );
      break;
    }
  }
  return evals;
}

function planMapValue(
  field: DescField & { fieldKind: "map" },
  rules: MapRules | undefined,
  rulePath: PathBuilder,
  ruleCelCache: RuleCelCache,
  planner: Planner,
): Eval<ReflectMap> {
  const evals = new EvalMany<ReflectMap>();
  if (rules) {
    evals.add(new EvalMapRulesCel(ruleCelCache.getPlans(rules), rulePath));
  }
  const [keyRules, keyRulePath] = getScalarRules(
    field.mapKey,
    rulePath.clone().field(MapRulesSchema.field.keys),
    rules?.keys,
    field,
  );
  const ignoreKey = ignoreScalarValue(field.mapKey, rules?.keys?.ignore);
  const evalKey = planScalarValue(keyRules, keyRulePath, ruleCelCache, true);
  const baseRulePath = rulePath.clone().field(MapRulesSchema.field.values);
  switch (field.mapKind) {
    case "message": {
      const [valueRules, valueRulePath] = getMessageRules(
        field.message,
        baseRulePath,
        rules?.values,
        field,
      );
      evals.add(
        new EvalMapEntries<ReflectMessage>(
          ignoreKey,
          evalKey,
          ignoreMessageValue(rules?.values?.ignore),
          planMessageValue(
            field.message,
            valueRules,
            valueRulePath,
            ruleCelCache,
            planner,
          ),
        ),
      );
      break;
    }
    case "enum": {
      const [valueRules, valueRulePath] = getEnumRules(
        baseRulePath,
        rules?.values,
        field,
      );
      evals.add(
        new EvalMapEntries<number>(
          ignoreKey,
          evalKey,
          ignoreEnumValue(field.enum, rules?.values?.ignore),
          planEnumValue(field.enum, valueRules, valueRulePath, ruleCelCache),
        ),
      );
      break;
    }
    case "scalar": {
      const [valueRules, valueRulePath] = getScalarRules(
        field.scalar,
        baseRulePath,
        rules?.values,
        field,
      );
      evals.add(
        new EvalMapEntries<ScalarValue>(
          ignoreKey,
          evalKey,
          ignoreScalarValue(field.scalar, rules?.values?.ignore),
          planScalarValue(valueRules, valueRulePath, ruleCelCache),
        ),
      );
      break;
    }
  }
  return evals;
}

function planEnumValue(
  descEnum: DescEnum,
  rules: EnumRules | undefined,
  rulePath: PathBuilder,
  ruleCelCache: RuleCelCache,
): Eval<number> {
  if (!rules) {
    return EvalNoop.get();
  }
  return new EvalMany<number>(
    new EvalEnumDefinedOnly(descEnum, rulePath, rules),
    new EvalScalarRulesCel(ruleCelCache.getPlans(rules), false, rulePath),
  );
}

function planScalarValue(
  rules: ScalarRules | undefined,
  rulePath: PathBuilder,
  ruleCelCache: RuleCelCache,
  forMapKey = false,
): Eval<ScalarValue> {
  if (!rules) {
    return EvalNoop.get();
  }
  return new EvalScalarRulesCel(
    ruleCelCache.getPlans(rules),
    forMapKey,
    rulePath,
  );
}

function planMessageValue(
  descMessage: DescMessage,
  rules: MessageRules | undefined,
  rulePath: PathBuilder,
  ruleCelCache: RuleCelCache,
  planner: Planner,
): Eval<ReflectMessage> {
  const evals = new EvalMany<ReflectMessage>();
  evals.add(planner.plan(descMessage));
  if (rules) {
    if (isMessage(rules, AnyRulesSchema)) {
      evals.add(new EvalAnyRules(rulePath, rules));
    }
    evals.add(new EvalMessageRulesCel(ruleCelCache.getPlans(rules), rulePath));
  }
  return evals;
}

function planFieldCels(
  field: DescField,
  cel: readonly Constraint[],
  userRegistry: Registry,
): Eval<ReflectMessageGet> {
  return cel.length > 0
    ? new EvalFieldCel(field, cel, userRegistry)
    : EvalNoop.get();
}

function planMessageCels(
  descMessage: DescMessage,
  cel: readonly Constraint[],
  userRegistry: Registry,
): Eval<ReflectMessage> {
  return cel.length > 0
    ? new EvalMessageCel(cel, descMessage, userRegistry)
    : EvalNoop.get();
}
