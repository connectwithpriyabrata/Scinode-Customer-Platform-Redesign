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
`switchDay` (day states), `openScira` (hero-coupled), `ecoScroll` + hero showcase carousel, the compliance module (`badge`/`filterCompliance`), the Scinode Secure banner injector (`.secure-mount`), the Trust Center modal (`openTrustCenter`/`closeTrustCenterModal`), the scinode-art generator + `SCINODE` data, the React Ecosystem app, the Opportunities engine (`initOpps`, `openDrawer`, …), and the hero background — a p5.js (CDN, loaded in `<head>`) molecule/node network canvas layered behind `.hero-card` content via `#hero-p5-layer`. Instance-mode sketch; particle count scales with container area; `ResizeObserver` on the host (not `window.resize`) keeps it correct across viewport resize *and* sidebar collapse/expand; respects `prefers-reduced-motion` (including live toggling). None of this belongs on module pages.

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
- Colors: Teal `--teal-500:#02968A`, Navy `--navy-500:#033243`, Sage `#96DDA5`, Gold `#E5D62E`, Indigo `#6366F1`.
- Cards: white surface, **no visible border**, use `--shadow-card`/`--shadow-hero`/`--shadow-nested` for separation, `--radius-lg` (16px) for primary cards (Stripe/Linear feel). Radius scale: `--radius-xs` 6px / `--radius-sm` 8px / `--radius-md` 12px / `--radius-lg` 16px / `--radius-full` 999px.
- Layout: fixed sidebar (220px, collapsible ~56px) + fixed top nav + scrollable `.main`; `.content` provides horizontal gutters.
- Brand gradient (`--gradient`, `#016358 → #182133`) may be used on any dark surface where navy would otherwise be flat fill (hero banners, feature cards, dark section banners like the Scinode Secure banner) — not on small elements (badges/icons) or thin chrome (top nav, sidebar).

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

## Users & Access module (User & Access Management)
Customer-facing Users & Access center + a stakeholder blueprint, built from the 4 PRD/spec PDFs (Consolidated PRD = canonical for data/rules, Design Spec Part 1 = canonical for UI). Sidebar section **Organization** (added to every page): Users & Access → `users-access.html`. `access-blueprint.html` is a standalone stakeholder page, deliberately NOT in the sidebar — reached from the presenter bar's "Blueprint" link (and directly by URL).
- **Files**: `assets/ua/` — `ua.css` (all `ua-`/`ub` styles), `ua-core.js` (seeds, state, `UA.access` effective-permission rule, `UA.capacity` Free/Premium checks, `UA.footprint` cross-platform lookup, modal/drawer/menu/toast primitives), `ua-views.js` (5 tab renderers), `ua-flows.js` (member/team drawers, Add New User, Create Team, upgrade popups + intent capture, approvals, Superadmin transfer, in-module Org Activity preview), `ua-app.js` (bootstrap + presenter bar), `bp.css` + `bp.js` (blueprint page), `ua-embed.js` (standalone Org Activity card for module pages — see below).
- **Presenter bar** (bottom of users-access.html): View as Role (Superadmin/Admin/Member) × Platform (Scinode / for Manufacturers / for Researchers / Deep Research) × that platform's own Plan (Free/Premium) × Stage (Day 0/Day 1), plus scenario jump, in-module preview, reset. Deep links: `users-access.html?role=&plan=&day=&platform=&tab=&open=preview|upgrade`.
- **Plan/Stage are per-platform, not global** (Organization Subscription is one per Company × Platform per the PRD's DB model): `UA.db.plan`/`UA.db.day` belong to whichever platform is on screen, each cached independently in `UA.cache[platform]` and seeded with its own default via `UA.PLATFORM_DEFAULTS` (Scinode + Scinode for Manufacturers start Premium/Day 1, Scinode for Researchers Free/Day 1, Deep Research Free/Day 0) — switching the Platform selector alone already demonstrates independent access with no other click. `UA.setPlanDay(which, val)` re-seeds only the current platform; `UA.setState({plan, day, ...})` still works unchanged (routes plan/day through `setPlanDay`).
- **One identity, many platforms** (PRD §4): the Company (`UA.ORG`) is one shared object across every platform's dataset; a person's name/email is consistent everywhere, but role/Team/permission are independent per platform. The Member drawer's **"Across platforms"** section (`UA.footprint(id)`, skipped for `id==='me'` since that's a "View as" simulation lens, not a fixed identity) shows a person's membership on all 4 platforms side by side with a **View here** jump (`UA.jumpTo`) — the live realization of the PRD's worked example table.
- **Rules encoded**: 3 platform roles; Free = 1 Superadmin + 2 Members + 0 Teams; Members never invite; Admin needs a Team and can't create Teams/invite Admins; effective permission = Team enabled AND user permission; Create Team CTA stays clickable on Free (opens upgrade popup); approvals change permission only, never role/Team; sent invites reserve a seat (assumption). Conflicts between the docs are listed (with the prototype's assumption) in `access-blueprint.html#s-open` — update that list when Product answers.
- Data is in-memory per platform (no persistence); Admin on Free renders an explanatory "not available" state by design.
- **Org Activity embedded in real modules** (Design Spec §6/§6.1/§6.2 — "every applicable module" rule): `assets/ua/ua-embed.js` is a second, self-contained entry point (depends only on `ua-core.js`, never `ua-views.js`/`ua-flows.js`) that renders a live Org Activity / My Activity / Request to View / Upgrade to Use card with its own mini role-switcher. Mounted via `UAEmbed.mount(mountId, moduleKey, title)` in [market-pulse.html](market-pulse.html) (`market_pulse`), [requests.html](requests.html) (`requests`), and [projects.html](projects.html) (`projects`) — deliberately **not** in `manufacturing.html`/`rnd.html`/`products.html` per explicit scope decision. All three always run as the Scinode platform.

## Scenario flows (auth-flows.html / invite-flows.html)
Clones of `auth.html` / `invite.html` (originals untouched) driven by the 7 states in "Scinode Sign Up: Flow and Design States". Shared engine `assets/flows/flows.js` + `flows.css` renders a bottom scenario bar (Scenario dropdown · Platform · Email domain · journey tracker with Back/Next + Approve/Reject fork · caption). Scenarios 1–5 live in auth-flows, 6–7 in invite-flows; picking one from the other page navigates there. Each page has an adapter (`Flows.init({page, apply, go, detect, source})`) at the end of the file mapping step keys → existing screen functions; screen functions are wrapped to call `Flows.sync()` so in-screen clicks move the tracker. The old devbar is kept as "Edge states" (hidden until toggled; its Platform group is hidden). Deep links: `?s=<1-7>&p=<atoms|ions|customers|deepresearch>&d=<domain>&step=<key>`.
