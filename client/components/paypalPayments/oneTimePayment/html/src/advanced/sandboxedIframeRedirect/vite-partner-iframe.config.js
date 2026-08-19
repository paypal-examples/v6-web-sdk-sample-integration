import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  root: "src/partner-iframe",
  cacheDir: "../../node_modules/.vite-partner-iframe",
  server: {
    port: 3000,
    proxy: {
      "/paypal-api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
