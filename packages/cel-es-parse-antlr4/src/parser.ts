import { ParsedExpr } from "@buf/alfus_cel.bufbuild_es/dev/cel/expr/syntax_pb";
import { type CelParser } from "@bufbuild/cel-es";

export class Antrl4Parser implements CelParser {
  parse(expr: string): ParsedExpr {
    throw new Error("Method not implemented.");
  }
}
