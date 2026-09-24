/**
 * Public site URL used for metadataBase, sitemap, robots, and canonicals.
 * Set NEXT_PUBLIC_SITE_URL in production; the default is the current deploy target.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://cemong.vercel.app";
