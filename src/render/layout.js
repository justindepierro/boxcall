// src/render/layout.js
import { renderSidebar } from '../components/sidebar/sidebarDOM.js';

/**
 * Injects a full layout with sidebar and main content.
 * @param {string} contentHTML
 * @returns {string}
 */
// src/render/layout.js
export function withSidebar(contentHTML = '') {
  return `
    <div class="flex h-screen overflow-hidden">
      <aside id="sidebar-root" class="h-screen w-64 shrink-0 transition-all duration-300 ease-in-out"></aside>
      <main id="main-content" class="flex-1 overflow-y-auto p-6 transition-all duration-300">
        ${contentHTML}
      </main>
    </div>
  `;
}

/**
 * Render the full layout with sidebar and content
 * @param {HTMLElement} container
 * @param {string} contentHTML
 */
export function renderPage(container, contentHTML) {
  container.innerHTML = withSidebar(contentHTML);
  renderSidebar(); // 🧠 This handles all buttons, logic, etc
}

export function withSimpleLayout(contentHTML = '') {
  return `
      <main class="p-6 max-w-2xl mx-auto">
        ${contentHTML}
      </main>
    `;
}
