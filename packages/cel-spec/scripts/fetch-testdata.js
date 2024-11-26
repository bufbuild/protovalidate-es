import pkg from "../package.json" with { type: "json" };
import { extractFiles, fetchRepository } from "./common.js";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

/*
 * Fetch conformance test data from the upstream github.com/google/cel-spec
 * Because we convert the test data from textproto to JSON, this script depends
 * on the directory "proto" to contain the corresponding Protobuf files.
 */

if (
  typeof pkg.upstreamCelSpecRef !== "string" ||
  pkg.upstreamCelSpecRef.length === 0
) {
  throw new Error(
    "Missing 'upstreamCelSpecRef' in package.json. It can point to a commit, branch, or tag of github.com/google/cel-spec",
  );
}

// Fetch github.com/google/cel-spec
const archive = await fetchRepository(pkg.upstreamCelSpecRef);
// Extract testdata/simple/*.textproto
const testdataTextProto = extractFiles(
  archive,
  /^cel-spec-[^/]+\/tests\/simple\/testdata\/([^/]+\.textproto)$/,
);
// Convert textproto to JSON with `buf convert`, using the local module "proto".
const testdataJson = convertTestDataToJson(
  testdataTextProto,
  "proto",
  "cel.expr.conformance.test.SimpleTestFile",
);
// Write as JSON array to a TypeScript file
writeFileSync(
  "src/testdata-json.ts",
  `// Generated from github.com/google/cel-spec ${pkg.upstreamCelSpecRef} by scripts/fetch-testdata.json
import type { JsonObject } from "@bufbuild/protobuf";

export const testdataJson: JsonObject[] = ${JSON.stringify(testdataJson, null, 2)};`,
);

/**
 * @param {[string, Uint8Array|string][]} testData
 * @param {string} module
 * @param {string} typeName
 * @return {any[]}
 */
function convertTestDataToJson(testData, module, typeName) {
  const testFiles = [];
  for (const [name, content] of testData) {
    try {
      const jsonString = bufConvert(module, typeName, content);
      const json = JSON.parse(jsonString);
      testFiles.push(json);
    } catch (e) {
      throw new Error(`Failed to convert ${name}`, { cause: e });
    }
  }
  return testFiles;
}

/**
 * @param {string} input
 * @param {string} typeName
 * @param {string | Uint8Array} from
 * @return {string}
 */
function bufConvert(input, typeName, from) {
  const command = "buf";
  const args = [
    "convert",
    input,
    `--type=${typeName}`,
    "--from=-#format=txtpb",
    "--to=-#format=json",
  ];
  const p = spawnSync(command, args, {
    encoding: "buffer",
    input: from,
    windowsHide: true,
  });
  if (p.error !== undefined) {
    throw p.error;
  }
  if (p.status !== 0) {
    throw new Error(p.stderr.toString());
  }
  return p.stdout.toString();
}
