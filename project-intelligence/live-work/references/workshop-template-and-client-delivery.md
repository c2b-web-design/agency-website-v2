# The Workshop Model — Template, Client Workspaces, and What Ships

**Captured:** 30 July 2026
**Status:** Working reference. **Not a plan and grants no implementation authority.**
**Applies:** at site completion. **Nothing here is to be built now.**
**Purpose:** carry Carl's stated intent for separating his permanent working environment from
deliverable site code, the reason `.gitignore` cannot achieve it, and the questions still open.

**Code state at capture:** commit `f2d774a`, `main` clean, 144 commits.

---

## Carl's metaphor — read this first, because the whole design follows from it

**The template is a workshop.** Permanent, and the thing you work *in*.

> *"Site code, whether that be ours or a client's, must be packaged, shipped out the door and
> our workshop is free to work in again."*

And on concurrency, which is what fixes the design:

> *"If we get a second client while still working on the first, it's the equivalent of me
> getting on the phone to the relevant people and saying 'you see that land next to my
> workshop? Build an identical workshop for me.'"*

**Three consequences, all load-bearing:**

1. **Workshops are unlimited and cheap.** Copying is the mechanism working as intended, not a
   compromise.
2. **They run in parallel.** Client A's workshop stays open while B's is built. No queue.
3. **Each is complete and shares nothing.** Two full workshops, not one workshop with two
   benches. **Nothing can leak between them because nothing is shared.**

**The blueprint workshop is never worked in.** It is copied. It is the blueprint that happens
also to be a building.

### Always empty, always upgraded

Carl, on the second client:

> *"Our template always stays empty, but we keep it upgraded and optimal. Second client comes,
> people come saying 'another workshop?' 'Yes, but here's the upgraded plans.'"*

**Two properties held at once, and they are not in tension — the first is what makes the second
possible:**

- **Always empty.** No site code ever accumulates in it, because all building happens in copies.
- **Always upgraded.** The tools are maintained *there*, so each new workshop is built to the
  current plans rather than the plans of the first job.

**Because it stays empty, upgrading it is safe** — there is no client work in it to disturb, and
no risk of one client's site influencing another's. **Emptiness is the precondition for
maintainability, not merely tidiness.**

**On "here's the architect's drawings, the materials":** in git terms the drawings **are** the
workshop. Copying the repo brings tools and methodology across together; there is nothing
separate to hand over, and **the plans cannot drift from the building because they are the same
artefact.**

---

## The rule that decides what stays: tools versus what you made

Carl's own division, and it settles most of the file-by-file question without further input:

> *"All the stuff that went into making my site's buttons, CTA, rail system, hero section, all
> of that code — gone. What remains are the tools, ethos files, methodology etc. That's our
> workspace, our workshop."*

**A workshop keeps its tools. It does not keep the furniture built with them.**

Config is a **tool**, not site code — this is what the word "tools" resolves. `package.json`,
`tsconfig.json`, `eslint.config.mjs` are the bench and the jig.

### Mapped against the repo at capture

| Stays — tools | Goes — what was made |
|---|---|
| `project-intelligence/` (ethos, methodology, protocols) | `app/page.tsx` |
| `CLAUDE.md`, `AGENTS.md` | `app/start/page.tsx` |
| `.claude/` (hooks, settings) | `components/enquiry/` — all four files |
| `package.json`, `tsconfig.json`, `next.config.ts` | `components/layout/site-header.tsx` |
| `eslint.config.mjs`, `postcss.config.mjs`, `components.json` | `brand-assets/` — 32 C2B files |
| `lib/utils.ts` | |
| `components/ui/button.tsx` — shadcn, not authored | |
| `components/layout/container.tsx` — generic | |

**Two files do not resolve under the rule. Both are tools welded to this site.** See Open
Questions 1 and 2.

---

## ⚠ Why `.gitignore` cannot do this job — and why it looks like it can

**Carl's initial hypothesis was that `.gitignore` is the solution. It is not, and the way it
fails is the dangerous kind: silently, while appearing to have worked.**

**A git repo is two independent things.** The **working tree** — files on disk, what `ls`
shows. The **history** — every version of every file ever committed, in `.git/`. Deleting a
file from the working tree does not remove it from history. **The history is the repo**;
`clone` copies the history and reconstructs a working tree from its latest state.

**`.gitignore` controls what is added in future. It has no effect on what is already
committed.**

**Measured in this repo at capture:**

| | |
|---|---:|
| Total commits | **144** |
| Commits touching `project-intelligence/` | **83** |
| First such commit | `6243da4` — near project start |

**So:** adding `project-intelligence/` to `.gitignore`, deleting the folder, committing, and
cloning that repo delivers **all 83 commits containing every version of those files.** `git
log`, `git show`, and the GitHub UI expose them immediately. The working tree looks clean.

**And a clone-of-a-clone inherits history by default**, so the originally-planned
clone-then-clone approach carries it twice.

**The DAW parallel Carl's method suggests:** the working tree is the current mixdown; the
history is the project file with every take ever recorded. Mute a take and it is not in the
bounce — it is still in the session. Hand over the session and it is unmuted. `.gitignore`
says *"do not record new takes from this input"*; it says nothing about the 83 already on the
timeline.

### Where `.gitignore` does belong

**As a convenience, never as the protection.** In a workshop it can keep client paths
structurally separate so the extraction boundary is visible *while working* rather than
reconstructed at the end. ⚠ **Never let a `.gitignore` entry stand in for a fresh
`git init`.**

---

## The structure

**Direction settled 30 July 2026 — Question 3.** This repo becomes the workshop; the C2B site
code is extracted out into a new repo of its own.

```
THIS REPO (144 commits) --extract site code--> NEW C2B SITE REPO, fresh init
        |                                      (live site, proof piece, deployed)
        |  what remains, keeping the 144 commits
        v
BLUEPRINT WORKSHOP — permanent. Tools, ethos, project-intelligence, methodology.
                     No site code, C2B's or a client's. ALWAYS EMPTY. Never worked in.
                     Kept upgraded and optimal. Copied.
        |
        +-- copy --> CLIENT A WORKSHOP --+-- extract site code --> DELIVERED REPO
        |                                +-- archive whole workshop --> PC client folder
        |
        +-- copy --> CLIENT B WORKSHOP --+-- extract site code --> DELIVERED REPO
                                         +-- archive whole workshop --> PC client folder
```

**Copying is safe wherever nothing is meant to be left behind** — blueprint to workshop
qualifies, because the blueprint contains only what a workshop should have.

⚠ **Copying is unsafe at every boundary where content must be dropped.** Those boundaries
need a fresh `git init`, not a clone.

### ⚠ The blueprint workshop must not be a clone of this repo

**If it is, contamination enters at the top and propagates to every client.** Each workshop is
a copy of the blueprint; whatever history the blueprint has, every workshop has — including
all 83 `project-intelligence/` commits and the site code just removed. **Tier 3 then becomes
unreachable safely, because the defect was introduced at tier 1.**

The blueprint starts from a fresh `git init`. Files are copied in by hand; commit 1 is the
blueprint itself.

---

## Delivery is extraction, not purging — and that is the safer direction

**Carl's model, and it is better than purging:**

> *"At the end of that, strip out the client's code for their website. Save what's left into a
> client file on my PC."*

**The workshop is never destroyed or cleaned. The client's code is copied out; the workshop is
archived intact.**

**Why this matters beyond tidiness — the failure modes are opposite:**

| | Purge a clone | Extract into a fresh repo |
|---|---|---|
| Proves | a negative — nothing was missed | a positive — the site builds and runs |
| Verified by | auditing absence | **building it** |
| A mistake | ships silently; nothing breaks | breaks the build immediately |
| Discovered by | a developer the client hires, later | **you, at once** |

⚠ **A missed path in a purge changes nothing visible.** The build works, the site deploys, and
years later someone runs `git log`. **A missed file in an extraction breaks the build, costs
minutes, and is free.** Same class of protection; the choice is which direction a mistake
points.

**The archived workshop is also an asset** — the record of how that site was built, and where
to go if the client returns.

---

## Tool maintenance — resolved, and recorded because the reasoning is not obvious

**The concern raised:** version-pinned tools decay silently. `package-lock.json` freezes an
exact dependency tree, security state included. A blueprint built now and used in eight months
starts a client on a stale stack.

**Carl's answer:** *"Then we update the tool, do whatever it takes to keep the chisel sharp."*

**With concurrency, that fully resolves it, and turns the pinning from a liability into a
feature:**

- **Sharpening happens in the blueprint.** One toolset maintained; every workshop built after
  inherits sharp tools.
- **A shipped workshop keeps the tools it was built with.** A client's site was built and
  tested against that exact tree. **Freezing it is correct, not decay.**
- **You do not re-sharpen a workshop that has already shipped.**

**Staleness is not decay to be prevented everywhere. It is a point-in-time snapshot per
client, plus one maintained blueprint.**

---

## Open questions — record only. No answer is implied by its placement here.

⚠ **Carl declined to settle these, deliberately:** *"we need understanding before we bake stuff
in, even a reminder."* **A note is a claim a future session acts on, and it will be read as
settled.** None of these is settled. Reasoning is recorded so it is not re-derived.

### 1. `app/globals.css` — one file containing both

**2,012 lines; 266 mention `enquiry`.** The first ~50 lines are `@theme` tokens and shadcn
variables — tool. Below sits the corridor's entire visual language: glass material, filament
borders, memory rail, button materials, timing contracts.

**Not two files that were merged** — the site's CSS grew inside the tool's CSS, which is normal
for Tailwind. **There is no clean cut line; it is a read-through.**

⚠ **This is the concrete cost of extraction, and it grows** — the orbiting-light work will add
to this file. A known cost, not a surprise.

### 2. `verify/` — nine scripts; six are welded to this site

`README.md`, `screenshot.mjs`, `responsive.mjs` are general purpose. `q5-stutter.mjs`,
`field-colour.mjs`, `field-displays.mjs`, `field-entrance-timing.mjs`, `begin-timing.mjs`,
`opening-trace.mjs` navigate to `/start`, press Begin, and measure the Q5 reveal.

**By the tools rule they stay — but they would measure a page that does not exist.** ⚠ **A
broken tool in a workshop is worse than an absent one, because it looks usable.**

**What is worth preserving is the harness pattern**, not the scripts: the Playwright setup, the
cold-load technique, the frame-gap measurement method. The selectors are site-specific.

**Deferring this is actively better** — the orbiting-light work will add to the harness, so the
answer may look different afterwards.

### 3. Which side inherits this repo's 144 commits — DECIDED 30 July 2026

**Carl's decision:** *"We take out our site code and put it in a new repo. What remains will be
the template/workshop."*

**This repo becomes the workshop. The C2B site code is extracted out to a new repo.**

**Why this is the right way round:** the workshop is the thing with continuity. It holds the 83
commits of methodology, the decisions, and the corrections that produced the system — the
history actually worth consulting later. The site is output; output ships. **Extracting the
site preserves the history you would want.**

⚠ **The one consequence, and it remains open** — see Question 3a.

### 3a. ⚠ The C2B site's source stays in the workshop's history — accept, or act?

**Follows directly from the decision in Question 3, and is the last structural point.**

Because this repo becomes the workshop, **it keeps all 144 commits — including every version of
the site code removed from the working tree**: `app/page.tsx`, the enquiry corridor, the glass,
the filament, `brand-assets/`. Every client workshop is a copy, so **every client workshop
carries the C2B site's source in its history.**

**Two things this is NOT, both checked:**

1. **Not a client-exposure risk.** Delivery is extraction into a fresh repo (see "Delivery is
   extraction"), so nothing from any workshop's history reaches a client. **That protection
   holds regardless of how this is answered.**
2. **Not ongoing accumulation.** Client work happens in *copies*, which are archived to Carl's
   PC. The workshop's history only ever grows by what is committed *in the workshop*. **This is
   a one-time inheritance of the C2B site, and it does not grow with each client.**

**So the question is narrow: is the C2B site's source acceptable, permanently, in the history of
every workshop?**

| Route | Keeps methodology history | Risk |
|---|---|---|
| **Accept it** | yes | none — inert, invisible, never delivered, does not grow |
| Fresh-init the workshop too | **no — loses the 83 commits** | none, but discards the thing Question 3 chose to preserve |
| Purge site paths from history | yes | ⚠ the silent-failure mode, **on the one repo copied everywhere** |

**DECIDED 30 July 2026 — Carl accepts it.**

### ⚠ Two beliefs to correct, because they would fail if the risk were real

**Carl accepted this reasoning that some *"shavings"* might be exposed, and that partial
exposure is survivable: *"If they got part of the picture? Acceptable... Good luck putting all
that together from partial files."* The conclusion is right. The reasoning is not, and it must
not be inherited.**

**1. Git history does not leak fragments. It preserves complete files at every version.**
`git log --all -- project-intelligence/` returns **every complete file in every state it ever
had** — `working-with-carl.md` in full, all 42 decisions, the protocols — plus commit messages
explaining each change. **More complete than the working tree**, since it includes superseded
versions. **Nothing would be partial**, so a mitigation resting on partiality provides nothing.

**2. The traditional-developer-versus-AI-developer distinction does not hold.** `git log` is not
an AI tool; it is among the first things any developer learns. **Assume full fluency.**

### Why the decision is nonetheless correct — the exposure is zero, not small

**Nothing from any workshop's history reaches a client, partially or otherwise.** The delivered
repo is a **fresh `git init`** holding only their site code: no ancestry, no parent commits, no
connection to any workshop. **There is nothing to run `git log` against**, because the history
was never copied into the repo the client has.

**The DAW parallel:** the client receives a bounced stereo file. Not a session with tracks
muted — **a WAV.** No take history, no plugin chain, nothing to unmute.

**So this is not a security trade-off; it is housekeeping.** The 144 commits sit in Carl's own
workshop and his own archived client workspaces, all on his machine. *"Fine, leave it"* is a
legitimate answer to a housekeeping question. **It would not be a legitimate answer to an
exposure question — and the point is that this is not one.**

### ⚠ Where the real trade-secret risk lives instead

**Not history — the extraction step.** A file copied across by mistake on delivery day **is**
delivered, in full, in the client's first commit. No `git log` needed.

**That is the failure mode worth a check**, and the extraction model already makes it loud:
verify by building, **and inspect what is in that first commit before it leaves.**

---

## The goal in one sentence, and how to verify it on GitHub

**Carl:** *"All I want a client to get is the .wav file."*

**Where the uncertainty was, and it is the right place to be uncertain:** how this works with
GitHub. ⚠ **GitHub has no concept of "publish only the current state."** Pushing a repo uploads
whatever history that repo has. There is no setting, export option or privacy toggle that trims
it. **The cleanliness comes entirely from the fresh `git init`** — a repo with no ancestry has
none to upload.

### The .wav test — run it before the client's repo is pushed anywhere

```
git log --oneline
```

**It must print exactly one line.** One commit, no parents.

**One commit is a bounce. Many commits is a session file.** If it prints more than one line,
something was cloned rather than initialised — **stop, and start the delivery repo again.**

⚠ **The two mistakes that silently undo this:**

1. **Never `git clone` a workshop to create a delivery repo.** It copies the history.
2. **Never add a workshop as a remote to a delivery repo.** It re-attaches the history.

**Copy files; init fresh.**

**Carl's metaphor for this, unprompted, and it names the trade honestly:** a workshop built to
the plans, arriving with the previous job's offcuts already in the loft. Inert, unseen, and
there in every copy.

**One strength of the repo-copy approach, from the same metaphor** — *"here's the architect's
drawings, the materials."* In git terms the drawings **are** the workshop; there is nothing
separate to hand over. **The plans cannot drift from the building, because they are the same
artefact.**

### 4. `decisions.md` and `review-log.md` — filtered, or newly authored?

**42 decisions, three kinds, and the third is why "keep or delete" is too blunt:**

1. **Method** — D-006 (files canonical, not chat), D-035 (mastering pass), D-036 (only Carl
   approves), D-038 (future work outside the repo). **Permanent. The workshop's point.**
2. **This site's design** — D-028 glass, D-029 filament, D-031/D-032 amber reflection. **One
   specific site.**
3. **Permanent technical lessons discovered while doing (2)** — per-channel `calc()` in legacy
   `rgba()` silently fails; measure before accepting a hypothesis (the Q5 stutter, where every
   GPU-aimed check came back clean and the cost was Three.js CPU init).

⚠ **The risk is not keeping noise. It is discarding a hard-won lesson because it is filed
beside the design work that produced it.** Deleting a design decision is cheap — this repo
keeps it. **Losing a lesson that cost two days is not.**

**So the useful question may not be "which entries survive" but "does the workshop's decisions
file have the same shape as this one?"** A record of *this site's* decisions and a record of
*patterns and lessons* may want to be different files rather than one file filtered.

**Note on authority:** `context-rules.md` forbids retroactive rewriting — DEPRECATED, never
deleted. **The workshop is not this repo, so that rule does not bind it**, but the instinct
does. In the workshop this is **authoring a new file that draws on the old**, not editing
history. Which matches Carl: *"certain other files may have to be re-written or amended so
that I can build sites for others."*

### 5. `brand-assets/` in a workshop — a working preference, not a safety question

**32 C2B files. They never reach a client** — delivery is extraction, and they are not part of
any client's site code. **So exposure is not the issue.**

**For:** they are the visual standard — the gold sampling that produced `#f2bf61`, the
transition studies, the origins. Reference for judging quality.
**Against:** another brand's identity sitting in a workshop where someone else's site is being
built. The risk is **the wrong asset used by accident**, reaching a client's staging build.

---

## What this changes about current work

**Nothing.** It does not touch the orbiting light and authorises no change.

**One thing is worth knowing while building:** the more entangled the C2B site becomes with
reusable scaffolding, the harder the extraction — `globals.css` being the live example. **Not
a reason to change anything now. It is the reason this record exists now** rather than at
completion.
