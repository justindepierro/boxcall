/**
 * Standardized Page Factory
 * Creates consistent page rendering interface across all pages
 */

import { PageContainer } from '@components/layout/pageContainer.js';
import { initPageUI } from '@utils/initPageUI.js';
import { devLog } from '@utils/devLogger.js';

/**
 * Creates a standardized page with consistent lifecycle management
 * @param {Object} config
 * @param {string} config.name - Page name for debugging
 * @param {string} config.content - HTML content
 * @param {Object} [config.containerOptions] - PageContainer options
 * @param {Function} [config.onMount] - Callback after page is mounted
 * @returns {HTMLElement}
 */
export function createPage({ name, content, containerOptions = {}, onMount }) {
  devLog(`📄 Rendering ${name} page`);

  const page = PageContainer(content, {
    title: name,
    ...containerOptions,
  });

  // Standard post-render initialization
  requestAnimationFrame(() => {
    initPageUI();

    if (onMount && typeof onMount === 'function') {
      onMount(page);
    }

    devLog(`✅ ${name} page mounted and initialized`);
  });

  return page;
}

/**
 * Legacy compatibility wrapper for pages using container pattern
 * @param {Function} renderFn - Function that renders into container
 * @returns {Function} - Standardized render function
 */
export function wrapLegacyPage(renderFn) {
  return function standardizedRender() {
    const container = document.createElement('div');
    renderFn(container);
    return container;
  };
}
