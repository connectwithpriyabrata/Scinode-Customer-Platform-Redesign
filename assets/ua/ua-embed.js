/* Users & Access — Org Activity / Upgrade to Use, embedded directly in a real module page
   (Market Pulse, Requests, Projects — see Design Spec §6/§6.1/§6.2, "every applicable module" rule).
   Self-contained: depends ONLY on ua-core.js (seeds, state, UA.access/UA.audit/UA.toast/UA.person$ …),
   never ua-views.js/ua-flows.js — those render the full Users & Access shell and assume DOM/elements
   (#ua-root, the presenter bar, …) that a standalone module page doesn't have. Scoped to the Scinode
   platform, since that's the platform these module pages belong to. */
(function () {
  'use strict';
  const UA = window.UA; if (!UA) return;
  const ic = UA.ic, esc = UA.esc, S = UA.state;

  S.platform = 'scinode';
  UA.load(); /* seeds 'scinode' with its own default Plan/Stage (Premium/Day 1) if nothing's touched it yet */

  const EMB = (window.UAEmbed = {});
  let MOD = 0, VIEW = 'org';

  function head(title) {
    const sw = '<div class="ua-row" style="gap:8px"><span class="ua-xs ua-muted">View as</span><div class="ua-seg">' +
      ['superadmin', 'admin', 'member'].map((r) => '<button type="button" class="' + (S.role === r ? 'on use' : '') + '" onclick="UAEmbed.setRole(\'' + r + '\')">' + UA.roleLabel(r) + '</button>').join('') + '</div></div>';
    return '<div class="ua-row wrap between"><div><div class="ua-h">Org Activity</div><div class="ua-hint">' + esc(title) + ' · ' + esc(UA.db.org.name) + ' · part of <a class="ua-link" href="users-access.html">Users &amp; Access</a></div></div>' + sw + '</div>';
  }

  function body(i) {
    const m = UA.mod(i), me = UA.me(), a = UA.access(me, i), mem = UA.isMem(), adm = UA.isAdm();
    const pill = UA.isSA() ? '<span class="ub navy">Superadmin · Use on every module</span>' : a.teamOff ? '<span class="ub gray">Not enabled for your Team</span>' : '<span class="ub ' + (a.lvl === 'use' ? 'teal' : a.lvl === 'view' ? 'navy' : 'gray') + '">Your access: ' + (a.lvl === 'use' ? 'Use' : a.lvl === 'view' ? 'View' : 'No Access') + '</span>';
    const pendingUse = UA.db.requests.some((r) => r.pid === 'me' && r.mod === i && r.type === 'use' && r.status === 'pending');
    const upg = a.lvl === 'view' && !UA.isSA() ? (pendingUse ? '<span class="ub warn dot">Upgrade request pending</span>' : '<button type="button" class="btn btn-outline btn-sm" onclick="UAEmbed.upgradeToUse()">' + ic('arrow', 14) + 'Upgrade to Use</button>') : '';
    const statusRow = '<div class="ua-row wrap" style="gap:8px;margin-top:10px">' + pill + upg + '</div>';

    const adminOff = adm && a.teamOff;
    if (adminOff) return statusRow + '<div style="margin-top:14px">' + UA.emptyState('lock', 'Not enabled for your Team', 'Admins only see My Activity and Org Activity for modules enabled to their Team(s).', '', 'gray') + '</div>';

    const ppl = UA.people().filter((p) => p.status === 'active' && p.id !== 'me' && p.role !== 'superadmin').concat(UA.people().filter((p) => p.role === 'superadmin' && p.id !== 'me'));
    const times = ['19 Sep 2026, 9:42 AM', '18 Sep 2026, 6:20 PM', '18 Sep 2026, 2:15 PM', '17 Sep 2026, 11:03 AM', '16 Sep 2026, 4:48 PM'];
    let rows = ppl.slice(0, 5).map((p, k) => ({ k: k, p: p, t: times[k], restricted: k % 2 === 0 }));
    if (VIEW === 'my') rows = [{ k: 90, p: me, t: '19 Sep 2026, 8:05 AM', restricted: false }, { k: 91, p: me, t: '17 Sep 2026, 3:12 PM', restricted: false }];

    const tabs = !mem ? '<div class="ua-seg" style="align-self:flex-start">' +
      '<button type="button" class="' + (VIEW === 'my' ? 'on' : '') + '" onclick="UAEmbed.setView(\'my\')">My Activity</button>' +
      '<button type="button" class="' + (VIEW === 'org' ? 'on' : '') + '" onclick="UAEmbed.setView(\'org\')">Org Activity</button></div>' : '';
    const note = mem
      ? '<div class="ua-banner info"><span>' + ic('eye', 16) + '</span><div class="grow">You can see that activity happened — who did what and when. Restricted items open only after a <b>Request to View</b> is approved by ' + (me.teams.length ? 'your Team Admin' : 'the Superadmin') + '. Members never get a separate Org Activity view.</div></div>'
      : adm ? '<div class="ua-banner neutral"><span>' + ic('shield', 16) + '</span><div class="grow ua-sm">Org Activity is limited to modules enabled for your Team(s).</div></div>'
        : '<div class="ua-banner neutral"><span>' + ic('crown', 16) + '</span><div class="grow ua-sm">Org Activity is organization-wide — who raised what, by email, across every module.</div></div>';

    const act = (r) => {
      const key = i + ':' + r.k, unl = UA.db.unlocked[key] || UA.db.unlocked['*me:' + i], pend = UA.db.requests.some((x) => x.itemKey === key && x.status === 'pending');
      if (!mem || r.k >= 90 || !r.restricted || unl) return '<button type="button" class="btn btn-ghost-v btn-sm" onclick="UA.toast(\'Opens the underlying ' + esc(UA.itemFor(i)) + '\')">' + (unl ? 'View' : 'Open') + '</button>';
      return pend ? '<span class="ub warn dot">Request pending</span>' : '<button type="button" class="btn btn-outline btn-sm" onclick="UAEmbed.requestView(' + r.k + ')">Request to View</button>';
    };
    const table = '<div class="ua-tbl-wrap" style="box-shadow:none"><div class="ua-act h"><span>User</span><span>Activity</span><span>Item</span><span>Date &amp; time</span><span>Action</span></div>' +
      rows.map((r) => '<div class="ua-act"><span class="ua-person">' + UA.av(r.p, 'sm') + '<span class="nm">' + esc(r.p.name) + '</span></span><span>' + UA.actFor(i) + '</span><span>' + esc(UA.itemFor(i)) + '</span><span class="ua-muted">' + r.t + '</span><span>' + act(r) + '</span></div>').join('') + '</div>';
    return statusRow + '<div style="margin-top:14px;display:flex;flex-direction:column;gap:14px">' + tabs + note + table + '</div>';
  }

  EMB.render = function () {
    const el = document.getElementById(EMB.mountId); if (!el) return;
    MOD = UA.PLATFORMS.scinode.mods.indexOf(EMB.moduleKey);
    el.innerHTML = '<div class="ua-card">' + head(EMB.title) + body(MOD) + '</div>';
  };
  EMB.setRole = function (r) { S.role = r; UA.applyViewer(); EMB.render(); };
  EMB.setView = function (v) { VIEW = v; EMB.render(); };
  EMB.requestView = function (k) {
    const key = MOD + ':' + k;
    const r = { id: UA.uid('r'), type: 'view', pid: 'me', mod: MOD, item: UA.itemFor(MOD) + ' (activity #' + (k + 1) + ')', itemKey: key, date: 'Today', status: 'pending', reason: '' };
    UA.db.requests.unshift(r);
    const ap = UA.approverOf(r);
    UA.audit('Request to View submitted', UA.mod(MOD).name + ' · ' + r.item, 'Restricted', 'Requested');
    UA.toast('Request to View sent to ' + ap.label, 'It would land in Users & Access → Access & Approvals.');
    EMB.render();
  };
  EMB.upgradeToUse = function () {
    if (UA.db.requests.some((r) => r.pid === 'me' && r.mod === MOD && r.type === 'use' && r.status === 'pending')) return;
    const r = { id: UA.uid('r'), type: 'use', pid: 'me', mod: MOD, date: 'Today', status: 'pending' };
    UA.db.requests.unshift(r);
    const ap = UA.approverOf(r);
    UA.audit('Request to Use submitted', UA.mod(MOD).name, UA.access(UA.me(), MOD).base === 'view' ? 'View' : 'No Access', 'Use (requested)');
    UA.toast('Request sent to ' + ap.label, 'Approving changes your permission only — never your role or Team.');
    EMB.render();
  };
  /* mount(mountId, moduleKey, title) — moduleKey is one of UA.PLATFORMS.scinode.mods, e.g. 'market_pulse' */
  EMB.mount = function (mountId, moduleKey, title) {
    EMB.mountId = mountId; EMB.moduleKey = moduleKey; EMB.title = title;
    EMB.render();
  };
})();
