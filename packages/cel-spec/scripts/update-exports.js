import { readdirSync, readFileSync, writeFileSync } from "node:fs";

/*
 * Read all files in src, and update the "exports" in package.json.
 * This script depends on all relevant .ts files to be present in the "src" directory.
 */

const sourceFiles = readdirSync("src", { recursive: true, encoding: "utf-8" })
  .filter((f) => f.includes("/"))
  .filter((f) => f.endsWith(".ts"));

const exports = {};
const typesVersions = {
  "*": {},
};

for (const sourceFile of sourceFiles) {
  const internal = sourceFile.replace(/\.ts$/, "");
  // drop the "gen" directory for exports
  const external = internal.replace(/^gen\//, "");
  exports[`./${external}.js`] = {
    import: `./dist/esm/${internal}.js`,
    require: `./dist/cjs/${internal}.js`,
  };
  typesVersions["*"][`${external}.js`] = [`./dist/cjs/${internal}.d.ts`];
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.exports = exports;
pkg.typesVersions = typesVersions;
writeFileSync("package.json", JSON.stringify(pkg, null, 2));
