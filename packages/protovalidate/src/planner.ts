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
} from "./gen/buf/validate/validate_pb.js";
import type {
  ReflectList,
  ReflectMap,
  ReflectMessage,
  ReflectMessageGet,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
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
  EvalIgnoreCondition,
  IgnoreConditionListOrMap,
  IgnoreConditionMessage,
  IgnoreConditionScalarOrEnum,
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

    // TODO if IGNORE_ALWAYS, don't plan anything except required check

    const evalFieldCels = planFieldCels(
      field,
      constraints?.cel ?? [],
      userRegistry,
    );

    switch (field.fieldKind) {
      case "message": {
        const condition = new IgnoreConditionMessage(field, constraints.ignore);
        const pass = new EvalMany<ReflectMessage>(
          evalFieldCels,
          planMessageValue(
            field.message,
            getMessageRules(constraints, field.message, field),
            ruleCelCache,
            planner,
          ),
        );
        evals.add(new EvalIgnoreCondition(field, condition, pass));
        break;
      }
      case "list": {
        const condition = new IgnoreConditionListOrMap(
          field,
          constraints.ignore,
        );
        const pass = new EvalMany<ReflectList>(
          evalFieldCels,
          planListValue(
            field,
            getListRules(constraints, field),
            ruleCelCache,
            planner,
          ),
        );
        evals.add(new EvalIgnoreCondition(field, condition, pass));
        break;
      }
      case "map": {
        const condition = new IgnoreConditionListOrMap(
          field,
          constraints.ignore,
        );
        const pass = new EvalMany<ReflectMap>(
          evalFieldCels,
          planMapValue(
            field,
            getMapRules(constraints, field),
            ruleCelCache,
            planner,
          ),
        );
        evals.add(new EvalIgnoreCondition(field, condition, pass));
        break;
      }
      case "enum": {
        const condition = new IgnoreConditionScalarOrEnum(
          field,
          constraints.ignore,
        );
        const pass = new EvalMany<number>(
          evalFieldCels,
          planEnumValue(
            field.enum,
            getEnumRules(constraints, field),
            ruleCelCache,
          ),
        );
        evals.add(new EvalIgnoreCondition(field, condition, pass));
        break;
      }
      case "scalar": {
        const condition = new IgnoreConditionScalarOrEnum(
          field,
          constraints.ignore,
        );
        const pass = new EvalMany<ScalarValue>(
          evalFieldCels,
          planScalarValue(
            getScalarRules(constraints, field.scalar, field),
            ruleCelCache,
          ),
        );
        evals.add(new EvalIgnoreCondition(field, condition, pass));
        break;
      }
    }
  }
  return evals;
}

function planListValue(
  field: DescField & { fieldKind: "list" },
  rules: RepeatedRules | undefined,
  ruleCelCache: RuleCelCache,
  planner: Planner,
): Eval<ReflectList> {
  const evals = new EvalMany<ReflectList>();
  if (rules) {
    evals.add(new EvalListRulesCel(ruleCelCache.getPlans(rules)));
  }
  switch (field.listKind) {
    case "enum": {
      evals.add(
        new EvalListItems<number>(
          planEnumValue(
            field.enum,
            getEnumRules(rules?.items, field),
            ruleCelCache,
          ),
        ),
      );
      break;
    }
    case "scalar": {
      evals.add(
        new EvalListItems<ScalarValue>(
          planScalarValue(
            getScalarRules(rules?.items, field.scalar, field),
            ruleCelCache,
          ),
        ),
      );
      break;
    }
    case "message": {
      evals.add(
        new EvalListItems<ReflectMessage>(
          planMessageValue(
            field.message,
            getMessageRules(rules?.items, field.message, field),
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
  ruleCelCache: RuleCelCache,
  planner: Planner,
): Eval<ReflectMap> {
  const evals = new EvalMany<ReflectMap>();
  if (rules) {
    evals.add(new EvalMapRulesCel(ruleCelCache.getPlans(rules)));
  }
  const evalKey = planScalarValue(
    getScalarRules(rules?.keys, field.mapKey, field),
    ruleCelCache,
    true,
  );
  switch (field.mapKind) {
    case "message":
      evals.add(
        new EvalMapEntries<ReflectMessage>(
          evalKey,
          planMessageValue(
            field.message,
            getMessageRules(rules?.values, field.message, field),
            ruleCelCache,
            planner,
          ),
        ),
      );
      break;
    case "enum":
      evals.add(
        new EvalMapEntries<number>(
          evalKey,
          planEnumValue(
            field.enum,
            getEnumRules(rules?.values, field),
            ruleCelCache,
          ),
        ),
      );
      break;
    case "scalar":
      evals.add(
        new EvalMapEntries<ScalarValue>(
          evalKey,
          planScalarValue(
            getScalarRules(rules?.values, field.scalar, field),
            ruleCelCache,
          ),
        ),
      );
      break;
  }
  return evals;
}

function planEnumValue(
  descEnum: DescEnum,
  rules: EnumRules | undefined,
  ruleCelCache: RuleCelCache,
): Eval<number> {
  if (!rules) {
    return EvalNoop.get();
  }
  return new EvalMany<number>(
    new EvalEnumDefinedOnly(descEnum, rules),
    new EvalScalarRulesCel(ruleCelCache.getPlans(rules)),
  );
}

function planScalarValue(
  rules: ScalarRules | undefined,
  ruleCelCache: RuleCelCache,
  forMapKey = false,
): Eval<ScalarValue> {
  if (!rules) {
    return EvalNoop.get();
  }
  return new EvalScalarRulesCel(ruleCelCache.getPlans(rules), forMapKey);
}

function planMessageValue(
  descMessage: DescMessage,
  rules: MessageRules | undefined,
  ruleCelCache: RuleCelCache,
  planner: Planner,
): Eval<ReflectMessage> {
  const evals = new EvalMany<ReflectMessage>();
  evals.add(planner.plan(descMessage));
  if (rules) {
    if (rules.$typeName == "buf.validate.AnyRules") {
      evals.add(new EvalAnyRules(rules));
    }
    evals.add(new EvalMessageRulesCel(ruleCelCache.getPlans(rules)));
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
