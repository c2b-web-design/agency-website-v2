# C2B Web Design — Mission Overview

## Agency Identity

**Name:** C2B Web Design  
**Type:** Premium web design agency — trust bridge into a wider human-led AI and digital systems business  
**Stage:** Milestone complete — homepage scaffold and full enquiry flow approved at commit 2152e6e (2026-06-14)

---

## Mission

Design and deliver premium digital experiences for discerning clients. The agency's website is the first and most important proof of its own standard: it demonstrates positioning, design quality, intelligent enquiry thinking, and ongoing refinement before any client project exists.

C2B Web Design operates as the visible, trusted front for a wider offering that includes human-led AI integration, intelligent enquiry systems, and digital workflow improvement. The web design identity establishes the aesthetic credibility and consultative tone that the broader service offer depends on.

---

## Visual Direction

| Principle | Definition |
|---|---|
| **Luxury** | Restraint over decoration. Space is the signal. |
| **Minimal** | Nothing unnecessary exists on the page. Every element earns its position. |
| **Futuristic** | Decisions made for longevity, not trend. |

The aesthetic is dark-first, typographically precise, and architecturally clean.

---

## Services

Approved service model — see D-012.

| Service | Description |
|---|---|
| **Premium Website Design** | High-quality websites that make a business look more trusted, credible, and worth the investment. |
| **Website Transformation** | Turning a dated or underperforming website into a sharper, more persuasive digital presence. |
| **Intelligent Enquiry Systems** | Smarter forms, faster follow-up, and qualification journeys that reduce admin and improve conversion. |
| **Ongoing Growth & Improvement** | Continuous refinement, optimisation, and updating so the digital presence keeps working harder after launch. |

Client-facing language always describes business outcomes — never implementation details, tools, or technology.

---

## Target Clients

Businesses that want a premium digital presence, faster and smarter enquiry handling, or a step-change improvement from a dated website. Clients for whom the quality of their online presence is a commercial priority.

---

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.5 |
| Language | TypeScript (strict) | 5 |
| Styling | Tailwind CSS | 4 |
| Component system | shadcn/ui | 4.7.0 |
| Fonts | Geist Sans / Geist Mono | — |
| Icons | Lucide React | latest |

---

## Deployment — PRIVATE, and it stays private

**The site IS deployed to Vercel.** Recorded 28 July 2026, because nothing in this repository
said so and a Builder session consequently told Carl there was no deployment. **There is no
`vercel.json` and no `.vercel` directory** — the project is linked through the GitHub
integration, so a repo-only check finds nothing. **Do not conclude from the filesystem that
the site is undeployed.**

**⛔ NO OTHER HUMAN HAS SEEN IT, and none will until it is finished.** Carl, 28 July 2026:
*"No other human has seen it. Not till its finished."*

### ⚠ Protection is PARTIAL — measured, not assumed

**Corrected within the hour it was first written.** An earlier version of this section said
the deployment was SSO-protected. **That is true of previews and false of production.**
Measured 28 July 2026:

| URL form | Result |
|---|---|
| `agency-website-v2-awjv-<hash>-c2b-web-design.vercel.app` (preview) | **302** → `vercel.com/sso-api`. Protected |
| `agency-website-v2-awjv.vercel.app` (**production alias**) | **200.** Serves the site. **No authentication** |

**On the Hobby plan, Vercel Authentication covers preview deployments only.** The short alias
— the one anyone would naturally bookmark or paste — is **publicly reachable by anyone who
has it.**

**Carl's position, and it is a reasonable one:** nobody has the URL but him, it is linked from
nowhere, and the practical risk is tiny. *"The risk is miniscule. That be said, someone wins
the lottery every week."*

**So the distinction to hold is unlisted, not private.** They differ only when something
unexpected happens — which is precisely the case that cannot be planned for afterwards.

**What was done in the repo** (`app/robots.ts`, `robots` metadata in `app/layout.tsx`): all
crawlers blocked, plus a `noindex, nofollow` meta tag because some crawlers honour the tag
but not the file. Verified rendering, not assumed.

⚠ **Neither is access control.** A crawler that ignores the standard, or any person with the
link, still reaches the site. **The real control is Vercel → project → Settings → Deployment
Protection, which is Carl's and outside this repository.**

⚠⚠ **REMOVE BOTH BEFORE LAUNCH.** A finished commercial site that blocks crawlers will never
be indexed and will never appear in search. It would look completely correct and no one would
find it — a silent, expensive defect. The warning is repeated in both files.

**Consequences that matter:**

- **Do not share the URL.** The production alias has no login wall to stop anyone.
- **Do not propose disabling deployment protection**, and do not propose enabling it either.
  Publishing is outward-facing and hard to un-see; it requires Carl's explicit instruction,
  never an inference from convenience.
- **An agent cannot fetch the preview.** Authenticated URLs fail `WebFetch`. Any claim about
  what is live must come from Carl or a local run — never from a fetch that "looked fine".

**What it is for.** Not a shop window — Carl's reference surface. *"I stare at it and try to
go thru it to get ideas, inspiration. Instead of listening, i look."*

**Preview URLs are per-build and go stale.** A URL of the form
`agency-website-v2-<hash>-c2b-web-design.vercel.app` is pinned to one deployment and will
show whatever was built at that moment. **Judging colour or timing against a stale preview is
a real risk** — seven commits landed on 28 July alone. Prefer the production alias, which
tracks the latest push.

**For viewing on the TV or phone, local is usually better:** `npm run dev` binds to the LAN
(`http://192.168.0.60:3000` at last check), so any device on the network sees the **current**
build with no login and no deployment lag.

---

## Current Project Stage

**Milestone commit:** 2152e6e — 2026-06-14

**Homepage:** Approved.
- Navbar (Services → Work → About → Contact), Hero (scaffold only — **right-side space intentionally empty; do not fill without a brief**, D-026), Services (D-012), Work/Proof (D-013), Contact/CTA (D-014), Footer.
- CTA links to `/start`. Send/submit backend not yet wired.

**`/start` Enquiry Experience:** Approved — full corridor complete.
- Opening reveal → Q5 → Q4 → Q3 → Q2 → Q1 → Completion ("Understood" handoff).
- Shared corridor architecture: D-023. All five questions approved: D-024.
- Send button position approved. Begin / Next step / Send visibility consistent.
- Mobile opening reveal and corridor: approved.

**Next, when building resumes:**
1. **`/start` Begin button** — unusable for 7.4s. Measured; not the Three.js work. The
   visual sequence must not change. See `live-work/enquiry-opening-timing-reference.md`.
2. **Four-box geometry in Three.js** — current state of the build.

**Future work is deliberately not recorded in this repository.** Carl holds that record
outside it. Do not reconstruct it here or treat its absence as a gap. See
`active-sprints/current-sprint.md`.

---

## AI Workflow

This project operates under a defined multi-agent AI structure. See `/project-intelligence/ai-system/ai-roles.md`.

---

*Last updated: 2026-07-28 — future-work references removed (D-038). Milestone commit 2152e6e; Sprint 2 closed. Building paused since 25 July 2026.*
