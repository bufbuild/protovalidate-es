import { type CelParser } from "@bufbuild/cel-es";
import { Antrl4Parser } from "./parser";

export function newCelParser(): CelParser {
  return new Antrl4Parser();
}
