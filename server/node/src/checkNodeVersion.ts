import { readFileSync } from "node:fs";
import { join } from "node:path";
import { satisfies } from "semver";

const minimumNodeVersion = readFileSync(
  join(__dirname, "../", ".nvmrc"),
  "utf-8",
);

const isValidNodeVersion = satisfies(
  process.version,
  `>= ${minimumNodeVersion}`,
);

// successfully exit when Node version is valid
if (isValidNodeVersion) {
  process.exit(0);
}

const output = `
** Invalid Node.js Version **
current version: ${process.version}
minimum required version: ${minimumNodeVersion}
`;

console.error(output);
process.exit(1);
