module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "coverage",
  testMatch: ["**/tests/**/*.test.js"],
};
