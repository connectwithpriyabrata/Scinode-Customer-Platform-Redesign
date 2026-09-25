# Deep Research — Sign-Up, Sign-In & Invitation UX Copy Spec

**Handoff type:** designer-to-designer implementation spec, right-side authentication experience only.
**Scope:** the Deep Research platform's behavior inside the shared Scinode auth prototype (`auth.html` for organic sign-up/sign-in, `invite.html` for the invitation flow). Both files implement the same 4-platform pattern (ATOMS, IONS, Scinode for Customers, Deep Research); this spec documents the pattern **as it exists today**, with every value that is Deep-Research-specific called out explicitly.
**Do not modify the left side.** Everything on the left (brand panel: illustration carousel, headline, ecosystem sub-line, "Invited by" chip, trust/benefit cards, footer) is out of scope. This spec documents right-side content only: headings, subtext, form fields, labels, placeholders, helper text, validation, CTAs, links, system messages, and state transitions.

---

## 0. Audit summary — what already exists (read this before implementing)

This is not a new flow. Every state below already exists in the codebase. Do not build parallel components.

| Concern | Where it lives | Notes |
|---|---|---|
| Sign-up (email+password) | `auth.html` `#af-screen-signup` | Shared by all 4 platforms |
| Verify email | `auth.html` `#af-screen-verify` | Shared component, 3 sub-states (pending/expired/verified) |
| Workspace-details screen ("You're almost there") | `auth.html` `#af-screen-xp-profile` | Shared component serving **3 different entry modes** — see §2 |
| Sign-in | `auth.html` `#af-screen-signin` | Shared; also renders "Just Approved" / "Just Verified" landing states |
| Cross-platform Pending | `auth.html` `#af-result-pending` (inside `#af-screen-result`) | Shared; reused by both the organic sign-up path and the existing-Scinode-user path — **do not duplicate** |
| Rejected | `auth.html` `#af-result-simple` (`reason==='rejected'` branch of `afShowResult()`) | Shared; **does not currently exist in `invite.html`** — see Open Questions |
| Reset password | `auth.html` `#af-screen-reset` + 3 forgot-password modals | Shared |
| Invitation landing | `invite.html` `#iv-screen-landing` | Invite-only |
| Invitation auth (2-step: credentials → profile) | `invite.html` `#iv-screen-auth` | Invite-only |
| Invitation Pending / Verify / Sign-in-from-link / Confirmation | `invite.html` `#iv-screen-pending` / `#iv-screen-verify` / `#iv-screen-signin` / `#iv-screen-confirmation` | Invite-only. **Not the same copy as `auth.html`'s equivalents** in every case — see §11 and Open Questions |

**Dead code found during audit:** `auth.html` contains a rich "Signup Confirmed" success screen (`#af-result-success`, rendered by `afRenderSuccess()`) for `reason==='activated'`. As of the current implementation, **this branch is unreachable** — every path that used to lead there (`afSubmitXpProfile()`'s `activated` branch, SSO sign-up) now routes to the plain Sign In screen instead. Do not treat `#af-result-success` as a live Deep Research state; it is legacy markup. Flagged in Open Questions.

---

## 1. Important Scinode account logic

**Sign-up ≠ cross-platform access request.** The codebase already distinguishes these:

- **Sign-up** creates a brand-new Scinode ecosystem account. Reached via `#af-screen-signup` → Verify Email → the workspace-details screen in **signup mode**.
- **Cross-platform access** is an *existing* Scinode user (already has an account via Customers / Researchers (IONS) / Manufacturers (ATOMS) / Deep Research) requesting access to a platform they haven't used yet. Reached via `#af-screen-signin` (they sign in with existing credentials) → the **same** workspace-details screen, but in **existing-customer mode**, which asks only for what's still missing — **do not send them through sign-up.**

This distinction is enforced in code: `afSubmitSignin()` checks `afState.existingCustomer` and, if true, calls `afShowXpProfile('existing-customer')` — never `afShowScreen('signup')`.

### Deep Research-specific consequence

For Deep Research, **the platform-specific questions have been removed from onboarding entirely** (see §5). This means an existing Scinode user requesting Deep Research access today has **nothing platform-specific left to fill in** — the existing-customer screen shows only the identity confirmation and "How it works" panel, with a Continue button that is never blocked. This is a real, current behavior, not an oversight in this spec — flagged in Open Questions as it may not be the intended experience.

---

## 2. Verify the difference between these states

The codebase already keeps these distinct and does **not** merge them (per an explicit prior product decision: *"Do NOT merge Verification Pending and Approval Pending"*).

| State | Confirms | Where |
|---|---|---|
| **Email verification** | The user controls the email address | `#af-screen-verify` |
| **Organisation/domain verification** | The relationship between the email domain and the organisation | The 3-way Company Name block (locked/editable/public) inside the workspace-details screen, driven by the Domain state (§7) |
| **Approval** | The user is permitted to access Deep Research | Cross-Platform Pending screen → "Just Approved" sign-in state |

Also distinct, and not interchangeable:

| State | Meaning | Copy trigger |
|---|---|---|
| **Just verified** | The user's email has just been verified (and the org is already approved on this platform, so nothing else is pending) | `afOpenSigninFromLink('verify')` |
| **Just approved** | The user's Deep Research access has just been approved (admin-approval email link) | `afOpenSigninFromLink('approved')` |

These two **are** combined in one shared screen (`#af-screen-signin`, `afRenderSigninLanding()`) — same layout (illustration + colleagues card + Recommended First Steps), different heading/subtext only. This is the existing, intentional implementation (not something to change).

---

## 3. Field inventory

Every field that exists or is required for Deep Research on the right side, across both files.

### Account (sign-up, `auth.html` Screen 1)

| Field | Label | Placeholder | Required | Helper/validation | Notes |
|---|---|---|---|---|---|
| Email | "Email" | `you@company.com` | Yes | Native email validation | id `af-section3-email` |
| Password | "Password" | `Create a password` | Yes | Live checklist, see §4 | id `af-section3-password` |
| Confirm Password | "Confirm Password" | `Re-enter password` | Yes | "Passwords don't match." (`af-password-match-error`) | id `af-section3-password-confirm` |

SSO alternative: Google, LinkedIn, and (if the email domain is already verified) an Enterprise SSO button reading `Continue with {Company} SSO`.

### Organisation (workspace-details screen, first-time signups only)

| Field | Label | Placeholder | Required | Notes |
|---|---|---|---|---|
| Company Name (verified domain) | "Company Name" | — (locked, read-only) | N/A | Shows a lock icon + green verified check + info banner: *"Scinode has already identified your company. You can continue with your account setup."* |
| Company Name (new domain) | "Company Name" | `Enter company name` | Yes | Info banner: *"New domain — your company will go through a quick verification before activation."* Also reveals **Company Website** (optional, `https://yourcompany.com`) and **Country** (select, optional) |
| Company Name (public domain) | "Which company do you represent?" | `Enter company name` | Yes | Info banner: *"Public email domain — your access will need admin approval either way."* |

**Deep Research uses the label "Company Name"** (same as ATOMS), not "Organisation Name" (Customers) or "Organization / Institute Name" (IONS). See Open Questions — this is an existing terminology inconsistency across platforms, not something introduced by this spec.

Company Name is shown **only** for first-time signups (`afState.signupUserType === 'first'`). Recurring users and existing-Scinode-user sign-ins never see it.

### Deep Research-specific fields

**None, currently.** As of the latest product decision (see §5), Deep Research asks no platform-specific questions during sign-up, recurring sign-up, or the existing-customer cross-platform flow. The two questions that previously existed ("What best describes your role?" / "What type of organisation are you part of?") have been removed from the codebase entirely — see §5 for what replaces them.

Do **not** invent replacement fields. If Deep Research is meant to collect this information somewhere (e.g. "inside the dashboard, post-approval, on first login"), that surface does not exist in this prototype yet — flagged in Open Questions.

### Also present on the workspace-details screen, signup only (shared across platforms, shown for Deep Research too)

| Field | Label | Required | Notes |
|---|---|---|---|
| Name | "Name" (direct) / "Name" (SSO, locked + "From Google"/"From LinkedIn" chip) | Yes | id `af-name-direct-input` |
| Phone Number | "Phone Number" | Yes | Country-code select defaults to `+91` |
| Website | — | **Not shown for Deep Research** (only ATOMS/IONS/Customers) | — |
| Terms/Privacy consent checkbox | "I agree to the Terms of Service and Privacy Policy." | Yes | id `af-signup-consent` |

---

## 4. Password requirements

Existing rule, enforced identically on Sign Up, Reset Password, and the invitation flow's own password fields:

- At least 8 characters
- At least 1 uppercase letter
- At least 1 number or symbol

**UI behaviour:** a live checklist (`af-criteria-box` / `af-signup-criteria-box`) shows each rule as met/unmet while typing, and collapses to a single line — *"Password meets all requirements"* — once all three pass. This is presentation-only; the underlying rule check does not change.

| Case | Message | Where |
|---|---|---|
| Password mismatch (sign-up) | "Passwords don't match." | `af-password-match-error` |
| Password mismatch (reset) | "Passwords don't match." | `af-reset-password-match-error` |
| Reset link expired | *(No dedicated screen exists for this today — the reset screen is reached only via the "Simulate clicking the email link" prototype shortcut. Flagged in Open Questions.)* | — |
| Password reset email sent | Modal: **"Verify your email address"** — "We've sent a password reset link to your email. Please check your inbox (and spam folder) and follow the link to reset your password." | `#af-modal-verify-email` |
| Password reset success | Modal: **"Password Updated Successfully"** — "Your password has been updated. Please sign in with your new credentials." CTA: **Go to Sign in** | `#af-modal-password-updated` |

---

## 5. Deep Research change from previous design (important — read before implementing)

An earlier iteration of this product had Deep Research ask two mandatory questions during onboarding:

1. "What best describes your role?"
2. "What type of organisation are you part of?"

**This has been reversed.** Per the current product decision, these two questions are **out of scope for sign-up** and will instead be asked **inside the dashboard, during first login, post admin approval** (i.e. after the user's Deep Research access has already been granted). The dashboard-side implementation of that first-login questionnaire **does not exist in this prototype** — it is a future surface, not something to build as part of this spec. Do not re-add these two questions to the sign-up, recurring-sign-up, or existing-customer flows.

Practical effect on the current codebase:
- Deep Research's workspace-details screen shows no mandatory field, so the **Continue/Create Account button is never disabled** for Deep Research (contrast with ATOMS, where it's disabled until at least one Industry is picked).
- Deep Research has no "already captured, skip it for recurring users" behavior to implement, because there is no field to skip.

---

## 6. Domain states

Documented as implemented in `afSetDomain()` / the Company Name block of the workspace-details screen. These are **devbar-simulated** in this prototype (no real domain-verification backend) — the UI logic and copy below is what matters for implementation.

### New domain
The email domain is not associated with an existing organisation.
- **Fields:** editable Company Name (required), Company Website (optional), Country (optional)
- **System message (info banner):** *"New domain — your company will go through a quick verification before activation."*
- **Next state:** `afComputeSignupReason()` returns `'pending'` → Cross-Platform Pending screen after the workspace-details step.

### Verified domain
The domain is already associated with a verified organisation.
- **Fields:** Company Name shown locked/read-only with a verified checkmark.
- **System message:** *"Scinode has already identified your company. You can continue with your account setup."*
- **Next state:** depends on whether the org is already approved *for this specific platform* (see "Org on This Platform" below) — either straight to Sign In (`activated`) or Cross-Platform Pending (`pending-platform`).

### Domain verification required
*Not a separate implemented state.* "New domain" above already represents "needs verification" — there is no additional in-between state in the current codebase. Flagged in Open Questions in case product intends a distinct third state here.

### Public domain
The email is from a public/personal provider (Gmail, Outlook, Yahoo, etc.).
- **Fields:** Company Name shown as an open text field, labeled **"Which company do you represent?"** (required).
- **System message:** *"Public email domain — your access will need admin approval either way."*
- **Next state:** `'pending'` → Cross-Platform Pending screen. **A public domain is never treated as an automatically verified organisation** — this is enforced by the existing branch logic (`afState.domain === 'public'` always routes to `isPending`, never `activated`).

### Org on This Platform (verified-domain only — determines new vs. cross-platform)
A verified-domain organisation can still be new *to Deep Research specifically*, even if it already has a Scinode account elsewhere:
- **Approved on this platform:** signup reason is `activated` → user is routed straight to Sign In after completing the workspace-details screen (see §8).
- **First entry on this platform:** signup reason is `pending-platform` → same Cross-Platform Pending screen as a brand-new domain, with the banner copy variant removed in the latest redesign (see §10 — the pending screen no longer varies its message by reason).

---

## 7. Sign-up (organic, new-user flow)

### Screen 1 — Account credentials
- **Heading:** "Get started with your account"
- **Subtext (above heading):** "Welcome to **Deep Research**" (bold platform name)
- **Eyebrow banner** (above everything): **"Already a part of the Scinode ecosystem?"** with an (i) info icon (hover/focus popover: *"What's part of the Scinode Ecosystem? Scinode / Scinode for Researchers / Scinode for Manufacturers / Deep Research"*), body copy *"Your Scinode account works across the ecosystem. Use your existing account here. No need to create another one."*, CTA **Sign In →**
- **Fields:** Email, Password, Confirm Password (see §3)
- **Primary CTA:** **Sign Up** (submit button; no longer "Continue to Workspace Details" — that copy was retired along with the old 2-step-wizard-in-one-form pattern)
- **SSO:** "Or continue with" divider, then Enterprise SSO (if domain matched) / Google / LinkedIn
- **Existing-account detection:** handled entirely by the eyebrow banner above — this prototype does not do live email-lookup; the banner is always present as the "if you already have an account, here's the door out" affordance.

### Screen 2 — Email verification
See §9.

### Screen 3 — Workspace details ("You're almost there")
Shown after Verify Email (direct signups) or immediately after SSO signup (identity already confirmed by the provider — no email verification step needed).

- **Identity header card** (signup only): avatar initial + full name + "✓ Email Verified" pill + email address. Confirms the account that was just created.
- **Heading:** "You're almost there"
- **Subtext:** "Your Scinode account is all set — just confirm a couple of details to set up your **Deep Research** workspace."
- **"How it works" infographic** (collapsed by default, expand via chevron): three equal steps, not a progress stepper — **Add Details → Get Verified → Access in 24 Hours**, each with an icon (pencil / shield-check / clock) and no per-step status.
- **Fields shown for Deep Research, first-time signup:** Company Name (see §3), Name, Phone Number, Terms/Privacy consent. **No Website field, no platform-specific question** (see §5).
- **Fields shown for Deep Research, recurring signup:** Name, Phone Number, Terms/Privacy consent only — no Company Name (never shown to recurring users, any platform).
- **Submit button label:** "Create Account" (direct source) or "Complete Sign Up" (SSO source).
- **On submit:** routes by the signup reason computed at Screen 1 submission (see §12 State Priority) — Cross-Platform Pending, or straight to Sign In if the org was already approved on Deep Research.

---

## 8. Sign-in

- **Fields:** Email, Password (both required unless "SSO org detected" devbar state is active, which swaps in an Enterprise-SSO-only panel)
- **Forgot password link:** "Forgot password?" → opens the 3-step forgot-password modal flow (§4)
- **SSO:** Google, LinkedIn (Enterprise SSO shown separately when an org panel is detected)
- **Footnote:** "Don't have an account? **Sign Up**"
- **Supported authentication methods** (already in codebase — do not invent others): Direct email/password, Google, LinkedIn, Enterprise SSO (domain-matched).

### Existing account without Deep Research access
This is the **existing-customer cross-platform** case (§1). On sign-in, if the account is recognized as an existing Scinode user without Deep Research access yet:
- If nothing is outstanding, routes to the workspace-details screen in existing-customer mode — for Deep Research, this currently shows no fields (see §5), so it functions as a simple confirmation step, then routes to Cross-Platform Pending.
- If the platform profile is already marked complete (devbar-simulated), skips straight to Cross-Platform Pending.

### Existing account with Deep Research access (plain sign-in)
- **Title:** "Welcome back!"
- **Body:** "Taking you straight to your workspace — no signup needed."
- **Info banner:** "Existing users always skip signup: matched to your existing account and company via the shared Scinode identity."
- **CTA:** "Continue to Deep Research →"

### Pending approval (sign-in attempt while still waiting)
Shows the same Cross-Platform Pending screen as §10 — the account's pending reason is fixed at signup and does not re-derive from current toggle state on a later visit.

### Just approved
- **Heading:** "Welcome to **Deep Research**, {FirstName}! Your account is approved." (uses the platform's full label, not a short account-noun abbreviation)
- **Subtext:** "Sign in to get started." *(This is the full, final subtext for every platform — the previous per-platform "…and start your first research query" clause has been removed.)*
- Illustration + Recommended First Steps panel (brand-panel side, left — do not modify) shown; on the right, the colleagues/team card is **not** shown for Just Approved (only for Just Verified — see below), since there's no established team activity on this platform yet for a brand-new approval.

### Just verified
- **Heading:** "{FirstName}, your email is verified and your account is approved."
- **Subtext:** "Welcome to **{Company}**'s space on Deep Research. Your team and workspace are ready—sign in to continue and get started" *(em dash, no trailing period — exact existing copy)*
- Colleagues/team activity card **is** shown here (team was already active on Deep Research beforehand, unlike Just Approved).

### Email not verified / Email just verified
Covered by the Verify Email screen states — see §9.

---

## 9. Email verification

### Verification required
- **Title:** "Verify your email"
- **Body:** "We've sent a verification link to **{email}**. Click the link in that email to continue."
- **Info banner:** "Verify your email to finish setting up your **Deep Research** account."
- **Primary CTA:** "I've verified — Continue"
- **Secondary action:** "Resend verification email"

### Verification email sent / Resend verification
System message on the resend button itself: label changes to **"Verification email resent ✓"** for 2.5 seconds (button disabled during that window), then reverts to "Resend verification email".

### Email still unverified
No distinct state exists beyond the default "Verification required" view above — clicking Continue before actually verifying is not specifically handled (this is a prototype; verification always "succeeds" when Continue is clicked). Flagged in Open Questions.

### Email just verified
- **Title:** "Your email is already verified"
- **Body:** "You can continue setting up your account."
- Resend action hidden; Continue proceeds directly.

*(Note: this "verified" sub-state of the Verify Email screen is a distinct devbar-only preview state, not the same thing as the "Just verified" sign-in landing in §8 — the former is about the Verify Email screen itself still being open when the email turns out to already be verified; the latter is the destination after verification completes. Do not conflate.)*

### Expired verification link
- **Title:** "This link has expired"
- **Body:** "Verification links expire after 24 hours for security. Request a new one below."
- Continue is hidden entirely; "Resend verification email" becomes the sole, primary action (styled as the main submit button, not the ghost/secondary style used elsewhere).

---

## 10. Approval

### Pending approval
- **Title:** "Your account is created with us"
- **Body:** "We're reviewing your profile and will notify you by email as soon as your access is ready, usually within 24–48 hours."
- Icon: clock, with a checkmark badge overlay.
- **This copy and layout is now identical regardless of *why* the account is pending** (new domain, public domain, or cross-platform expansion) — the previous design had a reason-specific banner ("Cross-platform expansion detected: …") and a 3-step "Verification Lifecycle" timeline; **both were removed** in the latest redesign. Do not re-add reason-specific messaging here.
- **"While you wait, explore Scinode" section** — 2 cards, Deep-Research-specific copy:
  - Card 1 — **"From Idea to Molecule"** — "Discover how AI helps chemists move from a target molecule to practical, commercially viable synthesis routes."
  - Card 2 — **"Beyond AI: Intelligence for Chemistry"** — "Explore why chemistry needs more than AI alone — and how human expertise, scientific reasoning, and AI come together to accelerate discovery."
- **A gif is planned for this screen** ("Abhishek's gif," per product) between the pending message and the explore cards — **not yet supplied**. A `TODO` comment marks the exact insertion point in `auth.html`. Do not fabricate placeholder art; leave the marker as-is until the asset is provided.

### Still pending (repeat visit / repeat sign-in attempt)
Same screen and copy as above — the account's pending state is fixed at signup and does not change on revisit.

### Just approved
Covered in §8 (this is a Sign In screen state, not a separate screen).

### Rejected
- **Title:** "We couldn't verify your company for this platform"
- **Body:** "We were unable to verify your company or confirm your eligibility for this platform with the information provided."
- **Info banner:** "If you believe this is incorrect, please contact our team at **support.deepresearch@scinode.ai**."
- **Reassurance line:** "**Don't worry! This doesn't mean you can't use Scinode.** You can still explore and access other platforms that may be relevant to your work."
- **"Explore Other Platforms" section:** lists the 3 platforms *other than* the one just rejected (Scinode, Scinode for Manufacturers, Scinode for Researchers, when rejected from Deep Research), each with its own one-line blurb.
- No recovery-action CTA is shown (no "reapply" button exists today) — whether the user can reapply, and whether "contact an administrator" is the only path, is **not defined** in the current implementation. Flagged in Open Questions.
- **This state does not currently exist in `invite.html`** — see Open Questions.

---

## 11. Reset password

Existing 10-step flow, unchanged for Deep Research:

1. **Forgot password** (link on Sign In) → opens modal
2. **Enter email** — modal title "Check Your Email", body "Please add your email and click on 'Reset'", field labeled "Work Email"
3. **Reset email sent** — closes that modal, opens "Verify your email address" modal (§4)
4. **Reset link** — prototype shortcut: "(Prototype) Simulate clicking the email link →" opens the Reset Password screen directly
5. **Expired reset link** — *not implemented as a distinct state* (Open Questions)
6. **Create new password** — heading "Reset your password", subtext "Choose a strong, unique password to secure your Scinode account.", fields "New Password" / "Confirm your new Password"
7. **Password mismatch** — "Passwords don't match." (`af-reset-password-match-error`)
8. **Password requirements** — same live checklist as §4
9. **Password successfully updated** — modal "Password Updated Successfully", CTA "Go to Sign in"
10. **Return to sign-in** — both the modal CTA and the screen's own "Back to Sign In" footnote link route to `#af-screen-signin`

---

## 12. Invitation flow (`invite.html`)

Deep Research invitation data currently in the codebase (`IV_PLATFORM.deepresearch`) — used as the example content below:

- Company: "Caltech Chemistry Lab"
- Invited by: "Dr. Ananya Rao" (Principal Investigator)
- Team: "Research (Computational & Experimental Chemistry)"
- Invitee: "Noah Fischer" / `noah.fischer@caltech.edu`

### Valid invitation (landing screen)
- **Badge:** "Platform Invitation" *(renamed from "Workspace Invitation" — latest copy decision)*
- **Heading:** "You've been invited to join **{Company}**"
- **Subtext:** "Connect with your organization and get started on the platform." *(unified across all 4 platforms — previously platform-specific benefit copy, now standardized)*
- **Card:** company avatar + name + platform badge ("Deep Research") + Verified pill; "Who Invited You" row (name + title); "Team" row *(relabeled from "Team & Department")*; personal invite message quote; teammate avatar stack + count ("Join 12 teammates already in this workspace")
- **CTA:** "Accept Invitation & Create Account →"
- Removed in the latest copy pass: the "{domain} · Verified Enterprise Account" line, "Assigned Role" row, "Invitation Sent To" row, "Expires in 7d", and the "Takes about ~60 seconds…" caption — none of these appear on the current landing card.

### Existing Scinode user + invitation
Authenticates using the existing account (single-step sign-in inside `#iv-screen-auth`, toggled via `ivState.existing`) — **does not create a duplicate account.** Skips directly to the Confirmation screen (no Step 2 profile fields — name/phone are already on file).

### New user + invitation
May need to create a Scinode account before accessing Deep Research. Step 1 (credentials) → Step 2 (profile: Name, Phone; **no platform-specific field or Website for Deep Research**, consent) → Verify Email (direct source only) → Sign In → Confirmation.

### Invitation email mismatch
**Not implemented** — there is no check today for "the currently entered/authenticated email differs from the invited email." Flagged in Open Questions.

### Expired invitation
**Not implemented** — no expiry message or recovery action exists in the current code (consistent with "Expires in 7d" being removed from the landing card entirely). Flagged in Open Questions.

### Already accepted invitation
**Not implemented** as a distinct message. The closest existing behavior: if `ivState.pendingAccount` is true and the org isn't yet approved on this platform, the landing CTA (`ivAccept()`) redirects straight to the Pending screen instead of the auth form — but there is no explicit "you already accepted this invite" state for an invitee who already has full access. Flagged in Open Questions.

### Already has access
**Not implemented** as a distinct message — see above.

### Step 2 — Profile details (screen-2 fields, invite-specific labels)
- **Heading:** "Tell the team about your role"
- **Subtext:** "{InvitedBy} and the {Company} team will see this on {profileActivity}." — for Deep Research: *"research queries, saved routes, and literature reviews"*
- **Fields:** Full Name, Job Title *(invite.html asks Job Title; the organic sign-up flow in `auth.html` does not have this field — an existing divergence, not introduced by this spec)*, Phone Number, Terms/Privacy consent. No Deep-Research-specific field (§5), no Website field for Deep Research.
- **Submit:** "Complete Setup & Enter Workspace →"

### Pending (cross-platform invite)
⚠️ **This screen's copy has not been updated to match `auth.html`'s latest simplification** (§10) — it still uses the older, reason-specific pattern:
- **Title:** "Your account is pending approval" *(not "Your account is created with us" — divergent from `auth.html`)*
- **Body:** "Scinode is an invite-only platform. Your account is pending admin approval. You will be notified in your registered email ID once access is approved."
- **Banner:** "**Cross-platform expansion** — {Company} is verified on Scinode, but hasn't been approved for Deep Research yet. An admin will review and approve this workspace before {FirstName} is activated. Approval usually takes 24–48 hours."
- **Bullet:** "{InvitedBy} and the rest of your team have already set up your role — no further action needed from you."
This is a real, current inconsistency between the two files — flagged in Open Questions rather than silently unified, since reconciling it is a product decision (which copy is correct going forward), not a documentation call.

### Sign-in-from-link states (approved / verified)
- **Just approved:** heading "You're all set, {FirstName}!", subtext "Your account has been approved. Sign in to accept your invitation.", success banner "**{Company}** has been approved for Deep Research. Start your first research workflow."
- **Just verified:** heading "{FirstName}, your email ID has been verified.", subtext "Sign in to join {Company} on Deep Research.", success banner "Your email is verified and {Company} is already verified. Sign in to accept your invitation."

### Confirmation (rich success screen)
Unlike `auth.html` (where the equivalent screen is now dead code — see §0), **this screen is live and reachable** in `invite.html` via `ivFinishAccept()` when the org is already approved on this platform.
- **Badge:** "Invitation accepted & access granted" (new user) / "Matched to your existing Scinode account" (existing user)
- **Headline:** "You're in, {FirstName}!"
- **Subtext:** "{InvitedBy} added you to **{Company}** on Deep Research. Your team is ready for you." (new user) / "Welcome back to **{Company}** on Deep Research — no new profile needed, you were matched to your existing Scinode account." (existing user)
- Company/role card, colleagues stack, Recommended First Steps checklist (Deep-Research-specific: "Invitation Accepted", "Run Your First Deep Research Query", "Complete Your Profile")
- **CTA:** "Continue to Deep Research Workspace →"

---

## 13. System message inventory

| Trigger | Exact copy | Type | Where it appears | Next action |
|---|---|---|---|---|
| Sign-up password mismatch | "Passwords don't match." | Error | Inline, below Confirm Password | Blocks submit |
| Reset password mismatch | "Passwords don't match." | Error | Inline, below Confirm new Password | Blocks submit |
| Industries not selected (ATOMS only — N/A for Deep Research) | "Select at least one industry." | Error | Inline | Blocks submit |
| Verified-domain company | "Scinode has already identified your company. You can continue with your account setup." | Informational/success | Info banner, Company Name field | None (informational) |
| New-domain company | "New domain — your company will go through a quick verification before activation." | Informational | Info banner | None |
| Public-domain company | "Public email domain — your access will need admin approval either way." | Informational | Info banner | None |
| Cross-platform expansion (signup-time preview, verified domain + org not yet approved) | "**Cross-platform expansion** — {Company} is verified on Scinode, but this will be its first account on Deep Research. Admin approval will be required after email verification." | Informational | Info banner, Company Name field | None |
| Verify email sent | "We've sent a verification link to **{email}**. Click the link in that email to continue." | Informational | Verify Email screen body | User clicks link or Resend |
| Verification resent | "Verification email resent ✓" | Success (transient, 2.5s) | Resend button label | Button re-enables |
| Verification link expired | "This link has expired" / "Verification links expire after 24 hours for security. Request a new one below." | Error | Verify Email screen | Resend becomes primary action |
| Account pending | "Your account is created with us" / "We're reviewing your profile and will notify you by email as soon as your access is ready, usually within 24–48 hours." | Informational/status | Cross-Platform Pending screen | None — passive wait |
| Account rejected | "We couldn't verify your company for this platform" / "We were unable to verify your company or confirm your eligibility for this platform with the information provided." | Error | Result screen | Contact support or explore other platforms |
| Plain sign-in (existing user, has access) | "Welcome back!" / "Taking you straight to your workspace — no signup needed." | Success | Result screen | Continue to Deep Research |
| Password reset link sent | "We've sent a password reset link to your email. Please check your inbox (and spam folder) and follow the link to reset your password." | Informational | Modal | User clicks link (or prototype shortcut) |
| Password updated | "Your password has been updated. Please sign in with your new credentials." | Success | Modal | Go to Sign in |
| Loading/empty states | *None found in the audited code* — no spinners, skeleton states, or empty-state copy exist anywhere in this auth flow. Flagged in Open Questions. | — | — | — |

---

## 14. Screen / state flow

```
ENTER EMAIL (Sign Up Screen 1)
    ↓
IDENTIFY ACCOUNT
    ↓
Existing Scinode account?
    ├── YES → Existing-account flow (Sign In, not Sign Up)
    │           ↓
    │         Has Deep Research access already?
    │           ├── YES → Plain sign-in → "Welcome back!" → Continue to Deep Research
    │           └── NO  → existing-customer workspace-details screen
    │                       ↓ (no fields to fill for Deep Research — see §5)
    │                     Org already approved on Deep Research?
    │                       ├── YES → Cross-Platform Pending (still shown — access is a fresh grant)
    │                       └── NO  → Cross-Platform Pending
    │                                   ↓ (admin approves, later)
    │                                 "Just Approved" sign-in landing
    └── NO → New user flow
                ↓
              Password + Confirm Password
                ↓
              Source: Direct or SSO?
                ├── Direct → Verify Email
                │              ↓ (I've verified — Continue)
                │            Workspace-details screen (signup-first or signup-recurring)
                └── SSO → Workspace-details screen directly (identity pre-verified)
                            ↓
                          Domain state (verified / new / public)
                            ├── New or Public domain → reason = 'pending'
                            ├── Verified + org already approved on Deep Research → reason = 'activated'
                            └── Verified + org NOT yet approved on Deep Research → reason = 'pending-platform'
                            ↓
                          Submit ("Create Account" / "Complete Sign Up")
                            ├── reason = 'activated'         → Sign In screen (pre-filled email)
                            └── reason = 'pending' or         → Cross-Platform Pending
                                'pending-platform'
                                ↓ (admin approves)
                              "Just Approved" sign-in landing
                                ↓ (admin rejects)
                              Rejected
```

**Invitation flow** (`invite.html`) branches the same way at "Existing Scinode account? YES/NO" but starts from the landing card's Accept CTA instead of Sign Up, and its Pending/Confirmation copy diverges from the above in the ways documented in §12.

---

## 15. State priority

Per the existing implementation, when multiple conditions are true, evaluation order is:

1. **Is there an active signin-link mode** (`approved` / `verify`, i.e. the user arrived via an email link)? If so, the sign-in screen renders the rich landing and a plain form submit just confirms inline — this takes priority over everything else.
2. **Is there a stored `pendingAccount`** (this exact account already submitted and is still waiting)? If so, any sign-in attempt re-shows that fixed pending state rather than re-deriving it from current devbar toggles.
3. **Is this an existing Scinode ecosystem account** (`existingCustomer`) on a different platform? If so, route through the existing-customer workspace-details screen — **never** through new-user sign-up, matching the explicit product rule in §1.
4. Otherwise, fall through to a plain sign-in attempt.

This order is enforced by the sequential `if` statements in `afSubmitSignin()`. This spec documents that existing order; it does not introduce new priority logic. If product intends a different priority (e.g. an invitation should out-rank an existing Scinode account, or vice versa), that is a decision the current code does not make explicitly for invite.html vs. auth.html cross-cases — flagged in Open Questions.

---

## 16. UX copy requirements (terminology)

**Audit finding on "organisation" vs. "company":** the codebase is **not** fully consistent today:

| Platform | Term used in Company Name label |
|---|---|
| ATOMS | "Company Name" |
| IONS | "Organization / Institute Name" |
| Scinode for Customers | "Organisation Name" |
| **Deep Research** | **"Company Name"** |

Deep Research currently uses "Company Name," matching ATOMS rather than the more research-oriented "Organisation" language used by IONS/Customers. This spec documents the existing behavior as-is and does **not** change it — but flags it in Open Questions, since a research-context platform using "Company" rather than "Organisation" may not be intentional.

**Preferred terms, used consistently elsewhere in the flow (confirmed from the audit):**
- Scinode account
- Deep Research (never abbreviated in user-facing copy)
- Work email / Organization Email Address (platform-dependent, per the `emailLabel` field — Deep Research uses plain "Email")
- Verify email
- Verify organisation *(not used verbatim anywhere in current copy — the closest equivalent is the Company Name verification banners in §7)*
- Approval / Approved
- Access
- Continue to Deep Research

Avoid (none of these appear in the current copy, and should stay out per the standing UX copy requirement): "Something went wrong," "Proceed," generic "Continue" where a more specific label exists, "Verification complete" without saying what was verified, "Account approved" where what was actually approved is Deep Research access specifically (the current copy correctly says "your account is approved" only in contexts where the *account* itself — not just platform access — is what's being confirmed, e.g. Just Approved/Just Verified headings referring to the whole account's approval state).

---

## 17. Do not change the left side

Implementation scope is limited to the right-side authentication experience described in this document. **Do not modify the left-side brand panel content, UI, interaction, layout, imagery, animation, or messaging** — this includes the illustration carousel, headline, ecosystem sub-line, "Invited by" chip and trust/benefit cards (`invite.html` landing), and the Recommended First Steps panel that appears on the brand panel for the Just Approved/Just Verified/rich-pending states.

---

## 18. Open Questions / Product Decisions Required

Do not guess answers to these — confirm with product before implementing anything that depends on them.

1. **Deep Research's deferred onboarding questions** (§5): where exactly do "What best describes your role?" and "What type of organisation are you part of?" get asked now? A "first login, post-approval, inside the dashboard" surface doesn't exist yet in this prototype. Is that dashboard flow in scope for this project, or a separate initiative?
2. **Existing-customer + Deep Research has an empty form.** Since Deep Research has no platform-specific field, the existing-customer workspace-details screen shows only "How it works" and an always-enabled Continue button. Is that the intended experience, or should this screen be skipped entirely for Deep Research (go straight to Cross-Platform Pending)?
3. **`invite.html`'s Pending screen copy has not been updated** to match `auth.html`'s simplified version (§12) — it still shows the older reason-specific banner and title. Should it be brought in line, and if so, with which copy (the two files currently disagree)?
4. **No "Rejected" state exists in `invite.html`.** If an invited user's organisation fails verification, what should happen? Should it reuse `auth.html`'s Rejected screen copy/logic?
5. **Rejected-account recovery.** Can a rejected user reapply? Is "contact an administrator" (with the platform-specific support email) the only path? No CTA for this exists today.
6. **Invitation email mismatch, expired invitation, already-accepted invitation, already-has-access** — none of these four states from the required list are implemented in `invite.html` today. Are they needed, and if so what should each say?
7. **Domain verification mechanism.** All domain states (new/verified/public) are currently devbar-simulated with no real backend check. Out of scope for this spec, but the actual verification mechanism (whom it calls, how long it takes) isn't documented anywhere in the codebase.
8. **Session/expiry behavior** not covered anywhere in the audited code: expired verification-link recovery beyond "click Resend," expired password-reset-link state, session timeout, rate limiting, network/server error states, loading states, or returning to an abandoned/incomplete flow mid-way. None of these exist today. Are any of them required for this spec's scope, or genuinely out of scope for this prototype?
9. **Terminology: "Company" vs. "Organisation" for Deep Research** (§16) — confirm whether Deep Research should keep "Company Name" or switch to "Organisation Name"/"Organization / Institute Name" for consistency with the other research-context platform (IONS).
10. **Accessibility requirements** — not specified anywhere in the current implementation or in available product docs; needs a separate accessibility pass/requirements doc if in scope.
11. **`#af-result-success` dead code** (§0) — this rich "Signup Confirmed" screen is fully built but currently unreachable. Should it be deleted, or is there a scenario where it's meant to still fire?
12. **invite.html's Step 2 asks "Job Title"; `auth.html`'s equivalent screen does not.** Is Job Title intentionally invite-only, or should it be added to (or removed from) one side for consistency?

---

## 19. Final checklist

- [x] All right-side screens documented (Sign Up, Verify Email, workspace-details/"You're almost there," Sign In incl. Just Approved/Just Verified, Cross-Platform Pending, Rejected, Reset Password + 3 modals, Invitation landing, Invitation auth (2-step), Invitation Pending/Verify/Sign-in/Confirmation)
- [x] All fields documented, including Deep Research's current "no platform-specific field" state
- [x] All field validations documented
- [x] All CTAs documented
- [x] All system messages documented (§13)
- [x] Sign-up covered
- [x] Sign-in covered
- [x] Invitation covered
- [x] Email verification covered
- [x] Domain verification covered (new / verified / public — "domain verification required" not separately implemented, flagged)
- [x] Public domain covered
- [x] Password reset covered
- [x] Pending approval covered
- [x] Just verified covered
- [x] Just approved covered
- [x] Existing Scinode user covered
- [x] Existing Deep Research user covered (plain sign-in, already has access)
- [x] Duplicate-account prevention covered (§1 — existing-customer routing never goes through sign-up)
- [ ] Loading/error states — **not covered**, because none exist in the audited implementation (see Open Question 8)
- [x] Edge cases covered where they exist in code; **not implemented** edge cases are explicitly listed rather than invented (Open Questions 3, 4, 5, 6, 8)
- [x] Left-side scope explicitly excluded (§17)
- [x] Open product decisions identified (§18)
