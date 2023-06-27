import { TreeSitterParser } from "./parser";
import { type CelParser } from "@bufbuild/cel-es";
import Parser from "web-tree-sitter";

export function newCelParser(celParser: Parser): CelParser {
  return new TreeSitterParser(celParser);
}
