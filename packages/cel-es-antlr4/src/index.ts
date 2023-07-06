import { type CelParser } from "@bufbuild/cel-es";
import { Antrl4Parser } from "./parser";

export const CEL_PARSER: CelParser = new Antrl4Parser();
