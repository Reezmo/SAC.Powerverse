import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This repo already has docs/CLAUDE.md and docs/AGENTS.md as the real
  // convention docs — don't let Next.js auto-generate duplicates at the root.
  agentRules: false,
};

export default nextConfig;
