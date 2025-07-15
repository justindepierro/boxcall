import { renderSidebar } from '../components/sidebar/sidebarDOM.js';

/**
 * Renders a full app shell with sidebar and main content.
 * @param {string[] | string} contentBlocks - Either a single HTML string or array of content blocks
 * @returns {string} Full HTML structure with sidebar
 */
export function withSidebar(contentBlocks = '') {
  const contentHTML = Array.isArray(contentBlocks) ? contentBlocks.join('\n') : contentBlocks;

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
 * Injects the full layout into the provided container and mounts the sidebar
 * @param {HTMLElement} container - DOM element to mount into (usually #page-view)
 * @param {string[] | string} contentBlocks - HTML content to render
 */
export function renderPage(container, contentBlocks = '') {
  container.innerHTML = withSidebar(contentBlocks);
  renderSidebar(); // Mounts interactive sidebar elements
}

/**
 * Renders a centered layout without a sidebar (for public pages)
 * @param {string[] | string} contentBlocks
 * @returns {string} HTML structure
 */
export function withSimpleLayout(contentBlocks = '') {
  const contentHTML = Array.isArray(contentBlocks) ? contentBlocks.join('\n') : contentBlocks;

  return `
    <main class="p-6 max-w-2xl mx-auto">
      ${contentHTML}
    </main>
  `;
}
