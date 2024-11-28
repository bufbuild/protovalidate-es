import {
  extractFiles,
  fetchRepository,
  readPackageJson,
  writeFiles,
} from "./common.js";

/*
 * Fetch Protobuf files from the upstream github.com/google/cel-spec
 */

const { upstreamCelSpecRef } = readPackageJson("package.json");
const archive = await fetchRepository(upstreamCelSpecRef);
const proto = extractFiles(
  archive,
  /^cel-spec-[^/]+\/proto\/(cel\/expr\/.+\.proto)$/,
);
writeFiles(proto, "proto");
