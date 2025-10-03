import js from "@eslint/js";
import { flatConfigs as pluginImportXFlatConfigs } from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import * as tsResolver from "eslint-import-resolver-typescript";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      pluginImportXFlatConfigs.recommended,
      pluginImportXFlatConfigs.typescript,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    settings: {
      "import-x/resolver": {
        name: "tsResolver",
        resolver: tsResolver,
      },
    },
  },
);
