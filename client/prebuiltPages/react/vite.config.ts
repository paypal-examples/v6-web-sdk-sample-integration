import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/client/prebuiltPages/react/dist" : "./",
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
    allowedHosts: ["v6-web-sdk-sample-integration-server.fly.dev"],
    proxy: {
      "/paypal-api": {
        target: "https://66.241.125.234",
        changeOrigin: true,
        secure: false,
        headers: {
          Host: "v6-web-sdk-sample-integration-server.fly.dev",
        },
      },
    },
  },
}));
