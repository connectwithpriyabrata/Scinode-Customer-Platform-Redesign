/* Scinode shared shell JS — used by every page (sidebar, Create Request modal, generic UI helpers).
   Page-specific engines (day states, opportunities, compliance, ecosystem) stay inline on their page. */

/* ── Sidebar collapse ── */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const topNav = document.getElementById('top-nav');
  const main = document.querySelector('.main');
  if (sidebar) sidebar.classList.toggle('collapsed');
  if (topNav) topNav.classList.toggle('sb-collapsed');
  if (main) main.classList.toggle('sb-collapsed');
}

/* ── Create Request modal (top nav) ── */
function openModal() {
  const m = document.getElementById('create-request-modal');
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const m = document.getElementById('create-request-modal');
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}
function handleModalBackdropClick(e) {
  if (e.target === document.getElementById('create-request-modal')) closeModal();
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

/* ── Horizontal scroll (carousels) ── */
function hscroll(id, dir) {
  const el = document.getElementById(id + '-scroll');
  if (el) el.scrollBy({ left: dir * 240, behavior: 'smooth' });
}

/* ── Accordion ── */
function toggleAccordion(trigger) {
  const expanded = trigger.getAttribute('aria-expanded') === 'true';
  trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  const content = document.getElementById(trigger.getAttribute('aria-controls'));
  if (content) content.setAttribute('data-state', expanded ? 'closed' : 'open');
}

/* ── Collapsible ── */
function toggleCollapsible(trigger) {
  const expanded = trigger.getAttribute('aria-expanded') === 'true';
  trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  const content = document.getElementById(trigger.getAttribute('aria-controls'));
  if (content) content.setAttribute('data-state', expanded ? 'closed' : 'open');
}

/* ── Filter tabs ── */
function switchTab(tab) {
  const list = tab.closest('[role="tablist"]');
  if (!list) return;
  list.querySelectorAll('[role="tab"]').forEach(t => {
    t.setAttribute('aria-selected', 'false');
    t.classList.remove('active');
  });
  tab.setAttribute('aria-selected', 'true');
  tab.classList.add('active');
}

/* ══════════════════════════════════════════════════════════════════════
   Icon system (ICONOGRAPHY.md) — Migration Phase 1: infrastructure only.
   Nothing on any page references AppIcon/NavIcon/StatusIcon/FeatureIcon yet;
   this is purely additive so later phases are a pure find-and-replace
   against already-tested code. Path data is copied verbatim from
   lucide.dev (MIT licensed) — this is the "Prototype implementation" from
   ICONOGRAPHY.md Section 1, a faithful stand-in for lucide-react.
   ══════════════════════════════════════════════════════════════════════ */

/* Raw Lucide path data, keyed by the exact Lucide export name.
   ICONOGRAPHY.md Section 8 semantic registry keys resolve to one of these
   via ICON_REGISTRY below — never reference this table by semantic name. */
const ICON_PATHS = {
  LayoutDashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  Factory: '<path d="M12 16h.01"/><path d="M16 16h.01"/><path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M8 16h.01"/>',
  FlaskConical: '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  Package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
  Sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  FolderKanban: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>',
  ClipboardList: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  Bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  Plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  Search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  Settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  LogOut: '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
  Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  Moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  ShieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  Shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  TrendingUp: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  Building2: '<path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',
  Handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  FileText: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  Scale: '<path d="M12 3v18"/><path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/>',
  Microscope: '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
  Layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  TestTubes: '<path d="M9 2v17.5A2.5 2.5 0 0 1 6.5 22A2.5 2.5 0 0 1 4 19.5V2"/><path d="M20 2v17.5a2.5 2.5 0 0 1-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5V2"/><path d="M3 2h7"/><path d="M14 2h7"/><path d="M9 16H4"/><path d="M20 16h-5"/>',
  Beaker: '<path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/>',
  Gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  Share2: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  CheckCircle2: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  Check: '<path d="M20 6 9 17l-5-5"/>',
  AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  AlertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  Info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  Star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  X: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  ChevronRight: '<path d="m9 18 6-6-6-6"/>',
  ChevronLeft: '<path d="m15 18-6-6 6-6"/>',
  ChevronDown: '<path d="m6 9 6 6 6-6"/>',
  ChevronUp: '<path d="m18 15-6-6-6 6"/>',
  ArrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  SlidersHorizontal: '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  Calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  Download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  ExternalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  CircleHelp: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  Phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  Copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
};

/* ICONOGRAPHY.md Section 8 semantic registry — one concept, one Lucide icon.
   Keys here are the only names product code should ever reference; the
   PascalCase names above are an implementation detail. */
const ICON_REGISTRY = {
  /* Navigation & workspace */
  dashboard: 'LayoutDashboard', manufacturing: 'Factory', rnd: 'FlaskConical',
  products: 'Package', scira: 'Sparkles', projects: 'FolderKanban',
  requests: 'ClipboardList', notifications: 'Bell', 'create-request': 'Plus',
  search: 'Search', profile: 'User', settings: 'Settings', logout: 'LogOut',
  'light-mode': 'Sun', 'dark-mode': 'Moon',
  /* Domain concepts */
  compliance: 'ShieldCheck', security: 'Shield', 'market-intelligence': 'TrendingUp',
  manufacturers: 'Building2', 'cro-partners': 'Handshake', documentation: 'FileText',
  regulatory: 'Scale', analytical: 'Microscope', 'materials-engineering': 'Layers',
  bioprocessing: 'TestTubes', formulation: 'Beaker', 'process-scaleup': 'Gauge',
  'technology-transfer': 'Share2', 'access-control': 'Lock',
  /* Status & feedback */
  success: 'CheckCircle2', warning: 'AlertTriangle', error: 'AlertCircle',
  info: 'Info', rating: 'Star',
  /* Common UI glyphs */
  close: 'X', 'chevron-right': 'ChevronRight', 'chevron-left': 'ChevronLeft',
  'chevron-down': 'ChevronDown', 'chevron-up': 'ChevronUp', 'arrow-right': 'ArrowRight',
  filter: 'SlidersHorizontal', calendar: 'Calendar', clock: 'Clock',
  download: 'Download', 'external-link': 'ExternalLink',
  /* Help & Support */
  'help-support': 'CircleHelp', email: 'Mail', phone: 'Phone', copy: 'Copy'
};

/* Section 6 semantic colors — status roles only (Success/Warning/Error/Info).
   Neutral and Brand roles are covered by the existing --text-2 and --teal-*
   tokens directly and don't need their own lookup table. */
const STATUS_COLORS = {
  success: { bg: 'var(--status-success-bg)', fg: 'var(--status-success-fg)' },
  warning: { bg: 'var(--status-warning-bg)', fg: 'var(--status-warning-fg)' },
  error: { bg: 'var(--status-error-bg)', fg: 'var(--status-error-fg)' },
  info: { bg: 'var(--status-info-bg)', fg: 'var(--status-info-fg)' }
};
const STATUS_ICON_NAME = { success: 'success', warning: 'warning', error: 'error', info: 'info' };

/* FeatureIcon hue palette — the broader per-category tint set (Section 6),
   distinct from the four status colors above. Matches the tint-50 bg +
   600/700 fg formula already used by badges elsewhere in the app. */
const FEATURE_HUES = {
  teal: { bg: 'var(--teal-50)', fg: 'var(--teal-600)' },
  indigo: { bg: '#EEF2FF', fg: '#4338CA' },
  blue: { bg: '#EFF6FF', fg: '#1D4ED8' },
  green: { bg: '#F0FDF4', fg: '#15803D' }
};

function resolveIconPath(name) {
  const lucideName = ICON_REGISTRY[name] || name;
  return ICON_PATHS[lucideName] || '';
}

/* `AppIcon` — the primitive. Renders one bare icon, no container.
   name: a Section 8 registry key (e.g. 'manufacturing') or a literal
   Lucide name (e.g. 'Factory') for one-off decorative use.
   size: one of 14/18/20/24 (ICONOGRAPHY.md Section 4). Defaults to 18. */
function AppIcon(name, opts) {
  opts = opts || {};
  const size = opts.size || 18;
  const color = opts.color || 'currentColor';
  const path = resolveIconPath(name);
  if (!path) return '';
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
}

/* `NavIcon` — sidebar / top-nav. Always 18px, never a container.
   Active/inactive color is intentionally NOT set here — it comes from the
   surrounding `.sb-item`/`.sb-item.active` CSS via currentColor, per the
   "never hardcode SVG colors" rule in ICONOGRAPHY.md Section 10. */
function NavIcon(name) {
  return AppIcon(name, { size: 18 });
}

/* `StatusIcon` — verified/warning/error/info. Always circular, one of the
   two approved tile sizes (ICONOGRAPHY.md Section 5). */
function StatusIcon(status, opts) {
  opts = opts || {};
  const size = opts.size === 'feature' ? 48 : 28;
  const iconSize = opts.size === 'feature' ? 24 : 18;
  const colors = STATUS_COLORS[status];
  if (!colors) return '';
  const icon = AppIcon(STATUS_ICON_NAME[status], { size: iconSize, color: colors.fg });
  return '<span class="status-icon" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + colors.bg + ';color:' + colors.fg + ';display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">' + icon + '</span>';
}

/* `FeatureIcon` — category/feature tiles. Always a rounded-square, one of
   the two approved tile sizes (ICONOGRAPHY.md Section 5). */
function FeatureIcon(name, opts) {
  opts = opts || {};
  const size = opts.size === 'feature' ? 48 : 28;
  const iconSize = opts.size === 'feature' ? 24 : 18;
  const radius = opts.size === 'feature' ? 'var(--radius-md)' : 'var(--radius-sm)';
  const hue = FEATURE_HUES[opts.hue] || FEATURE_HUES.teal;
  const icon = AppIcon(name, { size: iconSize, color: hue.fg });
  return '<span class="feature-icon" style="width:' + size + 'px;height:' + size + 'px;border-radius:' + radius + ';background:' + hue.bg + ';color:' + hue.fg + ';display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">' + icon + '</span>';
}

/* ══════════════════════════════════════════════════════════════════════
   Help & Support drawer — shared across every page. The drawer markup is
   injected once (lazily, on first open) instead of duplicated per page,
   since the sidebar trigger is the only piece that has to live in each
   page's static HTML. Structured for future channels (phone, chat, KB,
   tickets, expert booking) without changing this layout. */
const SUPPORT_EMAIL = 'scinode@scimplify.com';
let helpDrawerLastFocus = null;

function ensureHelpDrawer() {
  if (document.getElementById('help-drawer')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="help-drawer-backdrop" id="help-drawer-backdrop" onclick="closeHelpDrawer()"></div>' +
    '<div class="help-drawer" id="help-drawer" role="dialog" aria-modal="true" aria-labelledby="help-drawer-title">' +
      '<div class="help-drawer-head">' +
        '<div>' +
          '<div class="help-drawer-title" id="help-drawer-title">Help &amp; Support</div>' +
          '<div class="help-drawer-sub">Need assistance with Scinode?<br><br>Our team can help with platform usage, requests, projects, and technical issues.</div>' +
        '</div>' +
        '<button type="button" class="help-drawer-close" onclick="closeHelpDrawer()" aria-label="Close">' + AppIcon('close', { size: 16 }) + '</button>' +
      '</div>' +
      '<div class="help-drawer-body">' +
        '<div class="help-card">' +
          '<span class="help-card-icon">' + AppIcon('email', { size: 18, color: 'var(--teal-600)' }) + '</span>' +
          '<div class="help-card-info">' +
            '<div class="help-card-title">Email Support</div>' +
            '<div class="help-card-value">' + SUPPORT_EMAIL + '</div>' +
            '<div class="help-card-meta">Typical response: Within 1 business day</div>' +
          '</div>' +
        '</div>' +
        '<div class="help-actions">' +
          '<a class="btn btn-default" href="mailto:' + SUPPORT_EMAIL + '">Compose Email</a>' +
          '<button type="button" class="btn btn-outline" onclick="copySupportEmail()">Copy Email</button>' +
        '</div>' +
        '<div class="help-divider"></div>' +
        '<div class="help-card help-card-disabled" aria-disabled="true">' +
          '<span class="help-card-icon">' + AppIcon('phone', { size: 18 }) + '</span>' +
          '<div class="help-card-info">' +
            '<div class="help-card-title">Call Support</div>' +
            '<div class="help-card-meta">Coming Soon</div>' +
          '</div>' +
        '</div>' +
        '<div class="help-divider"></div>' +
        '<div class="help-card">' +
          '<span class="help-card-icon">' + AppIcon('clock', { size: 18, color: 'var(--teal-600)' }) + '</span>' +
          '<div class="help-card-info">' +
            '<div class="help-card-title">Business Hours</div>' +
            '<div class="help-card-meta">Monday – Saturday</div>' +
            '<div class="help-card-meta">9:00 AM – 6:00 PM IST</div>' +
          '</div>' +
        '</div>' +
        '<div class="help-divider"></div>' +
        '<div class="help-section-label">Resources</div>' +
        '<div class="help-resource-row" aria-disabled="true"><span class="help-resource-icon">' + AppIcon('documentation', { size: 15 }) + '</span>Getting Started</div>' +
        '<div class="help-resource-row" aria-disabled="true"><span class="help-resource-icon">' + AppIcon('documentation', { size: 15 }) + '</span>FAQs</div>' +
        '<div class="help-resource-row" aria-disabled="true"><span class="help-resource-icon">' + AppIcon('documentation', { size: 15 }) + '</span>Release Notes</div>' +
      '</div>' +
    '</div>';
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
}

function openHelpDrawer() {
  ensureHelpDrawer();
  helpDrawerLastFocus = document.activeElement;
  document.getElementById('help-drawer-backdrop').classList.add('open');
  document.getElementById('help-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  const closeBtn = document.querySelector('#help-drawer .help-drawer-close');
  if (closeBtn) closeBtn.focus();
}
function closeHelpDrawer() {
  const backdrop = document.getElementById('help-drawer-backdrop');
  const drawer = document.getElementById('help-drawer');
  if (!drawer || !drawer.classList.contains('open')) return;
  backdrop.classList.remove('open');
  drawer.classList.remove('open');
  document.body.style.overflow = '';
  if (helpDrawerLastFocus && helpDrawerLastFocus.focus) helpDrawerLastFocus.focus();
}
function copySupportEmail() {
  function done() { showToast('Email copied'); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(SUPPORT_EMAIL).then(done, done);
  } else {
    done();
  }
}
document.addEventListener('keydown', function (e) {
  const drawer = document.getElementById('help-drawer');
  if (!drawer || !drawer.classList.contains('open')) return;
  if (e.key === 'Escape') { closeHelpDrawer(); return; }
  if (e.key === 'Tab') {
    const focusables = drawer.querySelectorAll('a[href], button:not([disabled])');
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ── Shared toast (used by Help & Support; available to any page) ── */
function showToast(text) {
  let wrap = document.getElementById('sc-toast');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'sc-toast';
    wrap.className = 'sc-toast';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'sc-toast-item';
  el.textContent = text;
  wrap.appendChild(el);
  setTimeout(function () { el.remove(); }, 2200);
}
