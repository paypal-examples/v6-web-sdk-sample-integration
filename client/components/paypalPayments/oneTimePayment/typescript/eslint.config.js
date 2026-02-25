import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig([
  {
    files: ["src/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  tseslint.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  globalIgnores(["src/dist/"]),
  {
    rules: {
      "max-params": ["error", 2],
    },
  },
]);
