import { CelParser } from "./celenv";
import { parse } from "./grammar";
import { ParsedExpr } from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/syntax_pb";

export class PeggyParser implements CelParser {
  parse(text: string): ParsedExpr {
    return parse(text) as ParsedExpr;
  }
}
