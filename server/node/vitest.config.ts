import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    unstubGlobals: true,
    sequence: {
      shuffle: true,
    },
    setupFiles: ["vitest.setup.ts"],
  },
});
