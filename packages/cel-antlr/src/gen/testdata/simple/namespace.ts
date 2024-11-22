import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  name: "namespace",
  description: "Uses of qualified identifiers and namespaces.",
  section: [
    {
      name: "qualified",
      description: "Qualified variable lookups.",
      test: [
        {
          name: "self_eval_qualified_lookup",
          expr: "x.y",
          typeEnv: [{ name: "x.y", ident: { type: { primitive: "BOOL" } } }],
          bindings: { "x.y": { value: { boolValue: true } } },
          value: { boolValue: true },
        },
      ],
    },
    {
      name: "namespace",
      description: "Namespaced identifiers.",
      test: [
        {
          name: "self_eval_container_lookup",
          expr: "y",
          typeEnv: [
            { name: "x.y", ident: { type: { primitive: "BOOL" } } },
            { name: "y", ident: { type: { primitive: "STRING" } } },
          ],
          container: "x",
          bindings: {
            "x.y": { value: { boolValue: true } },
            y: { value: { stringValue: "false" } },
          },
          value: { boolValue: true },
        },
        {
          name: "self_eval_container_lookup_unchecked",
          expr: "y",
          disableCheck: true,
          typeEnv: [
            { name: "x.y", ident: { type: { primitive: "BOOL" } } },
            { name: "y", ident: { type: { primitive: "BOOL" } } },
          ],
          container: "x",
          bindings: {
            "x.y": { value: { boolValue: true } },
            y: { value: { boolValue: false } },
          },
          value: { boolValue: true },
        },
      ],
    },
  ],
};
