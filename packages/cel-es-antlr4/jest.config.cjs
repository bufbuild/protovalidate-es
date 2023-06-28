// eslint-disable-next-line no-undef
module.exports = {
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/dist/"
  ],
  "transform": {
    "^.+\\.tsx?$": [
      "esbuild-jest",
      {
        "sourcemap": true,
        "loaders": {
          ".spec.ts": "tsx"
        },
        "target": "es2020"
      }
    ]
  }
};
