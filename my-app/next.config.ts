import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["sharp"],
  // Safe to force-include now that node_modules is hoisted (no symlinks) —
  // sharp's linux-x64 addon dynamically dlopen's libvips from the sibling
  // @img/sharp-libvips-linux-x64 package, which the file tracer was missing.
  outputFileTracingIncludes: {
    "/api/classify": ["./node_modules/sharp/**/*", "./node_modules/@img/**/*"],
  },
};

export default nextConfig;
