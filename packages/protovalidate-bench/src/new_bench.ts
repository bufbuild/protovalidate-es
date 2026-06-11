// Copyright 2021-2026 Buf Technologies, Inc.
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

import {Bench} from "tinybench";
import * as console from "node:console";
import type {DescMessage, Message} from "@bufbuild/protobuf";
import { createValidator } from "@bufbuild/protovalidate";
import {cases} from "./cases.js";
import {writeFileSync} from "node:fs";

/* eslint-disable no-console, import/no-named-as-default-member */

const outPath = ".tmp/bench";

async function main(args: string[]): Promise<void> {
    function filterTests(regexp: string): Test[] {
        const tests = setupTests();
        const re = new RegExp(regexp);
        return tests.filter((test) => re.test(test.name));
    }
    switch (args.shift()) {
        case "list":
            if (args.length > 1) {
                exitUsage(1);
                break;
            }
            for (const test of filterTests(args.length == 1 ? args[0] : ".*")) {
                console.log(test.name);
            }
            break;
        case "benchmark":
            if (args.length > 1) {
                exitUsage(1);
                break;
            }
            await bench(filterTests(args.length == 1 ? args[0] : ".*"));
            break;
        case "run": {
            if (args.length > 1) {
                exitUsage(1);
                break;
            }
            const tests = filterTests(args.length == 1 ? args[0] : ".*");
            run(tests);
            break;
        }
        default:
            exitUsage(1);
    }

    function exitUsage(exitCode = 0) {
        const out = exitCode === 0 ? process.stdout : process.stderr;
        out.write(
            [
                `USAGE: ${process.argv[1]} [list|benchmark|run] [regex] [iteration]`,
                ``,
                `benchmark '.*'`,
                `Run tests with the npm package "tinybench", and print results to standard out.`,
                ``,
                `run '.*'`,
                `Run each test.`,
                ``,
                `list '.*':`,
                `List tests.`,
                ``,
            ].join("\n"),
            () => process.exit(exitCode),
        );
    }
}

interface Test {
    name: string;
    schema: DescMessage;
    fixture: Message;
}

function setupTests(): Test[] {
    const tests: Test[] = [];
    tests.push(...cases);
    return tests;
}
/**
 * Run given tests consecutively.
 */
function run(tests: Test[]): void {
    const validator = createValidator();
    for (const test of tests) {
        console.log(`Running "${test.name}"`);
        validator.validate(test.schema, test.fixture);
    }
}

/**
 * Benchmark tests with the npm package "tinybench". Results are printed to
 * standard out.
 */
async function bench(tests: Test[]): Promise<void> {
    const bench = new Bench({name: 'protovalidate benchmarks', time: 100})
    const validator = createValidator();

    for (const test of tests) {
        bench.add(test.name, ()=> {
            validator.validate(test.schema, test.fixture);
        });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    await bench.run()

    const payload = {
        timestamp: timestamp,
        node: process.version,
        platform: `${process.platform}/${process.arch}`,
        tasks: bench.tasks.map((t) => ({
            name: t.name,
            // t.result is undefined if the task errored
            result: t.result,
        })),
    };
    writeFileSync(`${outPath}/${timestamp}.json`, JSON.stringify(payload, null, 2));

    console.log(bench.name)
    console.table(bench.table())
}

await main(process.argv.slice(2));
