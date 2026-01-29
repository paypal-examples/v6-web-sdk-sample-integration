import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  root: "src",
  // use a relative base path for hosting dist folder from:
  // /client/components/paypalPayments/oneTimePayment/typescript/src/dist/index.html
  base: "./",
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
      "/client": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
