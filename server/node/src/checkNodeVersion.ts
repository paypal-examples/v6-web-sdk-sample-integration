import { readFileSync } from "node:fs";
import { join } from "node:path";
import { satisfies } from "semver";

/**
 * Reads the minimum required Node.js version from the .nvmrc file.
 * @constant
 * @type {string}
 */
const minimumNodeVersion = readFileSync(
  join(__dirname, "../", ".nvmrc"),
  "utf-8",
);

/**
 * Checks if the current Node.js version satisfies the minimum required version.
 * @constant
 * @type {boolean}
 */
const isValidNodeVersion = satisfies(
  process.version,
  `>= ${minimumNodeVersion}`,
);

// successfully exit when Node version is valid
if (isValidNodeVersion) {
  process.exit(0);
}

/**
 * Output message displayed when the Node.js version is invalid.
 * @constant
 * @type {string}
 */
const output = `
** Invalid Node.js Version **
current version: ${process.version}
minimum required version: ${minimumNodeVersion}
`;

console.error(output);
process.exit(1);
