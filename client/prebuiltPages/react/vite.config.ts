import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/client/prebuiltPages/react/dist" : "./",
  // Ensure a single React instance when @paypal/react-paypal-js is consumed via
  // `npm link` from the sibling paypal-js monorepo (which has its own React copy).
  // Without this, Vite can bundle two Reacts and throw "invalid hook call".
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    sourcemap: true,
  },
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
}));
