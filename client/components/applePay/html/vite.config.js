import { defineConfig } from "vite";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  root: "src",
  server: {
    port: 3000,
      https: {
        key: fs.readFileSync("./localhost+2-key.pem"),
        cert: fs.readFileSync("./localhost+2.pem"),
      },
    proxy: {
      "/paypal-api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
