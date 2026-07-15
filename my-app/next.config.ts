import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https://api.anthropic.com",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["sharp"],
  // Scaffold template assets are read with fs at request time through a
  // manifest, which output-file tracing can't follow — include them
  // explicitly or the deployed function 500s on template generation.
  outputFileTracingIncludes: {
    "/api/generate": ["./src/lib/codegen/templates/**/*"],
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
