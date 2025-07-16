// src/components/sidebar/sidebarUtils.js

/**
 * 🧠 Returns the current page ID from the URL hash.
 * Example: #/dashboard → 'dashboard'
 */
export function getCurrentPage() {
  const hash = location.hash.replace(/^#\/?/, '').split('/')[0];
  return hash || 'dashboard';
}

/**
 * 🎭 Shows or hides a list of elements using `.hidden`
 * @param {NodeListOf<HTMLElement>} elements
 * @param {boolean} show - true to show, false to hide
 */
export function toggleElementsVisibility(elements, show = true) {
  if (!elements?.length) return;
  elements.forEach((el) => el.classList.toggle('hidden', !show));
}

/**
 * 🖊️ Safely updates textContent of a DOM element
 * @param {HTMLElement | null} el
 * @param {string} text
 */
export function safeSetText(el, text) {
  if (el) el.textContent = text;
}

/**
 * 🧩 Queries all major sidebar DOM parts and returns them in one object
 * Used for state handling and layout control
 *
 * @returns {{
 *   outer: HTMLElement | null,
 *   sidebar: HTMLElement | null,
 *   mainContent: HTMLElement | null,
 *   labels: NodeListOf<HTMLElement>,
 *   icons: NodeListOf<HTMLElement>,
 *   title: HTMLElement | null,
 *   minimizeBtn: HTMLElement | null
 * }}
 */
export function querySidebarElements() {
  const outer = document.getElementById('sidebar-root');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('page-view');
  const labels = document.querySelectorAll('.nav-label');
  const icons = document.querySelectorAll('.nav-icon');
  const title = document.querySelector('.sidebar-title');
  const minimizeBtn = document.getElementById('sidebar-minimize');

  if (!sidebar || !outer || !mainContent || !minimizeBtn) {
    console.warn('⚠️ querySidebarElements(): Some required sidebar parts are missing.', {
      outer,
      sidebar,
      mainContent,
      labels,
      icons,
      title,
      minimizeBtn,
    });
    return null;
  }

  return { outer, sidebar, mainContent, labels, icons, title, minimizeBtn };
}

export function adjustSidebarButtons(newState) {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.remove('gap-2', 'justify-start', 'pl-4', 'justify-center', 'px-2');
    if (newState === 'expanded') {
      btn.classList.add('gap-2', 'justify-start', 'pl-4');
    } else {
      btn.classList.add('justify-center', 'px-2');
    }
  });
}

export function updateSidebarVisibility({ labels, icons, title }, newState) {
  const isExpanded = newState === 'expanded';
  const isVisible = newState !== 'collapsed';

  toggleElementsVisibility(labels, isExpanded);
  toggleElementsVisibility(icons, isVisible);
  title?.classList.toggle('hidden', !isExpanded);
  labels?.forEach((el) => el.classList.toggle('hidden', !isExpanded));
}
