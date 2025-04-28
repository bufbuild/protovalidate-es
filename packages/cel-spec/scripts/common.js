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

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join as joinPath } from "node:path";
import { unzipSync } from "fflate";

/**
 * @param {string} path
 * @return {{upstreamCelSpecRef: string, [k:string]: unknown; }}
 */
export function readPackageJson(path) {
  const data = readFileSync(path, "utf8");
  const pkg = JSON.parse(data);
  if (typeof pkg !== "object" || pkg === null) {
    throw new Error(`Failed to parse ${path}`);
  }
  if (
    !("upstreamCelSpecRef" in pkg) ||
    typeof pkg.upstreamCelSpecRef !== "string" ||
    pkg.upstreamCelSpecRef.length === 0
  ) {
    throw new Error(
      `Missing 'upstreamCelSpecRef' in ${path}. It can point to a commit, branch, or tag of github.com/google/cel-spec`,
    );
  }
  return pkg;
}

/**
 * @param {string} path
 * @param {unknown} pkg
 */
export function writePackageJson(path, pkg) {
  const data = JSON.stringify(pkg, null, 2) + "\n";
  writeFileSync(path, data);
}

/**
 * @param {string} upstreamCelSpecRef
 * @return {Promise<Uint8Array>}
 */
export async function fetchRepository(upstreamCelSpecRef) {
  const url = `https://github.com/google/cel-spec/archive/${upstreamCelSpecRef}.zip`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10 * 1000),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * @param {[string, Uint8Array | string][]} files
 * @param {string} dir
 */
export function writeFiles(files, dir) {
  rmSync(dir, { recursive: true, force: true });
  for (const [path, content] of files) {
    const target = joinPath(dir, path);
    if (!existsSync(dirname(target))) {
      mkdirSync(dirname(target), { recursive: true });
    }
    writeFileSync(target, content);
  }
}

/**
 * @param {Uint8Array} zip
 * @param {RegExp} re
 * @return {[string, Uint8Array][]}
 */
export function extractFiles(zip, re) {
  const entries = Object.entries(
    unzipSync(zip, {
      filter: (file) => re.test(file.name),
    }),
  );
  return entries.map(([name, content]) => {
    const match = re.exec(name);
    return [match?.[1] ?? name, content];
  });
}
