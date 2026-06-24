# Dashboard Changes — Implementation Plan

> Source: `Dashboard changes.pdf` + Scinode Customer Product Philosophy.
> Target file: `scinode-day10.html` (single static file; React via CDN only for the ecosystem section).
> Decisions approved in `implementation plan v1.pdf`. **Phase 1 in progress.**

---

## Approved decisions (v1)

1. **Hero + case studies** — keep the carousel on **all** dashboard states (globally visible). Expand 3 → 8–10 slides, remove dead CTAs, fix hardcoded total + dots, keep the component reusable. *(Resolves open decision #1: all states.)*
2. **Images** — **no gray placeholders.** Use relevant temporary stock-style images: pharma manufacturing, chemistry labs, bioprocessing, manufacturing facilities, scientists/R&D, process scale-up, regulated manufacturing, quality & compliance. *(Resolves #2: real temporary assets.)*
3. **Recommendations** — for this phase: remove partner/supplier terminology, **preserve the existing recommendation structure**, do **not** build a dedicated recommendations module yet. *(Resolves #3: terminology only.)*
4. **Notifications** — **no changes** this stage; retain current notification UI. Requirements later. *(Resolves #4.)*

### Phased implementation order (commit each phase separately; do not modify unrelated components)
- **Phase 1 — Global terminology cleanup + Service section updates** ✅ done (`5968d38`)
- **Phase 2 — Day 0 activity redesign (Popular Searches + Scira activity cards)** ✅ done
- **Phase 3 — Hero & case-study expansion** ✅ done
- **Phase 4 — Compliance section redesign** ✅ done

**Phase 4 notes:** Day 0 "Built for Regulated Chemistry" (6 plain cert cards) → dedicated **"Compliance & Certifications"** module: **30 items** across Factory (8) / Product (7) / Documentation (8) / Regulatory (7), JS-rendered from a data array into `#compliance-scroll`. Each `.cmp-card` = a category-colored **seal emblem** (abbreviation + category icon) + name + category label. Category **filter tabs** (All + 4) via `filterCompliance()`; **chevron** horizontal scroll via `hscroll('compliance',±1)`. Images: seal emblems are deliberate temporary visuals (real trademarked cert logos can be dropped in later) — no gray placeholders. *Scope:* Day 0 only (per PDF); the collapsed copies in Day 1/Day 10 still show the old 6 cert cards — can be propagated on request.

**Phase 4 card redesign (Figma `91:228`):** replaced the vertical seal cards with the Figma card — horizontal **logo (41×42) + title (15px) / subtitle (12px) + teal verified circle-check**, white card, `#e4e4e7` border, 8px radius, 16px padding, 272px wide. Data restructured to `{t,s,c,k,img}`. **GMP uses the real logo** downloaded from the Figma asset (`assets/certs/gmp.png`); the other 29 use generated category-colored seal-badge SVGs (`badge()`), swappable for real logo images via the `img` field. Filter tabs + chevron scroll unchanged.

**Phase 3 notes:** hero showcase carousel expanded **3 → 8 educational case studies** (API scale-up, process optimization, specialty chemicals, nutraceutical mfg, cosmetic formulation, bioprocessing, quality & compliance, tech transfer). Removed the dead `.showcase-arrow` CTAs. Carousel JS now derives `total` from `track.children.length` and **generates the dots dynamically** (was hardcoded `total=3` + 3 hardcoded `.cdot`s) — reusable for any slide count. Images: relevant temporary Unsplash stock photos (reused IDs already proven to load in the file). Hero stays in the shared region → global on all day states (per v1 decision).

**Phase 2 notes:** Day 0 "Your Activity" went 4 cards → 2. Card 1 `.act-searches` = "Popular Searches Today" CSS marquee of `.search-chip`s (pause-on-hover, seamless via duplicated set). Card 2 `.act-scira` reuses the `.act-card.view-all` dark card + "Ask Scira" CTA. New `openScira(query)` global routes every chip + CTA to the hero search (Philosophy §4). Existing `.activity-grid` / card styles / spacing reused — no new card system.

**Phase 2 refinement (balance):** rebalanced 75/25 → **60/40** (`.activity-grid-2{grid-template-columns:3fr 2fr}`). Left card density raised to **two marquee rows** scrolling opposite directions (kills vertical whitespace). Scira card given **stronger prominence**: sparkle badge + "Scira Intelligence" eyebrow, radial glow, larger Poppins title (17px), full-width CTA.

**Phase 2 EXPERIMENT (Direction 3 modified) — `Activity Section – Direction 3 (Modified).pdf`:** reframed the left card from search pills to **scientific objectives**.
- **70/30** layout (`.activity-grid-exp{grid-template-columns:7fr 3fr;align-items:start}`).
- Left = **featured opportunity card** (`.obj-featured`, ~42% of left: category → Poppins title → description → Ask Scira CTA) + **3 supporting objective rows** (`.obj-row`: icon → objective → discipline → chevron; plain rows, not cards/pills/tags/buttons).
- Header "What People Are Building Today" — no search terminology.
- **Scira card preserved exactly** and **not stretched**: `align-items:start` keeps it at its natural height (~220px), top-aligned, while the taller objective content lives in the left card. (A featured card + 3 rows can't fit inside Scira's ~220px height, so stretch alignment would have forced Scira taller — top-align is the resolution that respects "do not increase Scira height".)
- **Reversible:** both variants live in the DOM — `#activity-experiment` (visible) and `#activity-classic` (`.hidden`, the 60/40 marquee preserved). Rollback = swap the `hidden` class between them (instructions in an HTML comment at the section). Git baseline: `4fc7179`.
- *Trade-off / open:* because Scira can't grow and the objective content is taller, there's whitespace to the right below Scira. Alternatives if undesired: vertically center Scira, or trim the left card (e.g., 2 rows) to shrink the gap.

**Phase 2 EXPERIMENT — Direction 3 *Refined* (`Activity Section – Direction 3 Refined.pdf`, supersedes the above):** fixes the excess-height/imbalance of the first experiment.
- **Heights now align** — reverted `align-items:start` → stretch; left card ≈ Scira (229/229, ~9px Scira adjustment, within "slight adjustments acceptable").
- **Featured** compacted (`.obj-featured` padding 18→13/15, flex row): category → title → description, **no default CTA**; "Ask Scira →" reveals on **hover to the right** (`.obj-feat-hovercta`, opacity/translateX fade) — discoverable, not promotional.
- **Supporting objectives → horizontal carousel** (`.obj-carousel.scroll-area#objcar-scroll`): replaced the stacked `.obj-row`s with `.sobj` items (icon + title + discipline), **dot-separated** (`.sobj-sep`), transparent default, hover = "temporary card" (subtle bg + soft border + elevation). Chevron nav reuses `hscroll('objcar',±1)` — same handler as every other carousel. Scrolls for future expansion.
- **Header:** status pill "Updated Weekly" (removed "Real industry objectives").
- **Scira card** unchanged — remains primary action / visual anchor.
- Rollback unchanged: `#activity-experiment` (live) vs `#activity-classic` (`.hidden`); git baselines `4fc7179` (pre-experiment) / `e994a6c` (first experiment).
- *Note:* smooth `scrollBy` is a no-op in the preview engine (instant works); chevrons scroll normally in a real browser.

### Preservation rules (all phases)
Preserve existing spacing system, typography scale, card styles, section paddings, and responsive behavior. **Prefer extending existing components over creating new ones.**

---

## How the PDF maps to the four requested buckets

| Requested bucket | Sourced from | Coverage |
|---|---|---|
| **Day 0 changes** | PDF Change 2 → Day 0 #1 (Hero), #3 (Service section), #4 (Regulated Chemistry) + Change 1 (Global terminology) | Fully specified |
| **Activity changes** | PDF Change 2 → Day 0 #2 (Your Activity, 2 cards) | Fully specified |
| **Recommendation changes** | Inferred: PDF hero "case studies" + "Popular Searches Today" + Philosophy §6 (recommendations = products/tech/market-intel, *not* suppliers) | Partly inferred — see ⚠️ |
| **Notification changes** | **Not in the PDF.** | ⚠️ No requirements — needs input |

---

## Bucket 1 — Day 0 changes

### 1A. Hero banner → rotating case studies (PDF Day 0 #1)
**What:** Convert the right-side "auto-scrolled update section" (showcase carousel) into **8–10 educational/trust-building case studies**. **Remove the CTA** (the `.showcase-arrow` button). No fake CTAs. Examples: API scale-up success, Process optimization, Specialty chemicals, Nutraceutical manufacturing, Cosmetic formulation.

**Files / components to modify (`scinode-day10.html`):**
- **HTML — slides:** `#showcase-track` block, **lines 1537–1593** (currently 3 slides: Project Delivery / Market Update / R&D Milestone). Expand to 8–10 `.showcase-card` items; delete the `.showcase-arrow` button from each `.showcase-footer`.
- **HTML — dots:** `.carousel-dots`, **lines 1597–1601** (3 hardcoded `.cdot` spans) → must become 8–10, or be generated dynamically.
- **JS — carousel logic:** auto-scroll IIFE, **lines 3850–3882**. Hardcoded `total = 3` (line 3853) → drive from slide count; dot-sync loop at 3860 already iterates `.cdot` so it adapts if dots are generated.
- **CSS:** `.showcase-*` rules, **lines 199–264** — likely reusable as-is; only remove `.showcase-arrow` usage (keep or drop the rule).

**⚠️ Scope decision:** the hero is in the **shared** top region, so it renders on Day 0/1/10/30. Decide whether case studies replace the carousel everywhere or only on Day 0 (would require day-scoping the hero or swapping slide sets per state).

**Philosophy check:** removing CTAs + framing as outcomes (not "find a supplier") aligns with "guide users / educational / suppliers invisible."

### 1B. Service section: "How We Execute Complex Chemistry" (PDF Day 0 #3)
**What:** Rename header → **"How we execute complex Science"**. Rename CTAs: "Explore Manufacturing **Partners**" → "Explore Manufacturing **Capabilities**"; "Explore Research **Partners**" → "Explore Research **Capabilities**".

**Files / components:**
- **Section header (static HTML):** **line 1762** `How We Execute Complex Chemistry`.
- **React ecosystem components (inline JSX, CDN Babel):**
  - `ManufacturingColumn` CTA — **line 4395** `Explore Manufacturing Partners`.
  - `RDColumn` CTA — **line 4701** `Explore Research Partners`.
  - Sub-CTAs "Explore all Research Partners offering this service" — **lines 4499, 4563, 4676**.
  - Sub-label "...across the partner network" — **line 4370**.
- Note: this section is mounted 3× (`#eco-day0/1/10`); a single component edit propagates to all.

### 1C. "Built for Regulated Chemistry" → Compliance module (PDF Day 0 #4)
**What:** Change the section header, and replace/extend the current 6 cert cards with a **dedicated compliance module of ~30 items** with **proper images + names** and **chevron horizontal scroll**. Categories: **Factory** (GMP, ISO, FDA, EHS), **Product** (licenses, regulatory approvals), **Documentation** (SDS, COA, Specifications), **Regulatory** (compliance requirements, certifications).

**Files / components:**
- **Existing block (static HTML):** header **line 1768**, cert scroller **lines 1769–1777** (6 `.cert-card`s in a plain `.hscroll`, **no chevron controls today**).
- **CSS:** `.cert-card` / `.cert-logo` — **lines 359–363**. New module likely needs a richer card (image + name + category) and `.hscroll-controls` chevrons (pattern already exists, e.g. line 1646–1649).
- **New work:** a reusable compliance-item card + a data array of ~30 items (consistent with the `window.SCINODE` data pattern, or inline static cards). Add chevron buttons calling existing `hscroll(id, dir)`.
- **Decision:** real logos/images vs. generated placeholders (`window.scinodeArt`, lines 3886–4001) vs. text avatars. ~30 real cert images is an asset-sourcing task.

---

## Bucket 2 — Activity changes (PDF Day 0 #2)

**What:** Restructure Day 0 "Your Activity" from **4 cards → 2 cards**:
- **Card 1 — "Popular Searches Today"**: width ≈ the first **3** existing cards; **auto-scroll carousel** of search prompts (Scale ibuprofen production, Develop nutraceutical formulation, Fermentation process optimization, Improve yield of Grignard reaction, API technology transfer). **Every item opens Scira.**
- **Card 2 — Scira pathway**: heading **"Lay out your execution pathway with Scira"**, subheading **"Explore molecules, manufacturers or R&D needs with Scira"**, CTA **"Ask Scira"**.

**Files / components:**
- **Day 0 "Your Activity" (static HTML):** `.activity-grid` with 4 `.act-card`s, **lines 1613–1638**. Header at **1614**. Replace the 4-up grid (`repeat(4,1fr)`, CSS line 376) with a 2-card layout where Card 1 spans ~3/4.
- **Card 1** = new auto-scroll mini-carousel inside a card; can reuse carousel pattern from hero (3850–3882) or `hscroll`. Needs its own track + timer.
- **Card 2** = adapt the existing teal "view-all" card (`.act-card.view-all`, line 1632, CSS 379) → new copy + `.act-va-title` / `.act-va-sub` + Ask Scira button.
- **Behavior:** wire all Card 1 items + Card 2 CTA to the Scira entry point (currently no real handler — hero search/`Ask Scira` are visual). Define a single `openScira(query)` stub.

**Philosophy check:** "Everything opens Scira" directly satisfies §4 (Scira is the primary interaction layer; exploration flows go to Scira).

---

## Bucket 3 — Recommendation changes  ⚠️ *(partly inferred — confirm scope)*

The PDF has no standalone "Recommendations" module, but per Philosophy §6 (recommendations = **products, technologies, market-intelligence news; never suppliers**) the following recommendation-flavored surfaces are in scope:

### 3A. Global removal of partner/supplier terminology (PDF Change 1)
**What:** Remove "partner / suppliers / vendor" language platform-wide (Philosophy §3 forbidden terms). Re-frame discovery as capabilities/requirements.

**Every occurrence to revise (`scinode-day10.html`):**
| Line | Current text | Context |
|---|---|---|
| 1627 | "Find CRO partner" | Day 0 activity (being restructured anyway — 2A) |
| 1949 / 2908 | "Partner facilities in your workflow" | Labs Viewed Recently (Day 1 / Day 10) |
| 2109 / 3043 | "CDMO & CMO partners you work with" | Manufacturers Viewed Recently |
| 2793 | "View partners" button | Day 10 activity |
| 3578 | "Top partner" chip | Day 30 manufacturer perf |
| 3726 / 3741 | "...qualified manufacturing partners" / "...from our partners" | Create Request modal |
| 4370 | "...across the partner network" | Ecosystem (Mfg column) |
| 4395 / 4701 | "Explore Manufacturing/Research **Partners**" | Ecosystem CTAs (also in 1B) |
| 4499 / 4563 / 4676 | "Explore all Research Partners offering this service" | Ecosystem sub-CTAs |

### 3B. Recommendation surfaces — philosophy alignment
- **Hero "Market Update" slide** (line 1562–1571) and the case-study set (1A) → keep as market-intelligence / educational recommendations; ensure no supplier framing.
- **"Popular Searches Today"** (2A Card 1) is itself a recommendation surface → confirm it routes to Scira, not to a listing.
- **Existing "Scira Intelligence" cards** (Day 10 lines ~3201/3659; Day 30) — recommend reviewing copy for product/tech/market-intel framing (no supplier recs). *Not mandated by the PDF — flagged for consistency.*

**⚠️ Confirm:** Is "Recommendation changes" meant only as the terminology cleanup above, or do you want a *new* recommendations module (products / technologies / market intel)? The PDF implies only the former.

---

## Bucket 4 — Notification changes  ⚠️ *(not in the PDF)*

The PDF contains **no notification requirements.** For reference, the current implementation is minimal:
- **Top-nav bell** with static red dot — `scinode-day10.html` **line 1445** (`.notif-dot`, CSS line 64). No dropdown/panel, no behavior.
- **Sidebar "Requests" count badge** — **line 1484** (`#req-badge`), shown only on Day 10/30 via `switchDay` (line 3808).
- No notification feed, toast, or read/unread state exists.

**Needs input before planning** — e.g.: a notification panel/dropdown? Per-day notification content? Tie to "Action Required" (Day 10 line ~2800) and "Upcoming Milestones" (Day 30 line ~3680)? Toasts on actions? I can spec this once you share intent.

---

## Cross-cutting implementation constraints

- **Single static file, no build step** — all edits in `scinode-day10.html`; served at `localhost:8899`.
- **Ecosystem section is React (CDN + in-browser Babel)** — items 1B/3A CTAs are JSX, edited in the `<script type="text/babel">` region (~lines 4360–4760), and changes propagate to all 3 mounts.
- **Carousel counts are hardcoded** — adding hero/activity slides means updating `total` and dot markup (or generating dots).
- **Hero is shared across day states** — resolve the Day-0-only vs. global scope question for 1A.
- **Two `:root` token blocks** (≈line 16 and ≈line 950) — any token change needs both.
- **Asset sourcing** — ~30 compliance images (1C) and 8–10 case-study images (1A) are content/asset tasks, not just code; decide real images vs. generated `scinodeArt` placeholders.
- **Day-state isolation** — new Day 0 markup must live inside `#day0`; the hero is the one exception (shared).
- **Typography** — new headers use Poppins (`--font-heading`); body/labels use Outfit (per recent decisions).

## Open decisions — RESOLVED (see "Approved decisions (v1)" above)
1. ~~Hero case studies: Day 0 only, or all states?~~ → **All states** (keep globally visible).
2. ~~Compliance/case-study images: real or placeholders?~~ → **Relevant temporary stock-style images**, no gray placeholders.
3. ~~Recommendation bucket: cleanup only, or new module?~~ → **Terminology cleanup only**; preserve structure.
4. ~~Notifications: what behavior?~~ → **No changes this stage.**

---

## Phase 1 — execution checklist (Global terminology + Service section)

**Terminology cleanup (preserve structure, text-only):**
| Line | From → To |
|---|---|
| 1627 | "Find CRO partner" → "Explore CRO capabilities" |
| 1949 / 2908 | "Partner facilities in your workflow" → "Facilities in your workflow" |
| 2109 / 3043 | "CDMO & CMO partners you work with" → "CDMO & CMO facilities you work with" |
| 2793 | "View partners" → "View capabilities" |
| 2898 | "3-vendor comparison" → "3-manufacturer comparison" |
| 3544 | "Vendor evaluation" → "Manufacturer evaluation" |
| 3578 | "Top partner" → "Top performer" |
| 3653 | "Multi-vendor RFQ" → "Multi-manufacturer RFQ" |
| 3665 | "View suppliers" → "Explore alternatives" |
| 3726 | "…qualified manufacturing partners." → "…qualified manufacturing capabilities." |
| 3741 | "…feasibility from our partners." → "…feasibility assessments." |
| 4370 | "…across the partner network" → "…across our manufacturing ecosystem" |

**Service section updates:**
| Line(s) | From → To |
|---|---|
| 1764 (Day 0), 2609 (Day 1), 3364 (Day 10) | "How We Execute Complex Chemistry" → "How We Execute Complex Science" |
| 4395 | CTA "Explore Manufacturing Partners" → "Explore Manufacturing Capabilities" |
| 4701 | CTA "Explore Research Partners" → "Explore Research Capabilities" |
| 4499 / 4563 / 4676 | "Explore all Research Partners offering this service" → "Explore all Research Capabilities for this service" |

*Vocabulary: "partner/supplier/vendor" → established product terms "capabilities" / "manufacturer" / "facilities" (per Philosophy §3; "manufacturer" is the existing accepted term and structure is preserved).*
