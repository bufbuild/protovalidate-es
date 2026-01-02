#!/usr/bin/env node

// Copyright 2024-2026 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { readFileSync, writeFileSync } from "node:fs";
import { readReference } from "../scripts/lib.mjs";

/*
 * Write the protovalidate upstream version to README.md
 */
if (process.argv.length != 3) {
  console.error("USAGE: update-bufgenyaml buf.gen.yaml");
  process.exit(1);
}
const upstreamRef = readReference();
const bufgenyamlPath = process.argv[2];
const bufgenyaml = readFileSync(bufgenyamlPath, "utf-8");
const lines = bufgenyaml.split("\n");
const indexStart = lines.indexOf("inputs:");
const indexEnd = lines.indexOf("plugins:");
if (indexStart == -1 || indexEnd == -1) {
  throw new Error(`Cannot update ${bufgenyamlPath}`);
}
let newInputs;
switch (upstreamRef.kind) {
  case "semver":
    newInputs = `inputs:
  - module: buf.build/bufbuild/protovalidate:${upstreamRef.value}
  - module: buf.build/bufbuild/protovalidate-testing:${upstreamRef.value}`;
    break;
  case "branch":
    newInputs = `inputs:
  - git_repo: https://github.com/bufbuild/protovalidate.git
    ref: ${upstreamRef.value}
    subdir: proto/protovalidate
  - git_repo: https://github.com/bufbuild/protovalidate.git
    ref: ${upstreamRef.value}
    subdir: proto/protovalidate-testing`;
    break;
  default:
    throw new Error("unsupported upstream version");
}
const newBufgenyaml = [
  ...lines.slice(0, indexStart),
  newInputs,
  ...lines.slice(indexEnd, lines.length),
].join("\n");
if (newBufgenyaml !== bufgenyaml) {
  writeFileSync(bufgenyamlPath, newBufgenyaml);
  console.log(`Updated ${bufgenyamlPath}`);
}
