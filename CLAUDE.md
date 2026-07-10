# Scinode Dashboard Prototype

## Overview
A no-build HTML prototype for the Scinode platform — an AI-powered execution platform for chemistry, manufacturing, and R&D workflows. Originally a single file; now a **multi-page** app: one full Dashboard page plus one lightweight page per sidebar module, all sharing extracted CSS/JS. Served locally at `localhost:8899` via a Python HTTP server.

## File structure
```
/Users/priyabratadevi/
  assets/
    scinode.css        ← shared design system (tokens, layout, all components) — ~1110 lines
    scinode.js         ← shared SHELL behaviors (loaded in <head> on every page)
    certs/             ← certification logo images
  scinode-day10.html   ← Dashboard (the big, feature-rich page; day states live here)
  manufacturing.html   ┐
  rnd.html             │  module pages — each = shared shell + placeholder <main>,
  products.html        ├  link assets/scinode.css + assets/scinode.js, NO dashboard-
  scira.html           │  specific JS. ~140 lines each. Built out later, one at a time.
  projects.html        │
  requests.html        ┘
  CLAUDE.md
```
- **No build step**: static files served directly. Dashboard's Ecosystem section uses inline React 18 + Babel via `unpkg` CDN (dashboard only).
- **Server**: `python3 -m http.server 8899` from `/Users/priyabratadevi`. Dashboard = `localhost:8899/scinode-day10.html`. Note: `/` shows a directory listing (no `index.html` yet).

## Shared shell (assets/scinode.js)
Global functions used by every page — do NOT redefine these per page:
`toggleSidebar`, `openModal` / `closeModal` / `handleModalBackdropClick` (+ Escape-to-close), `hscroll`, `toggleAccordion`, `toggleCollapsible`, `switchTab`. All are null-safe (no-op if the target element isn't on the page).

## Dashboard-specific JS (inline in scinode-day10.html only)
`switchDay` (day states), `openScira` (hero-coupled), `ecoScroll` + hero showcase carousel, the compliance module (`badge`/`filterCompliance`), the Scinode Secure banner injector (`.secure-mount`), the scinode-art generator + `SCINODE` data, the React Ecosystem app, and the Opportunities engine (`initOpps`, `openDrawer`, …). None of this belongs on module pages.

## Sidebar navigation (shared markup, one active item per page)
- **Workspace**: Dashboard → `scinode-day10.html`, Manufacturing → `manufacturing.html`, R&D → `rnd.html`, Products → `products.html`
- **Intelligence**: Ask Scira → `scira.html`
- **Operations**: Projects → `projects.html`, Requests → `requests.html`
- **Known duplication**: the sidebar + top-nav markup is copy-pasted into all 7 pages. A nav change means touching every page (use a script). Possible future DRY: inject the shell from `scinode.js` via a `<div id="app-shell">` + `data-page` marker so nav lives in one place.

## Day State System (Dashboard only)
`switchDay(n)` toggles visibility of `#day0`/`#day1`/`#day10`/`#day30`. Default is Day 10.
- **Day 0** — Onboarding: empty-state activity cards, "What you can build with Scinode" carousel, **Recommended for You**, ecosystem, **Compliance & Trust**
- **Day 1** — Early usage: 2×2 conversion matrix, recent activity, first requests, suggested next steps
- **Day 10** — Active usage (default): 5-card conversion matrix (47 requests), activity feed, action required, active projects, horizontal scrollers, Scira Intelligence, ecosystem
- **Day 30** — Power user: expanded matrix + spend KPI, spend breakdown, manufacturer scorecards, milestone timeline, network view

## Typography — strict
- **Poppins (600/700)**: ONLY hero headlines and section headers (`.sec-title`, `.sec-eyebrow`, `.modal-title`, `.hero-headline`, `.perf-name`, etc.). `--font-heading: 'Poppins'`.
- **Outfit**: EVERYTHING else — body, card titles/content, KPI labels, badges, buttons, sidebar, nav. `--font: 'Outfit'`. When in doubt, use Outfit; Poppins is reserved for headers only.
- Tokens live in `assets/scinode.css`; the Ecosystem React section has a second inline `<style id="eco-styles">` block.

## Design system
- Load the **`scinode-design-system`** skill before any visual/color/mockup decision — it's the source of truth.
- Colors: Teal `--teal-500:#02968A`, Navy `--navy-500:#043E54`, Sage `#96DDA5`, Gold `#E5D62E`, Indigo `#6366F1`.
- Cards: white surface, **no visible border**, subtle shadow, 12px radius (Stripe/Linear feel).
- Layout: fixed sidebar (220px, collapsible ~56px) + fixed top nav + scrollable `.main`; `.content` provides horizontal gutters.
- Brand logo gradient (`#016358 → #182133`) is **logo-only** per the design system — the ONE exception is the Scinode Secure banner background (applied deliberately at the user's request, with white/sage foreground for legibility).

## Notable Dashboard sections
- **Hero**: dark gradient banner, animated typing search, rotating insight cards.
- **Recommended for You** (Opportunities engine): featured card (headline + one benefit-led `lead` line + "Why this is a good fit" panel + specs + per-category CTA) with a hover-to-preview signal rail (category icons, 120ms delay). Reversible block between `OPPS:start`/`OPPS:end` markers. Featured card hugs its content (no fixed height) with the rail pinning section height.
- **Compliance & Trust**: certification carousel with tabs (All/Factory/Product/Documentation/Regulatory) + a **Scinode Secure** banner above the tabs (5 PRD principles as trust pillars, injected into `.secure-mount` in each day state). Tabs/cards unchanged when editing the banner.
- **Ecosystem Capabilities**: React-rendered R&D + Manufacturing columns.
- **Create Request Modal**: 6-card grid; opened from the top-nav button via shared `openModal()`.

## Conventions & workflow
- **Reversible blocks**: wrap large optional sections in `<!-- X:start -->` / `<!-- X:end -->` comment markers (see `OPPS:`) so they can be removed cleanly.
- **One module per file**: build/edit a module in its own page; it can't break the others. Module pages carry no dashboard JS.
- **Verify in the browser preview** after changes: reload, check the console (no errors), and screenshot. Preview evals race async navigation — after `location.href = …`, re-query once the page settles. Resize to 1280px for a realistic desktop width (native preview viewport can be narrow).
- **Git**: the working tree is `/Users/priyabratadevi`; the git repo is `/Users/priyabratadevi/scinode-dashboard/`. Copy changed/new files into that repo before `git add`/`commit`. Commit each milestone with a descriptive message. **Never push** unless explicitly asked (currently many commits ahead of `origin/main`, intentionally unpushed).
