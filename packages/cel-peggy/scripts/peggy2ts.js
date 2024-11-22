import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { argv } from "node:process";

// Convert generated peggy JS grammar to TypeScript

const inputPath = argv[2];
if (
  typeof inputPath != "string" ||
  inputPath.length === 0 ||
  !existsSync(inputPath)
) {
  throw new Error(`Missing argument for input path`);
}
const js = readFileSync(inputPath, "utf8");
let lines = js.split("\n");

// Disable linter and type checking
lines = [`/* eslint-disable */`, `// @ts-nocheck`, ...lines];

// Remove "use strict", don't need it in TypeScript
lines = lines.filter((line) => line !== `"use strict";`);

// Replace CommonJs export with ESM/TS export
const i = lines.indexOf(`module.exports = {`);
if (i === -1) {
  throw new Error("missing cjs exports");
}
lines.splice(i, 5);
lines.push(`export const parse: (text: string) => ParsedExpr = peg$parse;`);

const outputPath = inputPath.substring(0, inputPath.length - 3) + ".ts";
writeFileSync(outputPath, lines.join("\n"));
unlinkSync(inputPath);
