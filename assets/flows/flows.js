/* ══════════════════════════════════════════════════════════════════════
   SCENARIO FLOWS — shared engine for auth-flows.html + invite-flows.html
   Source: "Scinode Sign Up: Flow and Design States" (7 states).

   Each page registers an adapter:
     Flows.init({
       page:   'auth' | 'invite',
       apply:  function (ctx) {}   // set page state for scenario/platform/domain
       go:     function (key, ctx) {}  // render the screen for a step key
       detect: function () {}      // -> step key currently on screen (or null)
       source: function () {}      // -> 'direct' | 'google' | 'linkedin'
     });
   and calls Flows.sync() whenever its own screens change (wrapped
   functions), so the tracker follows in-screen clicks too.

   Step keys: invite, signup, signin, verify, step2, pending, dashboard,
              approved, rejected. A step may be { branch: [...] } — the
              admin-review fork into approved / rejected.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  var PAGES = { auth: 'auth-flows.html', invite: 'invite-flows.html' };

  var PLATFORMS = [
    { key: 'customers', label: 'Scinode' },
    { key: 'atoms', label: 'ATOMS' },
    { key: 'ions', label: 'IONS' },
    { key: 'deepresearch', label: 'Deep Research' }
  ];

  function S(key, label, sub) { return { key: key, label: label, sub: sub || '' }; }
  var REVIEW = { branch: [S('approved', 'Approved', 'Screen 5 · Sign In'), S('rejected', 'Rejected', 'Support contact')] };

  var SCENARIOS = [
    {
      id: '1', page: 'auth', short: 'First-time user',
      title: 'First-time user',
      who: 'First person from a new org / domain, on any platform.',
      approval: 'Admin approval: always',
      domains: [{ key: 'new', label: 'New work domain' }, { key: 'public', label: 'Public (Gmail)' }],
      steps: function (c) {
        var s2 = c.platform === 'deepresearch' ? 'Name, Phone only' : 'Company, Name, Phone + platform';
        return [S('signup', 'Sign Up', 'Email, Password, Google SSO'), S('verify', 'Verify email'), S('step2', 'Step 2', s2), S('pending', 'Pending', 'GIF + explore cards'), REVIEW];
      }
    },
    {
      id: '2', page: 'auth', short: 'Recurring · same platform',
      title: 'Recurring user · same platform',
      who: 'New person signing up organically; their org is already on this platform.',
      approval: 'Verified domain: no approval · Public domain: approval',
      domains: [{ key: 'verified', label: 'Verified' }, { key: 'public', label: 'Public (Gmail)' }],
      steps: function (c) {
        var head = [S('signup', 'Sign Up', 'Email, Password, Google SSO'), S('verify', 'Verify email'), S('step2', 'Step 2', 'Name, Phone (+ Website if empty)')];
        return c.domain === 'verified'
          ? head.concat([S('approved', 'Sign In', 'Screen 5 · no approval')])
          : head.concat([S('pending', 'Pending', 'Public domain'), REVIEW]);
      }
    },
    {
      id: '3', page: 'auth', short: 'Cross-platform · same user',
      title: 'Recurring cross-platform · Case 1 (same user)',
      who: 'Existing user with an account on another platform opens this one. System finds no access → Sign In, not Sign Up.',
      approval: 'Approval: yes (org’s first entry to ATOMS / IONS / Deep Research)',
      note: function (c) {
        if (c.platform === 'customers') return 'Assumption (doc §8): verified cross-platform into Scinode needs no approval.';
        if (c.platform === 'deepresearch') return 'Deep Research has no Step 2 here: straight to Pending.';
        return '';
      },
      steps: function (c) {
        var out = [S('signin', 'Sign In', 'Existing account, no access yet')];
        if (c.platform !== 'deepresearch') out.push(S('step2', 'Step 2', 'Platform fields only'));
        return c.platform === 'customers'
          ? out.concat([S('dashboard0', 'Scinode Dashboard', 'Day 0 · demo only')])
          : out.concat([S('pending', 'Pending'), REVIEW]);
      }
    },
    {
      id: '4', page: 'auth', short: 'Cross-platform · new user',
      title: 'Recurring cross-platform · Case 2 (new verified user)',
      who: 'New person from a verified org; it’s the org’s first time on this platform.',
      approval: 'Approval: yes (org’s first entry to ATOMS / IONS / Deep Research)',
      note: function (c) {
        return c.platform === 'customers' ? 'Assumption (doc §8): verified cross-platform into Scinode needs no approval.' : '';
      },
      steps: function (c) {
        var head = [S('signup', 'Sign Up', 'Email, Password, Google SSO'), S('verify', 'Verify email'), S('step2', 'Step 2', 'Name, Phone, T&C + platform')];
        return c.platform === 'customers'
          ? head.concat([S('dashboard0', 'Scinode Dashboard', 'Day 0 · demo only')])
          : head.concat([S('pending', 'Pending'), REVIEW]);
      }
    },
    {
      id: '5', page: 'auth', short: 'Rejected',
      title: 'Rejected',
      who: 'Admin rejects the org for a platform. Any approval path above can end here.',
      approval: 'Shows support contact + platforms the user is not rejected for',
      steps: function () { return [S('pending', 'Pending', 'Awaiting admin'), S('rejected', 'Rejected', 'Support contact + other platforms')]; }
    },
    {
      id: '6', page: 'invite', short: 'Invitation · same platform',
      title: 'Invitation · same platform',
      who: 'Invited person; their org is already on this platform.',
      approval: 'Verified domain: no approval · Public domain: approval',
      domains: [{ key: 'verified', label: 'Verified' }, { key: 'public', label: 'Public (Gmail)' }],
      steps: function (c) {
        var head = [S('invite', 'Invitation', 'Platform Invitation pill'), S('signup', 'Sign Up', 'No email verification'), S('step2', 'Step 2', 'Username, Phone')];
        return c.domain === 'verified'
          ? head.concat([S('dashboard0', 'Scinode Dashboard', 'Direct entry · Day 0 demo')])
          : head.concat([S('pending', 'Pending', 'Public domain'), REVIEW]);
      }
    },
    {
      id: '7', page: 'invite', short: 'Invitation · cross-platform',
      title: 'Invitation · cross-platform (Scinode → IONS / ATOMS / Deep Research)',
      who: 'Invited person; their org is new to this platform.',
      approval: 'Verified: domain’s first entry only · Public: always',
      platforms: ['atoms', 'ions', 'deepresearch'],
      domains: [
        { key: 'first', label: 'Verified · 1st entry' },
        { key: 'verified', label: 'Verified · entered before' },
        { key: 'public', label: 'Public (Gmail)' }
      ],
      note: function () { return 'Assumption (doc §8): invitation approval is tracked per domain + platform, not per user.'; },
      steps: function (c) {
        var head = [S('invite', 'Invitation', 'Platform Invitation pill'), S('signup', 'Sign Up', 'No email verification'), S('step2', 'Step 2', 'Username, Phone')];
        return c.domain === 'verified'
          ? head.concat([S('dashboard0', 'Scinode Dashboard', 'Direct entry · Day 0 demo')])
          : head.concat([S('pending', 'Pending', c.domain === 'public' ? 'Public domain' : 'Domain’s 1st entry'), REVIEW]);
      }
    }
  ];

  function byId(id) { for (var i = 0; i < SCENARIOS.length; i++) if (SCENARIOS[i].id === id) return SCENARIOS[i]; return null; }

  // Flatten steps: branch entries expand to their options (all share the same
  // position in the journey), so index lookups and Back/Next work on one list.
  function flat(steps) {
    var out = [];
    steps.forEach(function (st, i) {
      if (st.branch) st.branch.forEach(function (b) { out.push({ key: b.key, pos: i, branch: true }); });
      else out.push({ key: st.key, pos: i });
    });
    return out;
  }

  var A = null;          // page adapter
  var ctx = null;        // { scenario, platform, domain }
  var current = null;    // step key on screen (null = off-script)
  var syncTimer = null;

  function scen() { return byId(ctx.scenario); }
  function steps() { return scen().steps(ctx); }
  function platformsFor(sc) { return sc.platforms || PLATFORMS.map(function (p) { return p.key; }); }

  function normalize() {
    var sc = scen();
    var allowed = platformsFor(sc);
    if (allowed.indexOf(ctx.platform) < 0) ctx.platform = allowed[0];
    if (sc.domains) {
      var keys = sc.domains.map(function (d) { return d.key; });
      if (keys.indexOf(ctx.domain) < 0) ctx.domain = keys[0];
    } else {
      ctx.domain = null;
    }
  }

  function writeUrl() {
    var q = '?s=' + ctx.scenario + '&p=' + ctx.platform + (ctx.domain ? '&d=' + ctx.domain : '') + (current ? '&step=' + current : '');
    try { history.replaceState(null, '', q); } catch (e) {}
  }

  // ── Public API ────────────────────────────────────────────────────────
  function start(stepKey) {
    normalize();
    A.apply(ctx);
    var list = steps();
    var target = stepKey && flat(list).some(function (f) { return f.key === stepKey; }) ? stepKey : (list[0].key || list[0].branch[0].key);
    go(target);
  }

  function go(key) {
    A.go(key, ctx);
    current = key;
    render();
  }

  function sync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      var k = A.detect();
      var keys = flat(steps()).map(function (f) { return f.key; });
      // Signing in from the approval email lands in the workspace — still the
      // "Approved" end of the journey.
      if (k === 'dashboard' && keys.indexOf(k) < 0 && keys.indexOf('approved') >= 0) k = 'approved';
      current = keys.indexOf(k) >= 0 ? k : null;
      render();
    }, 0);
  }

  function step(delta) {
    var f = flat(steps());
    var idx = -1;
    for (var i = 0; i < f.length; i++) if (f[i].key === current) { idx = i; break; }
    if (idx < 0) { go(f[0].key); return; }
    var pos = f[idx].pos + delta;
    // Moving forward into the fork picks its first option (Approved); moving
    // back out of it goes to the step before the fork.
    for (var j = 0; j < f.length; j++) if (f[j].pos === pos) { go(f[j].key); return; }
  }

  function setScenario(id) {
    var sc = byId(id);
    if (!sc) return;
    if (sc.page !== A.page) {
      location.href = PAGES[sc.page] + '?s=' + id + '&p=' + ctx.platform;
      return;
    }
    ctx.scenario = id;
    ctx.domain = null;
    start();
  }
  function setPlatform(p) { ctx.platform = p; start(); }
  function setDomain(d) { ctx.domain = d; start(); }

  // ── Rendering ─────────────────────────────────────────────────────────
  var ICON = {
    check: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    x: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    arrow: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    restart: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    sliders: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>',
    chev: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function buildBar() {
    var bar = document.createElement('div');
    bar.className = 'fl-bar';
    bar.id = 'fl-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Scenario walkthrough');
    bar.innerHTML =
      '<div class="fl-row fl-row-top">' +
        '<label class="fl-select-wrap">' +
          '<select id="fl-scenario" class="fl-select" aria-label="Scenario"></select>' + '</label>' +
        '<div class="fl-field"><span class="fl-label">Platform</span><div class="fl-seg" id="fl-platforms"></div></div>' +
        '<div class="fl-field" id="fl-domain-field"><span class="fl-label">Email domain</span><div class="fl-seg" id="fl-domains"></div></div>' +
        '<div class="fl-spacer"></div>' +
        '<button type="button" class="fl-ghost" id="fl-restart" title="Restart this scenario">' + ICON.restart + '<span>Restart</span></button>' +
        '<button type="button" class="fl-ghost" id="fl-edge" aria-expanded="false" title="Show the original state toggles (SSO, Google/LinkedIn, expired links…)">' + ICON.sliders + '<span>Edge states</span></button>' +
        '<button type="button" class="fl-icon-btn" id="fl-min" title="Minimise" aria-label="Minimise scenario bar">' + ICON.chev + '</button>' +
      '</div>' +
      '<div class="fl-row fl-row-track">' +
        '<button type="button" class="fl-nav" id="fl-back" aria-label="Previous step">' + ICON.left + '</button>' +
        '<ol class="fl-track" id="fl-track"></ol>' +
        '<button type="button" class="fl-nav fl-nav-next" id="fl-next" aria-label="Next step"><span>Next</span>' + ICON.right + '</button>' +
      '</div>' +
      '<div class="fl-caption" id="fl-caption"></div>';
    document.body.appendChild(bar);
    document.body.classList.add('fl-on');

    var sel = bar.querySelector('#fl-scenario');
    sel.innerHTML =
      '<optgroup label="Organic sign up / sign in">' + SCENARIOS.filter(function (s) { return s.page === 'auth'; }).map(opt).join('') + '</optgroup>' +
      '<optgroup label="Invitation link">' + SCENARIOS.filter(function (s) { return s.page === 'invite'; }).map(opt).join('') + '</optgroup>';
    function opt(s) { return '<option value="' + s.id + '">' + s.id + ' · ' + esc(s.short) + '</option>'; }
    sel.addEventListener('change', function () { setScenario(sel.value); });

    bar.querySelector('#fl-back').addEventListener('click', function () { step(-1); });
    bar.querySelector('#fl-next').addEventListener('click', function () { step(1); });
    bar.querySelector('#fl-restart').addEventListener('click', function () { start(); });
    bar.querySelector('#fl-min').addEventListener('click', function () {
      var min = bar.classList.toggle('fl-min');
      try { localStorage.setItem('fl-min', min ? '1' : ''); } catch (e) {}
    });
    try { if (localStorage.getItem('fl-min')) bar.classList.add('fl-min'); } catch (e) {}

    var edgeBtn = bar.querySelector('#fl-edge');
    edgeBtn.addEventListener('click', function () {
      var on = document.body.classList.toggle('fl-edge-on');
      edgeBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
      edgeBtn.classList.toggle('active', on);
    });
  }

  function render() {
    var bar = document.getElementById('fl-bar');
    if (!bar) return;
    var sc = scen();
    bar.querySelector('#fl-scenario').value = sc.id;

    var allowed = platformsFor(sc);
    bar.querySelector('#fl-platforms').innerHTML = PLATFORMS.map(function (p) {
      var ok = allowed.indexOf(p.key) >= 0;
      return '<button type="button" data-p="' + p.key + '"' + (p.key === ctx.platform ? ' class="active"' : '') + (ok ? '' : ' disabled title="Not a target for this scenario"') + '>' + p.label + '</button>';
    }).join('');
    bar.querySelectorAll('#fl-platforms button').forEach(function (b) {
      b.onclick = function () { if (!b.disabled) setPlatform(b.getAttribute('data-p')); };
    });

    var df = bar.querySelector('#fl-domain-field');
    df.classList.toggle('fl-hidden', !sc.domains);
    if (sc.domains) {
      bar.querySelector('#fl-domains').innerHTML = sc.domains.map(function (d) {
        return '<button type="button" data-d="' + d.key + '"' + (d.key === ctx.domain ? ' class="active"' : '') + '>' + esc(d.label) + '</button>';
      }).join('');
      bar.querySelectorAll('#fl-domains button').forEach(function (b) {
        b.onclick = function () { setDomain(b.getAttribute('data-d')); };
      });
    }

    // Journey tracker
    var list = steps();
    var f = flat(list);
    var curPos = -1;
    f.forEach(function (x) { if (x.key === current) curPos = x.pos; });
    var sso = A.source && A.source() !== 'direct';
    var html = '';
    list.forEach(function (st, i) {
      var state = curPos < 0 ? '' : (i < curPos ? ' done' : (i === curPos ? ' current' : ''));
      if (i > 0) html += '<li class="fl-arrow" aria-hidden="true">' + ICON.arrow + '</li>';
      if (st.branch) {
        html += '<li class="fl-fork' + state + '"><span class="fl-fork-label">Admin<br>review</span><span class="fl-fork-opts">' +
          st.branch.map(function (b) {
            var on = current === b.key;
            return '<button type="button" class="fl-chip fl-out-' + b.key + (on ? ' current' : '') + '" data-k="' + b.key + '">' +
              '<span class="fl-dot">' + (b.key === 'approved' ? ICON.check : ICON.x) + '</span>' +
              '<span class="fl-chip-text"><b>' + (b.key === 'approved' ? 'Approve' : 'Reject') + '</b><small>' + esc(b.sub) + '</small></span></button>';
          }).join('') + '</span></li>';
      } else {
        var skipped = st.key === 'verify' && sso;
        var endCls = (st.key === 'dashboard' || st.key === 'dashboard0' || st.key === 'approved') ? ' fl-out-approved' : (st.key === 'rejected' ? ' fl-out-rejected' : '');
        html += '<li><button type="button" class="fl-chip' + state + endCls + (skipped ? ' skipped' : '') + '" data-k="' + st.key + '"' +
          (skipped ? ' title="Skipped: Google SSO already verifies the email"' : '') + '>' +
          '<span class="fl-dot">' + (i < curPos ? ICON.check : (i + 1)) + '</span>' +
          '<span class="fl-chip-text"><b>' + esc(st.label) + '</b><small>' + esc(skipped ? 'Skipped (SSO)' : st.sub) + '</small></span></button></li>';
      }
    });
    var track = bar.querySelector('#fl-track');
    track.innerHTML = html;
    track.querySelectorAll('[data-k]').forEach(function (b) {
      b.onclick = function () { go(b.getAttribute('data-k')); };
    });
    var cur = track.querySelector('.current');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    var idx = -1;
    f.forEach(function (x, i) { if (x.key === current) idx = i; });
    var lastPos = f[f.length - 1].pos;
    bar.querySelector('#fl-back').disabled = idx <= 0;
    bar.querySelector('#fl-next').disabled = idx >= 0 && f[idx].pos === lastPos;

    var note = sc.note ? sc.note(ctx) : '';
    bar.querySelector('#fl-caption').innerHTML =
      '<b>' + esc(sc.id + '. ' + sc.title) + '</b> <span class="fl-sep">·</span>' + esc(sc.who) +
      '<span class="fl-pill">' + esc(sc.approval) + '</span>' +
      (note ? '<span class="fl-note">' + esc(note) + '</span>' : '') +
      (current ? '' : '<span class="fl-off">Off-script: this screen isn’t part of the scenario. Press Restart or pick a step.</span>');

    writeUrl();
  }

  function init(adapter) {
    A = adapter;
    var q = new URLSearchParams(location.search);
    var id = q.get('s');
    var sc = byId(id);
    if (!sc || sc.page !== A.page) sc = SCENARIOS.filter(function (s) { return s.page === A.page; })[0];
    if (id && byId(id) && byId(id).page !== A.page) {
      location.replace(PAGES[byId(id).page] + location.search);
      return;
    }
    ctx = { scenario: sc.id, platform: q.get('p') || 'atoms', domain: q.get('d') };
    buildBar();
    start(q.get('step'));
  }

  // Day 0 Scinode dashboard (scinode-day10.html defaults to Day 0) in a
  // full-screen frame under the scenario bar. Demo only: scrolling works,
  // clicks/keys are swallowed and the dashboard's own Day toggle is hidden.
  function showDashboard() {
    hideDashboard();
    var wrap = document.createElement('div');
    wrap.className = 'fl-dash';
    wrap.id = 'fl-dash';
    wrap.innerHTML = '<iframe src="scinode-day10.html" title="Scinode dashboard, Day 0 (demo)"></iframe>';
    wrap.querySelector('iframe').addEventListener('load', function () {
      try {
        var doc = this.contentDocument;
        var st = doc.createElement('style');
        st.textContent = '.day-toggle{display:none!important}';
        doc.head.appendChild(st);
        ['click', 'submit', 'keydown', 'mousedown'].forEach(function (t) {
          doc.addEventListener(t, function (e) {
            if (t === 'keydown' && /^(Arrow|Page|Home|End| )/.test(e.key)) return;
            e.preventDefault(); e.stopPropagation();
          }, true);
        });
      } catch (err) {}
    });
    document.body.appendChild(wrap);
    sync();
  }
  function hideDashboard() {
    var el = document.getElementById('fl-dash');
    if (el) el.remove();
  }
  function dashboardOpen() { return !!document.getElementById('fl-dash'); }

  window.Flows = { init: init, sync: sync, go: go, step: step, setScenario: setScenario,
    showDashboard: showDashboard, hideDashboard: hideDashboard, dashboardOpen: dashboardOpen };
})();
