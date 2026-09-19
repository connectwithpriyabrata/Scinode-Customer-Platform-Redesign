/* Users & Access — core: data seeds, state, permission + capacity rules, UI primitives.
   Rules encoded here come from the Consolidated PRD (canonical) + Design Spec Part 1. See access-blueprint.html for conflicts. */
(function () {
  'use strict';
  const UA = (window.UA = window.UA || {});

  /* ───────────── Icons (Lucide paths, stroke 1.75 per ICONOGRAPHY.md) ───────────── */
  const ICONS = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
    gem: '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
    chevr: '<path d="m9 18 6-6-6-6"/>',
    chevl: '<path d="m15 18-6-6 6-6"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    key: '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    'clipboard': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
    flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/>',
    scope: '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>'
  };
  UA.ic = function (name, size, color) {
    const p = ICONS[name];
    if (!p) return '';
    return '<svg width="' + (size || 16) + '" height="' + (size || 16) + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || 'currentColor') + '" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  };
  UA.ICONS = ICONS;
  const ic = UA.ic;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  UA.esc = esc;

  /* ───────────── Platforms & modules ───────────── */
  const MODS = {
    requests: { name: 'Requests', icon: 'clipboard' }, projects: { name: 'Projects', icon: 'folder' },
    market_pulse: { name: 'Market Pulse', icon: 'activity' }, deep_research: { name: 'Deep Research', icon: 'scope' },
    ask_scira: { name: 'Ask Scira', icon: 'sparkles' }, manufacturing: { name: 'Manufacturing', icon: 'factory' },
    rnd: { name: 'R&D', icon: 'flask' }, products: { name: 'Products', icon: 'package' },
    opportunities: { name: 'Opportunities', icon: 'target' }, proposals: { name: 'Proposals', icon: 'file' },
    demand_catalyst: { name: 'Demand Catalyst', icon: 'trend' }
  };
  const ITEMS = {
    requests: 'RFQ — Citric Acid', projects: 'Project Aurora', market_pulse: 'Citric Acid market report', deep_research: 'Citric Acid DI',
    ask_scira: 'Scira session #14', manufacturing: 'Plant audit — Karnataka', rnd: 'Solvent screening study', products: 'Product catalogue',
    opportunities: 'Opportunity #2381', proposals: 'Proposal for Opportunity #2381', demand_catalyst: 'RFQ — Product ABC'
  };
  const ACTS = {
    requests: 'Raised an R&D request', projects: 'Created a project', market_pulse: 'Generated a market report', deep_research: 'Generated detailed intelligence',
    ask_scira: 'Started a Scira session', manufacturing: 'Requested a quote', rnd: 'Submitted an R&D brief', products: 'Saved a product',
    opportunities: 'Opened an opportunity', proposals: 'Submitted a proposal', demand_catalyst: 'Submitted an RFQ'
  };
  UA.PLATFORMS = {
    scinode: { name: 'Scinode', legacy: '', mods: ['requests', 'projects', 'market_pulse', 'deep_research', 'ask_scira', 'manufacturing', 'rnd', 'products'], teams: ['R&D', 'Manufacturing', 'Commercial'], ops: 'Scinode Ops', dest: 'Scinode’s applicable upgrade flow', dash: 'Dashboard shows only the current user’s own Requests & Projects; sections without permission are omitted.' },
    manufacturers: { name: 'Scinode for Manufacturers', legacy: 'ATOMS', mods: ['opportunities', 'proposals', 'market_pulse', 'demand_catalyst', 'deep_research'], teams: ['Manufacturing', 'Sales', 'Quality'], ops: 'Scinode for Manufacturers Ops', dest: 'Scinode for Manufacturers Billing', dash: 'Dashboard is universal; only the Proposals widget is gated by Proposals permission.' },
    researchers: { name: 'Scinode for Researchers', legacy: 'IONS', mods: ['opportunities', 'proposals', 'market_pulse', 'demand_catalyst', 'deep_research'], teams: ['R&D', 'Lab Ops', 'Commercial'], ops: 'Scinode for Researchers Ops', dest: 'Scinode for Researchers’ own Premium upgrade flow', dash: 'Dashboard is universal; only the Proposals widget is gated by Proposals permission.' },
    deepresearch: { name: 'Deep Research', legacy: '', mods: ['deep_research'], teams: ['Research Ops', 'Product Research', 'Analytics'], ops: 'Scinode for Researchers (IONS) Ops — temporary routing', dest: 'Deep Research’s own Premium upgrade flow', dash: 'No universal surface — every request passes canUserAccess() for the platform membership itself.' }
  };
  const TEAM_DESC = ['Formulation, analytics and process research.', 'Plant operations, batch execution and QA hand-off.', 'Customer-facing sourcing and commercial strategy.'];
  const MOD_PATS = ['11101011', '10111110', '11110100'];

  /* ───────────── State ───────────── */
  const S = (UA.state = { role: 'superadmin', plan: 'free', day: 1, platform: 'scinode', tab: 'organization', f: { q: '', role: 'all', team: 'all', status: 'all', rtype: 'all', rstat: 'pending' } });
  UA.cache = {};
  UA.db = null;
  UA.PERSONA = { id: 'me', name: 'Priya Sharma', email: 'priya@acme.com' };
  UA.PUBLIC_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];
  UA.domainType = (email) => (UA.PUBLIC_DOMAINS.indexOf(String(email).split('@')[1]) > -1 ? 'public' : 'private');

  UA.plat = () => UA.PLATFORMS[S.platform];
  UA.modIds = () => UA.plat().mods;
  UA.mod = (i) => MODS[UA.modIds()[i]];
  UA.modId = (i) => UA.modIds()[i];
  UA.n = () => UA.modIds().length;
  UA.itemFor = (i) => ITEMS[UA.modId(i)];
  UA.actFor = (i) => ACTS[UA.modId(i)];

  /* ───────────── Seeds ───────────── */
  function mk(id, name, email, role, teams, status, perm8, extra) {
    return Object.assign({ id, name, email, role, teams: teams || [], status: status || 'active', perm8, joined: '12 Aug 2026', last: '2h ago' }, extra || {});
  }
  function seed(plan, day, platform) {
    const pl = UA.PLATFORMS[platform];
    const n = pl.mods.length;
    const fit = (p) => { p.perm = n === 1 ? (p.dr || p.perm8[0]) : p.perm8.slice(0, n); return p; };
    const tnames = pl.teams;
    const mkTeam = (i, admins, extra) => Object.assign({ id: 't' + (i + 1), name: tnames[i], desc: TEAM_DESC[i], admins: admins, mods: n === 1 ? '1' : MOD_PATS[i].slice(0, n), status: 'active' }, extra || {});
    const db = { org: { name: 'Acme Chemicals', id: 'CMP-182', domain: 'acme.com', status: 'Approved', since: 'Jun 2026' }, people: [], teams: [], invites: [], requests: [], audit: [], transfer: null, unlocked: {}, seq: 100 };
    const me = fit(mk('me', 'Priya Sharma', 'priya@acme.com', 'superadmin', [], 'active', 'UVNUVUUN', { dr: 'V', joined: '02 Jun 2026', last: 'Just now' }));
    const rahul = fit(mk('rahul', 'Rahul Mehta', 'rahul@acme.com', 'member', [], 'active', 'UUUUUUUU', { dr: 'U', joined: '02 Jun 2026' }));
    if (plan === 'free' && day === 0) {
      rahul.role = 'superadmin'; rahul.hideWhen = 'superadmin'; db.people = [me, rahul];
    } else if (plan === 'free') {
      const ananya = fit(mk('ananya', 'Ananya Rao', 'ananya@acme.com', 'member', [], 'active', 'UVUUVUUU', { dr: 'V', joined: '18 Aug 2026', last: 'Yesterday' }));
      db.people = [me, rahul, ananya];
      db.invites = [
        { id: 'i1', name: 'Rahul Mehta', email: 'rahul@acme.com', by: 'me', role: 'member', team: null, status: 'joined', domain: 'private', date: '04 Aug', pid: 'rahul' },
        { id: 'i2', name: 'Ananya Rao', email: 'ananya@acme.com', by: 'me', role: 'member', team: null, status: 'joined', domain: 'private', date: '18 Aug', pid: 'ananya' }
      ];
      db.requests = [{ id: 'r1', type: 'use', pid: 'ananya', mod: n === 1 ? 0 : 2, date: '18 Sep', status: 'pending' }];
      db.audit = [{ t: '18 Sep, 4:10 PM', actor: 'Ananya Rao', action: 'Request to Use submitted', entity: 'Market Pulse', o: 'View', nw: 'Use (requested)' }, { t: '18 Aug, 11:02 AM', actor: 'Priya Sharma', action: 'Invitation sent', entity: 'ananya@acme.com', o: '—', nw: 'Member · No Team' }];
    } else if (day === 0) {
      rahul.role = 'superadmin'; rahul.hideWhen = 'superadmin'; db.people = [me, rahul];
      db.teams = [mkTeam(0, ['me'], { hideWhen: 'superadmin' })];
    } else {
      const karan = fit(mk('karan', 'Karan Shah', 'karan@acme.com', 'admin', ['t1', 't3'], 'active', 'UUUUUUUU', { dr: 'U', joined: '10 Jun 2026', last: '3h ago' }));
      const sana = fit(mk('sana', 'Sana Qureshi', 'sana@acme.com', 'admin', ['t2'], 'active', 'UUUUUUUU', { dr: 'U', joined: '10 Jun 2026', last: 'Yesterday' }));
      const ananya = fit(mk('ananya', 'Ananya Rao', 'ananya@acme.com', 'member', ['t1', 't3'], 'active', 'UUVUUUUU', { dr: 'V', joined: '21 Jun 2026', last: '1d ago' }));
      const neha = fit(mk('neha', 'Neha Kulkarni', 'neha@acme.com', 'member', ['t1'], 'active', 'UUVUUUUU', { dr: 'U', joined: '02 Jul 2026', last: '5h ago' }));
      const vikram = fit(mk('vikram', 'Vikram Iyer', 'vikram@acme.com', 'member', [], 'active', 'UNVUUUUU', { dr: 'V', joined: '19 Aug 2026', last: '2d ago', organic: true }));
      const arjun = fit(mk('arjun', 'Arjun Patel', 'arjun@acme.com', 'member', ['t3'], 'active', 'UUUUNUUU', { dr: 'U', joined: '28 Jul 2026', last: '4d ago' }));
      const meera = fit(mk('meera', 'Meera Nair', 'meera.nair@gmail.com', 'member', [], 'pending', 'UUUUUUUU', { dr: 'U', joined: '—', last: '—', pubdomain: true }));
      rahul.teams = ['t2'];
      db.people = [me, rahul, karan, sana, ananya, neha, vikram, arjun, meera];
      db.teams = [mkTeam(0, ['karan']), mkTeam(1, ['sana']), mkTeam(2, ['karan'])];
      db.invites = [
        { id: 'i1', name: 'Rahul Mehta', email: 'rahul@acme.com', by: 'sa', role: 'member', team: 't2', status: 'joined', domain: 'private', date: '02 Jun', pid: 'rahul' },
        { id: 'i2', name: 'Karan Shah', email: 'karan@acme.com', by: 'sa', role: 'admin', team: 't1', status: 'joined', domain: 'private', date: '10 Jun', pid: 'karan' },
        { id: 'i3', name: 'Neha Kulkarni', email: 'neha@acme.com', by: 'karan', role: 'member', team: 't1', status: 'joined', domain: 'private', date: '02 Jul', pid: 'neha' },
        { id: 'i4', name: 'Meera Nair', email: 'meera.nair@gmail.com', by: 'sa', role: 'member', team: null, status: 'waiting', domain: 'public', date: '17 Sep', pid: 'meera' },
        { id: 'i5', name: 'Aditi Verma', email: 'aditi@acme.com', by: 'karan', role: 'member', team: 't1', status: 'sent', domain: 'private', date: '16 Sep' },
        { id: 'i6', name: 'Dev Malhotra', email: 'dev@gmail.com', by: 'sana', role: 'member', team: 't2', status: 'rejected', domain: 'public', date: '01 Sep' },
        { id: 'i7', name: 'Ishita Rao', email: 'ishita@acme.com', by: 'sa', role: 'member', team: null, status: 'cancelled', domain: 'private', date: '28 Aug' }
      ];
      db.requests = [
        { id: 'r1', type: 'use', pid: 'neha', mod: n === 1 ? 0 : 2, date: '18 Sep', status: 'pending', reason: 'I need to run market scans for the Citric Acid brief.' },
        { id: 'r2', type: 'view', pid: 'ananya', mod: n === 1 ? 0 : 3, date: '17 Sep', status: 'pending', reason: 'Want to reference last quarter’s analysis.' },
        { id: 'r3', type: 'use', pid: 'vikram', mod: n === 1 ? 0 : 4, date: '16 Sep', status: 'pending', reason: '' },
        { id: 'r4', type: 'invite', pid: 'meera', mod: null, date: '17 Sep', status: 'pending', reason: '' },
        { id: 'r5', type: 'view', pid: 'arjun', mod: 0, date: '15 Sep', status: 'pending', reason: 'Follow-up for a customer call.' }
      ];
      db.audit = [
        { t: '17 Sep, 9:41 AM', actor: 'Meera Nair', action: 'Signup completed (public domain)', entity: 'meera.nair@gmail.com', o: 'Invitation Accepted', nw: 'Pending Approval' },
        { t: '16 Sep, 2:15 PM', actor: 'Karan Shah', action: 'Invitation sent', entity: 'aditi@acme.com', o: '—', nw: 'Member · R&D' },
        { t: '10 Sep, 5:30 PM', actor: 'Priya Sharma', action: 'Team module enabled', entity: 'R&D → Market Pulse', o: 'Off', nw: 'On' },
        { t: '01 Sep, 1:02 PM', actor: 'Sana Qureshi', action: 'Approval denied', entity: 'dev@gmail.com', o: 'Waiting for Approval', nw: 'Rejected' }
      ];
    }
    return db;
  }

  /* ───────────── Viewer application (role persona → dataset) ───────────── */
  UA.applyViewer = function () {
    const db = UA.db, role = S.role;
    const p = (id) => db.people.find((x) => x.id === id);
    const me = p('me'), rahul = p('rahul');
    if (role === 'superadmin') {
      me.role = 'superadmin'; me.teams = [];
      if (rahul.role === 'superadmin' && !rahul.hideWhen) { rahul.role = 'member'; rahul.teams = db.teams[1] ? [db.teams[1].id] : []; }
    } else {
      if (rahul.role !== 'superadmin') { rahul.role = 'superadmin'; rahul.teams = []; }
      me.role = role;
      if (S.plan === 'premium') {
        const t = db.teams.find((x) => x.id === 't1') || db.teams[0];
        if (t) {
          me.teams = [t.id];
          if (role === 'admin' && t.admins.indexOf('me') < 0) t.admins.push('me');
          if (role !== 'admin') db.teams.forEach((x) => { x.admins = x.admins.filter((a) => a !== 'me'); });
        }
      } else me.teams = [];
      if (role === 'member' && S.plan === 'premium') db.teams.forEach((x) => { x.admins = x.admins.filter((a) => a !== 'me'); });
    }
  };
  UA.load = function () {
    const key = S.plan + '|' + S.day + '|' + S.platform;
    if (!UA.cache[key]) UA.cache[key] = seed(S.plan, S.day, S.platform);
    UA.db = UA.cache[key];
    UA.applyViewer();
  };
  UA.resetData = function () { UA.cache = {}; UA.load(); };

  /* ───────────── Accessors ───────────── */
  UA.people = () => UA.db.people.filter((p) => p.hideWhen !== S.role && p.status !== 'removed');
  UA.teams = () => UA.db.teams.filter((t) => t.hideWhen !== S.role);
  UA.me = () => UA.db.people.find((p) => p.id === 'me');
  UA.person = (id) => (id === 'sa' ? UA.superadmin() : UA.db.people.find((p) => p.id === id));
  UA.superadmin = () => UA.people().find((p) => p.role === 'superadmin' && p.id !== 'me') || UA.people().find((p) => p.role === 'superadmin') || UA.me();
  UA.team = (id) => UA.db.teams.find((t) => t.id === id);
  UA.teamsOf = (p) => (p.teams || []).map(UA.team).filter(Boolean);
  UA.isSA = () => S.role === 'superadmin';
  UA.isAdm = () => S.role === 'admin';
  UA.isMem = () => S.role === 'member';
  UA.premium = () => S.plan === 'premium';
  UA.roleLabel = (r) => ({ superadmin: 'Superadmin', admin: 'Admin', member: 'Member' }[r]);
  UA.myTeams = () => UA.teamsOf(UA.me());
  UA.adminOf = (t) => (t.admins || []).map(UA.person).filter(Boolean);

  const permAt = (p, i) => ({ U: 'use', V: 'view', N: 'none' }[(p.perm || '')[i]] || 'none');
  /* Effective permission = Team Enabled ∧ Member Permission (PRD §5.3). Superadmin isn't team-gated. */
  UA.access = function (p, i) {
    if (p.role === 'superadmin') return { lvl: 'use', base: 'use', teamOff: false };
    const base = permAt(p, i), ts = UA.teamsOf(p);
    if (ts.length && !ts.some((t) => t.mods[i] === '1')) return { lvl: 'none', base: base, teamOff: true };
    return { lvl: base, base: base, teamOff: false };
  };
  UA.setPerm = function (p, i, lvl) {
    const c = { use: 'U', view: 'V', none: 'N' }[lvl];
    const a = (p.perm || '').split(''); while (a.length < UA.n()) a.push('N');
    a[i] = c; p.perm = a.join('');
  };
  UA.accessSummary = function (p) {
    let u = 0, v = 0;
    for (let i = 0; i < UA.n(); i++) { const a = UA.access(p, i).lvl; if (a === 'use') u++; else if (a === 'view') v++; }
    return u + ' Use · ' + v + ' View';
  };

  /* Approval routing: Team member → that Team's Admin; No Team → Superadmin (Design §10.2) */
  UA.approverOf = function (r) {
    const p = UA.person(r.pid);
    const t = p && p.teams && p.teams[0] ? UA.team(p.teams[0]) : null;
    if (t) { const a = UA.adminOf(t)[0]; return { label: (a ? a.name : 'Team Admin') + ' · ' + t.name + ' Admin', team: t.id, kind: 'team' }; }
    return { label: 'Superadmin', team: null, kind: 'sa' };
  };
  UA.requestsVisible = function () {
    return UA.db.requests.filter((r) => {
      const ap = UA.approverOf(r);
      if (S.role === 'superadmin') return true;
      if (S.role === 'admin') return ap.kind === 'team' && UA.me().teams.indexOf(ap.team) > -1;
      return false;
    });
  };
  UA.pendingCount = () => UA.requestsVisible().filter((r) => r.status === 'pending').length;

  /* Invitations visible: SA all, Admin only ones for their teams / sent by them */
  UA.invitesVisible = function () {
    return UA.db.invites.filter((i) => S.role === 'superadmin' || (S.role === 'admin' && (i.by === 'me' || (i.team && UA.me().teams.indexOf(i.team) > -1))));
  };
  UA.membersVisible = function () {
    const all = UA.people();
    if (S.role === 'admin') { const mt = UA.me().teams; return all.filter((p) => p.id === 'me' || (p.teams || []).some((t) => mt.indexOf(t) > -1)); }
    return all;
  };

  /* ───────────── Capacity (Free = 1 Superadmin + 2 Members + 0 Teams; Premium limits are config-driven — illustrative) ───────────── */
  UA.limits = () => (UA.premium() ? { sa: 3, mem: 25, teams: 10, admins: 10 } : { sa: 1, mem: 2, teams: 0, admins: 0 });
  UA.usage = function () {
    const pp = UA.people();
    const reserved = UA.db.invites.filter((i) => i.role === 'member' && (i.status === 'sent') && !i.pid).length;
    return {
      sa: pp.filter((p) => p.role === 'superadmin').length,
      mem: pp.filter((p) => p.role === 'member').length + reserved,
      teams: UA.teams().length,
      admins: pp.filter((p) => p.role === 'admin').length
    };
  };
  /* Capacity check runs BEFORE creating the resource (PRD §6.2). Returns null (ok) or an upgrade variant. */
  UA.capacity = function (kind) {
    const l = UA.limits(), u = UA.usage();
    if (kind === 'member') return u.mem >= l.mem ? (UA.premium() ? 'limit' : 'member') : null;
    if (kind === 'superadmin') return UA.premium() ? (u.sa >= l.sa ? 'limit' : null) : 'superadmin';
    if (kind === 'admin') return UA.premium() ? (UA.teams().length ? (u.admins >= l.admins ? 'limit' : null) : 'admin-noteam') : 'admin';
    if (kind === 'team') return UA.premium() ? (u.teams >= l.teams ? 'limit' : null) : 'team';
    return null;
  };

  /* ───────────── Audit + toast ───────────── */
  UA.audit = function (action, entity, o, nw) {
    UA.db.audit.unshift({ t: 'Just now', actor: UA.PERSONA.name + ' (' + UA.roleLabel(S.role) + ')', action: action, entity: entity, o: o || '—', nw: nw || '—' });
  };
  UA.uid = (p) => p + '-' + (++UA.db.seq);

  UA.toast = function (msg, sub) {
    let r = document.getElementById('ua-toasts');
    if (!r) { r = document.createElement('div'); r.id = 'ua-toasts'; r.className = 'ua-toasts'; document.body.appendChild(r); }
    const t = document.createElement('div'); t.className = 'ua-toast';
    t.innerHTML = ic('check-circle', 16) + '<div>' + esc(msg) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>';
    r.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3800);
  };

  /* ───────────── UI primitives: modal, drawer, menu ───────────── */
  function root(id, cls) { let e = document.getElementById(id); if (!e) { e = document.createElement('div'); e.id = id; e.className = cls || ''; document.body.appendChild(e); } return e; }
  UA.modal = function (o) {
    const bd = root('ua-mbd', 'ua-backdrop'); const m = root('ua-modal', 'ua-modal');
    bd.style.zIndex = 215; bd.classList.add('open'); bd.onclick = () => UA.closeModal();
    m.innerHTML = '<div class="ua-modal-box ' + (o.size || '') + '" role="dialog" aria-modal="true">' +
      '<div class="ua-modal-h">' + (o.icon ? '<span class="ua-ic ' + (o.iconCls || '') + ' lg">' + ic(o.icon, 20) + '</span>' : '') +
      '<div style="flex:1;min-width:0"><div class="ua-modal-t">' + o.title + '</div>' + (o.sub ? '<div class="ua-modal-s">' + o.sub + '</div>' : '') + '</div>' +
      '<button type="button" class="ua-x" onclick="UA.closeModal()" aria-label="Close">' + ic('x', 16) + '</button></div>' +
      '<div class="ua-modal-b">' + (o.body || '') + '</div>' + (o.foot ? '<div class="ua-modal-f">' + o.foot + '</div>' : '') + '</div>';
    requestAnimationFrame(() => m.classList.add('open'));
    const f = m.querySelector('input:not([type=checkbox]):not([type=radio]),select,textarea'); if (f && !o.noFocus) setTimeout(() => f.focus(), 60);
  };
  UA.closeModal = function () {
    const bd = document.getElementById('ua-mbd'), m = document.getElementById('ua-modal');
    if (bd) bd.classList.remove('open'); if (m) m.classList.remove('open');
  };
  UA.drawer = function (o) {
    const bd = root('ua-dbd', 'ua-backdrop'); const d = root('ua-drawer', 'ua-drawer');
    bd.classList.add('open'); bd.onclick = () => UA.closeDrawer();
    d.innerHTML = '<div class="ua-drawer-h">' + (o.lead || '') + '<div style="flex:1;min-width:0"><div class="ua-h" style="font-size:18px">' + o.title + '</div>' + (o.sub ? '<div class="ua-hint">' + o.sub + '</div>' : '') + '</div>' +
      '<button type="button" class="ua-x" onclick="UA.closeDrawer()" aria-label="Close">' + ic('x', 16) + '</button></div>' +
      '<div class="ua-drawer-b">' + o.body + '</div>' + (o.foot ? '<div class="ua-drawer-f">' + o.foot + '</div>' : '');
    requestAnimationFrame(() => d.classList.add('open'));
  };
  UA.closeDrawer = function () {
    const bd = document.getElementById('ua-dbd'), d = document.getElementById('ua-drawer');
    if (bd) bd.classList.remove('open'); if (d) d.classList.remove('open');
  };
  UA.menu = function (ev, items) {
    ev.stopPropagation();
    const m = root('ua-menu', 'ua-menu');
    m.innerHTML = items.map((it) => it.sep ? '<div class="sep"></div>' : it.lbl ? '<div class="lbl">' + it.lbl + '</div>' : '<button type="button" class="' + (it.dg ? 'dg' : '') + '" ' + (it.dis ? 'disabled' : '') + ' onclick="UA.closeMenu();' + it.fn + '">' + (it.icon ? ic(it.icon, 15) : '') + it.label + '</button>').join('');
    m.classList.add('open');
    const r = ev.currentTarget.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
    m.style.left = Math.max(8, Math.min(window.innerWidth - mw - 8, r.right - mw)) + 'px';
    m.style.top = (r.bottom + mh + 12 > window.innerHeight ? Math.max(8, r.top - mh - 4) : r.bottom + 4) + 'px';
  };
  UA.closeMenu = function () { const m = document.getElementById('ua-menu'); if (m) m.classList.remove('open'); };
  document.addEventListener('click', (e) => { if (!e.target.closest('#ua-menu')) UA.closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { UA.closeMenu(); UA.closeModal(); UA.closeDrawer(); } });

  /* ───────────── Shared view bits ───────────── */
  const AV = ['a0', 'a1', 'a2', 'a3', 'a4'];
  UA.initials = (n) => String(n).split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  UA.av = function (p, size) {
    const n = typeof p === 'string' ? p : p.name; let h = 0; for (let i = 0; i < n.length; i++) h += n.charCodeAt(i);
    return '<span class="ua-av ' + (size || '') + ' ' + AV[h % 4] + '">' + esc(UA.initials(n)) + '</span>';
  };
  UA.person$ = function (p, opts) {
    opts = opts || {};
    return '<div class="ua-person">' + UA.av(p) + '<div style="min-width:0"><div class="nm">' + esc(p.name) + (p.id === 'me' ? ' <span class="ua-you">You</span>' : '') + '</div>' + (opts.noEmail ? '' : '<div class="em">' + esc(p.email) + '</div>') + '</div></div>';
  };
  UA.roleBadge = function (r) {
    const map = { superadmin: ['navy', 'crown'], admin: ['teal', 'shield'], member: ['gray', null] };
    const m = map[r]; return '<span class="ub ' + m[0] + '">' + (m[1] ? ic(m[1], 11) : '') + UA.roleLabel(r) + '</span>';
  };
  UA.statusBadge = function (s) {
    const map = { active: ['success', 'Active'], pending: ['warn', 'Pending Approval'], suspended: ['gray', 'Suspended'], rejected: ['err', 'Rejected'], sent: ['info', 'Sent'], joined: ['success', 'Joined'], waiting: ['warn', 'Waiting for Approval'], approved: ['success', 'Approved'], cancelled: ['gray', 'Cancelled'], accepted: ['info', 'Invitation Accepted'], reqpending: ['warn', 'Pending'] };
    const m = map[s] || ['gray', s]; return '<span class="ub dot ' + m[0] + '">' + m[1] + '</span>';
  };
  UA.lvlBadge = function (lvl, teamOff) {
    if (teamOff) return '<span class="ub gray">' + ic('ban', 11) + 'Not available to this team</span>';
    return lvl === 'use' ? '<span class="ub teal">Use</span>' : lvl === 'view' ? '<span class="ub navy">View</span>' : '<span class="ub gray">No Access</span>';
  };
  UA.teamChips = function (p) {
    const ts = UA.teamsOf(p);
    if (!ts.length) return '<span class="ua-faint">No Team</span>';
    return ts.map((t) => '<span class="ub teal">' + esc(t.name) + '</span>').join(' ');
  };
  UA.emptyState = function (icon, title, text, cta, cls) {
    return '<div class="ua-empty"><span class="ic ' + (cls || '') + '">' + ic(icon, 22) + '</span><h3>' + title + '</h3><p>' + text + '</p>' + (cta || '') + '</div>';
  };
  UA.setState = function (patch) {
    Object.assign(S, patch);
    if (S.role === 'admin' && S.plan === 'free') { /* Admin unavailable on Free — view renders the explanatory state */ }
    UA.load(); if (UA.render) UA.render(); if (UA.syncDemo) UA.syncDemo();
  };
})();
