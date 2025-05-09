import js from "@eslint/js";
import * as pluginImportX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import * as tsResolver from "eslint-import-resolver-typescript";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      pluginImportX.flatConfigs.recommended,
      pluginImportX.flatConfigs.typescript,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "import-x/extensions": ["error", "never"],
      "import-x/default": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
    settings: {
      "import-x/resolver": {
        name: "tsResolver",
        resolver: tsResolver,
      },
    },
  },
);
