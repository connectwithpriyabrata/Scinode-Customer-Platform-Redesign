# Scinode Dashboard Prototype

## Overview
A single-file HTML prototype (`scinode-day10.html`) for the Scinode platform dashboard — an AI-powered execution platform for chemistry, manufacturing, and R&D workflows. Served locally at `localhost:8899` via Python HTTP server.

## Architecture
- **Single file**: ~4800 lines of HTML/CSS/JS with inline React (via CDN) for the Ecosystem Capabilities section
- **No build step**: Static HTML served directly; React loaded via `unpkg` CDN (React 18 + Babel standalone)
- **Server**: `python3 -m http.server 8899` (or similar) from `/Users/priyabratadevi`

## Day State System
The dashboard has 4 progressive states toggled via a pill switcher in the top nav:
- **Day 0** — Onboarding: empty-state activity cards, use case carousel ("What you can build with Scinode"), ecosystem capabilities, certifications
- **Day 1** — Early usage: 2x2 conversion matrix, recent activity, first requests, suggested next steps
- **Day 10** — Active usage (default): 5-card conversion matrix (47 requests), activity feed, action required, active projects with progress bars, labs/manufacturers/products horizontal scrollers, Scira Intelligence cards, ecosystem section
- **Day 30** — Power user: expanded conversion matrix with spend KPI ($1.21M), spend breakdown chart, manufacturer performance scorecards (SynLab, ChemWorks, ReactChem), 8 active projects, milestone timeline, network view

Switching is done via `switchDay(n)` which toggles visibility of `#day0`, `#day1`, `#day10`, `#day30` divs.

## Typography
- **Section headers**: Poppins (600/700 weight) — `.sec-title`, `.sec-eyebrow`, `.modal-title`, `.hero-headline`, `.perf-name`, `.spend-total-num`, `.tbl th`, etc.
- **All other text**: Outfit — body copy, card titles, KPI labels, descriptions, badges, buttons, sidebar, nav
- CSS variables: `--font: 'Outfit', sans-serif` and `--font-heading: 'Poppins', sans-serif`
- Note: `--font` is declared in two `:root` blocks (line ~16 and line ~950) — both must be kept in sync

## Design System
- **Colors**: Teal primary (`--teal-500: #02968A`), Navy accents (`--navy-500: #043E54`), Sage/Gold/Indigo for highlights
- **Layout**: Fixed sidebar (220px, collapsible to 56px) + fixed top nav (56px) + scrollable main content
- **Components**: KPI cards, project cards with progress bars, activity cards, action cards, horizontal scroll carousels, accordion/collapsible sections, modal (Create Request), tab filters, step-dot progress indicators, manufacturer performance cards with star ratings

## Key Sections
- **Hero**: Dark gradient banner with animated typing search bar and rotating insight cards (project delivery, market update, R&D milestone)
- **Conversion Matrix**: Pipeline funnel KPIs (Submitted → Conversation → Quote → Converted → Active)
- **Ecosystem Capabilities**: React-rendered R&D + Manufacturing columns with services, technologies, and facilities
- **Scira Intelligence**: AI-generated insight cards with contextual recommendations
- **Create Request Modal**: 6-card grid (R&D, CMO, CDMO, Quote, Sample, Consultation)

## Interactive Features
- Sidebar collapse/expand (`toggleSidebar()`)
- Day state switching (`switchDay()`)
- Horizontal scroll with arrow buttons (`hscroll()`)
- Accordion and collapsible sections (`toggleAccordion()`, `toggleCollapsible()`)
- Modal open/close with backdrop click and Escape key
- Tab filtering on request tables (`switchTab()`)
