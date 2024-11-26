import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join as joinPath } from "node:path";
import { unzipSync } from "fflate";

/**
 * @param {string} upstreamCelSpecRef
 * @return {Promise<Uint8Array>}
 */
export async function fetchRepository(upstreamCelSpecRef) {
  const url = `https://github.com/google/cel-spec/archive/${upstreamCelSpecRef}.zip`;
  const response = await fetch(url); // eslint-disable-line no-undef
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
