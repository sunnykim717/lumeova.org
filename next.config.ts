import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The Cloudflare Workers runtime (via the OpenNext adapter) doesn't run
    // Next.js's default sharp-based image optimizer. The proper fix is the
    // Cloudflare Images binding (see wrangler.jsonc's comment), but every
    // image on this site is still an ImagePlaceholder today, so there's
    // nothing to optimize yet — unoptimized keeps the first deploy simple.
    // Revisit once real photography is added.
    unoptimized: true,
  },
};

export default nextConfig;
