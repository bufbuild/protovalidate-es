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

import { readFileSync } from "node:fs";

/**
 * Parse version.txt for a semver version with a leading "v",
 * or a branch name.
 *
 * @return { {kind: "semver", value: string} | {kind: "branch", value: string} }
 */
export function readReference() {
  const path = new URL("../version.txt", import.meta.url).pathname;
  const content = readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .filter((line) => line.length > 0)
    .join("");
  if (content.length == 0) {
    console.error("version.txt is empty");
    process.exit(1);
  }
  const semver = /^v\d+\.\d+\.\d+(?:-.+)?$/;
  if (semver.test(content)) {
    return {
      kind: "semver",
      value: content,
    };
  }
  return {
    kind: "branch",
    value: content,
  };
}
