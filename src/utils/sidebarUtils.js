// src/components/sidebar/sidebarUtils.js

/**
 * 🧠 Returns the current page from the URL hash.
 * Example: #/dashboard → 'dashboard'
 * Fallbacks to 'dashboard' if none is present.
 */
export function getCurrentPage() {
  const hash = location.hash.replace('#/', '').split('/')[0];
  return hash || 'dashboard';
}

/**
 * 🎭 Toggle visibility (via .hidden class) on a list of elements.
 * Useful for showing/hiding labels or icons.
 *
 * @param {NodeListOf<HTMLElement>} elements - Elements to toggle
 * @param {boolean} show - true = show, false = hide
 */
export function toggleElementsVisibility(elements, show = true) {
  if (!elements || elements.length === 0) return;
  elements.forEach((el) => el.classList.toggle('hidden', !show));
}

/**
 * 🖊️ Safely set the text content of an element.
 * If the element is null/undefined, nothing happens.
 *
 * @param {HTMLElement|null} el - Target element
 * @param {string} text - Text to assign
 */
export function safeSetText(el, text) {
  if (el) el.textContent = text;
}

/**
 * 🧩 Gathers and returns all relevant parts of the sidebar UI.
 * Centralized here to prevent duplication across modules.
 *
 * @returns {{
 *   sidebar: HTMLElement | null,
 *   mainContent: HTMLElement | null,
 *   labels: NodeListOf<HTMLElement>,
 *   title: HTMLElement | null,
 *   icons: NodeListOf<HTMLElement>,
 *   minimizeBtn: HTMLElement | null,
 *   overlay: HTMLElement | null
 * }}
 */
export function getSidebarParts() {
  const parts = {
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('main-content'),
    labels: document.querySelectorAll('.label'),
    title: document.querySelector('.sidebar-title'),
    icons: document.querySelectorAll('.nav-btn span:first-child'),
    minimizeBtn: document.getElementById('sidebar-minimize'),
    overlay: document.getElementById('sidebar-overlay'),
  };

  // ✅ Log missing pieces if needed
  for (const [key, val] of Object.entries(parts)) {
    if (!val || (val instanceof NodeList && val.length === 0)) {
      console.warn(`⚠️ getSidebarParts(): Missing or empty "${key}"`);
    }
  }

  return parts;
}
