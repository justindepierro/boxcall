// src/render/renderPage.js
import { PageContainer } from '@components/layout/pageContainer.js';
import { devError, devLog } from '@utils/devLogger.js';

/**
 * @typedef {Object} RenderPageOptions
 * @property {string} [maxWidth='max-w-5xl'] - Tailwind max-width class for layout.
 * @property {string} [title=''] - Optional page title.
 * @property {boolean} [titleFromHash=false] - If true, derive the title from the URL hash.
 * @property {string} [className=''] - Extra classes for container.
 * @property {string} [headerContent=''] - Optional extra header content.
 */

/**
 * Renders a page into #page-content with a PageContainer wrapper.
 *
 * @param {Function} pageRenderer - A function returning HTML (string or HTMLElement).
 * @param {RenderPageOptions} [options]
 */
export function renderPage(
  pageRenderer,
  {
    maxWidth = 'max-w-5xl',
    title = '',
    titleFromHash = false,
    className = '',
    headerContent = '',
  } = {}
) {
  const container = document.getElementById('page-content');
  if (!(container instanceof HTMLElement)) {
    devError('❌ renderPage(): #page-content not found.');
    return;
  }

  // Get the content
  const rawContent = pageRenderer();
  let content;
  if (typeof rawContent === 'string') {
    content = rawContent;
  } else if (rawContent instanceof HTMLElement) {
    content = rawContent;
  } else {
    devError('❌ renderPage(): pageRenderer must return a string or HTMLElement.');
    return;
  }

  // Determine title
  let finalTitle = title;
  if (titleFromHash) {
    const hash = window.location.hash.replace(/^#\/?/, '') || 'dashboard';
    finalTitle = capitalizeFirstLetter(hash.split('/')[0]);
  }

  // Update browser tab title
  document.title = finalTitle ? `BoxCall – ${finalTitle}` : 'BoxCall';

  // Wrap content
  const wrapped = PageContainer(content, { maxWidth, title: finalTitle, className, headerContent });

  // Replace page content
  container.innerHTML = '';
  container.appendChild(wrapped);

  devLog(`✅ renderPage(): Rendered page with title "${finalTitle}"`);
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
