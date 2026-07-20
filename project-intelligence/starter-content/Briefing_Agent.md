# Briefing: c2b Design System — For External Agents

## What This Is

This project was created in **Claude Design** — a tool built by Anthropic that lets Claude generate and manage design systems, UI kits, HTML prototypes, and visual assets inside a browser-based workspace. Think of it as a living design file that Claude can read, write, and update.

This specific project is the **c2b Web Design design system** — a set of brand guidelines, CSS tokens, visual component previews, and a full UI kit for the c2b web design agency.

---

## What Files Exist & What They Do

```
README.md                  ← Full brand guidelines (colors, type, voice, visual rules)
SKILL.md                   ← Agent skill definition for invoking this system
colors_and_type.css        ← All CSS design tokens (copy into any project)

assets/
  logo-gold-black.png      ← Primary logo: gold 3D mark on black
  logo-teal-white.png      ← Secondary logo: teal gradient on white
  logo-gold-dark.png       ← Horizontal logo: gold mark on dark

preview/                   ← Visual reference cards (HTML files)
  colors-brand.html        ← Gold & black palette swatches
  colors-teal.html         ← Teal & navy palette swatches
  colors-semantic.html     ← Semantic token roles
  type-scale.html          ← Full typography scale
  type-styles.html         ← Display, body, tagline specimens
  spacing-tokens.html      ← Spacing scale + border radius
  shadow-system.html       ← Shadow & glow elevation system
  button-components.html   ← Button variants
  card-components.html     ← Card variants
  nav-component.html       ← Navigation bar
  form-components.html     ← Form inputs

ui_kits/website/
  index.html               ← Full interactive agency homepage prototype
  Header.jsx               ← Nav component
  Hero.jsx                 ← Hero section
  Services.jsx             ← Services grid
  Portfolio.jsx            ← Portfolio grid
  Footer.jsx               ← Footer
```

---

## Key Brand Rules (Quick Reference)

* **Primary palette:** Gold (`#C9973A`, `#F5D060`) on near-black (`#0B0B0B`)
* **Secondary palette:** Teal (`#00C9D4`, `#0097A7`) to navy (`#1E5F8A`) on white
* **Display font:** Montserrat (Bold–Black), wide letter-spacing
* **Body font:** Nunito Sans (Regular–SemiBold)
* **Tagline format:** `Modern | High Quality | Professional`
* **Tone:** Professional, confident, no emoji, Title Case headlines
* **Buttons:** Pill shape (`border-radius: 999px`), gold gradient primary
* **Cards:** Dark `#1C1C1C` with gold `rgba(201,151,58,0.2)` border + glow on hover
* **Decorative accent:** 4-pointed star `✦` used as section ornament

Full details in `README.md`. All exact CSS values in `colors_and_type.css`.

---

## How to Use This System (Forward Process)

When building new designs, mocks, or UI for c2b:

1. Read `README.md` for brand rules
2. Import `colors_and_type.css` or copy the CSS variables into your project
3. Copy logo assets from `assets/`
4. Reference `ui_kits/website/` components for layout patterns
5. Follow the visual rules: dark-first, gold accents, Montserrat headings

---

## The Reverse Process (Updating From a Built Site)

If the c2b website has already been built (or partially built) in code, this design system can be **updated to reflect the real site** rather than the other way around. Here's how:

### Step 1 — Share the codebase

In Claude Design, use the **Import menu** to link:

* A local folder (VS Code project)
* A GitHub repository
* Or paste key files directly (CSS, Tailwind config, component files)

### Step 2 — What Claude Design reads

It will look for:

* `globals.css` / `tailwind.config.js` / CSS custom properties — to extract exact color tokens
* Font imports (Google Fonts links, `@font-face` declarations) — to confirm typefaces
* Component files — to understand actual spacing, radius, shadow values used
* Page screenshots — as visual confirmation

### Step 3 — What gets updated

Claude Design regenerates:

* `colors_and_type.css` — with your *actual* production values
* All `preview/` cards — showing real swatches and specimens
* `ui_kits/website/` components — pixel-matched to the real site
* `README.md` — updated with accurate visual foundations

### Step 4 — Result

The design system now mirrors the live codebase exactly — so any future mocks, proposals, or design explorations are automatically on-brand.

---

## How to Brief Claude Design

If you are advising on a task that requires visual output (a new page, a component, a proposal deck), you can instruct a Claude Design session like this:

> "Use the c2b design system. Read README.md for brand rules and colors_and_type.css for tokens. Build [X] following those guidelines."

Claude Design will produce HTML files that can be previewed in browser, exported as ZIP, or used as reference for production code.

---

## File Formats

* `.css` — standard CSS, works in any project
* `.jsx` — React/JSX components (Babel-transpiled, not TypeScript)
* `.html` — standalone browser previews, no build step needed
* `.png` — logo assets, standard raster images
* `README.md` / `SKILL.md` — plain Markdown, readable by any agent

