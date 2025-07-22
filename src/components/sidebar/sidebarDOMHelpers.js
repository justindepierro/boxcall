/**
 * Collects key sidebar elements.
 * @returns {{
 *   outer: HTMLElement | null,
 *   sidebar: HTMLElement | null,
 *   mainContent: HTMLElement | null,
 *   minimizeBtn: HTMLElement | null
 * }}
 */
export function querySidebarElements() {
  return {
    outer: document.getElementById('sidebar-root'),
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('page-view'),
    minimizeBtn: document.getElementById('sidebar-minimize'),
  };
}
