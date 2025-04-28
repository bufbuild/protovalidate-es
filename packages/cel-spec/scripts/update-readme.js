// Copyright 2024-2025 Buf Technologies, Inc.
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

import { readPackageJson } from "./common.js";
import { readFileSync, writeFileSync } from "node:fs";

/*
 * Write the CEL-spec upstream version to README.md
 */

const { upstreamCelSpecRef } = readPackageJson("package.json");
const readmePath = "README.md";
const readme = readFileSync(readmePath, "utf-8");
const match = readme.match(
  /<!-- upstreamCelSpecRef -->(.*)<!-- upstreamCelSpecRef -->/,
);
if (match == null) {
  throw new Error(`Cannot update ${readmePath}`);
}
const head = readme.substring(0, match.index);
const tail = readme.substring(match.index + match[0].length);
const newReadme =
  head +
  "<!-- upstreamCelSpecRef -->" +
  upstreamCelSpecRef +
  "<!-- upstreamCelSpecRef -->" +
  tail;
if (newReadme !== readme) {
  writeFileSync(readmePath, newReadme);
  console.log(`Updated ${readmePath}`);
}
