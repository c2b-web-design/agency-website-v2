import type { MetadataRoute } from "next";

/**
 * Block all crawlers while the site is unfinished.
 *
 * WHY THIS EXISTS. The production alias is PUBLIC — it returns HTTP 200 with no
 * authentication. Vercel's deployment protection on the Hobby plan covers
 * PREVIEW deployments only, so the short alias anyone would naturally bookmark
 * is reachable by anyone who has it.
 *
 * Carl's position, 28 July 2026: no other human has seen the site and none will
 * until it is finished. Nobody has the URL but him, so the practical risk is
 * small — but *"someone wins the lottery every week"*. Unlisted is not private,
 * and a URL can reach an index without ever being shared: browser telemetry, a
 * paste into a tool that crawls, or a crawl of vercel.app itself.
 *
 * This closes the cheap half of that gap. It is NOT access control — a crawler
 * that ignores the standard, or a person with the link, still reaches the site.
 * The real control is Vercel's Deployment Protection setting, which is Carl's to
 * change and outside this repository.
 *
 * ⚠ REMOVE THIS BEFORE LAUNCH. A site that blocks all crawlers will not be
 * indexed and will not appear in search results. Leaving this file in place on
 * a finished commercial site would be a serious, silent defect: everything
 * would look correct and no one would ever find it.
 *
 * See `project-intelligence/mission-overview.md` § Deployment.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
