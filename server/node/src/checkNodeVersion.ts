import { readFileSync } from "node:fs";
import path from "node:path";
import { satisfies } from "semver";

const minimumNodeVersion = readFileSync(
  // eslint-disable-next-line unicorn/prefer-module
  path.join(__dirname, "../", ".nvmrc"),
  "utf8",
);

const isValidNodeVersion = satisfies(
  process.version,
  `>= ${minimumNodeVersion}`,
);

// successfully exit when Node version is valid
if (isValidNodeVersion) {
  process.exitCode = 0;
} else {
  const output = `
  ** Invalid Node.js Version **
  current version: ${process.version}
  minimum required version: ${minimumNodeVersion}
  `;

  console.error(output);
  process.exitCode = 1;
}
