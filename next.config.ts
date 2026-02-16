import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep chromium as an external server package and explicitly include its binary assets
  // so Route Handlers that generate PDFs can find the brotli/chromium files in production.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/generate-report": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/admin/deliver": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
