// eslint-disable-next-line no-undef
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The root directory that Jest should scan for tests and modules within
  rootDir: "dist/esm",

  transform: {},
};

export default config;
