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
  getExtension,
  getOption,
  isFieldSet,
  isMessage,
  type ScalarType,
} from "@bufbuild/protobuf";
import {
  type FieldRules,
  type MessageRules,
  Ignore,
  field as ext_field,
  message as ext_message,
  oneof as ext_oneof,
  FieldRulesSchema,
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
  EvalFieldRequired,
  EvalListItems,
  EvalMany,
  EvalMapEntries,
  EvalNoop,
  EvalOneofRequired,
  EvalField,
} from "./eval.js";
import {
  getEnumRules,
  getListRules,
  getMapRules,
  getMessageRules,
  getRuleDescriptor,
  getScalarRules,
} from "./rules.js";
import {
  ignoreScalarValue,
  ignoreMessageField,
  ignoreListOrMapField,
  ignoreScalarOrEnumField,
  ignoreEnumValue,
  ignoreMessageValue,
} from "./condition.js";
import {
  type CelManager,
  EvalCustomCel,
  EvalExtendedRulesCel,
  EvalStandardRulesCel,
} from "./cel.js";

export class Planner {
  private readonly messageCache = new Map<DescMessage, Eval<ReflectMessage>>();

  constructor(private readonly celMan: CelManager) {}

  plan(message: DescMessage): Eval<ReflectMessage> {
    const existing = this.messageCache.get(message);
    if (existing) {
      return existing;
    }
    const messageRules = getOption(message, ext_message);
    if (messageRules.disabled) {
      return EvalNoop.get();
    }
    const e = new EvalMany<ReflectMessage>();
    this.messageCache.set(message, e);
    if (!messageRules.disabled) {
      e.add(this.fields(message.fields));
      e.add(this.messageCel(messageRules));
      e.add(this.oneofs(message.oneofs));
    }
    e.prune();
    return e;
  }

  private oneofs(oneofs: DescOneof[]): Eval<ReflectMessage> {
    return new EvalMany<ReflectMessage>(
      ...oneofs
        .filter((o) => getOption(o, ext_oneof).required)
        .map((o) => new EvalOneofRequired(o)),
    );
  }

  private fields(fields: DescField[]): Eval<ReflectMessage> {
    const evals = new EvalMany<ReflectMessage>();
    for (const field of fields) {
      const fieldRules = getOption(field, ext_field);
      if (fieldRules.required && fieldRules.ignore !== Ignore.ALWAYS) {
        evals.add(new EvalFieldRequired(field));
      }
      const baseRulePath = buildPath(FieldRulesSchema);
      switch (field.fieldKind) {
        case "message": {
          evals.add(
            new EvalField(
              field,
              ignoreMessageField(field, fieldRules.ignore),
              this.message(field.message, fieldRules, baseRulePath, field),
            ),
          );
          break;
        }
        case "list": {
          evals.add(
            new EvalField(
              field,
              ignoreListOrMapField(field, fieldRules.ignore),
              this.planList(field, fieldRules, baseRulePath),
            ),
          );
          break;
        }
        case "map": {
          evals.add(
            new EvalField(
              field,
              ignoreListOrMapField(field, fieldRules.ignore),
              this.map(field, fieldRules, baseRulePath),
            ),
          );
          break;
        }
        case "enum": {
          evals.add(
            new EvalField(
              field,
              ignoreScalarOrEnumField(field, fieldRules.ignore),
              this.enumeration(field.enum, fieldRules, baseRulePath, field),
            ),
          );
          break;
        }
        case "scalar": {
          evals.add(
            new EvalField(
              field,
              ignoreScalarOrEnumField(field, fieldRules.ignore),
              this.scalar(field.scalar, fieldRules, baseRulePath, false, field),
            ),
          );
          break;
        }
      }
    }
    return evals;
  }

  private planList(
    field: DescField & { fieldKind: "list" },
    fieldRules: FieldRules | undefined,
    baseRulePath: PathBuilder,
  ): Eval<ReflectList> {
    const evals = new EvalMany<ReflectList>(
      this.fieldCel(fieldRules, baseRulePath, false),
    );
    const [rules, rulePath, rulePathItems] = getListRules(
      baseRulePath,
      fieldRules,
      field,
    );
    if (rules) {
      evals.add(this.rules(rules, rulePath, false));
    }
    const itemsRules = rules?.items;
    switch (field.listKind) {
      case "enum": {
        evals.add(
          new EvalListItems<number>(
            ignoreEnumValue(field.enum, itemsRules?.ignore),
            this.enumeration(field.enum, itemsRules, rulePathItems, field),
          ),
        );
        break;
      }
      case "scalar": {
        evals.add(
          new EvalListItems<ScalarValue>(
            ignoreScalarValue(field.scalar, itemsRules?.ignore),
            this.scalar(field.scalar, itemsRules, rulePathItems, false, field),
          ),
        );
        break;
      }
      case "message": {
        evals.add(
          new EvalListItems<ReflectMessage>(
            ignoreMessageValue(itemsRules?.ignore),
            this.message(field.message, itemsRules, rulePathItems, field),
          ),
        );
        break;
      }
    }
    return evals;
  }

  private map(
    field: DescField & { fieldKind: "map" },
    fieldRules: FieldRules | undefined,
    baseRulePath: PathBuilder,
  ): Eval<ReflectMap> {
    const evals = new EvalMany<ReflectMap>(
      this.fieldCel(fieldRules, baseRulePath, false),
    );
    const [rules, rulePath, rulePathKeys, rulePathValues] = getMapRules(
      baseRulePath,
      fieldRules,
      field,
    );
    if (rules) {
      evals.add(this.rules(rules, rulePath, false));
    }
    const ignoreKey = ignoreScalarValue(field.mapKey, rules?.keys?.ignore);
    const evalKey = this.scalar(
      field.mapKey,
      rules?.keys,
      rulePathKeys,
      true,
      field,
    );
    const valuesRules = rules?.values;
    switch (field.mapKind) {
      case "message": {
        evals.add(
          new EvalMapEntries<ReflectMessage>(
            ignoreKey,
            evalKey,
            ignoreMessageValue(valuesRules?.ignore),
            this.message(field.message, valuesRules, rulePathValues, field),
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
            this.enumeration(field.enum, valuesRules, rulePathValues, field),
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
            this.scalar(
              field.scalar,
              valuesRules,
              rulePathValues,
              false,
              field,
            ),
          ),
        );
        break;
      }
    }
    return evals;
  }

  private enumeration(
    descEnum: DescEnum,
    fieldRules: FieldRules | undefined,
    baseRulePath: PathBuilder,
    fieldContext: { toString(): string },
  ): Eval<number> {
    const evals = new EvalMany<number>(
      this.fieldCel(fieldRules, baseRulePath, false),
    );
    const [rules, rulePath] = getEnumRules(
      baseRulePath,
      fieldRules,
      fieldContext,
    );
    if (rules) {
      evals.add(new EvalEnumDefinedOnly(descEnum, rulePath, rules));
      evals.add(this.rules(rules, rulePath, false));
    }
    return evals;
  }

  private scalar(
    scalar: ScalarType,
    fieldRules: FieldRules | undefined,
    baseRulePath: PathBuilder,
    forMapKey: boolean,
    fieldContext: { toString(): string },
  ): Eval<ScalarValue> {
    const evals = new EvalMany<ScalarValue>(
      this.fieldCel(fieldRules, baseRulePath, forMapKey),
    );
    const [rules, rulePath] = getScalarRules(
      scalar,
      baseRulePath,
      fieldRules,
      fieldContext,
    );
    if (rules) {
      evals.add(this.rules(rules, rulePath, forMapKey));
    }
    return evals;
  }

  private message(
    descMessage: DescMessage,
    fieldRules: FieldRules | undefined,
    baseRulePath: PathBuilder,
    fieldContext: { toString(): string },
  ): Eval<ReflectMessage> {
    const evals = new EvalMany<ReflectMessage>(
      this.fieldCel(fieldRules, baseRulePath, false),
    );
    evals.add(this.plan(descMessage));
    const [rules, rulePath] = getMessageRules(
      descMessage,
      baseRulePath,
      fieldRules,
      fieldContext,
    );
    if (rules) {
      if (isMessage(rules, AnyRulesSchema)) {
        evals.add(new EvalAnyRules(rulePath, rules));
      }
      evals.add(this.rules(rules, rulePath, false));
    }
    return evals;
  }

  private rules(
    rules: Exclude<FieldRules["type"]["value"], undefined>,
    rulePath: PathBuilder,
    forMapKey: boolean,
  ) {
    const ruleDesc = getRuleDescriptor(rules.$typeName);
    const prepared = this.celMan.compileRules(ruleDesc);
    const evalStandard = new EvalStandardRulesCel(
      this.celMan,
      rules,
      forMapKey,
    );
    for (const plan of prepared.standard) {
      if (!isFieldSet(rules, plan.field)) {
        continue;
      }
      evalStandard.add(
        plan.compiled,
        rulePath.clone().field(plan.field).toPath(),
      );
    }
    const evalExtended = new EvalExtendedRulesCel(
      this.celMan,
      rules,
      forMapKey,
    );
    if (rules.$unknown) {
      for (const uf of rules.$unknown) {
        const plans = prepared.extensions.get(uf.no);
        if (!plans) {
          continue;
        }
        for (const plan of plans) {
          evalExtended.add(
            plan.compiled,
            rulePath.clone().extension(plan.ext).toPath(),
            getExtension(rules, plan.ext),
          );
        }
      }
    }
    return new EvalMany(evalStandard, evalExtended);
  }

  private messageCel(messageRules: MessageRules): Eval<ReflectMessage> {
    const e = new EvalCustomCel(this.celMan, false);
    for (const rule of messageRules.cel) {
      e.add(this.celMan.compileRule(rule), []);
    }
    return e;
  }

  private fieldCel(
    fieldRules: FieldRules | undefined,
    baseRulePath: PathBuilder,
    forMapKey: boolean,
  ): Eval<ReflectMessageGet> {
    if (!fieldRules) {
      return EvalNoop.get();
    }
    const e = new EvalCustomCel(this.celMan, forMapKey);
    for (const [index, rule] of fieldRules.cel.entries()) {
      const rulePath = baseRulePath
        .clone()
        .field(FieldRulesSchema.field.cel)
        .list(index)
        .toPath();
      e.add(this.celMan.compileRule(rule), rulePath);
    }
    return e;
  }
}
