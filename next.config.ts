import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {}, // Enable Turbopack with empty config to resolve Serwist compatibility
};

export default withSerwist(nextConfig);
