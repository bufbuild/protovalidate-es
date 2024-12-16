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
  const data = readFileSync("package.json", "utf8");
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
  // eslint-disable-next-line no-undef
  const response = await fetch(url, {
    // eslint-disable-next-line no-undef
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
