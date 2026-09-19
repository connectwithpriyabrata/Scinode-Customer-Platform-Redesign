/* Users & Access — tab renderers (Organization · Teams · Members · Invitations · Access & Approvals). Role × plan × day aware. */
(function () {
  'use strict';
  const UA = window.UA, S = UA.state, ic = UA.ic, esc = UA.esc;

  const card = (title, hint, body, right, cls) => '<div class="ua-card ' + (cls || '') + '"><div class="ua-card-h"><div><div class="ua-h">' + title + '</div>' + (hint ? '<div class="ua-hint">' + hint + '</div>' : '') + '</div>' + (right || '') + '</div>' + body + '</div>';
  const btn = (label, fn, cls, icon) => '<button type="button" class="btn ' + (cls || 'btn-default') + '" onclick="' + fn + '">' + (icon ? ic(icon, 14) : '') + label + '</button>';
  const cap = (label, icon, num, of, pct, foot, opts) => {
    opts = opts || {};
    return '<div class="ua-card ua-cap ' + (opts.locked ? 'locked' : '') + '"><div class="lbl">' + ic(icon, 14) + label + (opts.tag || '') + '</div><div class="num">' + num + (of != null ? ' <small>/ ' + of + '</small>' : '') + '</div>' +
      (pct != null ? '<div class="ua-bar ' + (pct >= 100 ? 'full' : pct >= 80 ? 'warn' : '') + '"><i style="width:' + Math.min(100, pct) + '%"></i></div>' : '') + '<div class="foot">' + foot + '</div></div>';
  };
  UA.card = card; UA.btn = btn;

  /* ───────────── Shell ───────────── */
  UA.tabList = function () {
    const t = [{ id: 'organization', label: 'Organization' }, { id: 'teams', label: 'Teams', lock: !UA.premium() }, { id: 'members', label: 'Members' }];
    if (!UA.isMem()) {
      const inv = UA.invitesVisible().filter((i) => i.status === 'sent' || i.status === 'waiting').length;
      t.push({ id: 'invitations', label: 'Invitations / Applications', n: inv, gray: true });
      t.push({ id: 'approvals', label: 'Access & Approvals', n: UA.pendingCount() });
    }
    return t;
  };
  UA.go = function (tab) { S.tab = tab; UA.render(); window.scrollTo({ top: 0 }); };

  UA.render = function () {
    const rootEl = document.getElementById('ua-root'); if (!rootEl) return;
    const tabs = UA.tabList(); if (!tabs.find((t) => t.id === S.tab)) S.tab = 'organization';
    const pl = UA.plat();
    const planChip = UA.premium()
      ? '<span class="ua-chip gold">' + ic('gem', 14) + 'Plan: <b>Premium</b></span>'
      : '<span class="ua-chip">' + ic('gem', 14) + 'Plan: <b>Free</b>' + (UA.isSA() ? ' · <button type="button" class="ua-link" onclick="UA.upgrade(\'tab\',\'Header plan chip\')">Upgrade</button>' : '') + '</span>';
    let h = '<div class="ua-crumb">Organization Settings <span class="ua-faint">›</span> <b>Users &amp; Access</b></div>' +
      '<div class="ua-head"><div><div class="ua-title">Users &amp; Access</div><div class="ua-sub">' + (UA.isMem() ? 'See where you belong and what you can use in this organization.' : 'Manage who belongs to your organization on this platform, what they can access, and what needs your approval.') + '</div>' +
      '<div class="ua-ctx"><span class="ua-chip">' + ic('building', 14) + 'Organization: <b>' + esc(UA.db.org.name) + '</b></span><span class="ua-chip">' + ic('layers', 14) + 'Platform: <b>' + esc(pl.name) + '</b>' + (pl.legacy ? ' <span class="ua-faint">(' + pl.legacy + ')</span>' : '') + '</span>' + planChip +
      '<span class="ua-chip">' + ic(S.role === 'superadmin' ? 'crown' : S.role === 'admin' ? 'shield' : 'user', 14) + 'Your role: <b>' + UA.roleLabel(S.role) + '</b></span></div></div></div>';

    if (S.role === 'admin' && !UA.premium()) {
      h += '<div class="ua-card">' + UA.emptyState('lock', 'Admin isn’t available on the Free plan', 'Admin is a Team-scoped role — it requires at least one Team, and Teams are a Premium capability. On Free, an organization has 1 Superadmin and up to 2 Members.',
        '<div class="ua-row wrap" style="justify-content:center;margin-top:6px"><span class="ua-proto">Prototype</span>' + btn('View as Premium Admin', "UA.setState({plan:'premium'})", 'btn-outline') + btn('View as Free Superadmin', "UA.setState({role:'superadmin'})", 'btn-ghost-v') + '</div>', 'gray') + '</div>';
      rootEl.innerHTML = h; return;
    }
    h += '<div class="ua-tabs" role="tablist">' + tabs.map((t) => '<button type="button" role="tab" class="ua-tab" aria-selected="' + (S.tab === t.id) + '" onclick="UA.go(\'' + t.id + '\')">' + t.label +
      (t.lock ? '<span class="lk">' + ic('lock', 12) + '</span>' : '') + (t.n ? '<span class="n ' + (t.gray ? 'gray' : '') + '">' + t.n + '</span>' : '') + '</button>').join('') + '</div>';
    h += '<div id="ua-tab">' + ({ organization: vOrg, teams: vTeams, members: vMembers, invitations: vInvites, approvals: vApprovals }[S.tab])() + '</div>';
    rootEl.innerHTML = h;
  };

  /* ───────────── ORGANIZATION ───────────── */
  function accessRows(compact) {
    const me = UA.me(); let h = '';
    for (let i = 0; i < UA.n(); i++) {
      const a = UA.access(me, i), m = UA.mod(i);
      const pend = UA.db.requests.find((r) => r.pid === 'me' && r.mod === i && r.type === 'use' && r.status === 'pending');
      const teamState = me.teams.length ? (a.teamOff ? '<span class="ub gray">Not available to this team</span>' : '<span class="ub teal">Enabled for team</span>') : '<span class="ub gray">No Team · org-level</span>';
      let act = '';
      if (pend) act = '<span class="ub warn dot">Request pending</span>';
      else if (a.lvl === 'view') act = btn('Upgrade to Use', "UA.requestUse(" + i + ")", 'btn-outline btn-sm', 'arrow');
      else if (a.lvl === 'none' && !a.teamOff) act = btn('Request access', "UA.requestUse(" + i + ")", 'btn-ghost-v btn-sm');
      h += '<div class="ua-mod"><span class="ua-ic gray">' + ic(m.icon, 16) + '</span><div class="n">' + m.name + '<small>' + (a.teamOff ? (a.base !== 'none' ? 'Team-disabled overrides your individual ' + a.base.toUpperCase() + ' permission' : 'Disabled for your team') : 'Your permission: ' + (a.base === 'none' ? 'No Access' : a.base === 'use' ? 'Use' : 'View')) + '</small></div>' + (compact ? '' : teamState) + UA.lvlBadge(a.lvl, a.teamOff) + '<div style="min-width:140px;text-align:right">' + act + '</div></div>';
    }
    return h;
  }
  UA.accessRows = accessRows;

  function tree(scope) {
    const db = UA.db, pp = UA.people(), pl = UA.plat();
    const sas = pp.filter((p) => p.role === 'superadmin');
    let ts = UA.teams(); if (scope === 'mine') ts = UA.myTeams();
    const none = pp.filter((p) => p.role !== 'superadmin' && !(p.teams || []).length && scope !== 'mine');
    const leaf = (p) => '<div class="ua-leaf">' + UA.av(p, 'sm') + '<span>' + esc(p.name) + (p.id === 'me' ? ' <span class="ua-you">You</span>' : '') + '</span>' + UA.roleBadge(p.role).replace('class="ub', 'class="r ub') + (p.status !== 'active' ? UA.statusBadge(p.status) : '') + '<span class="ua-xs ua-faint">' + UA.accessSummary(p) + '</span></div>';
    let h = '<div class="ua-tree"><div class="ua-tree-root"><span class="a">' + esc(db.org.name[0]) + '</span><div><div class="n">' + esc(db.org.name) + '</div><div class="s">' + esc(pl.name) + ' · ' + pp.length + ' ' + (pp.length === 1 ? 'person' : 'people') + ' · ' + ts.length + ' Team' + (ts.length === 1 ? '' : 's') + '</div></div></div><div class="ua-branches">';
    if (scope !== 'mine') sas.forEach((p) => { h += '<div class="ua-branch"><div class="ua-node">' + UA.av(p) + '<div><div class="t">' + esc(p.name) + (p.id === 'me' ? ' <span class="ua-you">You</span>' : '') + '</div><div class="s">Superadmin · platform-wide</div></div>' + UA.roleBadge('superadmin') + '</div></div>'; });
    ts.forEach((t) => {
      const mem = pp.filter((p) => (p.teams || []).indexOf(t.id) > -1);
      h += '<div class="ua-branch"><div class="ua-node team"><span class="ua-ic">' + ic('users', 16) + '</span><div><div class="t">' + esc(t.name) + '</div><div class="s">Admin: ' + (UA.adminOf(t).map((a) => esc(a.name)).join(', ') || '—') + ' · ' + mem.length + ' member' + (mem.length === 1 ? '' : 's') + '</div></div></div>' +
        (mem.length ? '<div class="ua-leafs">' + mem.map(leaf).join('') + '</div>' : '') + '</div>';
    });
    if (none.length) h += '<div class="ua-branch"><div class="ua-node none"><span class="ua-ic gray">' + ic('user', 16) + '</span><div><div class="t">No Team</div><div class="s">Standalone Members · organization-level permissions</div></div></div><div class="ua-leafs">' + none.map(leaf).join('') + '</div></div>';
    return h + '</div></div>';
  }

  function transferCard() {
    const t = UA.db.transfer, me = UA.me();
    if (t) {
      const to = UA.person(t.to);
      return card('Superadmin ownership', 'Transfer requests are reviewed by Scinode before they take effect.',
        '<div class="ua-banner warn"><span>' + ic('clock', 16) + '</span><div class="grow"><div class="t">Transfer to ' + esc(to.name) + ' is awaiting Scinode review</div><div>You remain Superadmin until it is approved. Submitted ' + esc(t.at) + '.</div></div></div>' +
        '<div class="ua-sim" style="margin-top:12px"><span class="ua-proto">Prototype</span><span>Nucleus reviewer:</span>' + btn('Approve', 'UA.simTransfer(true)', 'btn-outline btn-sm') + btn('Reject', 'UA.simTransfer(false)', 'btn-danger-ghost btn-sm') + '</div>' +
        '<div style="margin-top:12px">' + btn('Cancel request', 'UA.cancelTransfer()', 'btn-ghost-v btn-sm') + '</div>');
    }
    return card('Superadmin ownership', 'Ownership is per platform — a Superadmin here is not automatically Superadmin elsewhere.',
      '<div class="ua-li" style="padding-top:0"><span class="ua-ic navy">' + ic('crown', 16) + '</span><div class="grow"><div class="t">' + esc(me.name) + ' <span class="ua-you">You</span></div><div class="s">Current Superadmin · ' + esc(UA.plat().name) + '</div></div></div>' +
      '<div style="margin-top:10px">' + btn('Request ownership transfer', 'UA.openTransfer()', 'btn-outline', 'swap') + '</div>');
  }

  function vOrg() {
    if (UA.isMem()) return vOrgMember();
    if (UA.isAdm()) return vOrgAdmin();
    const db = UA.db, L = UA.limits(), U = UA.usage(), pl = UA.plat(), free = !UA.premium();
    const id = card(esc(db.org.name), 'Verified organization · ' + esc(pl.name),
      '<div class="ua-row wrap" style="gap:8px"><span class="ub success dot">' + db.org.status + '</span><span class="ub gray">Company ID · ' + db.org.id + '</span><span class="ub teal">' + ic('check', 11) + 'Verified domain · ' + db.org.domain + '</span><span class="ub gray">On Scinode since ' + db.org.since + '</span></div>' +
      (S.day === 0 ? '<div class="ua-div" style="margin:16px 0 4px"></div><div class="ua-h" style="font-size:14px;margin-top:12px">Set up your organization</div><div class="ua-steps">' + steps() + '</div>' : ''),
      S.day === 0 ? btn('Set up your organization', "UA.go('members')", 'btn-default') : btn('Edit organization details', "UA.toast('Organization details','Editing is part of Organization Settings (not in this module).')", 'btn-outline', 'pencil'));
    const modsOn = (function () { let c = 0; for (let i = 0; i < UA.n(); i++) if (UA.teams().some((t) => t.mods[i] === '1')) c++; return c; })();
    let caps = cap('Superadmins', 'crown', U.sa, L.sa, U.sa / L.sa * 100, free ? 'Free includes 1 Superadmin. Doesn’t use a Member seat.' : 'Additional Superadmins are available on Premium.') +
      cap('Member seats', 'users', U.mem, L.mem, U.mem / L.mem * 100, free ? (U.mem >= L.mem ? 'You’ve used all Free seats.' : (L.mem - U.mem) + ' Free seat' + (L.mem - U.mem === 1 ? '' : 's') + ' remaining.') : 'Limits are configuration-driven.');
    caps += free ? cap('Teams', 'network', '0', null, null, 'Teams unlock with Premium.', { locked: true, tag: ' <span class="ub gold" style="margin-left:2px">Premium</span>' }) : cap('Teams', 'network', U.teams, L.teams, U.teams / L.teams * 100, U.teams ? 'Each Team is scoped to this platform.' : 'No Teams yet.');
    caps += free ? '<div class="ua-card ua-cap"><div class="lbl">' + ic('gem', 14) + 'Plan</div><div class="num">Free</div><div class="foot">Superadmin, Members and access management within Free capacity.</div><div style="margin-top:12px">' + btn('Upgrade to Premium', "UA.upgrade('tab','Organization › Plan card')", 'btn-premium btn-sm') + '</div></div>'
      : cap('Modules', 'grid', modsOn, UA.n(), modsOn / UA.n() * 100, 'Modules enabled by at least one Team on ' + esc(pl.name) + '.');
    let mid = '';
    if (S.day === 1) {
      if (free) mid = card('Plan limitations', 'What your Free plan includes — and what Premium adds.',
        '<div class="ua-row wrap" style="gap:8px"><span class="ub gray">1 Superadmin</span><span class="ub gray">2 Members</span><span class="ub gray">No Teams</span><span class="ub gray">No Admins</span></div><div class="ua-lockrow" style="margin-top:14px"><span class="ua-xs ua-muted">Locked on Free:</span>' +
        '<button type="button" class="ua-lockchip" onclick="UA.upgrade(\'team\',\'Organization › Locked actions\')">' + ic('lock', 12) + 'Create Team</button><button type="button" class="ua-lockchip" onclick="UA.upgrade(\'admin\',\'Organization › Locked actions\')">' + ic('lock', 12) + 'Create Admin</button><button type="button" class="ua-lockchip" onclick="UA.upgrade(\'superadmin\',\'Organization › Locked actions\')">' + ic('lock', 12) + 'Add another Superadmin</button></div>');
      else mid = card('Access summary', 'A snapshot of how access is set up on this platform.',
        '<div class="ua-grid c3"><div><div class="ua-xs ua-muted">Teams</div><div style="font-size:24px;font-weight:600">' + U.teams + '</div></div><div><div class="ua-xs ua-muted">People with access</div><div style="font-size:24px;font-weight:600">' + UA.people().filter((p) => p.status === 'active').length + '</div></div><div><div class="ua-xs ua-muted">Pending access requests</div><div style="font-size:24px;font-weight:600">' + UA.pendingCount() + '</div>' + (UA.pendingCount() ? '<button type="button" class="ua-link" onclick="UA.go(\'approvals\')">Review ' + ic('arrow', 12) + '</button>' : '') + '</div></div>');
    } else if (!free) mid = card('Get started', 'Premium is active — set up how your organization works.', '<div class="ua-row wrap">' + btn('Create Team', 'UA.openCreateTeam()', 'btn-default', 'plus') + btn('Add Member', 'UA.openAddUser()', 'btn-outline', 'user-plus') + '</div><div class="ua-hint" style="margin-top:10px">Invite roles available to you: Superadmin, Admin, Member.</div>');
    const pend = UA.pendingCount();
    const admin = card('Administration', null,
      '<div class="ua-list">' +
      '<div class="ua-li"><span class="ua-ic">' + ic('inbox', 16) + '</span><div class="grow"><div class="t">Access &amp; Approvals</div><div class="s">' + (pend ? pend + ' waiting on you' : 'Nothing waiting on you') + '</div></div><button type="button" class="btn btn-ghost-v btn-sm" onclick="UA.go(\'approvals\')">Open</button></div>' +
      '<div class="ua-li"><span class="ua-ic">' + ic('mail', 16) + '</span><div class="grow"><div class="t">Invitations / Applications</div><div class="s">' + UA.db.invites.length + ' total</div></div><button type="button" class="btn btn-ghost-v btn-sm" onclick="UA.go(\'invitations\')">Open</button></div>' +
      '<div class="ua-li"><span class="ua-ic">' + ic('history', 16) + '</span><div class="grow"><div class="t">Audit history</div><div class="s">Every request, approval, denial and permission change</div></div><button type="button" class="btn btn-ghost-v btn-sm" onclick="UA.openAudit()">View</button></div>' +
      '<div class="ua-li"><span class="ua-ic gold">' + ic('gem', 16) + '</span><div class="grow"><div class="t">Subscription</div><div class="s">' + (free ? 'Free plan' : 'Premium plan') + ' · managed in Billing</div></div><button type="button" class="btn btn-ghost-v btn-sm" onclick="UA.toast(\'Billing is the source of truth\',\'Users &amp; Access links out — it never duplicates the Billing page.\')">' + (free ? 'Compare' : 'View') + '</button></div></div>');
    return '<div class="ua-grid side"><div style="display:flex;flex-direction:column;gap:16px;min-width:0">' + id + '<div class="ua-grid c4">' + caps + '</div>' + mid +
      card('Organization directory', 'A directory for access — not an HR hierarchy. Superadmin, then Teams with members, then No Team.', tree('all')) + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:16px;min-width:0">' + admin + transferCard() + '</div></div>';
  }
  function steps() {
    const u = UA.usage(), free = !UA.premium();
    const st = [['Confirm organization details', true]];
    if (free) { st.push(['Add your first Member', u.mem > 0]); st.push(['Explore Premium for Teams', false]); }
    else { st.push(['Create your first Team', UA.teams().length > 0]); st.push(['Add Members', u.mem > 0]); st.push(['Configure module access', false]); }
    return st.map((s, i) => '<div class="ua-step ' + (s[1] ? 'done' : '') + '"><span class="dot">' + (s[1] ? ic('check', 12) : i + 1) + '</span><span class="t">' + s[0] + '</span></div>').join('');
  }

  function vOrgAdmin() {
    const me = UA.me(), db = UA.db, ts = UA.myTeams();
    const idc = card(esc(db.org.name), 'Read-only overview · ' + esc(UA.plat().name),
      '<div class="ua-row wrap" style="gap:8px"><span class="ub success dot">' + db.org.status + '</span><span class="ub gold">Premium</span><span class="ub navy">' + ic('shield', 11) + 'Your role · Admin</span>' + ts.map((t) => '<span class="ub teal">' + esc(t.name) + '</span>').join('') + '</div>' +
      '<div class="ua-hint" style="margin-top:12px">Billing, ownership controls, Superadmin management and organization-wide role management aren’t shown to Admins.</div>',
      btn('View my access', 'UA.openMyAccess()', 'btn-outline', 'key'));
    const scope = card('What you can do as an Admin', 'Your authority is bounded by your assigned Team(s).',
      '<div class="ua-grid c2"><div><div class="ua-sect">You can</div><div class="ua-list">' + ['Manage Members inside your Team(s)', 'Invite Members into your own Team — the Superadmin is notified of every invite', 'Set View / Use within modules already enabled for your Team', 'Approve Request to Use / View for your Team’s Members'].map((x) => '<div class="ua-li" style="padding:6px 0"><span style="color:var(--teal-600)">' + ic('check', 15) + '</span><div class="grow t" style="font-weight:400">' + x + '</div></div>').join('') + '</div></div>' +
      '<div><div class="ua-sect">You can’t</div><div class="ua-list">' + ['Create Teams or invite Admins / Superadmins', 'Enable new modules for a Team', 'Manage people outside your Team scope', 'Change organization-wide structure or Billing'].map((x) => '<div class="ua-li" style="padding:6px 0"><span style="color:var(--text-3)">' + ic('x', 15) + '</span><div class="grow t" style="font-weight:400;color:var(--text-2)">' + x + '</div></div>').join('') + '</div></div></div>');
    return '<div class="ua-grid side"><div style="display:flex;flex-direction:column;gap:16px;min-width:0">' + idc + scope + card('Your Team directory', 'Only the Team(s) you belong to.', tree('mine')) + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:16px;min-width:0">' + card('Waiting on you', null, UA.pendingCount() ? '<div class="ua-li" style="padding-top:0"><span class="ua-ic">' + ic('inbox', 16) + '</span><div class="grow"><div class="t">' + UA.pendingCount() + ' request' + (UA.pendingCount() === 1 ? '' : 's') + ' in your scope</div><div class="s">Request to Use / View from your Team</div></div></div>' + btn('Open Access & Approvals', "UA.go('approvals')", 'btn-default') : '<div class="ua-hint">Nothing waiting on you.</div>') + '</div></div>';
  }

  function vOrgMember() {
    const me = UA.me(), db = UA.db, ts = UA.myTeams();
    const useN = [...Array(UA.n()).keys()].filter((i) => UA.access(me, i).lvl === 'use').length, viewN = [...Array(UA.n()).keys()].filter((i) => UA.access(me, i).lvl === 'view').length;
    const hd = card(S.day === 0 ? 'You are a Member of this organization' : 'My organization', esc(db.org.name) + ' · ' + esc(UA.plat().name),
      '<div class="ua-row wrap" style="gap:8px"><span class="ub gray">Role · Member</span><span class="ub ' + (UA.premium() ? 'gold' : 'gray') + '">' + (UA.premium() ? 'Premium' : 'Free') + '</span>' + (ts.length ? ts.map((t) => '<span class="ub teal">' + esc(t.name) + '</span>').join('') : '<span class="ub gray">No Team</span>') + '</div>' +
      '<div class="ua-grid c3" style="margin-top:16px"><div class="ua-card" style="background:#F8FAFC;box-shadow:none"><div class="ua-xs ua-muted">Where do I belong?</div><div class="t" style="font-weight:500;margin-top:4px">' + esc(db.org.name) + '</div></div><div class="ua-card" style="background:#F8FAFC;box-shadow:none"><div class="ua-xs ua-muted">Which Team(s)?</div><div style="font-weight:500;margin-top:4px">' + (ts.map((t) => esc(t.name)).join(', ') || 'None — organization-level access') + '</div></div><div class="ua-card" style="background:#F8FAFC;box-shadow:none"><div class="ua-xs ua-muted">What can I use?</div><div style="font-weight:500;margin-top:4px">' + useN + ' Use · ' + viewN + ' View</div></div></div>');
    const acc = S.day === 0 ? '' : card('My access', 'Team-disabled always overrides an individual permission. Upgrade requests go to ' + (ts.length ? 'your Team Admin' : 'the Superadmin') + '.', '<div class="ua-list">' + accessRows() + '</div>',
      btn('Browse organization activity', 'UA.openModulePreview()', 'btn-outline btn-sm', 'activity'));
    return '<div style="display:flex;flex-direction:column;gap:16px">' + hd + acc + (S.day === 0 ? card('Your access', 'Ask your Superadmin if you need more.', '<div class="ua-hint">Detailed per-module access appears here once you start working. Members can’t invite people, edit access, or manage Teams.</div>') : '') + '</div>';
  }

  /* ───────────── TEAMS ───────────── */
  function teamCard(t) {
    const pp = UA.people().filter((p) => (p.teams || []).indexOf(t.id) > -1), on = t.mods.split('').filter((c) => c === '1').length;
    return '<div class="ua-card" style="cursor:pointer" onclick="UA.openTeam(\'' + t.id + '\')"><div class="ua-row" style="align-items:flex-start"><span class="ua-ic lg">' + ic('users', 20) + '</span><div class="grow" style="flex:1;min-width:0"><div class="ua-h" style="font-size:15px">' + esc(t.name) + '</div><div class="ua-hint">' + esc(t.desc) + '</div></div><span class="ub success dot">Active</span></div>' +
      '<div class="ua-row between" style="margin-top:16px"><div><div class="ua-xs ua-muted">Admin' + (t.admins.length === 1 ? '' : 's') + '</div><div class="ua-sm" style="font-weight:500;margin-top:2px">' + (UA.adminOf(t).map((a) => esc(a.name)).join(', ') || (t.pendingAdmin ? esc(t.pendingAdmin) + ' (invited)' : '—')) + '</div></div><div class="ua-avs">' + pp.slice(0, 4).map((p) => UA.av(p, 'sm')).join('') + '</div></div>' +
      '<div class="ua-row between" style="margin-top:14px"><span class="ua-xs ua-muted">' + pp.length + ' member' + (pp.length === 1 ? '' : 's') + ' · ' + on + ' of ' + t.mods.length + ' module' + (t.mods.length === 1 ? '' : 's') + ' enabled</span><span class="ua-link">' + (UA.isMem() ? 'View' : 'Open') + ic('arrow', 12) + '</span></div></div>';
  }
  function vTeams() {
    if (!UA.premium()) {
      if (UA.isMem()) return '<div class="ua-card">' + UA.emptyState('lock', 'Teams aren’t available on your current plan', 'Teams let an organization group people and control which modules each group can access.', btn('Learn about Premium', "UA.upgrade('learn','Teams tab (Member)')", 'btn-outline'), 'gold') + '</div>';
      const d1 = S.day === 1;
      return '<div class="ua-card ua-gate"><div><span class="ub gold" style="margin-bottom:10px">' + ic('gem', 11) + 'Premium</span><h3 class="ua-h" style="font-size:22px;margin-top:8px">' + (d1 ? 'Organize your organization with Teams' : 'Teams are available with Premium.') + '</h3>' +
        '<p class="ua-sub" style="margin-top:8px">' + (d1 ? 'Teams let you group members and control which modules they can access.' : 'Create teams to organize members and control module access at the team level.') + '</p>' +
        '<ul>' + ['Group Members and give each Team its own module access', 'Assign Team Admins who manage their own people', 'Enable or disable modules per Team — Team settings always win', 'Team-scoped approvals for access requests'].map((x) => '<li>' + ic('check', 15) + x + '</li>').join('') + '</ul>' +
        '<div class="ua-row wrap">' + btn('Create Team', "UA.upgrade('team','Teams tab › + Create Team')", 'btn-default', 'plus') + btn('Upgrade to Premium', "UA.upgrade('tab','Teams tab › Upgrade')", 'btn-premium') + '</div><div class="ua-hint" style="margin-top:10px">Free includes 0 Teams. The Create Team button stays visible and clickable — it opens the upgrade popup instead of a broken form.</div></div>' +
        '<div class="ua-gate-art"><span class="g">Your organization today</span><div><div class="big">0</div><div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px">Teams on the Free plan</div></div><div style="font-size:12px;color:rgba(255,255,255,.55)">Superadmin · ' + UA.usage().mem + '/2 Members</div></div></div>';
    }
    let ts = UA.isSA() ? UA.teams() : UA.myTeams();
    const head = '<div class="ua-row between wrap"><div><div class="ua-h">' + (UA.isSA() ? 'Teams' : UA.isAdm() ? 'Your Teams' : 'My Teams') + '</div><div class="ua-hint">' + (UA.isAdm() ? 'You manage members within your assigned Teams.' : UA.isMem() ? 'View-only — your Teams, their modules, and your effective access.' : 'Teams are scoped to this platform and never appear on another.') + '</div></div>' + (UA.isSA() ? btn('Create Team', 'UA.openCreateTeam()', 'btn-default', 'plus') : '') + '</div>';
    if (!ts.length) return head + '<div class="ua-card" style="margin-top:16px">' + UA.emptyState('users', UA.isSA() ? 'Create your first Team' : 'You’re not in a Team yet', UA.isSA() ? 'Group Members and manage access more easily. Every Team needs an assigned Admin.' : 'You have organization-level access. Your Superadmin can add you to a Team.', UA.isSA() ? btn('Create Team', 'UA.openCreateTeam()', 'btn-default', 'plus') : '') + '</div>';
    return head + '<div class="ua-grid c3" style="margin-top:16px">' + ts.map(teamCard).join('') + '</div>';
  }

  /* ───────────── MEMBERS ───────────── */
  function memberRows() {
    const f = S.f, q = f.q.toLowerCase(); let list = UA.membersVisible();
    list = list.filter((p) => (!q || (p.name + ' ' + p.email).toLowerCase().indexOf(q) > -1) && (f.role === 'all' || p.role === f.role) && (f.status === 'all' || p.status === f.status) && (f.team === 'all' || (f.team === 'none' ? !(p.teams || []).length : (p.teams || []).indexOf(f.team) > -1)));
    const showAct = UA.isMem() ? false : true, d1p = UA.premium() && S.day === 1;
    if (!list.length) return '<tr><td colspan="7" style="padding:36px;text-align:center;color:var(--text-2)">No members match these filters.</td></tr>';
    return list.map((p) => {
      const clickable = !UA.isMem() || p.id === 'me';
      return '<tr class="' + (clickable ? 'click' : '') + '" ' + (clickable ? 'onclick="UA.openMember(\'' + p.id + '\')"' : '') + '><td>' + UA.person$(p, { noEmail: UA.isMem() }) + '</td><td>' + UA.roleBadge(p.role) + '</td><td>' + UA.teamChips(p) + '</td><td>' + UA.statusBadge(p.status) + (p.organic ? ' <span class="ub gray" title="Joined without an invite">Organic</span>' : '') + '</td>' +
        '<td class="ua-tnum">' + (p.status === 'pending' ? '<span class="ua-faint">—</span>' : UA.accessSummary(p)) + '</td>' + (d1p ? '<td class="ua-muted">' + p.last + '</td>' : '<td class="ua-muted">' + p.joined + '</td>') +
        '<td class="r">' + (showAct ? '<button type="button" class="btn btn-icon-sm" aria-label="Actions" onclick="UA.memberMenu(event,\'' + p.id + '\')">' + ic('more', 15) + '</button>' : '') + '</td></tr>';
    }).join('');
  }
  UA.memberRows = memberRows;
  function vMembers() {
    const U = UA.usage(), L = UA.limits(), free = !UA.premium(), full = free && U.mem >= L.mem;
    const canAdd = !UA.isMem();
    const only = UA.membersVisible().length === 1 && UA.isSA();
    let h = '';
    if (full && UA.isSA()) h += '<div class="ua-banner warn"><span>' + ic('alert', 16) + '</span><div class="grow"><div class="t">You’ve reached your Free plan user limit</div><div>All ' + L.mem + ' Member seats are in use. Upgrade to add more people, Teams and Admins.</div></div><div class="acts">' + btn('Upgrade to Premium', "UA.upgrade('member','Members banner')", 'btn-premium btn-sm') + '</div></div>';
    if (only) return '<div style="display:flex;flex-direction:column;gap:16px">' + h + '<div class="ua-card">' + UA.emptyState('users', 'Build your team', 'Invite people from your organization to start working together.' + (UA.premium() ? ' Roles you can invite: Superadmin, Admin, Member.' : ''), btn('Add New User', 'UA.openAddUser()', 'btn-default', 'plus') + (free ? '<div class="ua-hint">Members ' + U.mem + '/' + L.mem + ' used on the Free plan</div>' : '')) + '</div></div>';
    const teamOpts = '<option value="all">All Teams</option><option value="none">No Team</option>' + UA.teams().map((t) => '<option value="' + t.id + '"' + (S.f.team === t.id ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('');
    h += '<div class="ua-tbl-wrap"><div class="ua-toolbar"><label class="ua-search">' + ic('search', 15) + '<input type="search" placeholder="Search name or email" value="' + esc(S.f.q) + '" oninput="UA.setF(\'q\',this.value)"></label>' +
      '<select class="ua-select" onchange="UA.setF(\'role\',this.value)"><option value="all">All roles</option><option value="superadmin"' + (S.f.role === 'superadmin' ? ' selected' : '') + '>Superadmin</option><option value="admin"' + (S.f.role === 'admin' ? ' selected' : '') + '>Admin</option><option value="member"' + (S.f.role === 'member' ? ' selected' : '') + '>Member</option></select>' +
      (UA.premium() ? '<select class="ua-select" onchange="UA.setF(\'team\',this.value)">' + teamOpts + '</select>' : '') +
      '<select class="ua-select" onchange="UA.setF(\'status\',this.value)"><option value="all">All statuses</option><option value="active"' + (S.f.status === 'active' ? ' selected' : '') + '>Active</option><option value="pending"' + (S.f.status === 'pending' ? ' selected' : '') + '>Pending Approval</option><option value="suspended"' + (S.f.status === 'suspended' ? ' selected' : '') + '>Suspended</option></select><span class="ua-spacer"></span>' +
      (free && !UA.isMem() ? '<span class="ua-xs ua-muted ua-tnum">Members <b style="color:var(--text-1)">' + U.mem + '/' + L.mem + '</b> used</span>' : '') +
      (canAdd ? btn(UA.isAdm() ? 'Invite Member' : 'Add New User', 'UA.openAddUser()', 'btn-default', 'plus') : '') + '</div>' +
      (free && UA.isSA() && S.day === 1 ? '<div class="ua-lockrow" style="padding:10px 16px;background:#FCFBEF"><span class="ua-xs ua-muted">Locked on Free — discoverable, not hidden:</span><button type="button" class="ua-lockchip" onclick="UA.upgrade(\'admin\',\'Members › Locked actions\')">' + ic('lock', 12) + 'Create Admin</button><button type="button" class="ua-lockchip" onclick="UA.upgrade(\'superadmin\',\'Members › Locked actions\')">' + ic('lock', 12) + 'Add another Superadmin</button><button type="button" class="ua-lockchip" onclick="UA.upgrade(\'team\',\'Members › Locked actions\')">' + ic('lock', 12) + 'Create Team</button></div>' : '') +
      '<div class="ua-scroll"><table class="ua-tbl"><thead><tr><th>Member</th><th>Role</th><th>Team</th><th>Status</th><th>Access</th><th>' + (UA.premium() && S.day === 1 ? 'Last active' : 'Joined') + '</th><th></th></tr></thead><tbody id="ua-mrows">' + memberRows() + '</tbody></table></div></div>' +
      (UA.isMem() ? '<div class="ua-hint" style="margin-top:12px">Members can see basic directory info and their own access. Only Superadmins and Admins can invite people or edit access.</div>' : '');
    return '<div style="display:flex;flex-direction:column;gap:16px">' + h + '</div>';
  }
  UA.setF = function (k, v) { S.f[k] = v; const b = document.getElementById('ua-mrows'); if (b) b.innerHTML = memberRows(); else UA.render(); };

  /* ───────────── INVITATIONS / APPLICATIONS ───────────── */
  function vInvites() {
    const list = UA.invitesVisible(), pl = UA.plat();
    const life = '<div class="ua-life"><span class="s"><i>1</i>Invitation Sent</span><span class="ln"></span><span class="s"><i>2</i>Invitation Accepted</span><span class="ln"></span><span class="s"><i>3</i>Signup Completed</span><span class="ln"></span><div class="fork"><span class="s"><i>' + ic('check', 11) + '</i>Private domain → Active (Joined)</span><span class="s"><i>' + ic('clock', 11) + '</i>Public domain → Pending Admin Approval → Active</span></div></div><div class="ua-hint" style="margin-top:12px">Can also end in Rejected · Suspended · Cancelled. Cross-platform invitations still follow the approval matrix.</div>';
    const rows = list.length ? list.map((i) => {
      const inv = i.by === 'me' ? UA.me() : UA.person(i.by), by = inv ? inv.name : '—', t = i.team ? UA.team(i.team) : null;
      const lbl = i.status === 'waiting' ? UA.statusBadge('waiting') + '<div class="ua-xs ua-muted" style="margin-top:3px">Waiting for ' + esc(pl.name) + ' approval</div>' : UA.statusBadge(i.status);
      return '<tr><td><div class="ua-person">' + UA.av(i.name) + '<div><div class="nm">' + esc(i.name) + '</div><div class="em">' + esc(i.email) + '</div></div></div></td><td>' + esc(by) + '</td><td>' + UA.roleBadge(i.role) + '</td><td>' + (t ? '<span class="ub teal">' + esc(t.name) + '</span>' : '<span class="ua-faint">—</span>') + '</td><td>' + (i.domain === 'public' ? '<span class="ub warn">Public domain</span>' : '<span class="ub teal">Verified domain</span>') + '</td><td>' + lbl + '</td><td class="ua-muted">' + i.date + '</td><td class="r"><button type="button" class="btn btn-icon-sm" aria-label="Actions" onclick="UA.inviteMenu(event,\'' + i.id + '\')">' + ic('more', 15) + '</button></td></tr>';
    }).join('') : '';
    return '<div style="display:flex;flex-direction:column;gap:16px">' + card('How an invitation moves', 'The same lifecycle is used for same-platform and cross-platform invitations.', life) +
      (list.length ? '<div class="ua-tbl-wrap"><div class="ua-toolbar"><div class="ua-h" style="font-size:14px">Invitations &amp; applications</div><span class="ua-spacer"></span>' + btn(UA.isAdm() ? 'Invite Member' : 'Add New User', 'UA.openAddUser()', 'btn-default', 'plus') + '</div><div class="ua-scroll"><table class="ua-tbl"><thead><tr><th>Invitee</th><th>Invited by</th><th>Role</th><th>Team</th><th>Domain</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>'
        : '<div class="ua-card">' + UA.emptyState('mail', 'No invitations yet', 'Invited users and their approval status will appear here once you send an invite.', btn(UA.isAdm() ? 'Invite Member' : 'Add New User', 'UA.openAddUser()', 'btn-default', 'plus')) + '</div>') + '</div>';
  }
  UA.inviteMenu = function (ev, id) {
    const i = UA.db.invites.find((x) => x.id === id), it = [];
    if (i.status === 'sent') { it.push({ label: 'Resend invitation', icon: 'send', fn: "UA.resendInvite('" + id + "')" }); it.push({ lbl: 'Prototype' }); it.push({ label: 'Simulate: invitee signs up', icon: 'play', fn: "UA.simSignup('" + id + "')" }); it.push({ sep: 1 }); it.push({ label: 'Cancel invitation', icon: 'x-circle', dg: 1, fn: "UA.cancelInvite('" + id + "')" }); }
    else if (i.status === 'waiting') { it.push({ label: 'Review in Access & Approvals', icon: 'inbox', fn: "UA.go('approvals')" }); }
    else it.push({ label: 'No actions available', dis: 1, fn: '' });
    UA.menu(ev, it);
  };

  /* ───────────── ACCESS & APPROVALS ───────────── */
  const RT = { use: ['Request to Use', 'teal'], view: ['Request to View', 'navy'], invite: ['Invitation approval', 'warn'] };
  function vApprovals() {
    const f = S.f; let list = UA.requestsVisible();
    list = list.filter((r) => (f.rtype === 'all' || r.type === f.rtype) && (f.rstat === 'all' || (f.rstat === 'pending' ? r.status === 'pending' : r.status !== 'pending')));
    const rows = list.map((r) => {
      const p = UA.person(r.pid), ap = UA.approverOf(r);
      const modName = r.mod == null ? '—' : UA.mod(r.mod).name;
      const cur = r.type === 'use' ? 'Now: ' + (UA.access(p, r.mod).base === 'view' ? 'View' : 'No Access') : r.type === 'invite' ? esc(p.email) : '';
      return '<tr class="click" onclick="UA.review(\'' + r.id + '\')"><td>' + UA.person$(p) + '</td><td><span class="ub ' + RT[r.type][1] + '">' + RT[r.type][0] + '</span></td><td>' + modName + '</td><td><div>' + (r.type === 'view' ? esc(r.item || UA.itemFor(r.mod)) : r.type === 'invite' ? 'Join ' + esc(UA.plat().name) : 'Module access') + '</div><div class="ua-xs ua-muted">' + cur + '</div></td><td class="ua-muted">' + r.date + '</td><td>' + esc(ap.label) + '</td><td>' + UA.statusBadge(r.status === 'pending' ? 'reqpending' : r.status) + '</td><td class="r">' + (r.status === 'pending' ? btn('Review', "event.stopPropagation();UA.review('" + r.id + "')", 'btn-outline btn-sm') : '') + '</td></tr>';
    }).join('');
    const filters = '<select class="ua-select" onchange="S_f(\'rtype\',this.value)"><option value="all">All request types</option><option value="use"' + (f.rtype === 'use' ? ' selected' : '') + '>Request to Use</option><option value="view"' + (f.rtype === 'view' ? ' selected' : '') + '>Request to View</option><option value="invite"' + (f.rtype === 'invite' ? ' selected' : '') + '>Invitation approval</option></select>' +
      '<select class="ua-select" onchange="S_f(\'rstat\',this.value)"><option value="pending"' + (f.rstat === 'pending' ? ' selected' : '') + '>Pending</option><option value="resolved"' + (f.rstat === 'resolved' ? ' selected' : '') + '>Resolved</option><option value="all"' + (f.rstat === 'all' ? ' selected' : '') + '>All</option></select>';
    window.S_f = function (k, v) { S.f[k] = v; UA.render(); };
    const body = list.length ? '<div class="ua-scroll"><table class="ua-tbl"><thead><tr><th>Requester</th><th>Request type</th><th>Module</th><th>Item / scope</th><th>Requested on</th><th>Approver</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' : UA.emptyState('inbox', 'Nothing waiting on you', 'Access & Approvals is empty when there are no open Request to Use / Request to View / invitation-approval items.');
    return '<div style="display:flex;flex-direction:column;gap:16px"><div class="ua-banner neutral"><span>' + ic('info', 16) + '</span><div class="grow">Requests start inside a module (or in <b>My access</b>) and are resolved here. Members with a Team route to that Team’s Admin; Members with no Team route to the Superadmin. Approving changes a permission — <b>never a role or Team</b>.</div></div>' +
      '<div class="ua-tbl-wrap"><div class="ua-toolbar"><div class="ua-h" style="font-size:14px">Requests awaiting a decision</div><span class="ua-spacer"></span>' + filters + '</div>' + body + '</div>' +
      card('Audit history', 'Every request, approval, denial, invitation and permission change is recorded.', auditList(6), btn('View all', 'UA.openAudit()', 'btn-ghost-v btn-sm')) + '</div>';
  }
  function auditList(n) {
    const a = UA.db.audit.slice(0, n || 50);
    if (!a.length) return '<div class="ua-hint">No activity recorded yet.</div>';
    return '<div class="ua-list">' + a.map((x) => '<div class="ua-li"><span class="ua-ic gray">' + ic('history', 15) + '</span><div class="grow"><div class="t">' + esc(x.action) + ' <span class="ua-muted" style="font-weight:400">· ' + esc(x.entity) + '</span></div><div class="s">' + esc(x.actor) + ' · ' + esc(x.o) + ' → ' + esc(x.nw) + '</div></div><span class="ua-xs ua-faint">' + esc(x.t) + '</span></div>').join('') + '</div>';
  }
  UA.auditList = auditList;
})();
