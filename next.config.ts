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
      // common case; this is the ceiling for PDFs it can't shrink enough.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
