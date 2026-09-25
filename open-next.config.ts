// OpenNext config for the Cloudflare adapter.
// https://opennext.js.org/cloudflare
//
// Left at defaults on purpose: no incremental-cache override is set, since
// wrangler.jsonc doesn't provision an R2 bucket yet (see the comment there).
// Add `incrementalCache: r2IncrementalCache` here (from
// "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache")
// once ISR/on-demand revalidation is actually used and an R2 bucket has been
// created and added to wrangler.jsonc.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
