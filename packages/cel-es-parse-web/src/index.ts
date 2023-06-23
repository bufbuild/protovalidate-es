import { parseTree } from "./parser";
import { type CelParser } from "@bufbuild/cel-es";
import Parser from "web-tree-sitter";
import { syntax_pb } from "@bufbuild/cel-es-proto";

class TreeSitterParser implements CelParser {
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }

  parse(expr: string): syntax_pb.ParsedExpr {
    const tree = this.parser.parse(expr);
    return parseTree(tree);
  }
}

export function newCelParser(celParser: Parser): CelParser {
  return new TreeSitterParser(celParser);
}
