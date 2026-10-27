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
  const fact = (label, val, action) => '<div class="ua-fact"><div class="ua-fact-row"><span class="ua-fact-label">' + label + '</span></div><div class="ua-fact-row"><span class="ua-fact-val">' + val + '</span>' + (action || '') + '</div></div>';
  UA.card = card; UA.btn = btn;

  /* ───────────── Shell ───────────── */
  UA.tabList = function () {
    const t = [{ id: 'organization', label: 'Organization' }, { id: 'teams', label: 'Teams', lock: !UA.premium() }, { id: 'members', label: 'Members' }];
    if (!UA.isMem()) {
      const inv = UA.invitesVisible().filter((i) => i.status === 'sent' || i.status === 'waiting').length;
      t.push({ id: 'invitations', label: 'Invitations', n: inv, gray: true });
      t.push({ id: 'approvals', label: 'Access & Approvals', n: UA.pendingCount() });
    }
    return t;
  };
  UA.go = function (tab) { S.tab = tab; UA.render(); window.scrollTo({ top: 0 }); };
  UA.toggleDir = function () { S.dirOpen = !S.dirOpen; UA.render(); if (UA.syncDemo) UA.syncDemo(); };
  UA.orgMenu = function (ev) {
    const items = [];
    if (UA.db.day === 0) items.push({ label: 'Set up your organization', icon: 'arrow', fn: "UA.go('members')" });
    items.push({ label: 'Edit details', icon: 'pencil', fn: "UA.toast('Organization details','Editing is part of Organization Settings (not in this module).')" });
    items.push({ sep: 1 }, { lbl: 'Future actions' });
    UA.menu(ev, items);
  };
  UA.openPlanLimits = function (ev) {
    if (ev) ev.stopPropagation();
    UA.modal({
      icon: 'gem', iconCls: 'gold', title: 'Plan limitations', sub: 'What your Free plan includes — and what Premium adds.',
      body: '<div class="ua-row wrap" style="gap:8px"><span class="ub gray">1 Superadmin</span><span class="ub gray">' + UA.limits().mem + ' Members</span><span class="ub gray">No Teams</span><span class="ub gray">No Admins</span></div><div class="ua-lockrow" style="margin-top:14px"><span class="ua-xs ua-muted">Locked on Free:</span>' +
        '<button type="button" class="ua-lockchip" onclick="UA.upgrade(\'team\',\'Organization › Locked actions\')">' + ic('lock', 12) + 'Create Team</button><button type="button" class="ua-lockchip" onclick="UA.upgrade(\'admin\',\'Organization › Locked actions\')">' + ic('lock', 12) + 'Create Admin</button><button type="button" class="ua-lockchip" onclick="UA.upgrade(\'superadmin\',\'Organization › Locked actions\')">' + ic('lock', 12) + 'Add another Superadmin</button></div>',
      foot: btn('Close', 'UA.closeModal()', 'btn-ghost-v') + btn('Upgrade to Premium', "UA.closeModal();UA.upgrade('tab','Organization › Plan limitations')", 'btn-premium', 'sparkles')
    });
  };

  UA.render = function () {
    const rootEl = document.getElementById('ua-root'); if (!rootEl) return;
    const tabs = UA.tabList(); if (!tabs.find((t) => t.id === S.tab)) S.tab = 'organization';
    let headerActions = '';
    if (!UA.isMem() && !UA.premium()) {
      if (UA.isSA()) headerActions += btn('Create Team', "UA.upgrade('team','Header button')", 'btn-outline', 'plus');
      headerActions += btn(UA.isAdm() ? 'Invite Member' : 'Add Member', 'UA.openAddUser()', 'btn-default', 'user-plus');
    }
    let h = '<div class="ua-crumb">Organization Settings <span class="ua-faint">›</span> <b>Users &amp; Access</b></div>' +
      '<div class="ua-head"><div><div class="ua-title">Users &amp; Access</div><div class="ua-sub">' + (UA.isMem() ? 'See where you belong and what you can use in this organization.' : 'Manage who belongs to your organization on this platform, what they can access, and what needs your approval.') + '</div></div>' +
      (headerActions ? '<div class="ua-row" style="gap:8px">' + headerActions + '</div>' : '') + '</div>';

    if (S.role === 'admin' && !UA.premium()) {
      h += '<div class="ua-card">' + UA.emptyState('lock', 'Admin isn’t available on the Free plan', 'Admin is a Team-scoped role — it requires at least one Team, and Teams are a Premium capability. On Free, an organization has 1 Superadmin and up to ' + UA.limits().mem + ' Members.',
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
      else if (a.lvl === 'view') act = btn('Request use', "UA.requestUse(" + i + ")", 'btn-ghost-v btn-sm');
      else if (a.lvl === 'none' && !a.teamOff) act = btn('Request access', "UA.requestUse(" + i + ")", 'btn-ghost-v btn-sm');
      const sub = a.teamOff ? (a.base !== 'none' ? 'Team-disabled overrides your individual ' + a.base.toUpperCase() + ' permission' : 'Disabled for your team') : 'Your permission: ' + (a.base === 'none' ? 'No Access' : a.base === 'use' ? 'Use' : 'View');
      h += '<tr><td><div class="ua-row" style="gap:10px"><span class="ua-ic gray">' + ic(m.icon, 16) + '</span><div class="mod-name">' + m.name + '<small>' + sub + '</small></div></div></td>' +
        (compact ? '' : '<td>' + teamState + '</td>') +
        '<td>' + UA.lvlBadge(a.lvl, a.teamOff) + '</td>' +
        '<td class="r">' + act + '</td></tr>';
    }
    return h;
  }
  UA.accessRows = accessRows;
  function accessTbl(compact) {
    return '<div class="ua-scroll"><table class="ua-tbl' + (compact ? ' compact' : '') + '"><thead><tr><th>Module</th>' + (compact ? '' : '<th>Team</th>') + '<th>Your access</th><th class="r">Action</th></tr></thead><tbody>' + accessRows(compact) + '</tbody></table></div>';
  }
  UA.accessTbl = accessTbl;

  function quickStartHub() {
    const day0Premium = UA.db.day === 0 && UA.premium();
    const freeSA = !UA.premium() && UA.isSA();
    if (freeSA) {
      return card('Unlock more with Premium',
        'Your organization is on the Free plan. Upgrade to Premium to invite more colleagues, create teams, and manage access with greater flexibility as your organization grows.',
        '<div class="ua-row wrap" style="gap:10px">' + btn('Upgrade to premium', "UA.upgrade('team','Quick Start Hub')", 'btn-premium', 'sparkles') + '</div>',
        '<span class="ua-upsell-icon">' + ic('crown', 18) + '</span>', 'ua-upsell');
    }
    return card(day0Premium ? 'Get started' : 'Manage Organization Structure',
      day0Premium ? 'Premium is active for your organization. Set up your workspace by inviting colleagues, creating teams, and assigning the right module access as your organization grows.' : 'Quickly scale your organization by onboarding colleagues and structuring operational squads with scoped module access.',
      '<div class="ua-row wrap" style="gap:10px">' +
      btn('Create Team', UA.premium() ? 'UA.openCreateTeam()' : "UA.upgrade('team','Quick Start Hub')", 'btn-default', 'plus') +
      btn('Add Members', 'UA.openAddUser()', 'btn-outline', 'user-plus') +
      '</div>', null, 'ua-feature');
  }

  function tree(scope) {
    const pp = UA.people();
    let ts = UA.teams(); if (scope === 'mine') ts = UA.myTeams();
    const none = pp.filter((p) => p.role !== 'superadmin' && !(p.teams || []).length && scope !== 'mine');
    const leaf = (p) => '<div class="ua-leaf">' + UA.av(p, 'sm') + '<span>' + esc(p.name) + (p.id === 'me' ? ' <span class="ua-you">You</span>' : '') + '</span>' + UA.roleBadge(p.role).replace('class="ub', 'class="r ub') + (p.status !== 'active' ? UA.statusBadge(p.status) : '') + '</div>';
    let h = '<div class="ua-tree"><div class="ua-branches">';
    ts.forEach((t) => {
      const mem = pp.filter((p) => (p.teams || []).indexOf(t.id) > -1);
      h += '<div class="ua-branch"><div class="ua-node team"><span class="ua-ic">' + ic('users', 16) + '</span><div><div class="t">' + esc(t.name) + '</div><div class="s">Admin: ' + (UA.adminOf(t).map((a) => esc(a.name)).join(', ') || '—') + ' · ' + mem.length + ' member' + (mem.length === 1 ? '' : 's') + '</div></div></div>' +
        (mem.length && scope !== 'mine' ? '<div class="ua-leafs">' + mem.map(leaf).join('') + '</div>' : '') + '</div>';
    });
    if (none.length) h += '<div class="ua-branch"><div class="ua-node none"><span class="ua-ic gray">' + ic('user', 16) + '</span><div><div class="t">No Team</div><div class="s">Standalone Members · organization-level permissions</div></div></div><div class="ua-leafs">' + none.map(leaf).join('') + '</div></div>';
    return h + '</div></div>';
  }

  function vOrg() {
    if (UA.isMem()) return vOrgMember();
    if (UA.isAdm()) return vOrgAdmin();
    const L = UA.limits(), U = UA.usage(), pl = UA.plat(), free = !UA.premium();
    const id = card(esc(UA.db.org.name),
      'Verified member since ' + esc(UA.db.org.since),
      '<div class="ua-fact-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">' +
      fact('Domain', esc(UA.db.org.domain)) +
      fact('Plan', free ? 'Free' : '<span class="ub gold">' + ic('gem', 11) + 'Premium</span>', free ? '<button type="button" class="ua-icon-btn" onclick="UA.openPlanLimits(event)" aria-label="Plan limitations">' + ic('info', 12) + '</button>' : '') +
      fact('Location', esc(UA.db.org.location)) +
      fact('Your role', '<span class="ub navy">' + ic('crown', 11) + 'Superadmin</span>') +
      '</div>',
      '<button type="button" class="btn btn-icon-sm" aria-label="Organization actions" onclick="UA.orgMenu(event)">' + ic('more', 15) + '</button>');
    const modsOn = (function () { let c = 0; for (let i = 0; i < UA.n(); i++) if (UA.teams().some((t) => t.mods[i] === '1')) c++; return c; })();
    const capsHead = '<div class="ua-row" style="justify-content:space-between;align-items:center">' +
      '<div class="ua-h">Your organization at a glance</div>' +
      (free ? '' : '<span class="ua-chip success">' + ic('sparkles', 13) + 'Unlimited Capacity - Premium</span>') + '</div>';
    let caps = cap('Superadmins', 'crown', U.sa, free ? L.sa : null, free ? U.sa / L.sa * 100 : null, free ? 'Included in Free plan.' : 'Manages structure, billing, access.');
    if (!free) caps += cap('Admins', 'shield', U.admins, null, null, 'Manages Team members, access.');
    caps += cap(free ? 'Member seats' : 'Members', 'users', U.mem, free ? L.mem : null, free ? U.mem / L.mem * 100 : null, free ? (U.mem >= L.mem ? 'All Free seats used.' : (L.mem - U.mem) + ' Free seat' + (L.mem - U.mem === 1 ? '' : 's') + ' left.') : 'Uses modules, requests access.');
    caps += free ? cap('Teams', 'network', '0', null, null, 'Unlocks with Premium.', { locked: true, tag: ' <span class="ub gold" style="margin-left:2px">Premium</span>' }) : cap('Teams', 'network', U.teams, null, null, U.teams ? 'Scoped to this platform.' : 'No Teams yet.');
    caps += free ? '<div class="ua-card ua-cap ua-cap-hoverable"><div class="lbl">' + ic('gem', 14) + 'Plan<button type="button" class="ua-icon-btn" onclick="UA.openPlanLimits(event)" aria-label="Plan limitations">' + ic('info', 12) + '</button></div><div class="num">Free</div><div class="foot">Limited Free plan capacity.</div>' + btn('Upgrade to Premium', "UA.upgrade('tab','Organization › Plan card')", 'btn-premium btn-sm ua-cap-hover-cta', 'sparkles') + '</div>'
      : cap('Modules', 'grid', modsOn, null, null, 'Workflows available on ' + esc(pl.name) + '.');
    const dir = S.dirOpen ? card('Organization directory', 'A directory for access — not an HR hierarchy. Teams with members, then No Team.', tree('all')) : '';
    return '<div style="display:flex;flex-direction:column;gap:16px"><div class="ua-h">Organization snapshot</div><div class="ua-grid c2">' + id + quickStartHub() + '</div>' + capsHead + '<div class="ua-grid ' + (free ? 'c4' : 'c5') + '">' + caps + '</div>' + dir + '</div>';
  }
  function vOrgAdmin() {
    const me = UA.me(), db = UA.db, ts = UA.teamsIAdmin();
    const idc = card(esc(db.org.name), 'Read-only overview · ' + esc(UA.plat().name),
      '<div class="ua-fact-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">' +
      fact('Domain', esc(db.org.domain)) +
      fact('Plan', '<span class="ub gold">' + ic('gem', 11) + 'Premium</span>') +
      fact('Team(s)', ts.length ? ts.map((t) => esc(t.name)).join(', ') : 'Not yet assigned') +
      fact('Your role', '<span class="ub navy">' + ic('shield', 11) + 'Admin</span>') +
      '</div>' +
      '<div class="ua-hint" style="margin-top:12px">You manage Members and module access for ' + (ts.length ? ts.map((t) => esc(t.name)).join(', ') : 'your assigned Team') + '.</div>',
      btn('View my access', 'UA.openMyAccess()', 'btn-outline', 'key'), 'ua-pair-card');
    const myTs = UA.myTeams();
    const teamTiles = '<div style="max-height:68px;overflow-y:auto"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px">' +
      myTs.map((team) => {
        const memCount = UA.people().filter((p) => (p.teams || []).indexOf(team.id) > -1).length;
        const sub = 'Admin: ' + (UA.adminOf(team).map((a) => esc(a.name)).join(', ') || '—') + ' · ' + memCount + ' member' + (memCount === 1 ? '' : 's');
        return '<div class="ua-node team" style="max-width:none" title="' + esc(team.name) + ' — ' + sub + '"><span class="ua-ic">' + ic('users', 16) + '</span><div class="grow" style="min-width:0"><div class="t" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(team.name) + '</div><div class="s" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + sub + '</div></div></div>';
      }).join('') + '</div></div>';
    const teamDir = card('Your Team directory', 'Only the Team(s) you belong to.', teamTiles, null, 'ua-pair-card');
    const scope = card('What you can do as an Admin', 'Your authority is bounded by your assigned Team(s).',
      '<div class="ua-grid c2"><div><div class="ua-sect">You can</div><div class="ua-list">' + ['Manage Members inside your Team(s)', 'Invite Members or a fellow Admin into your own Team — the Superadmin is notified of every invite', 'Set View / Use within modules already enabled for your Team', 'Approve Request to Use / View for your Team’s Members'].map((x) => '<div class="ua-li" style="padding:6px 0"><span style="color:var(--teal-600)">' + ic('check-circle', 15) + '</span><div class="grow t" style="font-weight:400">' + x + '</div></div>').join('') + '</div></div>' +
      '<div><div class="ua-sect">You can’t</div><div class="ua-list">' + ['Create Teams or invite Superadmins', 'Enable new modules for a Team', 'Manage people outside your Team scope', 'Change organization-wide structure or Billing'].map((x) => '<div class="ua-li" style="padding:6px 0"><span style="color:var(--text-3)">' + ic('x-circle', 15) + '</span><div class="grow t" style="font-weight:400;color:var(--text-2)">' + x + '</div></div>').join('') + '</div></div></div>');
    return '<div style="display:flex;flex-direction:column;gap:16px;min-width:0"><div class="ua-grid c2" style="align-items:start">' + idc + teamDir + '</div>' + scope + '</div>';
  }

  function vOrgMember() {
    const me = UA.me(), db = UA.db, ts = UA.myTeams();
    const useN = [...Array(UA.n()).keys()].filter((i) => UA.access(me, i).lvl === 'use').length, viewN = [...Array(UA.n()).keys()].filter((i) => UA.access(me, i).lvl === 'view').length;
    const hd = card(UA.db.day === 0 ? 'You are a Member of this organization' : 'My organization', esc(db.org.name) + ' · ' + esc(UA.plat().name),
      '<div class="ua-fact-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">' +
      fact('Organization', esc(db.org.name)) +
      fact('Team(s)', ts.map((t) => esc(t.name)).join(', ') || 'None — organization-level access') +
      fact('Access', useN + ' Use · ' + viewN + ' View') +
      fact('Role', 'Member') +
      '</div>',
      '<div class="ua-row wrap" style="gap:8px;flex-shrink:0"><span class="ub ' + (UA.premium() ? 'gold' : 'gray') + '">' + (UA.premium() ? ic('gem', 11) + 'Premium' : 'Free') + '</span></div>');
    const acc = UA.db.day === 0 ? '' : card('My access', 'Team-disabled always overrides an individual permission. Upgrade requests go to ' + (ts.length ? 'your Team Admin' : 'the Superadmin') + '.', accessTbl(),
      btn('Browse organization activity', 'UA.openModulePreview()', 'btn-outline btn-sm', 'activity'));
    return '<div style="display:flex;flex-direction:column;gap:16px">' + hd + acc + (UA.db.day === 0 ? card('Your access', 'Ask your Superadmin if you need more.', '<div class="ua-hint">Detailed per-module access appears here once you start working. Members can’t invite people, edit access, or manage Teams.</div>') : '') + '</div>';
  }

  /* ───────────── TEAMS ───────────── */
  function teamCard(t) {
    const pp = UA.people().filter((p) => (p.teams || []).indexOf(t.id) > -1), on = t.mods.split('').filter((c) => c === '1').length;
    const amAdmin = UA.isSA() || (t.admins || []).indexOf(UA.me().id) > -1;
    const relBadge = UA.isAdm() ? '<span class="ub ' + (amAdmin ? 'navy' : 'gray') + '">' + (amAdmin ? 'Admin' : 'Member') + '</span>' : '';
    return '<div class="ua-card" style="cursor:pointer" onclick="UA.openTeam(\'' + t.id + '\')"><div class="ua-row" style="align-items:flex-start"><span class="ua-ic lg">' + ic('users', 20) + '</span><div class="grow" style="flex:1;min-width:0"><div class="ua-row between wrap" style="align-items:center;row-gap:6px"><div class="ua-h" style="font-size:15px;min-width:0">' + esc(t.name) + '</div><div style="display:flex;gap:6px;flex-shrink:0">' + '<span class="ub success dot">Active</span>' + relBadge + '</div></div><div class="ua-hint" style="margin-top:4px">' + esc(t.desc) + '</div></div></div>' +
      '<div class="ua-row between" style="margin-top:16px"><div><div class="ua-xs ua-muted">Admin' + (t.admins.length === 1 ? '' : 's') + '</div><div class="ua-sm" style="font-weight:500;margin-top:2px">' + (UA.adminOf(t).map((a) => esc(a.name)).join(', ') || (t.pendingAdmin ? esc(t.pendingAdmin) + ' (invited)' : '—')) + '</div></div><div class="ua-avs">' + pp.slice(0, 4).map((p) => UA.av(p, 'sm')).join('') + '</div></div>' +
      '<div class="ua-row between" style="margin-top:14px"><span class="ua-xs ua-muted">' + pp.length + ' member' + (pp.length === 1 ? '' : 's') + ' · ' + on + ' of ' + t.mods.length + ' module' + (t.mods.length === 1 ? '' : 's') + ' enabled</span><span class="ua-link">' + (UA.isMem() || !amAdmin ? 'View' : 'Open') + ic('arrow', 12) + '</span></div></div>';
  }
  function vTeams() {
    if (!UA.premium()) {
      if (UA.isMem()) return '<div class="ua-card">' + UA.emptyState('lock', 'Teams aren’t available on your current plan', 'Teams let an organization group people and control which modules each group can access.', btn('Learn about Premium', "UA.upgrade('learn','Teams tab (Member)')", 'btn-outline'), 'gold') + '</div>';
      const d1 = UA.db.day === 1;
      return '<div class="ua-card ua-gate"><div><span class="ub gold" style="margin-bottom:10px">' + ic('gem', 11) + 'Premium</span><h3 class="ua-h" style="font-size:22px;margin-top:8px">' + (d1 ? 'Organize your organization with Teams' : 'Teams are available with Premium.') + '</h3>' +
        '<p class="ua-sub" style="margin-top:8px">' + (d1 ? 'Teams let you group members and control which modules they can access.' : 'Create teams to organize members and control module access at the team level.') + '</p>' +
        '<ul>' + ['Group Members and give each Team its own module access', 'Assign Team Admins who manage their own people', 'Enable or disable modules per Team — Team settings always win', 'Team-scoped approvals for access requests'].map((x) => '<li>' + ic('check', 15) + x + '</li>').join('') + '</ul>' +
        '<div class="ua-row wrap">' + btn('Create Team', "UA.upgrade('team','Teams tab › + Create Team')", 'btn-default', 'plus') + btn('Upgrade to Premium', "UA.upgrade('tab','Teams tab › Upgrade')", 'btn-premium', 'sparkles') + '</div></div>' +
        '<div class="ua-gate-art"><span class="g">Your organization today</span><div><div class="big">0</div><div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px">Teams on the Free plan</div></div><div style="font-size:12px;color:rgba(255,255,255,.55)">Superadmin · ' + UA.usage().mem + '/' + UA.limits().mem + ' Members</div></div></div>';
    }
    let ts = UA.isSA() ? UA.teams() : UA.myTeams();
    const head = '<div class="ua-row between wrap"><div><div class="ua-h">' + (UA.isSA() ? 'Teams' : UA.isAdm() ? 'Your Teams' : 'My Teams') + '</div><div class="ua-hint">' + (UA.isAdm() ? 'Manage the Teams you administer — view-only for any Team you’ve just joined as a Member.' : UA.isMem() ? 'View-only — your Teams, their modules, and your effective access.' : 'Teams are scoped to this platform and never appear on another.') + '</div></div>' + (UA.isSA() && UA.db.day !== 0 ? btn('Create Team', 'UA.openCreateTeam()', 'btn-default', 'plus') : '') + '</div>';
    if (!ts.length) return head + '<div class="ua-card" style="margin-top:16px">' + UA.emptyState('users', UA.isSA() ? 'Create your first Team' : 'You’re not in a Team yet', UA.isSA() ? 'Group Members and manage access more easily. Every Team needs an assigned Admin.' : 'You have organization-level access. Your Superadmin can add you to a Team.', UA.isSA() ? btn('Create Team', 'UA.openCreateTeam()', 'btn-default', 'plus') : '') + '</div>';
    return head + '<div class="ua-grid c3" style="margin-top:16px">' + ts.map(teamCard).join('') + '</div>';
  }

  /* ───────────── MEMBERS ───────────── */
  function memberRows() {
    const f = S.f, q = f.q.toLowerCase(); let list = UA.membersVisible();
    list = list.filter((p) => (!q || (p.name + ' ' + p.email).toLowerCase().indexOf(q) > -1) && (f.role === 'all' || p.role === f.role) && (f.status === 'all' || p.status === f.status) && (f.team === 'all' || (f.team === 'none' ? !(p.teams || []).length : (p.teams || []).indexOf(f.team) > -1)));
    const showAct = UA.isMem() ? false : true, d1p = UA.premium() && UA.db.day === 1;
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
    const onboarding = UA.membersVisible().length === 1 && UA.isSA() && UA.db.day === 0;
    let h = '';
    if (full && UA.isSA()) h += '<div class="ua-banner warn"><span>' + ic('alert', 16) + '</span><div class="grow"><div class="t">You’ve reached your Free plan user limit</div><div>All ' + L.mem + ' Member seats are in use. Upgrade to add more people, Teams and Admins.</div></div><div class="acts">' + btn('Upgrade to Premium', "UA.upgrade('member','Members banner')", 'btn-premium btn-sm', 'sparkles') + '</div></div>';
    const teamOpts = '<option value="all">All Teams</option><option value="none">No Team</option>' + UA.teams().map((t) => '<option value="' + t.id + '"' + (S.f.team === t.id ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('');
    h += '<div class="ua-tbl-wrap"><div class="ua-toolbar"><label class="ua-search">' + ic('search', 15) + '<input type="search" placeholder="Search name or email" value="' + esc(S.f.q) + '" oninput="UA.setF(\'q\',this.value)"></label>' +
      '<select class="ua-select" onchange="UA.setF(\'role\',this.value)"><option value="all">All roles</option><option value="superadmin"' + (S.f.role === 'superadmin' ? ' selected' : '') + '>Superadmin</option><option value="admin"' + (S.f.role === 'admin' ? ' selected' : '') + '>Admin</option><option value="member"' + (S.f.role === 'member' ? ' selected' : '') + '>Member</option></select>' +
      (UA.premium() ? '<select class="ua-select" onchange="UA.setF(\'team\',this.value)">' + teamOpts + '</select>' : '') +
      '<select class="ua-select" onchange="UA.setF(\'status\',this.value)"><option value="all">All statuses</option><option value="active"' + (S.f.status === 'active' ? ' selected' : '') + '>Active</option><option value="pending"' + (S.f.status === 'pending' ? ' selected' : '') + '>Pending Approval</option><option value="suspended"' + (S.f.status === 'suspended' ? ' selected' : '') + '>Suspended</option></select><span class="ua-spacer"></span>' +
      (free && !UA.isMem() ? '<span class="ua-xs ua-muted ua-tnum">Members <b style="color:var(--text-1)">' + U.mem + '/' + L.mem + '</b> used</span>' : '') +
      (canAdd ? btn(UA.isAdm() ? 'Invite Member' : 'Add New User', 'UA.openAddUser()', 'btn-default', 'plus') : '') + '</div>' +
      '<div class="ua-scroll"><table class="ua-tbl"><thead><tr><th>Member</th><th>Role</th><th>Team</th><th>Status</th><th>Access</th><th>' + (UA.premium() && UA.db.day === 1 ? 'Last active' : 'Joined') + '</th><th></th></tr></thead><tbody id="ua-mrows">' + memberRows() + '</tbody></table></div></div>' +
      (UA.isMem() ? '<div class="ua-hint" style="margin-top:12px">Members can see basic directory info and their own access. Only Superadmins and Admins can invite people or edit access.</div>' : '');
    if (onboarding) {
      h += '<div class="ua-card">' + UA.emptyState('users', 'Build your team', 'Invite people from your organization to start working together.' + (UA.premium() ? ' Roles you can invite: Superadmin, Admin, Member.' : ''), btn('Add New User', 'UA.openAddUser()', 'btn-default', 'plus') + (free ? '<div class="ua-hint">Members ' + U.mem + '/' + L.mem + ' used on the Free plan</div>' : '')) + '</div>';
    }
    return '<div style="display:flex;flex-direction:column;gap:16px">' + h + '</div>';
  }
  UA.setF = function (k, v) { S.f[k] = v; const b = document.getElementById('ua-mrows'); if (b) b.innerHTML = memberRows(); else UA.render(); };

  /* ───────────── INVITATIONS / APPLICATIONS ───────────── */
  function vInvites() {
    const list = UA.invitesVisible(), pl = UA.plat();
    const life = '<div class="ua-life"><span class="s"><i>1</i>Invite sent</span><span class="ln"></span><span class="s"><i>2</i>They accept</span><span class="ln"></span><span class="s"><i>3</i>They sign up</span><span class="ln"></span><div class="fork"><span class="s"><i>' + ic('check', 11) + '</i>Most invites join right away</span><span class="s"><i>' + ic('clock', 11) + '</i>Some may need your approval first</span></div></div><div class="ua-hint" style="margin-top:12px">An invite can also be declined or withdrawn at any point.</div>';
    const setup = UA.db.day === 0 ? card('How invites work', 'From sending an invite to them joining your organization.', life, null, 'ua-pair-card') : '';
    const rows = list.length ? list.map((i) => {
      const inv = i.by === 'me' ? UA.me() : UA.person(i.by), by = inv ? inv.name : '—', t = i.team ? UA.team(i.team) : null;
      const lbl = i.status === 'waiting' ? UA.statusBadge('waiting') + '<div class="ua-xs ua-muted" style="margin-top:3px">Waiting for ' + esc(pl.name) + ' approval</div>' + (UA.isMem() ? '' : '<button type="button" class="ua-link" style="margin-top:3px" onclick="UA.reviewInvitePid(\'' + i.pid + '\')">Review' + ic('arrow', 12) + '</button>') : UA.statusBadge(i.status);
      return '<tr><td><div class="ua-person">' + UA.av(i.name) + '<div><div class="nm">' + esc(i.name) + '</div><div class="em">' + esc(i.email) + '</div></div></div></td><td>' + esc(by) + '</td><td>' + UA.roleBadge(i.role) + '</td><td>' + (t ? '<span class="ub teal">' + esc(t.name) + '</span>' : '<span class="ua-faint">—</span>') + '</td><td>' + (i.domain === 'public' ? '<span class="ub warn">Public domain</span>' : '<span class="ub teal">Verified domain</span>') + '</td><td>' + lbl + '</td><td class="ua-muted">' + i.date + '</td><td class="r"><button type="button" class="btn btn-icon-sm" aria-label="Actions" onclick="UA.inviteMenu(event,\'' + i.id + '\')">' + ic('more', 15) + '</button></td></tr>';
    }).join('') : '';
    if (!list.length) {
      const empty = '<div class="ua-card ' + (setup ? 'ua-pair-card' : '') + '">' + UA.emptyState('mail', 'No invitations yet', 'Invited users and their approval status will appear here once you send an invite.', btn(UA.isAdm() ? 'Invite Member' : 'Add New User', 'UA.openAddUser()', 'btn-default', 'plus')) + '</div>';
      return setup ? '<div class="ua-grid c2">' + empty + setup + '</div>' : empty;
    }
    return '<div style="display:flex;flex-direction:column;gap:16px">' + setup +
      '<div class="ua-tbl-wrap"><div class="ua-toolbar"><div class="ua-h" style="font-size:14px">Invitations</div><span class="ua-spacer"></span>' + btn(UA.isAdm() ? 'Invite Member' : 'Add New User', 'UA.openAddUser()', 'btn-default', 'plus') + '</div><div class="ua-scroll"><table class="ua-tbl"><thead><tr><th>Invitee</th><th>Invited by</th><th>Role</th><th>Team</th><th>Domain</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div></div>';
  }
  UA.inviteMenu = function (ev, id) {
    const i = UA.db.invites.find((x) => x.id === id), it = [];
    if (i.status === 'sent') { it.push({ label: 'Resend invitation', icon: 'send', fn: "UA.resendInvite('" + id + "')" }); it.push({ lbl: 'Prototype' }); it.push({ label: 'Simulate: invitee signs up', icon: 'play', fn: "UA.simSignup('" + id + "')" }); it.push({ sep: 1 }); it.push({ label: 'Cancel invitation', icon: 'x-circle', dg: 1, fn: "UA.cancelInvite('" + id + "')" }); }
    else if (i.status === 'waiting') { it.push({ label: 'Review in Access & Approvals', icon: 'inbox', fn: "UA.reviewInvitePid('" + i.pid + "')" }); }
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
    return '<div style="display:flex;flex-direction:column;gap:16px"><div class="ua-tbl-wrap"><div class="ua-toolbar"><div class="ua-h" style="font-size:14px">Requests awaiting a decision</div><span class="ua-spacer"></span>' + filters + '</div>' + body + '</div>' +
      card('Audit history', 'Every request, approval, denial, invitation and permission change is recorded.', auditList(6), btn('View all', 'UA.openAudit()', 'btn-ghost-v btn-sm')) + '</div>';
  }
  function auditList(n) {
    const a = UA.db.audit.slice(0, n || 50);
    if (!a.length) return '<div class="ua-hint">No activity recorded yet.</div>';
    return '<div class="ua-list">' + a.map((x) => '<div class="ua-li"><span class="ua-ic gray">' + ic('history', 15) + '</span><div class="grow"><div class="t">' + esc(x.action) + ' <span class="ua-muted" style="font-weight:400">· ' + esc(x.entity) + '</span></div><div class="s">' + esc(x.actor) + ' · ' + esc(x.o) + ' → ' + esc(x.nw) + '</div></div><span class="ua-xs ua-faint">' + esc(x.t) + '</span></div>').join('') + '</div>';
  }
  UA.auditList = auditList;
})();
