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

import { readdirSync } from "node:fs";
import { readPackageJson, writePackageJson } from "./common.js";

/*
 * Read all files in src, and update the "exports" in package.json.
 * This script depends on all relevant .ts files to be present in the "src" directory.
 */

const sourceFiles = readdirSync("src", { recursive: true, encoding: "utf-8" })
  .filter((f) => f.includes("/"))
  .filter((f) => f.endsWith(".ts"));

const exports = {};
const typesVersions = {
  "*": {},
};

for (const sourceFile of sourceFiles) {
  const internal = sourceFile.replace(/\.ts$/, "");
  // drop the "gen" directory for exports
  const external = internal.replace(/^gen\//, "");
  exports[`./${external}.js`] = {
    import: `./dist/esm/${internal}.js`,
    require: `./dist/cjs/${internal}.js`,
  };
  typesVersions["*"][`${external}.js`] = [`./dist/cjs/${internal}.d.ts`];
}

const pkg = readPackageJson("package.json");
pkg.exports = exports;
pkg.typesVersions = typesVersions;
writePackageJson("package.json", pkg);
