import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/paypal-api/:path*",
        destination: "http://localhost:8080/paypal-api/:path*",
      },
    ];
  },
};

export default nextConfig;
