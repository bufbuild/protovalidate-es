import { spawnSync } from "node:child_process";
import process from "node:process";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { URL } from "node:url";

const packageDir = new URL("../", import.meta.url).pathname;
const version = readUpstreamVersionFromPackageJsonScript(
  join(packageDir, "package.json"),
);

goInstall(
  `github.com/bufbuild/protovalidate/tools/protovalidate-conformance@${version}`,
  join(packageDir, "gobin"),
);

/**
 * @param {string} ref
 * @param {string} gobin
 * @return {string}
 */
function goInstall(ref, gobin) {
  if (!existsSync(gobin)) {
    mkdirSync(gobin, { recursive: true });
  }
  const p = spawnSync("go", ["install", ref], {
    encoding: "utf-8",
    env: {
      ...process.env,
      GOBIN: gobin,
    },
  });
  if (p.error !== undefined) {
    throw p.error;
  }
  if (p.status !== 0) {
    throw new Error(p.stderr);
  }
  return p.stdout;
}

/**
 * @param {string} path
 * @return {string}
 */
function readUpstreamVersionFromPackageJsonScript(path) {
  const data = readFileSync(path, "utf8");
  const pkg = JSON.parse(data);
  if (typeof pkg !== "object" || pkg === null) {
    throw new Error(`Failed to parse ${path}`);
  }
  const scripts = pkg.scripts;
  if (typeof scripts !== "object" || scripts === null) {
    throw new Error(`Missing 'scripts' in ${path}`);
  }
  const generate = scripts.generate;
  if (typeof generate !== "string") {
    throw new Error(`Missing 'scripts.generate' in ${path}`);
  }
  const r = /protovalidate-testing:(v\d+\.\d+\.\d+)/.exec(generate);
  if (!r) {
    throw new Error(
      `Unexpected value for 'scripts.generate' in ${path}: ${generate}`,
    );
  }
  return r[1];
}
