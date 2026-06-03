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

import * as console from "node:console";
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { createValidator } from "@bufbuild/protovalidate";
import { Bench, type Task } from "tinybench";
import { cases } from "./cases.js";

const usage = `USAGE: ${process.argv[1]} [regex]

Run tests with the npm package "tinybench", and print results to standard out.
If no regex is supplied, all benchmarks are run.

Arguments:
  regex          Run only tests whose name matches this regex.

Options:
  --dir <dir>    Directory for JSON results (default: .tmp/bench).
  -h, --help     Print this help and exit.
`;

const options = {
  dir: {
    type: "string",
  },
  help: {
    type: "boolean",
    short: "h",
  },
} as const;
const { values, positionals } = parseArgs({
  options,
  allowPositionals: true,
});
if (values.help) {
  console.log(usage);
  process.exit(0);
}
if (positionals.length > 1) {
  console.error(usage);
  process.exit(2);
}
const outPath = values.dir ?? ".tmp/bench";
const filter = positionals.length > 0 ? new RegExp(positionals[0]) : /.*/;
const tests = cases.filter((test) => filter.test(test.name));
if (tests.length == 0) {
  console.log("No tests match pattern; exiting.");
  process.exit(0);
}

const bench = new Bench({ name: "protovalidate benchmarks", time: 100 });
const validator = createValidator();
for (const test of tests) {
  bench.add(test.name, () => {
    validator.validate(test.schema, test.fixture);
  });
}
await bench.run();
writeOutputJson(outPath, bench.tasks);
console.log(bench.name);
console.table(bench.table());

/**
 * JSON output
 */
type OutputJson = {
  timestamp: Date;
  /**
   * Node.js version
   */
  node: string;
  /**
   * Node.js platform / arch
   */
  platform: string;
  /**
   * tinybench task results
   */
  tasks: {
    name: string;
    result: Task["result"];
  }[];
};

function writeOutputJson(outPath: string, tasks: Task[]) {
  const timestamp = new Date();
  const output: OutputJson = {
    timestamp,
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    tasks: tasks.map((t) => ({
      name: t.name,
      result: t.result,
    })),
  };
  writeFileSync(
    `${outPath}/${timestamp.toISOString().replace(/[:.]/g, "-")}.json`,
    JSON.stringify(output, null, 2),
  );
}
