# Session Handoff — 19 October 2026, SESSION 2. THE ORNATE CORNERS ON THE HOME PAGE, LIT AND APPROVED (R-084, R-085). THE DEADLINE MEASURED. THE HERO's BEHAVIOUR RAISED. FILM 02 CAPTURED.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.** Replaces 19 October session 1's.

---

## ⛔⛔ NEXT SUBJECT — Carl's to name

Carl's order stands: **Send** → **`/about` §3** → **the hero, last** → mastering; ⛔ deadline **19 November 2026**.
- **Send needs Carl's two purchases first.** Domain chosen in conversation: **`c2bwebdesign.co.uk`** (Hostinger showed it; the
  Builder's advice: buy the domain ALONE + Hostinger **Business Email Starter**, one mailbox with aliases, NO web hosting — the
  site stays on Vercel; the £0 offers are tied to hosting/48-month plans). **Not bought yet.** When Carl has them, the Builder:
  domain → Vercel, a sending service's DNS records, Send's server side (enquiry to Carl + confirmation to the visitor).
- **Open for Carl, undecided** (he: *"You have made a note of it"*): the corners' deadline `N` — options in D-100 (keep 1.5 s;
  raise ~3.5 s; three's `compileAsync`; a smaller studio image). The Builder recommends compileAsync + keep 1.5 s. ⚠ The ~1 s
  first-visit shader-compile freeze lands DURING THE HERO on the reader's path — matters once the hero is WebGL.

## WHAT HAPPENED — all PUSHED

| commit | what | verdict |
|---|---|---|
| `4ec8066` | the structural note **v6 FINAL** — reviews 3–5 folded in; Carl closed the rounds (*"until the cows come home"*) | — |
| `8b7b3c3` | **the corners ON THE PAGE**: `corner-frame.tsx` (SSR'd), `corner-canvas.tsx` (`ssr:false`), `corner-material.ts` (one copy, the bench reads it); the border `border-transparent`; a gold #a17b43 / blue #3F6DB8 1-px **fallback** wherever the corners cannot draw (no JS / no WebGL / lost context / deadline), one-way, canvas unmounted; the sequence at the **Q&A card entrance's timing, NOT linked** (2000 ms, 28% in, cubic ease-out) | **R-084** *"Looks great. Approved."* |
| `a9a886d` | **pass 3, the light**: the studio drifts ±20°/±10° over 12 s (the pieces never move); §3's studio ×2 (blue/gold 0.91); the button's `Ticker` reused | **R-085** *"They are not simply there, thet are doing something. Approved."* |
| `39e5b5e` | D-098: the hero's behaviour raised; D-100: `N` measured on production; `working-with-carl.md`: Zarathustra + Clair de Lune's arpeggio | records |
| `30b25ff` | **film 02** assembled at `Videos/C2B Films/02 Ornate corners/` (bins, 74 files, shot list, subtitle draft; the "before" STAGED) | records |
| this commit | this handoff; D-098: film 3 = the hero | records |

## THE HERO — raised today, NOTHING CHOSEN (D-098)

The logo **leans** in the background → **notices** the visitor → **jumps up** → **adjusts its attire** → **waddles** forward on
the c and the b (*"almost like a penguin"*) → stops → the **edge wipe** (a third-party Fusion plug-in — name not yet given; the
precursor) → the **burst** out of the screen (the event; cracks one idea) → the code logo live on the right. ⛔ **The method is
the Builder's** (Carl: *"Im more concerned with the outcome than i am the method"*); the bar: **ONE MODEL in both worlds, an exact
hand-off**. In-joke: ***"There is no spoon"***, found by the logo's own light. Music: *Clair de Lune* with its arpeggio, not
Beethoven's Fifth / Zarathustra. **Film 3 = the hero's construction — capture from STEP ONE.** D-026's guard stands until the hero
is the chunk.

## OPEN — with owners

- The domain + mailbox — **Carl**. Then Send — Builder.
- `N` / compileAsync — **Carl** (D-100).
- The plug-in's name — **Carl** (D-098).
- Phones — mastering (D-094; Carl: *"Phone is left for mastering"*).
- `scripting: none` verified in CHROMIUM only; other browsers unchecked.

## ⚠ STANDING / LESSONS FROM 19 OCTOBER (SESSION 2)

- ⛔ **The scope is OPEN** (Carl: *"Keep open until i ask you to lock and test."*). `chunk-scope.json` `files` now also holds
  `app/globals.css`, `components/home/corner-{frame,canvas}.tsx`, `corner-material.ts`, `ai-system/working-with-carl.md`;
  `app/page.tsx` unlocked. Do NOT lock without his word.
- **Pre-review rounds have an end** — say when findings are down to wording. **Never stretch Carl's words** past what he said
  (caught twice by the reviews: "accepted by Carl's ruling", "the gap is fine").
- **Capture a filmed build from its first step** (film 02 began late; two takes survive as stills). Ask early if a build is a
  §3 example.
- **Outcome over method** (new memory); **ask better** (Carl's client line — offer it as *"we'll show you how"*, not a correction).
- Instruments: the WebGL hook missed the shader stall (it lands in `getProgramInfoLog`) — a CPU profile found it. The site
  header is not a `<header>` element; select nav links by `href`.
- Lint baseline **1 error, 0 warnings**; `tsc` clean. **Servers STOPPED** (:3000, :3100 free).

---

*Written 19 October 2026, end of session 2. Replaces session 1's.*
