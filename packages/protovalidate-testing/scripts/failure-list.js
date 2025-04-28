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

import { readFileSync } from "node:fs";
import { log } from "node:console";

// Parse conformance harness output, sort, and output known failures yaml with comments

const lines = readFileSync(0, "utf-8").trim().split("\n");

const suites = [];
let suite;
let kase;
for (const line of lines) {
  // --- FAIL: standard_rules/map (failed: 18, skipped: 0, passed: 11, total: 29)
  const mSuite =
    /^--- FAIL: (.+) \(failed: \d+, skipped: \d+, passed: \d+, total: \d+\)$/.exec(
      line,
    );
  if (mSuite) {
    suite = {
      name: mSuite[1],
      cases: [],
    };
    suites.push(suite);
    continue;
  }
  //     --- FAIL: min/max/above/invalid
  const mCase = / {4}--- FAIL: (.+)/.exec(line);
  if (mCase) {
    if (!suite) {
      throw new Error();
    }
    kase = {
      name: mCase[1],
      lines: [],
    };
    suite.cases.push(kase);
    continue;
  }
  if (!kase) {
    throw new Error();
  }
  kase.lines.push(line);
}

suites.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
for (const suite of suites) {
  suite.cases.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
}

const out = [];
for (const suite of suites) {
  out.push(`${suite.name}:`);
  for (const kase of suite.cases) {
    out.push(`  - ${kase.name}`);
    for (const line of kase.lines) {
      out.push(`  #${line}`);
    }
  }
}

log(out.join("\n"));
