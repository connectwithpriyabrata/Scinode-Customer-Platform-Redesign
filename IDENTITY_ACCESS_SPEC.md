# Identity & Access — Signup/SSO Screen Inventory

> Source: `SSO doc.pdf` (PM spec, 27pp, "Sign-Up & SSO User Experience Specification — ATOMS | IONS | Scinode"). Covers **four** distinct platforms sharing one signup/SSO architecture. User management (roles, member tables, invite-sending UI) is **out of scope for this doc** — separate spec needed later.
>
> Gaps: the source doc's numbering skips §3, §4, §5, §7, §9. Treated as **not yet specified** rather than chased down — flagged inline below wherever it's relevant.

---

## Platforms

| Platform | Audience | Planned prototype file |
|---|---|---|
| ATOMS | Manufacturing / Suppliers | `auth.html` (product-switch state) |
| IONS | R&D / CROs / Labs | `auth.html` (product-switch state) |
| Scinode for Customers | Customers | `auth.html` (product-switch state) |
| Deep Research | Individual researchers — **distinct product from IONS**, confirmed | `auth.html` (product-switch state), first-login flow diverges |

---

## Core architecture (recap)

- **One User ID across all four platforms.** An existing user visiting a new platform logs in — never re-signs-up, never creates a second identity. (Dev/backend requirement, not just UI — implies a shared identity service.)
- **3-section signup structure**, identical order on all four: Section 1 (platform-specific fields) → Section 2 (SSO options) → Section 3 (email + password).
- **Company resolution — three branches**, each with different UI:
  - *Verified private domain* → company name locked/read-only, zero extra friction, no admin review.
  - *New private domain* → user provides company name (+ website/country if required) → goes to admin review, user status = pending.
  - *Public/free domain* (gmail.com, outlook.com, etc. — **configurable list**) → always requires admin approval; user searches for or adds their company.
- **Information priority stack** (strongest source wins, never re-ask): Existing User → Invitation → Enterprise SSO → Google/LinkedIn → Verified Email Domain → manual User Input.
- **Never create duplicate** Users, Companies, or Suppliers — even when an admin corrects a wrong initial company mapping (existing User ID is retained, just re-pointed).

---

## Screen / State Inventory

| # | Screen / State | Applies to | Trigger | Key elements | Spec ref |
|---|---|---|---|---|---|
| 1 | Signup — Section 1, ATOMS | ATOMS only | Direct signup entry | Name*, Company Name*, Phone*, Industries* (select) | §2.1 |
| 2 | Signup — Section 1, IONS | IONS only | Direct signup entry | Name*, Company Name*, Website*, Phone*, Profile Type* (select) | §2.1 |
| 3 | Signup — Section 1, Scinode for Customers | Customers only | Direct signup entry | Name*, Company Name*, Phone* | §2.1 |
| 4 | Signup — Section 1, Deep Research | Deep Research only | Direct signup entry | Name*, Company Name*, Phone* (no research-specific fields at signup — deferred to post-login) | §2.1 |
| 5 | Company field — locked (verified private domain) | Shared | Email domain matches known company | Read-only `[ Acme Manufacturing 🔒 ]` + "Identified from your company email" | §2.2 |
| 6 | Company field — editable (new private domain) | Shared | Email domain not yet mapped | Editable `Company Name *` text field | §2.2 |
| 7 | Company resolution — public/free domain | Shared | gmail.com / outlook.com / hotmail.com / yahoo.com / icloud.com (configurable) | "Which company do you represent?" + company search dropdown + "+ Add New Company" | §2.2, §6C |
| 8 | Signup — Section 2, SSO options | Shared | Always shown | "Continue with Google" / "Continue with LinkedIn" + Enterprise SSO button if company has it configured | §2.3 |
| 9 | Signup — Section 3, Email + Password | Shared | Direct (non-SSO) signup | Email*, Password* — no separate password field ever shown after SSO auth | §2.4 |
| 10 | Cross-platform banner | Shared, all 4 signup pages | Always visible on signup | "Already using another Scinode platform? Sign in with SSO or your existing email and password." + Sign In link | §2.6 |
| 11 | Google/LinkedIn signup result — existing private domain | Shared | SSO auth + domain matches known company | Name/Email prefilled+verified, Company locked, only Phone requested | §8 |
| 12 | Google/LinkedIn signup result — new private domain | Shared | SSO auth + unmapped domain | Name/Email prefilled+verified, Company Name* + Phone* requested | §8 |
| 13 | Google/LinkedIn signup result — public email | Shared | SSO auth + public domain | Name/Email prefilled+verified, Phone* + Company Name* requested → routes to admin review | §8 |
| 14 | Sign In — normal | Shared | "Sign In" link/entry | Email, Password, Sign In button, Continue with Google/LinkedIn, Forgot password? | §10 |
| 15 | Sign In — SSO-enabled company detected | Shared | Email entered matches SSO-enabled org | "We found your organization: Acme Manufacturing" + "Continue with Acme SSO" | §10 |
| 16 | Existing-user re-auth | Shared | Any returning, already-identified user | Skips signup entirely, routes straight into their platform | §10, §12 |
| 17 | Invitation landing | Shared (payload-driven) | User opens invite link | "You've been invited to join [Company] — Role: X, Team: Y, Platform: Z" + Accept Invitation | §11 |
| 18 | Invitation — profile completion | Shared | After invite acceptance + auth | Name*, Phone* **only** — no Company/Role/Team/Website/Industry fields (already known from invite) | §11 |
| 19 | Invitation — confirmation | Shared | After profile completion | "Welcome to [Company]. Role: X, Team: Y" + Continue to [Platform] | §11 |
| 20 | Pending review confirmation — new private domain | Shared | After signup with unmapped private domain | "Thanks! Our team will verify your company and review your access before activating your account." | §6B, §15 |
| 21 | Pending review confirmation — public domain | Shared | After signup with public email | Same pending-review messaging as #20 | §7, §15 |
| 22 | Deep Research — first-login welcome | Deep Research only | First login after signup | "Welcome to Deep Research" + primary CTA "Start Research" (immediate access) + optional "Complete Profile" + optional "Create Team" — **not signup blockers** | §2.7 |

### Admin-side (flagged, not detailed as UI in the source doc)

| # | Screen / State | Notes |
|---|---|---|
| 23 | Admin — pending applications queue | Only the *actions* are specified (Approve / Reject / Reassign), not a queue UI. **Not yet specified** — likely belongs with the later User Management spec. |
| 24 | Admin — Reject | User-facing: "Application rejected" notification. Admin-facing UI not detailed. |
| 25 | Admin — Reassign | Corrects a wrong company mapping; existing User ID retained. Admin-facing UI not detailed. |

---

## Designer Rules checklist (from §16 — use as QA pass on the prototype)

**Always:** same 3-section structure on all 4 platforms · Section 1 platform-specific only · Email+Password stays in Section 3 · prefill everything SSO already provided · lock company info once a verified private domain identifies it · show only missing fields · invitation signup is the lowest-friction path · visually distinguish verified/locked fields from user-entered ones.

**Never:** ask for Email/Name/Company twice · let a verified private-domain user change their mapped company · show company selection during invite signup · require a password after SSO auth · treat a public/free domain as proof of company affiliation · create duplicate Companies/Suppliers when multiple people from one org sign up · treat a company appearing in a public dataset as auto-approved.

---

## Proposed file split for the prototype

- **`auth.html`** — screens #1–16: signup (all 3 sections + all company-resolution branches), SSO results, sign-in. One file, product-switcher state (ATOMS/IONS/Customers/Deep Research) like `switchDay` in `scinode-day10.html`, plus sub-states for the company-resolution branch and SSO-vs-direct path.
- **`invite.html`** — screens #17–19: invitation is a distinct entry point (arrives via link, not the platform picker), minimal chrome, no product switcher needed since the invite payload already fixes the platform.
- Deep Research's first-login welcome (#22) — small addendum, could live at the bottom of `auth.html`'s Deep Research state as the "after signup" terminus.
- Admin queue/Approve/Reject/Reassign (#23–25) — deferred to the User Management phase, since the doc doesn't specify UI for it.

Not building anything yet — this is the inventory to review before we touch HTML.
