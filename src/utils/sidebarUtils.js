// src/components/sidebar/sidebarUtils.js

/**
 * 🧠 Returns the current page from the URL hash.
 * Example: #/dashboard → 'dashboard'
 * Fallbacks to 'dashboard' if none is present.
 */
export function getCurrentPage() {
  const hash = location.hash.replace(/^#\/?/, '').split('/')[0];
  return hash || 'dashboard';
}

/**
 * 🎭 Toggle visibility (via .hidden class) on a list of elements.
 * @param {NodeListOf<HTMLElement>} elements - Elements to toggle
 * @param {boolean} show - true = show, false = hide
 */
export function toggleElementsVisibility(elements, show = true) {
  if (!elements || elements.length === 0) return;
  elements.forEach((el) => el.classList.toggle('hidden', !show));
}

/**
 * 🖊️ Safely set the text content of an element.
 * @param {HTMLElement|null} el - Target element
 * @param {string} text - Text to assign
 */
export function safeSetText(el, text) {
  if (el) el.textContent = text;
}

/**
 * 🧩 Gathers and returns all relevant parts of the sidebar UI.
 * Returns references to both outer shell and dynamic elements.
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
export function getSidebarParts() {
  const sidebar = document.getElementById('sidebar');
  const labels = document.querySelectorAll('.nav-label');
  const icons = document.querySelectorAll('.nav-icon');
  const title = document.querySelector('.sidebar-title');
  const minimizeBtn = document.getElementById('sidebar-minimize');

  if (!sidebar || !labels.length || !icons.length || !title || !minimizeBtn) {
    console.warn('⚠️ getSidebarParts(): Missing some sidebar components.', {
      sidebar,
      labels,
      icons,
      title,
      minimizeBtn,
    });
    return null;
  }

  return { sidebar, labels, icons, title, minimizeBtn };
}
