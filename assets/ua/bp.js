/* Access Blueprint — scope, rules, conflicts, simulators. Static content + two interactive tools. */
(function () {
  'use strict';
  const UA = window.UA, ic = UA.ic, esc = UA.esc;
  const chip = (t, c) => '<span class="ub ' + (c || 'gray') + '">' + t + '</span>';
  const PH = { 1: chip('Phase 1', 'teal'), 2: chip('Phase 2', 'navy'), 3: chip('Phase 3', 'gray') };
  const ST = { proto: chip(ic('check', 11) + 'Prototyped', 'success'), be: chip('Backend', 'info'), spec: chip('Spec’d · to design', 'warn'), nuc: chip('Nucleus', 'navy') };
  const link = (label, href) => '<a class="ua-link" href="' + href + '">' + label + ic('arrow', 12) + '</a>';

  /* ───────────── Scope map (the answer to “what else needs to be built”) ───────────── */
  const UI = [
    ['Organization tab', 'Org identity, plan, capacity counters (X/2 Members, X/1 Superadmin), Day 0 setup, org directory tree.', 1, 'proto', 'users-access.html?tab=organization'],
    ['Teams tab', 'Free = Premium gate with a clickable Create Team. Premium = create/manage Teams, assign Admin, per-Team module on/off, Team members.', 1, 'proto', 'users-access.html?plan=premium&day=1&tab=teams'],
    ['Members tab', 'Directory with Role / Team / Status filters, detail drawer, View/Use per module, change role, suspend, remove.', 1, 'proto', 'users-access.html?tab=members&plan=premium&day=1'],
    ['Add New User (send side)', 'Role → capacity check → details → send. Blocked actions open the Premium modal, never a dead end. <i>Confirm overlap with your invite flow.</i>', 1, 'proto', 'users-access.html?tab=members'],
    ['Invitations / Applications tab', 'Sent → Joined → Waiting for Approval → Approved / Rejected tracker, separate from the directory. Admin/Superadmin only.', 1, 'proto', 'users-access.html?plan=premium&day=1&tab=invitations'],
    ['Access & Approvals tab', 'One review table: Request to Use, Request to View, public-domain invitation approvals. Approve / Reject / Edit & Approve + audit.', 1, 'proto', 'users-access.html?plan=premium&day=1&tab=approvals'],
    ['Upgrade popups + Upgrade Intent', 'Five action-specific popups with live usage copy; captures an intent record and routes it per platform.', 1, 'proto', 'users-access.html?open=upgrade'],
    ['Superadmin ownership transfer', 'Request → confirm → pending state. Takes effect only after Nucleus approval; requester stays Superadmin meanwhile.', 1, 'proto', 'users-access.html?tab=organization'],
    ['Org Activity / My Activity / Request to View / Upgrade to Use — pattern', 'Reusable block for every activity-generating module. Pattern is prototyped; <b>rolling it into each module is still to build</b> (Market Pulse, Deep Research, Demand Catalyst, Projects, Proposals, Requests).', 1, 'spec', 'users-access.html?open=preview&plan=premium&day=1'],
    ['Email notification templates (V1)', '13 triggers in the notification matrix (invite sent, accepted, approved/denied, admin-sent-invite → Superadmin, …). Copy exists; templates aren’t designed.', 2, 'spec', '#s-notify']
  ];
  const BE = [
    ['Identity, company & domain model + migration', 'User, Company, Company Domain Mapping, Platform Membership, Team, Team Membership, Module Permission, Subscription, Entitlement, Invitation. Dedupe existing users/companies/suppliers without creating duplicates.', 1],
    ['Domain-matching & company-routing engine', 'Public-domain check → private-domain lookup → new vs existing company. Public list is a config table, never hard-coded.', 1],
    ['Shared authorization service — canUserAccess()', 'One server-side 14-step precedence check for every platform. Front-end hiding is never a substitute.', 1],
    ['Entitlement & allowance engine', 'Member ≤ Team ≤ Organization allowance. Pools belong to the Company ID — never multiplied by users, teams or platforms.', 1],
    ['Capacity checks before create', 'Free = 1 Superadmin + 2 Members + 0 Teams, enforced before creating/activating anything plan-controlled.', 1],
    ['Upgrade Intent service', 'User, role, plan, trigger event, source screen, timestamp → routed to the right Ops team (Deep Research → IONS Ops, kept configurable).', 1],
    ['Access Request workflow', 'Request to Use / Request to View entity + endpoints, routed to Team Admin or Superadmin. Changes a permission — never a role or Team.', 1],
    ['Audit log + Module Activity Log', 'Two append-only tables: internal audit trail vs the customer-facing per-module Org Activity feed.', 1],
    ['Event-driven email service', 'Verification, signup submitted, pending approval, invitation sent/reminder, approved/rejected, role/permission changed, suspended/removed.', 2],
    ['Keycloak SSO (Google, LinkedIn, Enterprise OIDC/SAML)', 'Retrofit into Deep Research + Scinode; company-level enterprise SSO routing. Phase 1 keeps the existing JWT SSO.', 2],
    ['Org-level data sharing pattern', 'Company Profile, Market Pulse, Deep Research, Demand Catalyst and Projects stored once against company_id, gated by module permission.', 3]
  ];
  const NUC = [
    ['Applications queue', 'Pending / needs-routing / approved / rejected. “Existing organization found → View / Route”, “None found → Add New / Reject”. Approving never duplicates a company.', 1],
    ['Organization creation on approval', 'Admin confirms the company → create Company ID → map the applicant → verify → approve membership.', 1],
    ['Minimal audit trail on approvals & routing', 'Who did what, when, old → new value.', 1],
    ['Organization Detail', 'Overview · People & Teams · Platforms · Subscription (read-only, links to Billing) · Allowance · Activity, with a Keka-style org tree.', 3],
    ['Organization Allowance editor', 'Restricted to Nucleus Super Admin. Everyone else is rejected server-side, even on a direct API call.', 3],
    ['Superadmin change-request queue', 'Lives inside Applications as a sub-type. Approve = role reassigned + audit; reject = unchanged + reason.', 3],
    ['Nucleus roles', 'Exactly three: Super Admin, Admin, Team (platform-scoped). Distinct from customer Platform Roles.', 3]
  ];
  function scope() {
    const list = (arr, kind) => arr.map((r) => '<div class="bp-item"><div style="flex:1;min-width:0"><div class="t">' + r[0] + '</div><div class="s">' + r[1] + '</div><div class="tags">' + PH[r[2]] + (kind === 'ui' ? ST[r[3]] : kind === 'be' ? ST.be : ST.nuc) + (kind === 'ui' && r[4] && r[4][0] !== '#' ? link('Open', r[4]) : '') + '</div></div></div>').join('');
    return '<div class="bp-built"><div class="b">' + ic('check-circle', 18) + '<div>Sign up / Sign in<small>auth.html · already built</small></div></div><div class="b">' + ic('check-circle', 18) + '<div>SSO (Google · LinkedIn · Enterprise)<small>screens built · Keycloak backend is Phase 2</small></div></div><div class="b">' + ic('check-circle', 18) + '<div>Invite acceptance<small>invite.html · already built</small></div></div></div>' +
      '<div class="bp-cols"><div class="ua-card"><div class="bp-col-h"><span class="ua-ic">' + ic('monitor', 16) + '</span><div><div class="ua-h" style="font-size:15px">Customer-facing UI</div><div class="ua-hint">Users &amp; Access · shared by 4 platforms</div></div></div>' + list(UI, 'ui') + '</div>' +
      '<div class="ua-card"><div class="bp-col-h"><span class="ua-ic navy">' + ic('layers', 16) + '</span><div><div class="ua-h" style="font-size:15px">Backend &amp; services</div><div class="ua-hint">No screens — but the UI depends on them</div></div></div>' + list(BE, 'be') + '</div>' +
      '<div class="ua-card"><div class="bp-col-h"><span class="ua-ic gold">' + ic('key', 16) + '</span><div><div class="ua-h" style="font-size:15px">Nucleus (internal)</div><div class="ua-hint">UI layer over the same org / user tables</div></div></div>' + list(NUC, 'nuc') + '</div></div>';
  }

  /* ───────────── Who sees what ───────────── */
  function visibility() {
    const rows = [
      ['Organization', 'Full · admin controls limited', 'Full', 'Not available', 'Scoped to their Team(s), read-only', 'Own context only', 'Own context only'],
      ['Teams', 'Visible, upgrade-gated', 'Full management', 'Not available', 'Assigned Teams only', 'Own access only', 'Own Teams only'],
      ['Create Team', 'Opens upgrade popup', 'Yes', '—', '<span class="n">No</span>', '<span class="n">No</span>', '<span class="n">No</span>'],
      ['Members · invite', 'Up to 2 seats', 'Per plan', '—', 'Members only, own Team, notifies Superadmin', '<span class="n">Never</span>', '<span class="n">Never</span>'],
      ['Create Admin / extra Superadmin', 'Locked · upgrade popup', 'Yes', '—', '<span class="n">No</span>', '<span class="n">No</span>', '<span class="n">No</span>'],
      ['Invitations / Applications', 'Yes', 'Yes', '—', 'Yes (scope)', '<span class="n">Hidden</span>', '<span class="n">Hidden</span>'],
      ['Access & Approvals', 'Yes', 'Yes', '—', 'Yes (scope)', '<span class="n">Hidden</span>', '<span class="n">Hidden</span>'],
      ['Org Activity (per module)', 'Org-wide + My Activity', 'Org-wide + My Activity', '—', 'Enabled modules only', 'Awareness + Request to View', 'Awareness + Request to View'],
      ['Upgrade to Use', '<span class="n">No</span>', '<span class="n">No</span>', '—', '<span class="n">No</span>', 'Wherever View is held', 'Wherever View is held'],
      ['Transfer Superadmin', 'Request only', 'Request only', '—', '<span class="n">No</span>', '<span class="n">No</span>', '<span class="n">No</span>']
    ];
    return '<div class="ua-tbl-wrap"><div class="bp-scroll"><table class="bp-mx"><thead><tr><th>Area</th><th>Superadmin · Free</th><th>Superadmin · Premium</th><th>Admin · Free</th><th>Admin · Premium</th><th>Member · Free</th><th>Member · Premium</th></tr></thead><tbody>' +
      rows.map((r) => '<tr><td class="k">' + r[0] + '</td>' + r.slice(1).map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div></div>' +
      '<div class="ua-banner neutral"><span>' + ic('info', 16) + '</span><div class="grow">Three layers apply to every tab — <b>Visibility</b> (can I see it?), <b>Scope</b> (what’s inside?), <b>Action</b> (what can I do?). Free/Premium decides whether a capability exists; Day 0/Day 1 decides how much of it is surfaced. Try any cell in the <a class="ua-link" href="users-access.html">prototype</a> with the presenter bar.</div></div>';
  }
  function rules() {
    const free = [['Superadmins', '1 (doesn’t use a Member seat)', 'Configurable'], ['Members', 'Up to 2', 'Configurable, beyond Free cap'], ['Teams', '0 — tab + Create Team stay visible', 'Enabled'], ['Admin role', 'Not creatable (needs a Team)', 'Enabled · needs ≥ 1 Team']];
    return '<div class="ua-grid c2"><div class="ua-tbl-wrap"><table class="bp-mx"><thead><tr><th>Capacity</th><th>Free</th><th>Premium</th></tr></thead><tbody>' + free.map((r) => '<tr><td class="k">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') + '</tbody></table></div>' +
      '<div class="ua-card"><div class="ua-h" style="font-size:15px">Premium is triggered by</div><div class="ua-list" style="margin-top:8px">' + ['Creating any Team', 'Adding a Member past the 2 Free seats', 'Adding a second Superadmin', 'Creating an Admin (requires a Team)'].map((t, i) => '<div class="ua-li"><span class="ua-ic gold">' + (i + 1) + '</span><div class="grow t">' + t + '</div></div>').join('') + '</div><div class="ua-hint">Each runs a capacity check <b>before</b> the resource is created; if blocked, an upgrade intent is captured and a “request received” email is sent — never implying the upgrade is done.</div></div></div>';
  }

  /* ───────────── canUserAccess simulator ───────────── */
  const STEPS = [
    [1, 'Nucleus user active?', 'NUCLEUS_USER_INACTIVE', 'n'],
    [2, 'Nucleus Role permits this action?', 'NUCLEUS_ROLE_FORBIDS_ACTION', 'n'],
    [3, 'Platform within the Team user’s Platform Scope?', 'PLATFORM_OUT_OF_SCOPE', 'n'],
    [4, 'Organization active?', 'ORGANIZATION_INACTIVE', 'c'],
    [5, 'Organization–Platform membership active?', 'PLATFORM_MEMBERSHIP_INACTIVE', 'c'],
    [6, 'Active Organization Member?', 'NOT_ACTIVE_ORG_MEMBER', 'c'],
    [7, 'Member of the relevant Team?', 'NOT_TEAM_MEMBER', 'c'],
    [8, 'Module enabled for that Team?', 'MODULE_DISABLED_FOR_TEAM', 'c'],
    [9, 'User’s Module Permission allows the action?', 'NO_MODULE_PERMISSION', 'c'],
    [10, 'Subscription covers the module?', 'SUBSCRIPTION_DOES_NOT_COVER_MODULE', 'c'],
    [11, 'Organization has remaining allowance?', 'ORGANIZATION_ALLOWANCE_EXHAUSTED', 'c'],
    [12, 'Team has an allocation?', 'TEAM_ALLOCATION_MISSING', 'c'],
    [13, 'Member has an allocation?', 'MEMBER_ALLOCATION_MISSING', 'c'],
    [14, 'Remaining allowance available?', 'ALLOWANCE_EXHAUSTED', 'c']
  ];
  const UI_RESP = { 8: 'Deny. Team-disabled always overrides the user’s own permission.', 9: 'Deny — or offer the Request to Use / Upgrade to Use path.', 10: 'Restrict and show the upgrade prompt.', 11: 'Permission is fine but the org is out of allowance — restrict + upgrade prompt.', 14: 'Same as above: permission and entitlement fail independently.', 7: 'Deny. Members with no Team may still pass if org-level permissions apply (platform-dependent).' };
  const sim = { caller: 'c', fail: 0 };
  UA.bpFail = function (n) { sim.fail = sim.fail === n ? 0 : n; sim.preset = null; renderSim(); };
  UA.bpCaller = function (c) { sim.caller = c; if (c === 'c' && sim.fail && sim.fail < 4) sim.fail = 0; renderSim(); };
  UA.bpPreset = function (n) { sim.fail = n; renderSim(); };
  function renderSim() {
    const el = document.getElementById('bp-sim'); if (!el) return; let failed = null;
    const rows = STEPS.map((s) => {
      const na = sim.caller === 'c' && s[3] === 'n';
      let cls = 'pass', st = 'Pass';
      if (na) { cls = 'skip'; st = 'N/A for customer users'; } else if (failed) { cls = 'skip'; st = 'Not evaluated'; } else if (sim.fail === s[0]) { cls = 'fail'; st = 'Fails'; failed = s; }
      return '<div class="bp-step ' + cls + '"><span class="no">' + (cls === 'pass' ? ic('check', 12) : cls === 'fail' ? ic('x', 12) : s[0]) + '</span><div class="q">' + s[1] + '<small>' + st + '</small></div>' + (na ? '' : '<button type="button" class="ua-link" onclick="UA.bpFail(' + s[0] + ')">' + (sim.fail === s[0] ? 'Undo' : 'Make this fail') + '</button>') + '</div>';
    }).join('');
    const ok = !failed;
    const res = '<div class="bp-result ' + (ok ? 'ok' : 'no') + '"><div class="ua-xs" style="letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.6)">canUserAccess(…) returns</div><div class="v" style="margin-top:6px">' + (ok ? 'ALLOW' : 'DENY') + '</div><div class="r">' + (ok ? 'All layers passed. Consume from the shared, organization-level entitlement — one pool per module, never split per user or team.' : 'Stopped at step <b>' + failed[0] + '</b>. ' + (UI_RESP[failed[0]] || 'Deny with a reason code.')) + '</div>' +
      '<div class="bp-json">' + (ok ? '{ allowed: true,\n  permission: "USE",\n  remaining_allowance: 12 }' : '{ allowed: false,\n  reason: "' + failed[2] + '" }') + '</div></div>';
    const presets = '<div class="bp-opts"><span class="ua-xs ua-muted">Try:</span>' + [['View-only user', 9], ['Team disabled the module', 8], ['Allowance exhausted', 11], ['Not on the Team', 7], ['All pass', 0]].map((p) => '<button type="button" class="btn btn-outline btn-sm" onclick="UA.bpPreset(' + p[1] + ')">' + p[0] + '</button>').join('') + '</div>';
    el.innerHTML = '<div class="ua-row wrap" style="margin-bottom:12px"><div class="ua-seg"><button type="button" class="' + (sim.caller === 'c' ? 'on' : '') + '" onclick="UA.bpCaller(\'c\')">Customer user</button><button type="button" class="' + (sim.caller === 'n' ? 'on' : '') + '" onclick="UA.bpCaller(\'n\')">Nucleus user</button></div><span class="ua-xs ua-muted">Steps 1–3 apply only to internal Nucleus users.</span></div>' + presets + '<div class="bp-sim" style="margin-top:14px"><div>' + rows + '</div><div style="position:sticky;top:76px">' + res + '<div class="ua-hint" style="margin-top:10px">Only <span class="ua-code">ORGANIZATION_ALLOWANCE_EXHAUSTED</span> appears in the PRD; the other reason codes are illustrative names for the engineering team to confirm.</div></div></div>';
  }

  /* ───────────── Approval resolver ───────────── */
  const PLAT = { none: 'Brand-new person', scinode: 'Scinode', manufacturers: 'Scinode for Manufacturers', researchers: 'Scinode for Researchers', deepresearch: 'Deep Research' };
  const rs = { entry: 'organic', domain: 'private', from: 'none', to: 'manufacturers', org: 'no' };
  UA.bpSet = function (k, v) { rs[k] = v; renderResolve(); };
  function prd(s) {
    const g1 = s.domain === 'public', notes = [];
    notes.push('<b>Gate 1 · company mapping:</b> ' + (g1 ? 'Required — public domains never establish company identity' : 'Not required — verified private domain'));
    let g2 = 'na';
    if (s.from === 'none' || s.from === s.to) notes.push('<b>Gate 2 · cross-platform:</b> N/A — no cross-platform movement');
    else if (s.from === 'scinode' && s.to !== 'scinode') { g2 = 'req'; notes.push('<b>Gate 2 · cross-platform:</b> Required — Scinode → ' + PLAT[s.to] + ' always needs platform approval'); }
    else if (s.to === 'scinode') notes.push('<b>Gate 2 · cross-platform:</b> Not required — moving <i>to</i> Scinode is the defined no-new-approval path');
    else { g2 = 'undef'; notes.push('<b>Gate 2 · cross-platform:</b> <span style="color:#991B1B">Not specified</span> — the matrix has no ' + PLAT[s.from] + ' → ' + PLAT[s.to] + ' row'); }
    notes.push('<b>Approver:</b> Nucleus Admin (Applications queue)');
    const out = g2 === 'undef' ? 'u' : (g1 || g2 === 'req') ? 'p' : 'a';
    return { out: out, notes: notes };
  }
  function design(s) {
    const notes = []; let out = 'a'; const first = s.org === 'no';
    if (s.domain === 'public') { out = 'p'; notes.push('<b>Public / unverified domain</b> → always Pending Admin Approval'); }
    else if (s.to === 'scinode' && s.from !== 'none' && s.from !== 'scinode') notes.push('<b>Entering Scinode from another platform</b> → no approval (defined exception)');
    else if (s.entry === 'invited' && (s.from === 'none' || s.from === s.to) && s.from === s.to) notes.push('<b>Same-platform invitation, private domain</b> → no approval');
    else if (first) { out = 'p'; notes.push('<b>Org’s first entry to ' + PLAT[s.to] + '</b> → Pending Admin Approval (org-level, once)'); }
    else notes.push('<b>Org already approved for ' + PLAT[s.to] + '</b> → Active after verify / accept');
    notes.push('<b>Approver:</b> relevant platform Admin — Team Admin, or Superadmin if no Team (customer-side Access &amp; Approvals)');
    notes.push('<b>Granularity:</b> per organization × platform — later users skip it');
    return { out: out, notes: notes };
  }
  const LBL = { a: 'Active immediately', p: 'Pending Admin Approval', u: 'Undefined by the docs' };
  function renderResolve() {
    const el = document.getElementById('bp-resolve'); if (!el) return;
    const sel = (k, opts) => '<div class="ua-field"><label>' + opts[0] + '</label><select class="ua-select" style="width:100%" onchange="UA.bpSet(\'' + k + '\',this.value)">' + opts[1].map((o) => '<option value="' + o[0] + '"' + (rs[k] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></div>';
    const a = prd(rs), b = design(rs), diff = a.out !== b.out;
    const box = (h, r) => '<div class="bp-out"><div class="h">' + h + '</div><div class="res ' + r.out + '">' + LBL[r.out] + '</div><ul>' + r.notes.map((n) => '<li>' + n + '</li>').join('') + '</ul></div>';
    el.innerHTML = '<div class="bp-resolve">' + sel('entry', ['Entry type', [['organic', 'Organic joiner'], ['invited', 'Invitee']]]) + sel('domain', ['Email domain', [['private', 'Verified private domain'], ['public', 'Public (gmail, outlook…)']]]) +
      sel('from', ['Existing user from', Object.keys(PLAT).map((k) => [k, PLAT[k]])]) + sel('to', ['Target platform', Object.keys(PLAT).filter((k) => k !== 'none').map((k) => [k, PLAT[k]])]) + sel('org', ['Org already approved for target?', [['yes', 'Yes'], ['no', 'No — first entry']]]) + '</div>' +
      '<div class="bp-outs" style="margin-top:16px">' + box('Consolidated PRD §4.2 / §4.3 · canonical', a) + box('Design Spec Part 1 §12.5 – 12.9', b) + '</div>' +
      (diff ? '<div class="ua-banner warn" style="margin-top:16px"><span>' + ic('alert', 16) + '</span><div class="grow"><div class="t">The two documents give different answers for this case</div><div>See open question 2 below. This is the single most valuable thing to settle with Product before Phase 1 ships.</div></div></div>' : '<div class="ua-banner ok" style="margin-top:16px"><span>' + ic('check-circle', 16) + '</span><div class="grow">Both documents agree on the outcome for this case.</div></div>');
  }

  /* ───────────── Open questions / conflicts ───────────── */
  const Q = [
    ['must', 'Who approves a public-domain signup — Scinode (Nucleus) or the customer’s own Admin?',
      'PRD §4.2 / §10 and the summary: an <b>Admin in Nucleus</b> reviews the Applications queue and maps the company.', 'Design Spec §10.1 / §12.6: the request appears in the customer’s <b>Access &amp; Approvals</b>, routed to a Team Admin or Superadmin.',
      'Both exist: Nucleus for company/platform gates, customer-side queue for the approval row. Labelled “Waiting for Scinode approval” to match the spec.', 'Product'],
    ['must', 'Is cross-platform approval per person, or per organization × platform? And what about brand-new users?',
      'PRD matrix: approval when an <i>existing user moves</i> (Scinode → Manufacturers/Researchers/Deep Research). A brand-new verified user entering a platform is <b>Active</b> — gate 2 “doesn’t apply”. No rows for Manufacturers ↔ Researchers ↔ Deep Research.', 'Design Spec §12.5 – 12.8: approval is <b>organization-level, once per platform</b>. First verified-domain user entering a new platform is <b>Pending Admin Approval</b>.',
      'The simulator above shows both. The prototype follows the Design Spec for what users see.', 'Product + Eng'],
    ['must', 'Do module permissions carry across platforms?',
      'PRD §3.1 rule + master doc: a role, team, invitation or permission on one platform must <b>not</b> be copied to another. Module Permission is keyed on <span class="ua-code">membership_id</span> (per platform).', 'PRD §5.1 highlighted edge case: for shared modules (Market Pulse, Deep Research) the permission is <b>user-level and carries forward</b> to the next platform. Deep Research is also a platform <i>and</i> a gated module inside the other three.',
      'Permissions are per platform (matches the DB model). Cross-platform carry-forward is not built.', 'Product + Eng'],
    ['must', 'Can an Admin create a Team?',
      'PRD §5.1 action table: Create / delete teams — Superadmin ✓, <b>Admin ✓</b>. Master doc: Admin “can create/manage teams”.', 'PRD §5.3, Design Spec §3.2 / §3.4: an Admin can <b>never</b> create a Team or invite another Admin.',
      'Admins cannot create Teams (the majority, and the newer text).', 'Product'],
    ['must', 'Can Members invite people?',
      'Master UI doc (99 pp): Members can invite Members; the invite needs Team Admin / Superadmin approval.', 'PRD rule 27 + Design Spec §3.3: <b>Members can never invite, on any plan.</b> (Design Spec §8.2 still mentions “approve Member-invited users” — a leftover.)',
      'Members cannot invite. Master doc treated as superseded.', 'Confirm'],
    ['soon', 'Do pending invitations use up a Member seat?',
      'Not specified. Free = 2 Member seats.', 'A Free org could over-invite unless invites reserve seats.',
      'Sent invitations reserve a seat; cancelling releases it.', 'Product'],
    ['soon', 'What role does the outgoing Superadmin keep after an approved transfer?',
      'Docs: current Superadmin keeps ownership until Nucleus approves; audit records previous / new / approver / timestamp.', 'Nothing about what the previous owner becomes, or who is eligible to receive ownership.',
      'Outgoing Superadmin becomes a Member; any active non-Superadmin can be nominated.', 'Product'],
    ['soon', 'How does a Member with <i>No Access</i> ask for access?',
      'Only Request to Use (View → Use) and Request to View (restricted history) are defined.', 'Design Spec §8.2 hints at a “[Request access]” CTA on the Member’s Organization tab, with no flow behind it.',
      '“Request access” creates a Request to Use.', 'Design'],
    ['soon', 'Is the “Manage” permission real?',
      'PRD glossary: “four values only” but lists three (No Access → View → Use); DB access_level and the Nucleus Team role include <b>Manage</b>.', 'Design Spec uses View / Use only.',
      'Customer UI uses three values; Manage is Nucleus-only.', 'Eng + Design'],
    ['soon', 'Upgrade: Billing page, or intent → Ops email?',
      'Design Spec §13.2: on Scinode for Manufacturers the CTA routes to <b>Billing</b>.', 'PRD §6.2: capture an <b>Upgrade Intent</b>, email Ops, send a “request received” note. Deep Research routes to IONS Ops for now — keep configurable.',
      'Intent is captured and shown with its destination; the plan never flips by itself.', 'Product'],
    ['soon', 'One Team or many? How do Team permissions combine?',
      'PRD open Q2: “configurable — don’t assume one user = one team”. PRD §5.3: effective = the <i>more restrictive</i> of Team access and user permission.', 'Design Spec §12.10: where Teams disagree, the <b>highest</b> applicable permission wins.',
      'Members can be in several Teams; a module is on if <i>any</i> Team enables it, then ANDed with the user’s permission.', 'Product'],
    ['soon', 'Can a person belong to more than one company?',
      'PRD open Q1: unresolved. Fallback: if not supported, an existing user invited to a second company needs Admin handling — never a second User row.', 'Affects invitation acceptance and the Nucleus reassignment flow.',
      'One company per person; not exercised in this prototype.', 'Product'],
    ['fyi', 'Three vs five role labels',
      'Master doc: Owner / Admin / Team Manager / Member / Viewer.', 'PRD + Design Spec: three stored roles. Owner = Superadmin; Team Manager = a Team-scoped Admin/Member; Viewer = a Member capped at View.',
      'Three roles. “Team Manager” and “Viewer” are derived, not stored. PRD asks design to confirm.', 'Design'],
    ['fyi', 'Platform names and module lists',
      '“Scinode for Customers” (SSO doc, auth.html) vs “Scinode” (this spec). ATOMS → Scinode for Manufacturers, IONS → Scinode for Researchers, so “Scinode” now appears in three names.', 'Design Spec §5.3 lists more Researchers modules (R&D, CROs, Labs, R&D Projects) than the gated list in §5.4 / PRD §9.1.',
      'Names per this spec; only the gated modules carry permissions.', 'Design'],
    ['fyi', 'Status vocabularies',
      'PRD §8.4 gives Platform Membership only Pending / Active / Removed.', 'The UI needs Suspended, Rejected, Cancelled, Invitation Sent / Accepted / Signup Completed (Design Spec §9.4).',
      'Kept as separate fields: invitation status, application status, membership status.', 'Eng'],
    ['fyi', 'Minimal notifications in Phase 1?',
      'PRD open Q6: Phase 1 covers Nucleus approvals and invitation acceptance but not email triggers.', 'Design Spec §12.11 already lists 13 notification triggers.',
      'Toasts show who would be notified; no emails built.', 'Product']
  ];
  const SEV = { must: ['Resolve before build', 'err'], soon: ['Decide soon', 'warn'], fyi: ['Confirm', 'gray'] };
  function questions() {
    return '<div class="ua-banner info"><span>' + ic('info', 16) + '</span><div class="grow"><b>How the four documents relate.</b> The 99-page master UI doc is the oldest (3 tabs, Members can invite, 5 role labels). <b>Design Spec Part 1</b> is the source of truth for UI (5 tabs, Org Activity, gated/universal modules). The <b>Consolidated PRD</b> is canonical for architecture, data and the 30 rules. The summary doc is a digest of the other three.</div></div>' +
      Q.map((q, i) => '<div class="ua-card bp-q ' + q[0] + '"><div class="no">' + (i + 1) + '</div><div><h4>' + q[1] + ' <span class="ub ' + SEV[q[0]][1] + '">' + SEV[q[0]][0] + '</span></h4><div class="cmp"><div><small>Says</small>' + q[2] + '</div><div><small>But</small>' + q[3] + '</div></div><div class="as">' + ic('arrow', 14, 'var(--teal-600)') + '<div><b>Prototype assumes:</b> ' + q[4] + ' &nbsp;·&nbsp; <span class="ub gray">Owner: ' + q[5] + '</span></div></div></div></div>').join('');
  }

  /* ───────────── Phase plan ───────────── */
  function phases() {
    const P = [
      [1, 'Roles, teams & entitlement engine', 'Target 23 Sep 2026 · Deep Research rollout + standardising users across platforms; keeps the existing JWT SSO', [
        ['Company, Domain Mapping, Public Email Domain (config), Signup Application tables', 0, 'be'], ['User + Platform Membership (unique per user / company / platform)', 0, 'be'], ['Migration: dedupe dbo.users / dbo.company / sci.suppliers', 0, 'be'],
        ['Domain-matching engine + company routing for Admin (Add & Lock)', 0, 'be'], ['Cross-platform reuse + approval matrix', 0, 'be'], ['Roles + default-assignment rules', 1, ''], ['Team, Team Membership, Module Permission, capacity checks, Premium gating', 1, ''],
        ['Subscription (read from Billing) + Entitlement + allocation hierarchy', 0, 'be'], ['Shared authorization service (14 steps)', 0, 'be'], ['Full Users & Access UI — Organization / Teams / Members', 1, ''], ['Add New User, Edit Access, Superadmin transfer request', 1, ''],
        ['Upgrade-intent capture + platform routing', 1, ''], ['Access Request entity + endpoints', 1, ''], ['Module Activity Log surfaced per module', 1, 'partial'], ['Invitations / Applications tab', 1, ''], ['Access & Approvals tab', 1, ''], ['Create Team CTA visible + clickable on Free', 1, ''],
        ['Shared 3-section sign-up, dynamic Company field, sign-in, invitation acceptance', 1, 'built'], ['Nucleus Applications UI (list, filters, detail, approve / reject / route) + org creation', 0, 'nuc'], ['Email notification triggers V1', 0, 'spec']]],
      [2, 'Identity foundation', 'Post Phase 1', [['Keycloak: Google, LinkedIn, Enterprise OIDC / SAML at company level', 0, 'be'], ['Retrofit Keycloak into Deep Research + Scinode', 0, 'be'], ['Event-driven email service (full matrix)', 0, 'spec'], ['SSO-enabled company detection — “We found your organization”', 1, 'built'], ['Remaining domain-architecture hardening', 0, 'be']]],
      [3, 'Full Nucleus & organization-level data', 'Suggested', [['Organization Detail: tree, People & Teams, Platforms, Subscription, Allowance editor', 0, 'nuc'], ['Nucleus roles with platform-scoped Team accounts', 0, 'nuc'], ['Superadmin change-request queue', 0, 'nuc'], ['Org-level data sharing on Company Profile, Market Pulse, Deep Research, Demand Catalyst, Projects', 0, 'be'], ['Full audit logging + soft-delete discipline', 0, 'be']]]
    ];
    return P.map((p) => '<div class="bp-ph"><div class="top"><span class="no">PHASE ' + p[0] + '</span><div class="ua-h" style="font-size:16px">' + p[1] + '</div></div><div class="ua-hint">' + p[2] + '</div><div class="ua-grid c2" style="gap:0 32px;margin-top:10px">' + p[3].map((c) => '<div class="bp-chk ' + (c[1] ? 'done' : '') + '"><i>' + ic('check', 11) + '</i><div>' + c[0] + (c[2] === 'built' ? '<em>Already built</em>' : c[2] === 'partial' ? '<em>Pattern prototyped</em>' : c[1] ? '<em>Prototyped here</em>' : c[2] === 'be' ? '<em style="background:#DBEAFE;color:#1E40AF">Backend</em>' : c[2] === 'nuc' ? '<em style="background:var(--navy-50);color:var(--navy-500)">Nucleus</em>' : '<em style="background:rgba(229,214,46,.25);color:#5C4A00">To design</em>') + '</div></div>').join('') + '</div></div>').join('');
  }

  function notify() {
    const R = [['Invitation sent', 'Invitee'], ['Invitation accepted', 'Inviter'], ['Signup completed — private domain', 'Inviter (direct activation notice)'], ['Signup completed — public domain', 'Relevant Admin / Superadmin (approval required)'], ['Member joining a Team', 'The relevant Team'], ['Request to View submitted', 'Team Admin or Superadmin'], ['Upgrade to Use submitted', 'Team Admin or Superadmin'], ['Approval granted / denied', 'Requesting Member'], ['User approved', 'Invitee, Inviter and relevant Team'], ['Organic join (private domain)', 'Superadmin / Admin — “Review access” prompt, though the user is already Active'], ['Admin sends an invitation', 'Superadmin (in addition to the invitee)'], ['User joins without any invite', 'Superadmin — a new standalone Member has joined']];
    return '<div class="ua-tbl-wrap"><table class="bp-mx"><thead><tr><th>Event</th><th>Recipient</th></tr></thead><tbody>' + R.map((r) => '<tr><td class="k">' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</tbody></table></div>';
  }
  function model() {
    const core = ['User', 'Company', 'Company Domain Mapping', 'Platform Membership (carries the role)', 'Team', 'Team Membership → membership_id', 'Module Permission', 'Organization Subscription', 'Organization Module Entitlement', 'SSO Identity (issuer + subject)', 'Invitation', 'Access Request'], sup = ['Signup Application', 'Audit Log', 'Module Activity Log', 'Public Email Domain (config)', 'ATOMS Supplier Mapping'];
    return '<div class="ua-card"><div class="ua-sect">Core entities</div><div class="bp-ent">' + core.map((c) => '<span>' + c + '</span>').join('') + '</div><div class="ua-sect" style="margin-top:16px">Supplementary (Nucleus / ops)</div><div class="bp-ent">' + sup.map((c) => '<span class="s">' + c + '</span>').join('') + '</div>' +
      '<div class="ua-div" style="margin:16px 0"></div><div class="ua-grid c3">' + [['One identity', 'One global User ID and one Company ID across all four platforms. Cross-platform movement creates or retrieves a <b>membership</b> only.'], ['Two questions, kept apart', '“How much can the org use?” = Subscription → Entitlement. “Who can use it?” = Membership → Role → Team → Permission.'], ['Soft-delete everything', 'Companies, memberships, invitations and supplier mappings are never hard-deleted — a mistaken company is marked REJECTED / DUPLICATE.']].map((x) => '<div><div class="ua-h" style="font-size:14px">' + x[0] + '</div><div class="ua-hint" style="font-size:12px;margin-top:4px">' + x[1] + '</div></div>').join('') + '</div></div>';
  }

  /* ───────────── Compose ───────────── */
  function sec(id, no, eyebrow, title, desc, body) { return '<section class="bp-sec" id="' + id + '"><div class="bp-sec-h"><div><div class="bp-eyebrow2">' + eyebrow + '</div><div class="bp-sec-t">' + title + '</div>' + (desc ? '<div class="bp-sec-d">' + desc + '</div>' : '') + '</div></div>' + body + '</section>'; }
  const NAV = [['s-scope', 'What to build'], ['s-see', 'Who sees what'], ['s-engine', 'Access engine'], ['s-approve', 'Approval logic'], ['s-open', 'Open questions'], ['s-phase', 'Phase plan'], ['s-notify', 'Notifications'], ['s-model', 'Data model']];
  function mount() {
    const kp = (v, l, c) => '<div class="ua-card"><div class="v" style="color:' + c + '">' + v + '</div><div class="l">' + l + '</div></div>';
    const nOpen = Q.filter((q) => q[0] === 'must').length;
    const html = '<div class="bp-kpi">' + kp('3', 'Already built — Sign up / in, SSO screens, Invite acceptance', '#2D7A3A') + kp('10', 'Customer UI items — 8 prototyped in this module', 'var(--teal-600)') + kp('11 + 7', 'Backend services + Nucleus screens still to build', 'var(--navy-500)') + kp(nOpen + ' / ' + Q.length, 'Conflicts to resolve before build · total flagged', '#991B1B') + '</div>' +
      '<div class="bp-layout"><nav class="bp-toc" id="bp-toc">' + NAV.map((n, i) => '<a href="#' + n[0] + '"><span class="k">' + (i + 1) + '</span>' + n[1] + '</a>').join('') + '</nav><div>' +
      sec('s-scope', 1, 'Scope', 'What else needs to be built', 'Everything the four documents specify beyond Sign up / Sign in, SSO and Invite — split by who builds it, with a phase and prototype status on each item.', scope()) +
      sec('s-see', 2, 'Roles × plan', 'Who sees what', 'Three roles per platform, two plans, five tabs. Roles are platform-specific — the same person can be Member on one platform and Admin on another.', visibility() + rules()) +
      sec('s-engine', 3, 'Authorization', 'One access engine, fourteen checks', 'Every platform calls the same server-side service. Flip any step to fail and watch where the request stops — and why permission and entitlement fail for different reasons.', '<div class="ua-card" id="bp-sim"></div>') +
      sec('s-approve', 4, 'Approvals', 'When does a new user become Active?', 'Two independent gates: company mapping (driven by domain type) and cross-platform approval. The documents currently disagree on some cases — pick one and compare.', '<div class="ua-card" id="bp-resolve"></div>') +
      sec('s-open', 5, 'Alignment', 'Open questions &amp; conflicts between the documents', Q.length + ' items. The first five change data models or screens and should be settled before build; each shows what the prototype assumed in the meantime.', questions()) +
      sec('s-phase', 6, 'Delivery', 'Phased build plan', 'From the Consolidated PRD (§12). Phase 1 was re-prioritised to unblock the Deep Research rollout — core workflow and user management first, full Keycloak SSO deferred.', phases()) +
      sec('s-notify', 7, 'Email V1', 'Notification matrix', 'Who is told when — from Design Spec §12.11.', notify()) +
      sec('s-model', 8, 'Engineering', 'Data model &amp; principles', '', model()) + '</div></div>';
    document.getElementById('bp-root').innerHTML = html; renderSim(); renderResolve();
    const links = [...document.querySelectorAll('#bp-toc a')], secs = NAV.map((n) => document.getElementById(n[0]));
    const spy = () => { let cur = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 140) cur = i; }); links.forEach((l, i) => l.classList.toggle('on', i === cur)); };
    (document.querySelector('.main') || window).addEventListener('scroll', spy); window.addEventListener('scroll', spy); spy();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
