import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  root: "src/merchant-example",
  cacheDir: "../../node_modules/.vite-merchant-example",
  server: {
    port: 3001,
  },
});
