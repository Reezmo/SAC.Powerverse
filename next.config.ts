import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This repo already has docs/CLAUDE.md and docs/AGENTS.md as the real
  // convention docs — don't let Next.js auto-generate duplicates at the root.
  agentRules: false,
  experimental: {
    serverActions: {
      // Default is 1MB, which 413s on realistically-sized signed APP PDFs.
      // Client-side compression (src/lib/pdf/compressPdf.ts) shrinks the
      // common case. Capped at 4.5mb (not higher) because that's Vercel's
      // own hard platform limit for Serverless Function request bodies —
      // this setting can raise Next.js's own limit but can never exceed
      // Vercel's ceiling, so setting it any higher (e.g. 10mb) is a no-op
      // that gives false confidence.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
