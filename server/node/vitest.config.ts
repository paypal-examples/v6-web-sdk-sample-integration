import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    sequence: {
      shuffle: true,
    },
    setupFiles: ["vitest.setup.ts"],
  },
});
