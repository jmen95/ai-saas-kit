/** Unit tests — pure logic, no database required. */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: { esModuleInterop: true } }],
  },
};
