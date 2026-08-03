import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The worker retries once against the live TikTok API on rate-limit, so a single test can take up to 20s.
    testTimeout: 30 * 1000
  },
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" }
    })
  ]
});
