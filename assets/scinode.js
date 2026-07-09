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
