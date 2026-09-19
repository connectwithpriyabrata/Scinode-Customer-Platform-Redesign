/* Users & Access — bootstrap + presenter (demo) bar. Supports deep links: ?role=&plan=&day=&platform=&tab= */
(function () {
  'use strict';
  const UA = window.UA, S = UA.state, ic = UA.ic;
  const SCEN = [
    ['Free · Superadmin · Day 0 — set up', { role: 'superadmin', plan: 'free', day: 0, tab: 'organization' }],
    ['Free · Superadmin · Day 1 — seat limit reached', { role: 'superadmin', plan: 'free', day: 1, tab: 'members' }],
    ['Free · Member · Day 1 — Teams gated', { role: 'member', plan: 'free', day: 1, tab: 'teams' }],
    ['Premium · Superadmin · Day 0 — create first Team', { role: 'superadmin', plan: 'premium', day: 0, tab: 'teams' }],
    ['Premium · Superadmin · Day 1 — full administration', { role: 'superadmin', plan: 'premium', day: 1, tab: 'approvals' }],
    ['Premium · Admin (R&D) · Day 1 — scoped', { role: 'admin', plan: 'premium', day: 1, tab: 'members' }],
    ['Premium · Member · Day 1 — View → Upgrade to Use', { role: 'member', plan: 'premium', day: 1, tab: 'organization' }]
  ];
  UA.scenario = function (i) { if (i === '') return; UA.setState(SCEN[+i][1]); };
  UA.setDemo = function (k, v) { const p = {}; p[k] = v; if (k === 'platform' || k === 'plan' || k === 'day' || k === 'role') p.tab = S.tab; UA.setState(p); };

  function demoHtml() {
    const sg = (k, opts) => '<div class="sg" data-k="' + k + '">' + opts.map((o) => '<button type="button" data-v="' + o[0] + '" onclick="UA.setDemo(\'' + k + '\',' + (typeof o[0] === 'number' ? o[0] : "'" + o[0] + "'") + ')">' + o[1] + '</button>').join('') + '</div>';
    return '<div class="ua-demo-in"><div class="grp"><span class="gl">View as</span>' + sg('role', [['superadmin', 'Superadmin'], ['admin', 'Admin'], ['member', 'Member']]) + '</div><span class="dv"></span>' +
      '<div class="grp"><span class="gl">Plan</span>' + sg('plan', [['free', 'Free'], ['premium', 'Premium']]) + '</div><span class="dv"></span>' +
      '<div class="grp"><span class="gl">Stage</span>' + sg('day', [[0, 'Day 0'], [1, 'Day 1']]) + '</div><span class="dv"></span>' +
      '<div class="grp"><span class="gl">Platform</span><select onchange="UA.setDemo(\'platform\',this.value)" id="ua-plat-sel">' + Object.keys(UA.PLATFORMS).map((k) => '<option value="' + k + '">' + UA.PLATFORMS[k].name + '</option>').join('') + '</select></div><span class="dv"></span>' +
      '<div class="grp"><select onchange="UA.scenario(this.value);this.value=\'\'"><option value="">Jump to scenario…</option>' + SCEN.map((s, i) => '<option value="' + i + '">' + s[0] + '</option>').join('') + '</select>' +
      '<button type="button" class="lk" onclick="UA.openModulePreview()">' + ic('activity', 14) + 'In-module preview</button><a class="lk" href="access-blueprint.html">' + ic('layers', 14) + 'Blueprint</a><button type="button" class="lk" onclick="UA.resetData();UA.render();UA.toast(\'Demo data reset\')" title="Reset demo data">' + ic('refresh', 14) + 'Reset</button></div>' +
      '<button type="button" class="ua-demo-collapse" onclick="document.getElementById(\'ua-demo\').classList.add(\'min\')" aria-label="Collapse presenter bar">' + ic('chevd', 14) + '</button></div>' +
      '<button type="button" class="ua-demo-mini" onclick="document.getElementById(\'ua-demo\').classList.remove(\'min\')">' + ic('play', 12) + 'Presenter controls</button>';
  }
  UA.syncDemo = function () {
    const d = document.getElementById('ua-demo'); if (!d) return;
    d.querySelectorAll('.sg').forEach((g) => { const k = g.getAttribute('data-k'); g.querySelectorAll('button').forEach((b) => b.classList.toggle('on', String(S[k]) === b.getAttribute('data-v'))); });
    const ps = document.getElementById('ua-plat-sel'); if (ps) ps.value = S.platform;
  };

  function init() {
    const q = new URLSearchParams(location.search);
    ['role', 'plan', 'platform', 'tab'].forEach((k) => { if (q.get(k)) S[k] = q.get(k); });
    if (q.get('day') != null && q.get('day') !== '') S.day = +q.get('day');
    UA.load(); UA.render();
    const d = document.createElement('div'); d.className = 'ua-demo'; d.id = 'ua-demo'; d.innerHTML = demoHtml(); document.body.appendChild(d); UA.syncDemo();
    document.querySelector('.main') && new MutationObserver(() => d.classList.toggle('sbc', document.querySelector('.main').classList.contains('sb-collapsed'))).observe(document.querySelector('.main'), { attributes: true, attributeFilter: ['class'] });
    if (q.get('open') === 'preview') UA.openModulePreview();
    if (q.get('open') === 'upgrade') UA.upgrade('team', 'Deep link');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
