// Minimum OpenNext Cloudflare config: default dummy caches.
// Incremental cache (R2) will be added later, after baseline runtime works.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
