import { type CelParser, CelEnv } from "@bufbuild/cel-es";
import { Antrl4Parser } from "./parser";

export const CEL_PARSER: CelParser = new Antrl4Parser();

export function newCelEnv(namespace: string | undefined = undefined): CelEnv {
  return new CelEnv(namespace, CEL_PARSER);
}
