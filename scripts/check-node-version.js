const { readFileSync } = require("fs");
const { join } = require("path");
const semver = require("semver");

const minimumNodeVersion = readFileSync(
  join(__dirname, "../", ".nvmrc"),
  "utf-8"
);
const isValidNodeVersion = semver.satisfies(
  process.version,
  `>= ${minimumNodeVersion}`
);

// successfully exit when Node version is valid
if (isValidNodeVersion) {
  return;
}

const output = `
** Invalid Node.js Version **
current version: ${process.version}
minimum required version: ${minimumNodeVersion}
`;

console.error(output);
process.exit(1);
