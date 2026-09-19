/* Users & Access — flows: member/team drawers, Add New User, Create Team, upgrade popups + intent capture,
   approvals, Superadmin transfer, in-module Org Activity / Upgrade-to-Use preview. */
(function () {
  'use strict';
  const UA = window.UA, S = UA.state, ic = UA.ic, esc = UA.esc, btn = (l, f, c, i) => UA.btn(l, f, c, i);
  const refresh = () => { UA.render(); };
  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const nameFromEmail = (e) => e.split('@')[0].split(/[._-]+/).map(cap1).join(' ');
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const seg = (cur, fn, opts) => '<div class="ua-seg">' + [['none', 'No Access'], ['view', 'View'], ['use', 'Use']].filter((o) => !opts || opts.indexOf(o[0]) > -1).map((o) => '<button type="button" class="' + (cur === o[0] ? 'on ' + o[0] : '') + '" onclick="' + fn.replace('%L', o[0]) + '">' + o[1] + '</button>').join('') + '</div>';

  /* ───────────── Permissions of the acting user over a target ───────────── */
  function canManage(p) {
    if (p.id === 'me') return false;
    if (UA.isSA()) return true;
    if (UA.isAdm()) return p.role === 'member' && (p.teams || []).some((t) => UA.me().teams.indexOf(t) > -1);
    return false;
  }

  /* ───────────── Member detail drawer ───────────── */
  UA.openMember = function (id) {
    const p = UA.person(id), mem = UA.isMem(), edit = canManage(p) && p.status === 'active';
    let mods = '';
    for (let i = 0; i < UA.n(); i++) {
      const a = UA.access(p, i), m = UA.mod(i);
      const rowEditable = edit && p.role !== 'superadmin' && !a.teamOff;
      mods += '<div class="ua-mod"><span class="ua-ic gray">' + ic(m.icon, 15) + '</span><div class="n">' + m.name + '<small>' + (a.teamOff ? 'Team-disabled — overrides individual permission' : p.role === 'superadmin' ? 'Superadmin: Use by default' : '') + '</small></div>' +
        (rowEditable ? seg(a.base, "UA.setLvl('" + p.id + "'," + i + ",'%L')") : UA.lvlBadge(a.lvl, a.teamOff)) + '</div>';
    }
    const recent = UA.premium() && S.day === 1 && p.status === 'active' && p.id !== 'rahul' ? '<div><div class="ua-sect">Recent activity</div><div class="ua-list">' + [0, 1].map((k) => { const i = (UA.n() > 2 ? [2, 3][k] : 0); return '<div class="ua-li"><span class="ua-ic gray">' + ic('activity', 14) + '</span><div class="grow"><div class="t">' + UA.actFor(i) + '</div><div class="s">' + esc(UA.itemFor(i)) + '</div></div><span class="ua-xs ua-faint">' + ['2h ago', 'Yesterday'][k] + '</span></div>'; }).join('') + '</div></div>' : '';
    const foot = (canManage(p) && p.status !== 'pending') ? (p.status === 'suspended' ? btn('Reactivate', "UA.suspend('" + p.id + "')", 'btn-outline') : btn('Suspend', "UA.suspend('" + p.id + "')", 'btn-outline', 'ban')) + btn('Remove', "UA.confirmRemove('" + p.id + "')", 'btn-danger-ghost', 'trash') : '';
    UA.drawer({
      lead: UA.av(p, 'lg'), title: esc(p.name) + (p.id === 'me' ? ' <span class="ua-you">You</span>' : ''), sub: (mem ? '' : esc(p.email)),
      body: '<div class="ua-row wrap" style="gap:8px">' + UA.roleBadge(p.role) + UA.statusBadge(p.status) + '</div>' +
        '<div><div class="ua-sect">Details</div><dl class="ua-kv">' + (mem ? '' : '<dt>Email</dt><dd>' + esc(p.email) + '</dd><dt>Phone</dt><dd>+91 98••• ••' + (40 + p.name.length) + '</dd>') + '<dt>Organization</dt><dd>' + esc(UA.db.org.name) + '</dd><dt>Platform</dt><dd>' + esc(UA.plat().name) + '</dd><dt>Team</dt><dd>' + UA.teamChips(p) + '</dd><dt>Joined</dt><dd>' + esc(p.joined) + (p.organic ? ' · joined without an invite' : '') + '</dd></dl></div>' +
        (p.status === 'pending' ? '<div class="ua-banner warn"><span>' + ic('clock', 16) + '</span><div class="grow">Waiting for approval — public-domain signup.</div>' + (UA.isMem() ? '' : '<div class="acts">' + btn('Review', "UA.closeDrawer();UA.go('approvals')", 'btn-outline btn-sm') + '</div>') + '</div>' : '<div><div class="ua-sect">Module access' + (edit ? ' · effective = Team enabled ∧ Member permission' : '') + '</div>' + mods + '</div>' + recent) +
        (UA.isAdm() && p.role !== 'member' ? '<div class="ua-hint">Admins can’t change other Admins or Superadmins.</div>' : '') + (mem && p.id !== 'me' ? '<div class="ua-hint">Members see basic directory info only.</div>' : ''),
      foot: foot
    });
  };
  UA.setLvl = function (pid, i, lvl) {
    const p = UA.person(pid), old = UA.access(p, i).base; if (old === lvl) return;
    UA.setPerm(p, i, lvl); UA.audit('Module permission changed', p.name + ' → ' + UA.mod(i).name, old, lvl);
    UA.toast(p.name + ': ' + UA.mod(i).name + ' → ' + (lvl === 'none' ? 'No Access' : cap1(lvl)), 'Only ' + p.name + ' is notified — not the whole organization.');
    UA.openMember(pid); refresh();
  };
  UA.memberMenu = function (ev, id) {
    const p = UA.person(id), it = [{ label: 'View member', icon: 'eye', fn: "UA.openMember('" + id + "')" }];
    if (p.status === 'pending') it.push({ label: 'Review in Access & Approvals', icon: 'inbox', fn: "UA.go('approvals')" });
    else if (canManage(p)) {
      it.push({ label: 'Edit access', icon: 'pencil', fn: "UA.openMember('" + id + "')" });
      if (UA.isSA()) it.push({ label: 'Change role', icon: 'shield', fn: "UA.changeRole('" + id + "')" });
      if (UA.premium()) it.push({ label: 'Assign Team', icon: 'users', fn: "UA.assignTeam('" + id + "')" });
      it.push({ sep: 1 }); it.push({ label: p.status === 'suspended' ? 'Reactivate' : 'Suspend', icon: 'ban', fn: "UA.suspend('" + id + "')" }); it.push({ label: 'Remove', icon: 'trash', dg: 1, fn: "UA.confirmRemove('" + id + "')" });
    }
    UA.menu(ev, it);
  };
  UA.suspend = function (id) {
    const p = UA.person(id), was = p.status; p.status = was === 'suspended' ? 'active' : 'suspended';
    UA.audit(p.status === 'suspended' ? 'User suspended' : 'User reactivated', p.name, was, p.status);
    UA.toast(p.name + (p.status === 'suspended' ? ' suspended' : ' reactivated'), p.status === 'suspended' ? 'They keep their place in the organization but lose platform access.' : ''); UA.closeDrawer(); refresh();
  };
  UA.confirmRemove = function (id) {
    const p = UA.person(id);
    UA.modal({ icon: 'trash', iconCls: 'gray', title: 'Remove ' + esc(p.name) + '?', sub: 'They lose access to ' + esc(UA.plat().name) + ' immediately. The record is kept for the audit trail — nothing is hard-deleted.', body: '', foot: btn('Cancel', 'UA.closeModal()', 'btn-ghost-v') + btn('Remove', "UA.doRemove('" + id + "')", 'btn-danger') });
  };
  UA.doRemove = function (id) {
    const p = UA.person(id); p.status = 'removed'; (UA.db.teams || []).forEach((t) => { t.admins = t.admins.filter((a) => a !== id); });
    UA.audit('User removed', p.name, 'Active', 'Removed'); UA.closeModal(); UA.closeDrawer(); UA.toast(p.name + ' removed', 'Soft-deleted — kept in audit history.'); refresh();
  };
  UA.changeRole = function (id) {
    const p = UA.person(id);
    const opt = (r, ttl, s) => '<label class="ua-radio' + (p.role === r ? ' on' : '') + '"><input type="radio" name="crole" value="' + r + '"' + (p.role === r ? ' checked' : '') + '><div><div class="t">' + ttl + '</div><div class="s">' + s + '</div></div></label>';
    UA.modal({ icon: 'shield', title: 'Change role', sub: esc(p.name) + ' · roles are platform-specific — this affects ' + esc(UA.plat().name) + ' only.',
      body: opt('member', 'Member', 'Standard user. Can belong to one, several or no Teams.') + opt('admin', 'Admin ' + (UA.premium() ? '' : '<span class="ub gold">Premium</span>'), 'Manages people inside assigned Team(s). Must belong to at least one Team.') + opt('superadmin', 'Superadmin ' + (UA.premium() ? '' : '<span class="ub gold">Premium</span>'), 'Platform-wide. Extra Superadmins are a Premium capability.'),
      foot: btn('Cancel', 'UA.closeModal()', 'btn-ghost-v') + btn('Save role', "UA.saveRole('" + id + "')") });
  };
  UA.saveRole = function (id) {
    const p = UA.person(id), r = (document.querySelector('input[name=crole]:checked') || {}).value; if (!r || r === p.role) return UA.closeModal();
    const blocked = r === 'admin' ? UA.capacity('admin') : r === 'superadmin' ? UA.capacity('superadmin') : null;
    if (blocked) return UA.upgrade(blocked, 'Change role › ' + cap1(r));
    if (r === 'admin' && !(p.teams || []).length) { p.teams = [UA.teams()[0].id]; UA.teams()[0].admins.push(p.id); }
    if (p.role === 'admin' && r !== 'admin') UA.db.teams.forEach((t) => { t.admins = t.admins.filter((a) => a !== p.id); });
    UA.audit('Role changed', p.name, UA.roleLabel(p.role), UA.roleLabel(r)); p.role = r; UA.closeModal(); UA.toast(p.name + ' is now ' + UA.roleLabel(r)); refresh();
  };
  UA.assignTeam = function (id) {
    const p = UA.person(id), ts = UA.isAdm() ? UA.myTeams() : UA.teams();
    UA.modal({ icon: 'users', title: 'Assign Team', sub: esc(p.name) + ' can belong to one, several or no Teams.', body: (ts.length ? ts.map((t) => '<label class="ua-radio"><input type="checkbox" name="atm" value="' + t.id + '"' + ((p.teams || []).indexOf(t.id) > -1 ? ' checked' : '') + '><div><div class="t">' + esc(t.name) + '</div><div class="s">' + t.mods.split('').filter((c) => c === '1').length + ' of ' + t.mods.length + ' modules enabled</div></div></label>').join('') : '<div class="ua-hint">No Teams yet.</div>') + '<div class="ua-hint">Team membership references the platform membership — never the raw user.</div>',
      foot: btn('Cancel', 'UA.closeModal()', 'btn-ghost-v') + btn('Save', "UA.saveTeams('" + id + "')") });
  };
  UA.saveTeams = function (id) {
    const p = UA.person(id), keep = (p.teams || []).filter((t) => UA.isAdm() && UA.me().teams.indexOf(t) < 0), sel = [...document.querySelectorAll('input[name=atm]:checked')].map((x) => x.value);
    const before = p.teams.map((t) => UA.team(t).name).join(', ') || 'No Team'; p.teams = keep.concat(sel);
    UA.audit('Team assignment changed', p.name, before, p.teams.map((t) => UA.team(t).name).join(', ') || 'No Team'); UA.closeModal(); UA.toast('Team assignment updated', 'The relevant Team is notified.'); refresh();
  };

  /* ───────────── Team drawer ───────────── */
  UA.openTeam = function (tid) {
    const t = UA.team(tid), pp = UA.people().filter((p) => (p.teams || []).indexOf(tid) > -1), editMods = UA.isSA(), canAdd = !UA.isMem();
    let mods = '';
    for (let i = 0; i < UA.n(); i++) { const m = UA.mod(i), on = t.mods[i] === '1'; mods += '<div class="ua-mod"><span class="ua-ic gray">' + ic(m.icon, 15) + '</span><div class="n">' + m.name + '</div>' + (editMods ? '<button type="button" class="ua-switch ' + (on ? 'on' : '') + '" onclick="UA.toggleTeamMod(\'' + tid + '\',' + i + ')" aria-label="Toggle ' + m.name + '"></button>' : '<span class="ub ' + (on ? 'teal' : 'gray') + '">' + (on ? 'Enabled' : 'Not enabled') + '</span>') + '</div>'; }
    UA.drawer({
      lead: '<span class="ua-ic lg">' + ic('users', 20) + '</span>', title: esc(t.name), sub: esc(t.desc),
      body: '<div class="ua-row wrap" style="gap:8px"><span class="ub success dot">Active</span><span class="ub gray">Platform · ' + esc(UA.plat().name) + '</span></div>' +
        '<div><div class="ua-sect">Admin' + (t.admins.length === 1 ? '' : 's') + '</div>' + (UA.adminOf(t).map((a) => '<div class="ua-li"><div class="grow">' + UA.person$(a) + '</div>' + UA.roleBadge('admin') + '</div>').join('') || '<div class="ua-hint">' + (t.pendingAdmin ? esc(t.pendingAdmin) + ' — invitation sent, not yet joined' : 'No Admin assigned') + '</div>') + '</div>' +
        '<div><div class="ua-sect">Enabled modules' + (editMods ? '' : '') + '</div>' + mods + (UA.isAdm() ? '<div class="ua-hint">Admins can’t enable new modules for a Team — ask the Superadmin.</div>' : '') + (UA.isMem() ? '<div class="ua-hint">If a module is disabled for the Team, it overrides your individual permission.</div>' : '') + '</div>' +
        '<div><div class="ua-row between"><div class="ua-sect" style="margin:0">Members · ' + pp.length + '</div>' + (canAdd ? '<button type="button" class="ua-link" onclick="UA.closeDrawer();UA.openAddUser({team:\'' + tid + '\'})">' + ic('plus', 12) + 'Add member</button>' : '') + '</div><div class="ua-list" style="margin-top:6px">' + (pp.map((p) => '<div class="ua-li"><div class="grow">' + UA.person$(p, { noEmail: UA.isMem() }) + '</div><span class="ua-xs ua-muted ua-tnum">' + UA.accessSummary(p) + '</span>' + UA.roleBadge(p.role) + '</div>').join('') || '<div class="ua-hint">No members yet.</div>') + '</div></div>'
    });
  };
  UA.toggleTeamMod = function (tid, i) {
    const t = UA.team(tid), a = t.mods.split(''); a[i] = a[i] === '1' ? '0' : '1'; t.mods = a.join('');
    UA.audit('Team module ' + (a[i] === '1' ? 'enabled' : 'disabled'), t.name + ' → ' + UA.mod(i).name, a[i] === '1' ? 'Off' : 'On', a[i] === '1' ? 'On' : 'Off');
    UA.toast(UA.mod(i).name + (a[i] === '1' ? ' enabled' : ' disabled') + ' for ' + t.name, a[i] === '1' ? '' : 'All members of this Team lose access — user-level permissions can’t override it.'); UA.openTeam(tid); refresh();
  };

  /* ───────────── Add New User (send-side of the invite flow) ───────────── */
  UA.au = { role: 'member', team: '', email: '', perms: {} };
  UA.openAddUser = function (pre) {
    UA.au = { role: 'member', team: (pre && pre.team) || '', email: '', perms: {} };
    if (UA.isAdm() && !UA.au.team) UA.au.team = UA.myTeams()[0] ? UA.myTeams()[0].id : '';
    UA.auStep1();
  };
  UA.auStep1 = function () {
    const o = (r, ttl, s, lock) => '<label class="ua-radio' + (UA.au.role === r ? ' on' : '') + (lock === 'x' ? ' disabled' : '') + '"><input type="radio" name="aur" value="' + r + '"' + (UA.au.role === r ? ' checked' : '') + (lock === 'x' ? ' disabled' : '') + ' onchange="UA.au.role=this.value;UA.auStep1()"><div style="flex:1"><div class="t">' + ttl + (lock === 'p' ? ' <span class="ub gold">' + ic('lock', 10) + 'Premium</span>' : '') + '</div><div class="s">' + s + '</div></div></label>';
    const u = UA.usage(), l = UA.limits();
    UA.modal({ icon: 'user-plus', title: UA.isAdm() ? 'Invite Member' : 'Add New User', sub: 'Step 1 of 2 · Choose a role. Capacity is checked before anything is created.',
      body: (UA.isAdm() ? o('member', 'Member', 'Admins can only invite Members, into their own Team.') + '<div class="ua-hint">Admins can’t invite other Admins or Superadmins. The Superadmin is notified of every invite you send.</div>'
        : o('member', 'Member', 'Standard user. Joins with Use permission unless you set View.') + o('admin', 'Admin', 'Manages people inside assigned Team(s). Requires a Team.', UA.premium() ? '' : 'p') + o('superadmin', 'Superadmin', 'Platform-wide administration. Doesn’t need a Team.', UA.premium() ? '' : 'p')) +
        (UA.premium() ? '' : '<div class="ua-row between ua-sm ua-muted"><span>Members <b style="color:var(--text-1)">' + u.mem + '/' + l.mem + '</b> used on Free</span>' + (u.mem >= l.mem ? '<span class="ub warn">Seat limit reached</span>' : '') + '</div>'),
      foot: btn('Cancel', 'UA.closeModal()', 'btn-ghost-v') + btn('Continue', 'UA.auContinue()', 'btn-default', 'arrow') });
  };
  UA.auContinue = function () {
    const r = UA.au.role, blocked = UA.capacity(r);
    if (blocked) return UA.upgrade(blocked, 'Add New User › role ' + cap1(r));
    UA.auStep2();
  };
  function auModules() {
    const t = UA.au.team ? UA.team(UA.au.team) : null; let h = '';
    if (UA.au.role === 'superadmin') return '<div class="ua-banner neutral"><span>' + ic('crown', 16) + '</span><div>Superadmins get Use access across every module by default and aren’t restricted by Team gating.</div></div>';
    for (let i = 0; i < UA.n(); i++) {
      if (t && t.mods[i] !== '1') continue; const m = UA.mod(i), v = UA.au.perms[i] || 'use';
      h += '<div class="ua-mod"><span class="ua-ic gray">' + ic(m.icon, 15) + '</span><div class="n">' + m.name + '</div>' + seg(v, "UA.au.perms[" + i + "]='%L';UA.auStep2(true)", ['view', 'use']) + '</div>';
    }
    return h || '<div class="ua-hint">No modules are enabled for this Team yet.</div>';
  }
  UA.auStep2 = function (keep) {
    if (keep === true) { const e = document.getElementById('au-email'); if (e) UA.au.email = e.value; }
    const a = UA.au, pl = UA.plat(), dt = a.email && validEmail(a.email) ? UA.domainType(a.email) : null;
    const ts = UA.isAdm() ? UA.myTeams() : UA.teams();
    const teamSel = !UA.premium() ? '<div class="ua-field"><label>Team</label><div class="ua-hint">Teams are available with Premium — this Member will join with No Team and Use access.</div></div>' :
      '<div class="ua-field"><label>Team' + (a.role === 'admin' ? ' *' : '') + '</label><select class="ua-select" style="width:100%" onchange="UA.au.team=this.value;UA.au.perms={};if(this.value===\'__new\'){UA.au.team=\'\';UA.openCreateTeam({from:1});}else UA.auStep2(true)">' +
      (a.role !== 'admin' && !UA.isAdm() ? '<option value="">No Team — standalone Member</option>' : '<option value="">Select a Team</option>') + ts.map((t) => '<option value="' + t.id + '"' + (a.team === t.id ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('') + (UA.isSA() ? '<option value="__new">+ Create new Team…</option>' : '') + '</select>' +
      '<div class="h">' + (UA.isAdm() ? 'You can only invite into Teams you belong to.' : a.role === 'admin' ? 'Admins must belong to at least one Team.' : 'Optional for Members.') + '</div></div>';
    UA.modal({ icon: 'user-plus', title: UA.isAdm() ? 'Invite Member' : 'Add New User', sub: 'Step 2 of 2 · Inviting a <b>' + UA.roleLabel(a.role) + '</b> to ' + esc(pl.name) + '.', size: '', noFocus: keep === true,
      body: '<div class="ua-field"><label for="au-email">Work email *</label><input id="au-email" class="ua-input" type="email" placeholder="name@company.com" value="' + esc(a.email) + '" oninput="UA.au.email=this.value;UA.auHint()"><div class="h" id="au-hint">' + auHint(dt) + '</div><div class="e" id="au-err"></div></div>' + teamSel +
        '<div><div class="ua-sect">Module permissions' + (a.role === 'member' || a.role === 'admin' ? ' · defaults to Use' : '') + '</div>' + auModules() + '</div>' +
        '<div class="ua-banner info"><span>' + ic('bell', 16) + '</span><div class="grow">' + (UA.isAdm() ? 'The Superadmin is notified of this invitation the moment it’s sent.' : 'The invitee gets an email. Company, Role and Team are pre-set — they’re never asked for them at sign-up.') + '</div></div>',
      foot: btn('Back', 'UA.auStep1()', 'btn-ghost-v') + btn('Send Invitation', 'UA.auSend()', 'btn-default', 'send') });
  };
  function auHint(dt) { return dt === 'public' ? 'Public email domain — the invitation fixes company, role and Team, but the invitee will still need approval before becoming Active.' : dt === 'private' ? 'Verified organization domain — the invitee joins as Active after sign-up (no approval needed for the same platform).' : 'Invitations override normal domain / company selection.'; }
  UA.auHint = function () { const e = UA.au.email, h = document.getElementById('au-hint'); if (h) h.textContent = auHint(validEmail(e) ? UA.domainType(e) : null); };
  UA.auSend = function () {
    const a = UA.au, e = (document.getElementById('au-email').value || '').trim().toLowerCase(); a.email = e; const err = document.getElementById('au-err'), inp = document.getElementById('au-email');
    if (!validEmail(e)) { err.textContent = 'Enter a valid email address.'; inp.classList.add('err'); return; }
    if (UA.db.invites.some((i) => i.email === e && (i.status === 'sent' || i.status === 'waiting')) || UA.people().some((p) => p.email === e)) { err.textContent = 'This person already has an invitation or membership on this platform.'; inp.classList.add('err'); return; }
    if ((a.role === 'admin' || UA.isAdm()) && UA.premium() && !a.team) { err.textContent = 'Choose a Team — ' + (a.role === 'admin' ? 'Admins' : 'you can only invite into your own Team; Members here') + ' must belong to one.'; return; }
    const blocked = UA.capacity(a.role); if (blocked) return UA.upgrade(blocked, 'Add New User › Send');
    const t = a.team ? UA.team(a.team) : null; let perm = ''; for (let i = 0; i < UA.n(); i++) perm += a.role === 'superadmin' ? 'U' : (t && t.mods[i] !== '1') ? 'N' : { use: 'U', view: 'V' }[a.perms[i] || 'use'];
    UA.db.invites.unshift({ id: UA.uid('i'), name: nameFromEmail(e), email: e, by: 'me', role: a.role, team: a.team || null, status: 'sent', domain: UA.domainType(e), date: 'Today', perm: perm });
    if (t && a.role === 'admin' && !t.admins.length) t.pendingAdmin = e;
    UA.audit('Invitation sent', e, '—', UA.roleLabel(a.role) + (t ? ' · ' + t.name : ' · No Team')); UA.closeModal();
    UA.toast('Invitation sent to ' + e, UA.isAdm() ? 'Superadmin notified · appears in Invitations / Applications as “Sent”.' : 'Appears in Invitations / Applications as “Sent”.'); refresh();
  };
  UA.resendInvite = function (id) { const i = UA.db.invites.find((x) => x.id === id); UA.audit('Invitation resent', i.email, 'Sent', 'Sent'); UA.toast('Invitation resent to ' + i.email); };
  UA.cancelInvite = function (id) { const i = UA.db.invites.find((x) => x.id === id); i.status = 'cancelled'; UA.audit('Invitation cancelled', i.email, 'Sent', 'Cancelled'); UA.toast('Invitation cancelled', 'The link is no longer valid and the seat is released.'); refresh(); };
  UA.simSignup = function (id) {
    const i = UA.db.invites.find((x) => x.id === id), pid = UA.uid('p'), pub = i.domain === 'public';
    const perm = i.perm || 'U'.repeat(UA.n()); const p = { id: pid, name: i.name, email: i.email, role: i.role, teams: i.team ? [i.team] : [], status: pub ? 'pending' : 'active', perm: perm, joined: 'Today', last: '—', pubdomain: pub };
    UA.db.people.push(p); i.pid = pid; i.status = pub ? 'waiting' : 'joined';
    if (!pub && i.role === 'admin' && i.team) { UA.team(i.team).admins.push(pid); delete UA.team(i.team).pendingAdmin; }
    if (pub) UA.db.requests.unshift({ id: UA.uid('r'), type: 'invite', pid: pid, mod: null, date: 'Today', status: 'pending', reason: '' });
    UA.audit('Signup completed' + (pub ? ' (public domain)' : ' (private domain)'), i.email, 'Invitation Accepted', pub ? 'Pending Approval' : 'Active');
    UA.toast(i.name + (pub ? ' is waiting for approval' : ' joined as Active'), pub ? 'Public-domain signups always need approval — see Access & Approvals.' : 'Private-domain signups skip approval on the same platform. Inviter notified.'); refresh();
  };

  /* ───────────── Create Team (Premium) ───────────── */
  UA.ct = { mods: {} };
  UA.openCreateTeam = function (o) {
    const blocked = UA.capacity('team'); if (blocked) return UA.upgrade(blocked, 'Teams tab › + Create Team');
    UA.ct = { mods: {}, from: o && o.from }; for (let i = 0; i < UA.n(); i++) UA.ct.mods[i] = { on: true, lvl: 'use' };
    UA.ctRender();
  };
  UA.ctRender = function () {
    const keepVals = ['ct-name', 'ct-desc', 'ct-admin', 'ct-mem'].map((id) => { const e = document.getElementById(id); return e ? e.value : ''; });
    let mods = ''; for (let i = 0; i < UA.n(); i++) { const m = UA.mod(i), c = UA.ct.mods[i]; mods += '<div class="ua-mod"><span class="ua-ic gray">' + ic(m.icon, 15) + '</span><div class="n">' + m.name + '</div>' + (c.on ? seg(c.lvl, "UA.ct.mods[" + i + "].lvl='%L';UA.ctRender()", ['view', 'use']) : '') + '<button type="button" class="ua-switch ' + (c.on ? 'on' : '') + '" onclick="UA.ct.mods[' + i + '].on=!UA.ct.mods[' + i + '].on;UA.ctRender()" aria-label="Toggle ' + m.name + '"></button></div>'; }
    UA.modal({ icon: 'users', title: 'Create Team', sub: 'Teams belong to <b>' + esc(UA.db.org.name) + '</b> on <b>' + esc(UA.plat().name) + '</b> only. Every Team needs an assigned Admin.', size: 'wide', noFocus: true,
      body: '<div class="ua-grid c2"><div class="ua-field"><label for="ct-name">Team name *</label><input id="ct-name" class="ua-input" placeholder="e.g. Process Development" value="' + esc(keepVals[0]) + '"><div class="e" id="ct-e1"></div></div><div class="ua-field"><label for="ct-admin">Assigned Admin (email) *</label><input id="ct-admin" class="ua-input" type="email" placeholder="admin@acme.com" value="' + esc(keepVals[2]) + '"><div class="e" id="ct-e2"></div></div></div>' +
        '<div class="ua-field"><label for="ct-desc">Description</label><input id="ct-desc" class="ua-input" placeholder="What does this Team work on?" value="' + esc(keepVals[1]) + '"></div>' +
        '<div class="ua-field"><label for="ct-mem">Initial Members (optional, comma-separated emails)</label><input id="ct-mem" class="ua-input" placeholder="a@acme.com, b@acme.com" value="' + esc(keepVals[3]) + '"></div>' +
        '<div><div class="ua-sect">Module access for this Team · toggle on/off, then default View or Use for invitees</div>' + mods + '<div class="ua-hint" style="margin-top:6px">If a module is off for the Team, every member loses it — individual permissions can’t override.</div></div>' +
        '<div class="ua-banner info"><span>' + ic('mail', 16) + '</span><div class="grow">Creating the Team sends invitations to the Admin and any Members. Invitees default to <b>Use</b> unless you choose View. An Admin can never create a Team or invite another Admin.</div></div>',
      foot: btn('Cancel', 'UA.closeModal()', 'btn-ghost-v') + btn('Create Team', 'UA.ctSubmit()', 'btn-default') });
  };
  UA.ctSubmit = function () {
    const nm = document.getElementById('ct-name').value.trim(), ad = document.getElementById('ct-admin').value.trim().toLowerCase(), ds = document.getElementById('ct-desc').value.trim(), mm = document.getElementById('ct-mem').value.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
    let bad = false; const e1 = document.getElementById('ct-e1'), e2 = document.getElementById('ct-e2'); e1.textContent = e2.textContent = '';
    if (!nm) { e1.textContent = 'Give the Team a name.'; bad = true; } else if (UA.teams().some((t) => t.name.toLowerCase() === nm.toLowerCase())) { e1.textContent = 'A Team with this name already exists on this platform.'; bad = true; }
    if (!validEmail(ad)) { e2.textContent = 'A Team needs an assigned Admin — enter a valid email.'; bad = true; }
    if (bad) return;
    const blocked = UA.capacity('team'); if (blocked) return UA.upgrade(blocked, 'Create Team › Submit');
    let mods = '', perm = ''; for (let i = 0; i < UA.n(); i++) { const c = UA.ct.mods[i]; mods += c.on ? '1' : '0'; perm += c.on ? (c.lvl === 'view' ? 'V' : 'U') : 'N'; }
    const t = { id: UA.uid('t'), name: nm, desc: ds || 'New Team', admins: [], mods: mods, status: 'active', pendingAdmin: ad };
    UA.db.teams.push(t);
    const mk = (email, role) => UA.db.invites.unshift({ id: UA.uid('i'), name: nameFromEmail(email), email: email, by: 'me', role: role, team: t.id, status: 'sent', domain: UA.domainType(email), date: 'Today', perm: perm });
    mk(ad, 'admin'); mm.filter(validEmail).forEach((e) => mk(e, 'member'));
    UA.audit('Team created', nm, '—', mods.split('').filter((c) => c === '1').length + ' modules enabled'); UA.closeModal();
    UA.toast('Team “' + nm + '” created', (1 + mm.filter(validEmail).length) + ' invitation' + (mm.length ? 's' : '') + ' sent · see Invitations / Applications.'); if (UA.ct.from) UA.auStep1(); else { S.tab = 'teams'; refresh(); }
  };

  /* ───────────── Upgrade popups + Upgrade Intent capture ───────────── */
  const UPG = {
    member: () => ({ ttl: 'You’re at your Free plan limit', txt: 'You’ve used all ' + UA.usage().mem + ' of ' + UA.limits().mem + ' Member seats included in Free. Upgrade to Premium to add more people and unlock Teams and broader access management.', ev: 'ADD_MEMBER_LIMIT', cta: 'Upgrade to Premium', no: 'Cancel' }),
    team: () => ({ ttl: 'Create your first Team with Premium', txt: 'Free includes 0 Teams. Upgrade to Premium to organize Members into Teams and manage module access by Team.', ev: 'CREATE_TEAM', cta: 'Upgrade to Premium', no: 'Cancel' }),
    superadmin: () => ({ ttl: 'Share administration with Premium', txt: 'Free includes 1 Superadmin. Upgrade to Premium to add another Superadmin and share platform administration.', ev: 'ADD_SUPERADMIN', cta: 'Upgrade to Premium', no: 'Cancel' }),
    admin: () => ({ ttl: 'Add an Admin with Premium', txt: 'Admins work through Teams. Free includes 0 Teams, so you’ll need Premium to create a Team and add a team-based Admin.', ev: 'CREATE_ADMIN', cta: 'Upgrade to Premium', no: 'Cancel' }),
    tab: () => ({ ttl: 'Unlock more with Premium', txt: 'You’re currently on Free. This part of Users & Access is available with Premium, including expanded users, Teams and stronger access controls.', ev: 'PREMIUM_TAB_ACTION', cta: 'Upgrade to Premium', no: 'Not now' })
  };
  UA.upgrade = function (variant, src) {
    if (UA.isMem() && variant !== 'limit') variant = 'learn';
    if (variant === 'learn') { const sa = UA.superadmin(); return UA.modal({ icon: 'gem', iconCls: 'gold', title: 'Teams are available with Premium', sub: 'Teams let organizations group people and control which modules each group can access. Your plan is managed by your Superadmin, <b>' + esc(sa.name) + '</b> — let them know you’re interested.', body: '<div class="ua-banner neutral"><span>' + ic('info', 16) + '</span><div>As a Member, you can’t change the plan. Premium decisions are made by a Superadmin.</div></div>', foot: btn('Got it', 'UA.closeModal()', 'btn-default') }); }
    if (variant === 'limit') return UA.modal({ icon: 'alert', iconCls: 'gold', title: 'You’ve reached your plan limit', sub: 'This organization has used all of its Premium capacity for this resource. Limits are configuration-driven per organization.', body: '', foot: btn('Close', 'UA.closeModal()', 'btn-ghost-v') + btn('Contact ' + esc(UA.plat().ops), "UA.closeModal();UA.toast('Request sent to ' + '" + esc(UA.plat().ops) + "')", 'btn-default') });
    if (variant === 'admin-noteam') return UA.modal({ icon: 'users', title: 'Create a Team first', sub: 'Admins are scoped to Teams — an Admin must belong to at least one. Create a Team, then invite its Admin.', body: '', foot: btn('Cancel', 'UA.closeModal()', 'btn-ghost-v') + btn('Create Team', 'UA.openCreateTeam()', 'btn-default', 'plus') });
    const v = UPG[variant](); UA._upg = { v: v, variant: variant, src: src };
    UA.modal({ icon: 'gem', iconCls: 'gold', title: v.ttl, sub: v.txt, body: '<div class="ua-list">' + [['Additional Superadmins', 'crown'], ['Admins and Team-based administration', 'shield'], ['Teams and module enablement per Team', 'users'], ['Expanded Member capacity', 'user-plus']].map((x) => '<div class="ua-li" style="padding:7px 0"><span class="ua-ic gold">' + ic(x[1], 15) + '</span><div class="grow t">' + x[0] + '</div></div>').join('') + '</div><div class="ua-hint">' + esc(UA.plat().name) + ' → ' + esc(UA.plat().dest) + '.</div>',
      foot: btn(v.no, 'UA.closeModal()', 'btn-ghost-v') + btn(v.cta, 'UA.confirmUpgrade()', 'btn-premium') });
  };
  UA.confirmUpgrade = function () {
    const u = UA._upg, v = u.v, now = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    UA.audit('Upgrade intent captured', v.ev, 'Free', 'Premium (requested)');
    UA.modal({ icon: 'check-circle', iconCls: 'ok', title: 'Request received', sub: 'We’ve let <b>' + esc(UA.plat().ops) + '</b> know you’d like to upgrade. You’ll get a confirmation email — <b>your plan hasn’t changed yet</b>.', size: 'wide',
      body: '<div><div class="ua-sect">Upgrade Intent captured <span class="ua-proto">Backend record</span></div><table class="ua-tbl" style="background:#F8FAFC;border-radius:12px"><tbody>' + [['Organization', UA.db.org.name + ' · ' + UA.db.org.id], ['Platform', UA.plat().name], ['Current plan', 'Free'], ['Initiated by', UA.PERSONA.name + ' · ' + UA.roleLabel(S.role)], ['Trigger event', '<span class="ua-code">' + v.ev + '</span>'], ['Source screen', esc(u.src)], ['Timestamp', now], ['Routed to', esc(UA.plat().ops)], ['Destination', esc(UA.plat().dest)]].map((r) => '<tr><td style="width:150px;color:var(--text-2)">' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</tbody></table></div>' +
        '<div class="ua-sim"><span class="ua-proto">Prototype</span><span>Ops approves the upgrade →</span>' + btn('Simulate: switch org to Premium', "UA.closeModal();UA.setState({plan:'premium'});UA.toast('Organization upgraded to Premium','Teams, Admins and extra seats are now unlocked.')", 'btn-outline btn-sm') + '</div>',
      foot: btn('Done', 'UA.closeModal()', 'btn-default') });
  };

  /* ───────────── Requests: Upgrade to Use / Request to View / review ───────────── */
  UA.requestUse = function (i) {
    if (UA.db.requests.some((r) => r.pid === 'me' && r.mod === i && r.type === 'use' && r.status === 'pending')) return;
    const r = { id: UA.uid('r'), type: 'use', pid: 'me', mod: i, date: 'Today', status: 'pending' }; UA.db.requests.unshift(r); const ap = UA.approverOf(r);
    UA.audit('Request to Use submitted', UA.mod(i).name, UA.access(UA.me(), i).base === 'view' ? 'View' : 'No Access', 'Use (requested)');
    UA.toast('Request sent to ' + ap.label, 'Approving changes your permission only — never your role or Team.'); refresh(); if (UA._pvOpen) UA.renderPreview();
  };
  UA.review = function (rid) {
    const r = UA.db.requests.find((x) => x.id === rid), p = UA.person(r.pid), ap = UA.approverOf(r), cur = r.mod != null ? UA.access(p, r.mod) : null, open = r.status === 'pending';
    const facts = [['Requester', esc(p.name) + ' · ' + esc(p.email)], ['Request type', RT_L[r.type]], ['Platform / Team', esc(UA.plat().name) + ' · ' + (p.teams.length ? UA.teamsOf(p).map((t) => esc(t.name)).join(', ') : 'No Team')]];
    if (r.mod != null) { facts.push(['Module', UA.mod(r.mod).name]); facts.push([r.type === 'view' ? 'Restricted item' : 'Current permission', r.type === 'view' ? esc(r.item || UA.itemFor(r.mod)) : (cur.base === 'view' ? 'View' : cur.base === 'use' ? 'Use' : 'No Access')]); if (r.type === 'use') facts.push(['Requested', 'Use']); }
    if (r.type === 'invite') { facts.push(['Domain', '<span class="ub warn">Public domain</span>']); facts.push(['Applying to', 'Join ' + esc(UA.plat().name) + ' as Member']); }
    facts.push(['Requested on', r.date], ['Approver', esc(ap.label)]); if (r.reason) facts.push(['Reason', '“' + esc(r.reason) + '”']);
    UA.drawer({ lead: UA.av(p, 'lg'), title: RT_L[r.type], sub: esc(p.name) + ' · ' + r.date,
      body: '<dl class="ua-kv">' + facts.map((f) => '<dt>' + f[0] + '</dt><dd>' + f[1] + '</dd>').join('') + '</dl>' + (r.status !== 'pending' ? '<div class="ua-banner ' + (r.status === 'approved' ? 'ok' : 'err') + '"><span>' + ic(r.status === 'approved' ? 'check-circle' : 'x-circle', 16) + '</span><div class="grow">' + cap1(r.status) + ' — recorded in the audit history.</div></div>' : '') +
        '<div class="ua-banner neutral"><span>' + ic('shield', 16) + '</span><div class="grow ua-sm">' + (r.type === 'invite' ? 'Approving activates this person on ' + esc(UA.plat().name) + '. It doesn’t change any other platform.' : 'Approving changes <b>only ' + esc(p.name.split(' ')[0]) + '’s ' + (r.type === 'view' ? 'access to this one item' : 'Module Permission') + '</b>. Role, Team and Company are untouched.') + '</div></div>',
      foot: open ? btn('Reject', "UA.decide('" + rid + "','reject')", 'btn-danger-ghost') + (r.type !== 'invite' ? btn('Edit & Approve', "UA.editApprove('" + rid + "')", 'btn-outline') : '') + btn('Approve', "UA.decide('" + rid + "','approve')", 'btn-default', 'check') : '' });
  };
  const RT_L = { use: 'Request to Use', view: 'Request to View', invite: 'Invitation approval' };
  UA.editApprove = function (rid) {
    const r = UA.db.requests.find((x) => x.id === rid);
    UA.modal({ icon: 'pencil', title: 'Edit & Approve', sub: 'Modify the requested access before approving.', body: r.type === 'use' ? '<div class="ua-field"><label>Grant</label><select id="ea-v" class="ua-select" style="width:100%"><option value="use">Use (as requested)</option><option value="view">Keep View</option></select></div>' : '<div class="ua-field"><label>Unlock</label><select id="ea-v" class="ua-select" style="width:100%"><option value="item">This item only (default)</option><option value="module">Whole module history</option></select><div class="h">Approval applies to the specific item unless a broader permission is explicitly granted.</div></div>',
      foot: btn('Cancel', 'UA.closeModal()', 'btn-ghost-v') + btn('Approve', "UA.decide('" + rid + "','approve',document.getElementById('ea-v').value)", 'btn-default') });
  };
  UA.decide = function (rid, act, opt) {
    const r = UA.db.requests.find((x) => x.id === rid), p = UA.person(r.pid), ok = act === 'approve'; r.status = ok ? 'approved' : 'rejected';
    if (r.type === 'use' && ok) { const lv = opt || 'use'; UA.setPerm(p, r.mod, lv); UA.audit('Request to Use approved', p.name + ' → ' + UA.mod(r.mod).name, 'View', cap1(lv)); }
    else if (r.type === 'view' && ok) { UA.db.unlocked[r.itemKey || (p.id + ':' + r.mod)] = true; if (opt === 'module') UA.db.unlocked['*' + p.id + ':' + r.mod] = true; UA.audit('Request to View approved', p.name + ' → ' + UA.mod(r.mod).name, 'Restricted', opt === 'module' ? 'Module history unlocked' : 'Item unlocked'); }
    else if (r.type === 'invite') { const inv = UA.db.invites.find((i) => i.pid === p.id); if (ok) { p.status = 'active'; p.joined = 'Today'; if (inv) inv.status = 'approved'; if (p.role === 'admin' && p.teams[0]) UA.team(p.teams[0]).admins.push(p.id); } else { p.status = 'rejected'; if (inv) inv.status = 'rejected'; } UA.audit(ok ? 'Invitation approved' : 'Approval denied', p.email, 'Waiting for Approval', ok ? 'Active' : 'Rejected'); }
    else UA.audit('Request rejected', p.name + ' → ' + (r.mod != null ? UA.mod(r.mod).name : ''), 'Pending', 'Rejected');
    UA.closeModal(); UA.closeDrawer(); UA.toast((ok ? 'Approved' : 'Rejected') + ' · ' + p.name + ' notified', 'Recorded in the audit history.'); refresh(); if (UA._pvOpen) UA.renderPreview();
  };

  /* ───────────── Superadmin ownership transfer ───────────── */
  UA.openTransfer = function () {
    const el = UA.people().filter((p) => p.id !== 'me' && p.status === 'active' && p.role !== 'superadmin');
    UA.modal({ icon: 'swap', title: 'Request ownership transfer', sub: 'Transfer Superadmin of <b>' + esc(UA.plat().name) + '</b> to another eligible person. This is per platform.',
      body: el.length ? '<div class="ua-field"><label>Transfer to *</label><select id="tr-to" class="ua-select" style="width:100%">' + el.map((p) => '<option value="' + p.id + '">' + esc(p.name) + ' · ' + UA.roleLabel(p.role) + '</option>').join('') + '</select></div><div class="ua-field"><label>Reason (optional)</label><textarea id="tr-why" class="ua-input" rows="2" placeholder="Helps the Scinode reviewer"></textarea></div>' +
        '<label class="ua-radio" style="align-items:center"><input type="checkbox" id="tr-ok"><div class="s" style="margin:0">I understand this is a <b>request</b>: it takes effect only after Scinode approves it, and I stay Superadmin until then.</div></label>' : '<div class="ua-banner neutral"><span>' + ic('info', 16) + '</span><div>There’s no eligible active person to transfer to yet. Add someone first.</div></div>',
      foot: btn('Cancel', 'UA.closeModal()', 'btn-ghost-v') + (el.length ? btn('Submit for review', 'UA.submitTransfer()', 'btn-default') : '') });
  };
  UA.submitTransfer = function () {
    if (!document.getElementById('tr-ok').checked) return UA.toast('Please confirm you understand the transfer is a request.');
    const to = document.getElementById('tr-to').value; UA.db.transfer = { to: to, at: 'just now', why: document.getElementById('tr-why').value };
    UA.audit('Superadmin transfer requested', UA.person(to).name, 'Priya Sharma', UA.person(to).name + ' (pending Nucleus approval)'); UA.closeModal(); UA.toast('Transfer submitted to Scinode for review', 'Nothing changes until it’s approved.'); refresh();
  };
  UA.cancelTransfer = function () { UA.db.transfer = null; UA.audit('Superadmin transfer cancelled', '', 'Pending', 'Cancelled'); UA.toast('Transfer request cancelled'); refresh(); };
  UA.simTransfer = function (ok) {
    const t = UA.db.transfer, to = UA.person(t.to);
    UA.audit(ok ? 'Superadmin transfer approved (Nucleus)' : 'Superadmin transfer rejected (Nucleus)', to.name, 'Priya Sharma', ok ? to.name : 'Priya Sharma (unchanged)');
    if (!ok) { UA.db.transfer = null; UA.toast('Transfer rejected by Scinode', 'You remain Superadmin. Reason logged.'); return refresh(); }
    UA.modal({ icon: 'check-circle', iconCls: 'ok', title: 'Transfer approved', sub: '<b>' + esc(to.name) + '</b> is now Superadmin of ' + esc(UA.plat().name) + '. The audit trail records previous owner, new owner, approver and timestamp.', body: '<div class="ua-banner neutral"><span>' + ic('info', 16) + '</span><div class="ua-sm">The docs don’t say what role the outgoing Superadmin keeps. This prototype assumes <b>Member</b> (see Open Questions in the Blueprint). Data is reset so the demo stays consistent.</div></div>',
      foot: btn('OK', "UA.closeModal();delete UA.cache[S.plan+'|'+S.day+'|'+S.platform];UA.load();UA.render()", 'btn-default') });
  };

  /* ───────────── My access / Audit drawers ───────────── */
  UA.openMyAccess = function () { UA.drawer({ lead: '<span class="ua-ic lg navy">' + ic('key', 20) + '</span>', title: 'My access', sub: 'Effective = Team enabled ∧ your permission', body: '<div>' + UA.accessRows(true) + '</div><div class="ua-hint">Members with View can request Use; approval changes a permission, never a role.</div>' }); };
  UA.openAudit = function () { UA.drawer({ lead: '<span class="ua-ic lg gray">' + ic('history', 20) + '</span>', title: 'Audit history', sub: 'Append-only · every request, approval, denial, invitation and permission change', body: UA.auditList(60) }); };

  /* ───────────── In-module preview: My Activity / Org Activity / Request to View / Upgrade to Use ───────────── */
  UA.pv = { mod: 0, view: 'org' };
  UA.openModulePreview = function () {
    const ids = UA.modIds(); const i = ids.indexOf('market_pulse'); UA.pv = { mod: i > -1 ? i : 0, view: UA.isMem() ? 'aware' : 'org' }; UA._pvOpen = true;
    UA.modal({ icon: 'activity', title: 'In-module preview', sub: 'How <b>Org Activity</b> and <b>Upgrade to Use</b> appear inside any activity-generating module. Requests raised here land in Access &amp; Approvals.', size: 'xl', body: '<div id="pv-body"></div>', noFocus: true, foot: btn('Close preview', "UA._pvOpen=false;UA.closeModal()", 'btn-ghost-v') });
    UA.renderPreview();
  };
  UA.renderPreview = function () {
    const el = document.getElementById('pv-body'); if (!el) return; const i = UA.pv.mod, m = UA.mod(i), me = UA.me(), a = UA.access(me, i), mem = UA.isMem();
    const sel = '<select class="ua-select" onchange="UA.pv.mod=+this.value;UA.renderPreview()">' + UA.modIds().map((id, k) => '<option value="' + k + '"' + (k === i ? ' selected' : '') + '>' + UA.mod(k).name + '</option>').join('') + '</select>';
    const pill = UA.isSA() ? '<span class="ub navy">Superadmin · Use on every module</span>' : a.teamOff ? '<span class="ub gray">Not enabled for your Team</span>' : '<span class="ub ' + (a.lvl === 'use' ? 'teal' : a.lvl === 'view' ? 'navy' : 'gray') + '">Your access: ' + (a.lvl === 'use' ? 'Use' : a.lvl === 'view' ? 'View' : 'No Access') + '</span>';
    const upg = a.lvl === 'view' && !UA.isSA() ? (UA.db.requests.some((r) => r.pid === 'me' && r.mod === i && r.type === 'use' && r.status === 'pending') ? '<span class="ub warn dot">Upgrade request pending</span>' : btn('Upgrade to Use', 'UA.requestUse(' + i + ')', 'btn-outline btn-sm', 'arrow')) : '';
    const head = '<div class="ua-row wrap between"><div class="ua-row"><span class="ua-ic lg">' + ic(m.icon, 20) + '</span><div><div class="ua-h" style="font-size:18px">' + m.name + '</div><div class="ua-hint">' + esc(UA.db.org.name) + ' · ' + esc(UA.plat().name) + '</div></div></div><div class="ua-row wrap">' + sel + pill + upg + '</div></div>';
    let body = '';
    const adminOff = UA.isAdm() && a.teamOff;
    if (adminOff) body = '<div class="ua-card" style="box-shadow:none;background:#F8FAFC">' + UA.emptyState('lock', 'Not enabled for your Team', 'Admins only see My Activity and Org Activity for modules enabled to their Team(s).', '', 'gray') + '</div>';
    else if (S.day === 0) body = UA.emptyState('activity', 'No activity yet', 'Once your organization starts using this module, activity will appear here.');
    else {
      const ppl = UA.people().filter((p) => p.status === 'active' && p.id !== 'me' && p.role !== 'superadmin').concat(UA.people().filter((p) => p.role === 'superadmin' && p.id !== 'me'));
      const times = ['19 Sep 2026, 9:42 AM', '18 Sep 2026, 6:20 PM', '18 Sep 2026, 2:15 PM', '17 Sep 2026, 11:03 AM', '16 Sep 2026, 4:48 PM', '15 Sep 2026, 10:30 AM'];
      let rows = ppl.slice(0, 6).map((p, k) => ({ k: k, p: p, t: times[k], restricted: k % 2 === 0 }));
      if (UA.pv.view === 'my') rows = [{ k: 90, p: me, t: '19 Sep 2026, 8:05 AM', restricted: false }, { k: 91, p: me, t: '17 Sep 2026, 3:12 PM', restricted: false }];
      const tabs = !mem ? '<div class="ua-seg" style="align-self:flex-start"><button type="button" class="' + (UA.pv.view === 'my' ? 'on' : '') + '" onclick="UA.pv.view=\'my\';UA.renderPreview()">My Activity</button><button type="button" class="' + (UA.pv.view === 'org' ? 'on' : '') + '" onclick="UA.pv.view=\'org\';UA.renderPreview()">Org Activity</button></div>' : '';
      const note = mem ? '<div class="ua-banner info"><span>' + ic('eye', 16) + '</span><div class="grow">You can see that activity happened — who did what and when. Restricted items open only after a <b>Request to View</b> is approved by ' + (me.teams.length ? 'your Team Admin' : 'the Superadmin') + '. Members never get a separate Org Activity view.</div></div>' : UA.isAdm() ? '<div class="ua-banner neutral"><span>' + ic('shield', 16) + '</span><div class="grow ua-sm">Org Activity is limited to modules enabled for your Team(s).</div></div>' : '<div class="ua-banner neutral"><span>' + ic('crown', 16) + '</span><div class="grow ua-sm">Org Activity is organization-wide — who raised what, by email, across every module.</div></div>';
      const act = (r) => {
        const key = i + ':' + r.k, unl = UA.db.unlocked[key] || UA.db.unlocked['*me:' + i], pend = UA.db.requests.some((x) => x.itemKey === key && x.status === 'pending');
        if (!mem || r.k >= 90 || !r.restricted || unl) return btn(mem || UA.pv.view !== 'my' ? (unl ? 'View' : 'Open') : 'Open', "UA.toast('Opens the underlying " + esc(UA.itemFor(i)) + "')", 'btn-ghost-v btn-sm');
        return pend ? '<span class="ub warn dot">Request pending</span>' : btn('Request to View', "UA.requestView(" + i + "," + r.k + ")", 'btn-outline btn-sm');
      };
      body = tabs + note + '<div class="ua-tbl-wrap" style="box-shadow:none;background:#fff"><div class="ua-act h"><span>User</span><span>Activity</span><span>Item</span><span>Date &amp; time</span><span>Action</span></div>' +
        rows.map((r) => '<div class="ua-act"><span class="ua-person">' + UA.av(r.p, 'sm') + '<span class="nm">' + esc(r.p.name) + '</span></span><span>' + UA.actFor(i) + '</span><span>' + esc(UA.itemFor(i)) + '</span><span class="ua-muted">' + r.t + '</span><span>' + act(r) + '</span></div>').join('') + '</div>';
    }
    el.innerHTML = '<div style="display:flex;flex-direction:column;gap:14px">' + head + body + '</div>';
  };
  UA.requestView = function (i, k) {
    const key = i + ':' + k; const r = { id: UA.uid('r'), type: 'view', pid: 'me', mod: i, item: UA.itemFor(i) + ' (activity #' + (k + 1) + ')', itemKey: key, date: 'Today', status: 'pending', reason: '' }; UA.db.requests.unshift(r); const ap = UA.approverOf(r);
    UA.audit('Request to View submitted', UA.mod(i).name + ' · ' + r.item, 'Restricted', 'Requested'); UA.toast('Request to View sent to ' + ap.label, 'It also appears in Access & Approvals.'); UA.renderPreview(); refresh();
  };
})();
