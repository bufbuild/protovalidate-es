import pkg from "../package.json" with { type: "json" };
import { extractFiles, fetchRepository, writeFiles } from "./common.js";

/*
 * Fetch Protobuf files from the upstream github.com/google/cel-spec
 */

if (
  typeof pkg.upstreamCelSpecRef !== "string" ||
  pkg.upstreamCelSpecRef.length === 0
) {
  throw new Error(
    "Missing 'upstreamCelSpecRef' in package.json. It can point to a commit, branch, or tag of github.com/google/cel-spec",
  );
}

const archive = await fetchRepository(pkg.upstreamCelSpecRef);
const proto = extractFiles(
  archive,
  /^cel-spec-[^/]+\/proto\/(cel\/expr\/.+\.proto)$/,
);
writeFiles(proto, "proto");
