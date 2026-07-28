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
