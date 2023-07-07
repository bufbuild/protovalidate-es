import { TreeSitterParser } from "./parser";
import Parser from "web-tree-sitter";

export { TreeSitterParser } from "./parser";
export { Highlight } from "./highlight";

export function newCelParser(celParser: Parser): TreeSitterParser {
  return new TreeSitterParser(celParser);
}

export async function loadCelParser(
  celWasmPath: string
): Promise<TreeSitterParser> {
  await Parser.init();
  const parser = new Parser();
  const cel = await Parser.Language.load(celWasmPath);
  parser.setLanguage(cel);
  return newCelParser(parser);
}
