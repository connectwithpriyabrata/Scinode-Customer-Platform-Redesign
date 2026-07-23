# Scinode Iconography Specification

Version: 1.0
Status: Draft for Review
Owner: Scinode Design System
Last Updated: July 2026

Scope: every icon on every page of the Scinode Dashboard prototype (`scinode-day10.html`, `manufacturing.html`, `rnd.html`, `products.html`, `scira.html`, `projects.html`, `requests.html`).

No code has been changed to match this spec yet — see the Migration Phases section for how implementation proceeds once this document is approved.

This document exists because an audit of the current prototype found **429 inline SVG icons using 65 distinct attribute combinations** — 16 different stroke-widths, 15 different sizes, and the same concept (e.g. "verified") drawn 5 different ways with 2 different underlying technologies (SVG paths and a unicode ✓ glyph). This spec is the single source of truth that replaces all of that. Once approved, code changes happen in the phased migration in Section 11 — never as an ad-hoc edit.

---

## Design Principles

These are the philosophy behind every rule in the rest of this document. When a situation isn't explicitly covered elsewhere, fall back to these before improvising:

- One icon represents one concept across the entire platform.
- The same concept must never use multiple icons.
- Icons support labels — they should not replace text.
- Icons should communicate meaning without drawing unnecessary attention.
- Decorative icons should remain secondary to content.
- Reuse existing semantic icons before introducing new ones.
- Consistency is always preferred over choosing a "better looking" icon.

---

## 1. Icon library: Lucide, and only Lucide

**[Lucide](https://lucide.dev)** is the sole icon source for the entire platform. No other icon set, icon font, or hand-drawn path may be introduced — not Feather, not Heroicons, not Font Awesome, not Material Icons, not emoji-as-icon (see Section 2 for the flag-emoji exception).

### Prototype vs. production implementation

The semantic registry in Section 8 is the source of truth, independent of how an icon is actually rendered. Which of the two implementations below applies depends only on what stage the codebase is in — neither is a design decision, and using one over the other never changes which icon represents which concept.

| Implementation | When it applies | How an icon is produced |
|---|---|---|
| **Prototype (current)** | Today — Scinode Dashboard is a no-build static HTML/CSS/JS prototype (per `CLAUDE.md`), with no npm dependency tree or bundler outside the single inline-React-via-CDN Ecosystem section | The icon's SVG markup is authored inline, matching Lucide's path data exactly, and generated through the `AppIcon`/`NavIcon`/`StatusIcon`/`FeatureIcon` helpers described in Section 9. The visual output is pixel-identical to the production implementation at the same size and stroke-width. |
| **Production (target)** | Once the project adopts a real build pipeline | `lucide-react` is installed as an actual dependency and imported directly. Every semantic name in the Section 8 registry already matches a real Lucide export name, so `<AppIcon name="manufacturing" />` becomes a thin wrapper around `<Factory />` — no icon is re-chosen or redesigned in the process. |

**`lucide-react` is the intended long-term implementation.** The prototype's inline-SVG approach exists only because the current codebase has no build step — it is a faithful stand-in for the real package, not an alternative to it, and nothing about the design in Sections 2–7 changes when the project migrates.

---

## 2. Style: rounded outline only

Every icon must be Lucide's default **outline** style (Lucide only ships one style per icon, and it is already a rounded-stroke outline — there is no "duotone/solid/sharp" variant to accidentally pick). Concretely, every icon SVG must have:

```html
<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <!-- path data copied verbatim from lucide.dev -->
</svg>
```

Rules:
- `fill="none"` always. Icons never carry a solid fill — color comes entirely from `stroke`.
- `stroke="currentColor"` always. Icon color is set by the parent's CSS `color` property (via a text-color utility or the container's own color), never hardcoded as a literal hex inside the `<svg>` or `<path>`.
- `viewBox="0 0 24 24"` always — Lucide's native grid. Icons scale via the `width`/`height` attributes only; the viewBox is never altered to "zoom" an icon.
- `stroke-linecap="round"` and `stroke-linejoin="round"` always, no exceptions. (This is the rule that fixes the "sidebar nav looks sharp-cornered, dashboard cards look rounded" split found in the audit.)

**Out of scope for this rule** (governed separately, not "icons" in this spec's sense):
- The brand logo mark (solid-fill vector wordmark)
- Decorative illustration SVGs (the `opps-feed-art` category art, capacity-chart art)
- Generated cert badges (colored circle + text initials, e.g. "GMP", "ISO" — these are typographic badges, not icons)
- Country-flag emoji on manufacturer cards — kept as-is; flag emoji are a normal, practical pattern for representing countries and are not part of the icon-consistency problem this spec addresses

---

## 3. Global stroke width: 1.75

**`stroke-width="1.75"` is the single value used everywhere, at every size.** SVG's `stroke-width` attribute accepts any decimal value, so 1.75 is fully feasible with no technical constraint — the "1.8 fallback" the brief allowed for is not needed and is recorded here only for completeness: **if some future rendering context is ever found where 1.75 genuinely reads wrong (e.g. sub-pixel blur at a specific zoom), 1.8 is the only permitted substitute, sitewide, not per-icon.** No icon may use any other stroke-width value under any circumstance — not 1.5, not 2, not 2.5, not 3.

This retires 15 of the 16 stroke-width values the audit found in production (2, 2.5, 1.8, 1.5, 3, 1, 1.2, 2.2, 1.1, 2.4, 1.7, 1.9, 1.6, 1.4, 1.3, 0.9).

No `fill`-based star ratings, progress rings, or other stroke-width-adjacent hacks are permitted as a workaround — see Section 8 for the approved rating/status treatment.

---

## 4. Standard icon sizes: 14 / 18 / 20 / 24

Four sizes only, each tied to a specific context. No fifth size may be introduced — a design that seems to need one is a signal to reconsider the layout, not to add a size.

| Size | Context | Examples |
|---|---|---|
| **14px** | Dense inline contexts | Table-cell icons, inline badge/chip icons, breadcrumb or metadata icons, close buttons inside compact chips |
| **18px** | Default UI icon size | Buttons, form controls, list rows, sidebar/top-nav icons, the icon inside a **compact (28px) container** |
| **20px** | Emphasized inline icons | Section-header icons, KPI card icons, prominent standalone inline actions |
| **24px** | Standalone / large icons | Empty states, modal header icons, the icon inside a **feature (48px) container** |

A given *concept* (chevron, close, checkmark) is never redrawn at a different stroke-width for a different size — only the `width`/`height` attributes change; `stroke-width` stays 1.75 at every size per Section 3.

This retires 11 of the 15 icon sizes the audit found in production (10, 11, 12, 13, 15, 16, 17, 22, 32 as bare icon sizes — 16 survives only as the *default* inherited size for a handful of Lucide icons rendered without a container, folded into the 18px bucket going forward).

---

## 5. Icon containers ("tiles"): two sizes only

| Tile | Total size | Radius | Inner icon size | Shape |
|---|---|---|---|---|
| **Compact** | 28×28px | `--sc-radius-sm` (8px) for square tiles · full circle for status dots | 18px | Rounded-square (`FeatureIcon`) or circle (`StatusIcon`) |
| **Feature** | 48×48px | `--sc-radius-md` (12px) for square tiles · full circle for status dots | 24px | Rounded-square (`FeatureIcon`) or circle (`StatusIcon`) |

Background is always the tint-50 of the relevant semantic/category hue from the existing Scinode color ramps (teal-50, the R&D indigo pair, the status colors, etc.) with the icon in that hue's 600/700-weight color — the same "tint-50 bg + darker icon" formula the design system already uses for badges, just formalized for icon tiles. `StatusIcon` specifically draws its color from the six semantic roles in Section 6; `FeatureIcon` draws from the broader per-category hue palette used across the semantic registry (Section 8).

This retires 6+ distinct legacy tile sizes found in the audit (26px/7px-radius, 32px circle, 34px/9px-radius, 42px circle, 56px/12px-radius, plus the 30px close-button squares) down to exactly two.

---

## 6. Semantic Colors

Icon color is never a standalone decision — it always maps to one of the six semantic roles below, and icons inherit that color via `currentColor` rather than a hardcoded fill or stroke value. The actual hex values are the existing Scinode design-system color ramps; this section never introduces a new one-off color.

| Role | Color | Used for |
|---|---|---|
| Success | Green | `StatusIcon(success)` — completed/verified states |
| Warning | Amber | `StatusIcon(warning)` — attention-needed states |
| Error | Red | `StatusIcon(error)` — rejected/failed states |
| Information | Blue | `StatusIcon(info)` — informational callouts |
| Neutral / Default | Slate | The default color for every icon not carrying a semantic status — nav icons, button icons, plain content icons |
| Brand / Primary | Teal | Primary actions, active states, and any icon standing in for the brand itself |

`FeatureIcon` tiles (Section 5) may use any of the existing per-category hues (teal, indigo, blue, green, etc.) for their tint-50 background, following the same "tint-50 bg + 600/700-weight icon" formula — those category hues are a separate, broader palette than the six semantic roles above, which are reserved specifically for status/brand meaning.

---

## 7. Icon Spacing

Four spacing rules, no others:

| Context | Gap |
|---|---|
| Icon + label (inline text pairing) | 8px |
| Button icon + text | 8px |
| Navigation icon + label | 12px |
| Feature tile icon to title | 16px minimum |

Icons always align to the same baseline as the surrounding text — never offset above or below it. No additional spacing values are introduced beyond the four above; a layout that seems to need a fifth is a signal to adjust the surrounding layout's own spacing (the general 4/8/12/16/20/24/32/40/48px scale from the Scinode design system), not to invent a new icon-specific gap.

---

## 8. Semantic icon registry

One Lucide icon per concept, platform-wide. This table governs **recurring, structural concepts** — nav items, section headers, category/status types that repeat across the app. One-off decorative icons inside a single illustration (e.g. the five Trust Center pillar icons, or a single "why this fits" bullet icon) are not required to appear in this table, but must still follow every rule in Sections 2–5.

### Navigation & workspace
| Concept | Lucide icon | Notes |
|---|---|---|
| Dashboard | `LayoutDashboard` | |
| Manufacturing | `Factory` | The workspace/nav concept — the *activity*, not the companies. See "Manufacturers" below for the organization/company concept, which uses a different icon. |
| R&D | `FlaskConical` | |
| Products | `Package` | |
| Ask Scira (AI) | `Sparkles` | Also used for any other "AI-assisted" entry point |
| Projects | `FolderKanban` | |
| Requests | `ClipboardList` | |
| Notifications | `Bell` | |
| Create Request (primary CTA) | `Plus` | |
| Search | `Search` | |
| Profile / account | `User` | |
| Settings | `Settings` | |
| Logout | `LogOut` | |
| Light mode | `Sun` | |
| Dark mode | `Moon` | |

### Domain concepts
| Concept | Lucide icon | Notes |
|---|---|---|
| Compliance & Trust | `ShieldCheck` | Also used for the Trust Center entry point |
| Security / Scinode Secure | `Shield` | Plain shield — reserve `ShieldCheck` for the compliance/trust-center context specifically so the two read as related but distinct |
| Market Intelligence / Opportunities | `TrendingUp` | |
| Manufacturers (CDMO/CMO) | `Building2` | The organization/company concept — reserved for manufacturer entities and companies generally. Distinct from "Manufacturing" above, which is the workspace/nav activity and uses `Factory` instead. Verified against the audit: no change needed, the two concepts were already correctly separated. |
| CRO / R&D Partners | `Handshake` | |
| Documentation | `FileText` | |
| Regulatory | `Scale` | |
| Analytical R&D / QC | `Microscope` | |
| Materials Engineering | `Layers` | |
| Bioprocessing | `TestTubes` | |
| Formulation R&D | `Beaker` | |
| Process scale-up | `Gauge` | |
| Technology transfer | `Share2` | |
| Access control / permissions | `Lock` | |

### Status & feedback
| Concept | Lucide icon | Notes |
|---|---|---|
| Verified / success / done | `CheckCircle2` | The single replacement for all 5 legacy "checkmark" variants, including the unicode ✓ glyph badge. Color per the Success role in Section 6. |
| Warning / attention needed | `AlertTriangle` | Color per the Warning role in Section 6 |
| Error / rejected | `AlertCircle` | Color per the Error role in Section 6 |
| Informational | `Info` | Color per the Information role in Section 6 |
| Rating (stars) | `Star` | Filled variant (`fill="currentColor"`) is the one approved exception to the "no filled icons" rule in Section 2, specifically for star ratings — stroke-width and outline rules still apply to the star's own path |

### Common UI glyphs
| Concept | Lucide icon | Notes |
|---|---|---|
| Close / dismiss | `X` | The single replacement for the 2 legacy close-icon variants |
| Chevron — right / forward | `ChevronRight` | Also covers "View all →" style links |
| Chevron — left / back | `ChevronLeft` | |
| Chevron — down / expand | `ChevronDown` | |
| Chevron — up / collapse | `ChevronUp` | |
| Arrow — forward / next | `ArrowRight` | Distinct from chevron: used for primary CTA buttons, not for expand/collapse or pagination |
| Filter | `SlidersHorizontal` | |
| Calendar / date | `Calendar` | |
| Time / duration | `Clock` | |
| Download | `Download` | |
| External link | `ExternalLink` | |

This registry is additive — new concepts get added here (with a single Lucide icon chosen) before they're used anywhere in the product, never invented ad hoc at the point of use.

---

## 9. Reusable component guidelines

Four building blocks. `AppIcon` is the primitive; the other three wrap it for a specific role and are the only approved way to render an icon inside a colored container or a nav row.

### `AppIcon` — the primitive
Renders one bare icon, no container, no background.

- **Props:** `name` (a Section 8 registry key, or a literal Lucide icon name for one-off decorative use), `size` (one of 14/18/20/24, default `18`), `color` (defaults to `currentColor` — inherits from the parent; only set explicitly when the icon must differ from surrounding text color)
- Always emits `fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"`.

*Prototype (today, vanilla JS helper in `assets/scinode.js`):*
```js
function AppIcon(name, { size = 18, color } = {}) {
  const path = ICON_PATHS[name]; // looked up from the Section 8 registry, keyed by semantic name or literal Lucide name
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="${color || 'currentColor'}" stroke-width="1.75"
    stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
```

*Production (target, `lucide-react`):*
```jsx
function AppIcon({ name, size = 18, color, className }) {
  const Icon = REGISTRY[name]; // maps to the actual lucide-react export
  return <Icon size={size} color={color} strokeWidth={1.75} className={className} />;
}
```

### `NavIcon` — sidebar / top-nav
Wraps `AppIcon` at the fixed 18px size, no background tile (nav icons sit directly in the row, matching the current `.sb-icon` layout — only the stroke rounding/weight changes to match the rest of the app). Handles the active/inactive visual state.

- **Props:** `name`, `active` (boolean — `true` renders full brand color, `false` renders the existing muted/inactive color used by `.sb-item`)
- No size prop — always 18px, always no container.
- Spacing between the icon and its label follows the 12px navigation rule in Section 7.

### `StatusIcon` — verified / warning / error / info states
Always a **circular** container, one of the two approved tile sizes.

- **Props:** `status` (`success` | `warning` | `error` | `info`), `size` (`compact` = 28px container / 18px icon, or `feature` = 48px container / 24px icon)
- Background = tint-50 of the status color; icon = the Section 8 status icon for that status, colored per the semantic roles in Section 6.
- Replaces: the unicode ✓-in-circle badge, `.d1-action-icon`, and every other ad-hoc status-circle in the codebase.

### `FeatureIcon` — category / feature tiles
Always a **rounded-square** container, one of the two approved tile sizes.

- **Props:** `name` (a Section 8 domain-concept key), `hue` (which color ramp to tint the tile with — teal/indigo/blue/green/etc., matching the existing per-category color conventions), `size` (`compact` = 28px container / 18px icon, or `feature` = 48px container / 24px icon)
- Replaces: `.cap-cat-ico`, `.d1-next-icon`, `.usecase-icon`, `.cmp-cat-icon`, and every other bespoke "icon in a colored box" pattern.
- Spacing between the tile and its title follows the 16px-minimum rule in Section 7.

---

## 10. Anti-patterns

Things that are never acceptable, regardless of context:

- Never mix multiple icon libraries.
- Never mix filled and outline styles.
- Never use emojis as UI icons (country flags are the documented exception — see Section 2).
- Never stretch or distort icons.
- Never change stroke width for emphasis.
- Never create a new icon for an existing semantic concept.
- Never hardcode SVG colors when `currentColor` can be used (see Section 6).

---

## 11. Migration phases — zero visual regressions

No phase begins until the previous phase is verified and explicitly approved. "Zero visual regression" means, for every page touched in a phase: reload in the browser preview, screenshot before and after, confirm no layout shift and no console errors, and get a sign-off before moving on. This spec authorizes **no code changes on its own** — Phase 1 is the first actionable step, and only once this document is approved.

| Phase | Scope | Risk | Why this order |
|---|---|---|---|
| **0 — Freeze** *(this document)* | Audit + spec only, no code touched | None | Establishes the target before anything moves |
| **1 — Infrastructure** | Add the Lucide path registry + `AppIcon`/`NavIcon`/`StatusIcon`/`FeatureIcon` helpers to `assets/scinode.js`. Nothing in any page references them yet. | None — purely additive, unused code | Lets every later phase be a pure find-and-replace against tested infrastructure |
| **2 — Checkmark / verified family** | Replace all 5 legacy "verified" variants (incl. the unicode ✓ badge) with `StatusIcon(success)` | Low | Most jarring inconsistency found in the audit; bounded, well-understood set of locations |
| **3 — Close (X) icons** | Replace both legacy close-icon variants across every modal/drawer with `AppIcon('close')` | Low | Small, mechanical, high-visibility fix |
| **4 — Chevrons & arrows** | Replace all 5 stroke-width variants with `AppIcon('chevron-*'/'arrow-right')` at context-appropriate size | Low–Medium | More locations than Phases 2–3, but still a single mechanical swap per instance |
| **5 — Icon tiles (`FeatureIcon` rollout)** | Compliance category cards, capability cards, next-step cards, opportunity cards → the two approved tile sizes | Medium | Touches layout (container size changes), not just the icon glyph — needs closer visual review per page |
| **6 — Sidebar/top-nav (`NavIcon` rollout)** | All 7 pages' shared nav shell | Medium–High | Highest blast radius (every page, every load) — done only after Phases 2–5 have proven the pattern is safe |
| **7 — Remaining one-offs** | KPI icons, button icons, misc card icons not covered above | Low, but long tail | Sweep everything left so no legacy stroke-width/size survives anywhere |
| **8 — Cleanup** | Delete now-dead legacy icon markup, the retired CSS classes (`.cmp-check`, old tile classes superseded by `FeatureIcon`, etc.), the unicode ✓ glyph, and the lightning-bolt emoji icon | Low | Only once nothing references the old code paths |

Each phase is its own reviewable change — this spec deliberately does not bundle them, so a regression in Phase 5 (say) never has to be untangled from Phase 2's changes.
