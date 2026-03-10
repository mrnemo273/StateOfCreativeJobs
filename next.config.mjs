/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
    // Include cached snapshot JSON files in the serverless function bundle.
    // These are read dynamically via fs.readFileSync, so Vercel's file tracer
    // needs an explicit hint to bundle them.
    outputFileTracingIncludes: {
      "/api/snapshot/[slug]": ["./src/data/snapshots/**/*.json"],
    },
  },
};

export default nextConfig;
