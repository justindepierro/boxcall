/**
 * Wraps content in a standardized layout shell.
 * @param {HTMLElement} contentEl - The main content to wrap
 * @returns {HTMLElement} A styled section element
 */
export function PageWrapper(contentEl) {
  const wrapper = document.createElement('section');
  wrapper.className = 'page-wrapper max-w-screen-lg mx-auto p-6 space-y-6'; // responsive and clean
  wrapper.appendChild(contentEl);
  return wrapper;
}
