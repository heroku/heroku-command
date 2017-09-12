module.exports = {
  coverageReporters: ["json"],
  setupTestFrameworkScriptFile: "./test/init.js",
  transform: {
    "^.+\\.ts$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  testRegex: "\\.test\\.ts$",
  moduleFileExtensions: ["js", "ts"]
}
