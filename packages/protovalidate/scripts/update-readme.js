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

import { readFileSync, writeFileSync } from "node:fs";

/*
 * Write the protovalidate upstream version to README.md
 */

const upstreamVersion = readProtovalidateVersionFromPackageJson("package.json");
const readmePath = "README.md";
const readme = readFileSync(readmePath, "utf-8");
const match = readme.match(
  /<!-- upstreamProtovalidateRef -->(.*)<!-- upstreamProtovalidateRef -->/,
);
if (match == null) {
  throw new Error(`Cannot update ${readmePath}`);
}
const head = readme.substring(0, match.index);
const tail = readme.substring(match.index + match[0].length);
const newReadme =
  head +
  "<!-- upstreamProtovalidateRef -->" +
  upstreamVersion +
  "<!-- upstreamProtovalidateRef -->" +
  tail;
if (newReadme !== readme) {
  writeFileSync(readmePath, newReadme);
  console.log(`Updated ${readmePath}`);
}

function readProtovalidateVersionFromPackageJson(path) {
  const data = readFileSync(path, "utf8");
  const pkg = JSON.parse(data);
  if (typeof pkg !== "object" || pkg === null) {
    throw new Error(`Failed to parse ${path}`);
  }
  if (
    typeof pkg.scripts !== "object" ||
    pkg.scripts === null ||
    typeof pkg.scripts["fetch-proto"] !== "string"
  ) {
    throw new Error(`Missing scripts.fetch-proto in ${path}.`);
  }
  const match = pkg.scripts["fetch-proto"].match(
    /buf export buf\.build\/bufbuild\/protovalidate:(.+) --output proto/,
  );
  if (match == null) {
    throw new Error(
      `Unable to find version in scripts.fetch-proto in ${path}.`,
    );
  }
  console.log(match[1]);
  return match[1];
}
