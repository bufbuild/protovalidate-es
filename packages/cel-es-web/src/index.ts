import { TreeSitterParser } from "./parser";
import { type CelParser } from "@bufbuild/cel-es";
import Parser from "web-tree-sitter";

export function newCelParser(celParser: Parser): CelParser {
  return new TreeSitterParser(celParser);
}

export async function loadCelParser(celWasmPath: string): Promise<CelParser> {
  await Parser.init();
  const parser = new Parser();
  const cel = await Parser.Language.load(celWasmPath);
  parser.setLanguage(cel);
  return newCelParser(parser);
}
