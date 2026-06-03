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

import { Bench, type Task } from "tinybench";
import * as console from "node:console";
import { createValidator } from "@bufbuild/protovalidate";
import { cases, type BenchCase } from "./cases.js";
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

/* eslint-disable no-console, import/no-named-as-default-member */

let outPath = ".tmp/bench";

async function main(): Promise<void> {
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
    exitUsage(0);
  }
  if (values.dir) {
    outPath = values.dir;
  }
  if (positionals.length > 1) {
    exitUsage(2);
  }

  let filter = /.*/;
  if (positionals.length == 1) {
    filter = new RegExp(positionals[0]);
  }
  const tests = cases.filter((test) => filter.test(test.name));
  if (tests.length == 0) {
    console.log("No tests match pattern; exiting.");
    process.exit(0);
  }
  await bench(tests);

  function exitUsage(exitCode = 0): never {
    const out = exitCode === 0 ? process.stdout : process.stderr;
    out.write(
      [
        `USAGE: ${process.argv[1]} [regex]`,
        ``,
        `Run tests with the npm package "tinybench", and print results to standard out.`,
        `If no regex is supplied, all benchmarks are run.`,
        ``,
      ].join("\n"),
    );
    process.exit(exitCode);
  }
}

/**
 * Benchmark tests with the npm package "tinybench". Results are printed to
 * standard out.
 */
async function bench(tests: BenchCase[]): Promise<void> {
  const bench = new Bench({ name: "protovalidate benchmarks", time: 100 });
  const validator = createValidator();

  for (const test of tests) {
    bench.add(test.name, () => {
      validator.validate(test.schema, test.fixture);
    });
  }

  const timestamp = new Date();

  await bench.run();

  const output: OutputJson = {
    timestamp: timestamp,
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    tasks: bench.tasks.map((t) => ({
      name: t.name,
      // t.result is undefined if the task errored
      result: t.result,
    })),
  };
  writeFileSync(
    `${outPath}/${timestamp.toISOString().replace(/[:.]/g, "-")}.json`,
    JSON.stringify(output, null, 2),
  );

  console.log(bench.name);
  console.table(bench.table());
}

await main();

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
