#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const command = join(__dirname, "../gobin/protovalidate-conformance");
const p = spawnSync(command, process.argv.slice(2), {
  stdio: "inherit",
});
if (p.error !== undefined) {
  throw p.error;
}
process.exit(p.status);
