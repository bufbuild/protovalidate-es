import { type CelParser } from "./celenv.js";
import { parse } from "./grammar.js";
import type { ParsedExpr } from "@bufbuild/cel-spec/cel/expr/syntax_pb.js";

export class PeggyParser implements CelParser {
  parse(text: string): ParsedExpr {
    return parse(text);
  }
}
