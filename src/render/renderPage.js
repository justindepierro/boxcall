// src/render/renderPage.js
import { PageContainer } from '@components/layout/pageContainer.js';
import { devError, devLog, devWarn } from '@utils/devLogger.js';

/**
 * @typedef {Object} RenderPageOptions
 * @property {string} [maxWidth='max-w-5xl'] - Tailwind max-width class for layout.
 * @property {string} [title=''] - Optional page title.
 * @property {boolean} [titleFromHash=false] - If true, derive the title from the URL hash.
 * @property {string} [className=''] - Extra classes for the container.
 * @property {string} [headerContent=''] - Optional extra header content (right side).
 * @property {boolean} [preserveScroll=false] - If true, preserves scroll position on rerender.
 * @property {boolean} [noHeader=false] - If true, hides the header completely.
 */

/**
 * Main function to render a page into #page-content with a PageContainer wrapper.
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
    preserveScroll = false,
    noHeader = false,
  } = {}
) {
  const container = document.getElementById('page-content');

  // 1. Validate container
  if (!(container instanceof HTMLElement)) {
    devError('❌ renderPage(): #page-content not found. App shell may not be initialized.');
    return;
  }

  // 2. Save scroll position if requested
  const scrollPosition = preserveScroll ? container.scrollTop : 0;

  // 3. Safely execute renderer
  const content = safeRenderContent(pageRenderer);
  if (!content) {
    devWarn('⚠️ renderPage(): No valid content returned by renderer.');
    return;
  }

  // 4. Resolve page title
  const finalTitle = resolveTitle(title, titleFromHash);

  // 5. Update document title
  document.title = finalTitle ? `BoxCall – ${finalTitle}` : 'BoxCall';

  // 6. Create wrapped page container
  let wrapped;
  try {
    wrapped = PageContainer(content, {
      maxWidth,
      title: finalTitle,
      className,
      headerContent,
      noHeader,
    });
  } catch (err) {
    devError(`❌ renderPage(): Failed to create PageContainer - ${err}`);
    return;
  }

  // 7. Replace DOM content
  try {
    container.innerHTML = '';
    container.appendChild(wrapped);
  } catch (err) {
    devError(`❌ renderPage(): Failed to append content - ${err}`);
    return;
  }

  // 8. Restore scroll position
  if (preserveScroll) container.scrollTop = scrollPosition;

  devLog(`✅ renderPage(): Rendered page with title "${finalTitle}"`);
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

/**
 * Executes the page renderer safely and validates its output.
 * @param {Function} pageRenderer
 * @returns {HTMLElement | null}
 */
function safeRenderContent(pageRenderer) {
  try {
    if (typeof pageRenderer !== 'function') {
      devError('❌ renderPage(): pageRenderer is not a function.');
      return null;
    }
    const raw = pageRenderer();
    if (typeof raw === 'string') {
      const div = document.createElement('div');
      div.innerHTML = raw;
      return div;
    }
    if (raw instanceof HTMLElement) return raw;

    devError('❌ renderPage(): pageRenderer must return a string or HTMLElement.');
    return null;
  } catch (err) {
    devError(`❌ renderPage(): Renderer threw an error - ${err}`);
    return null;
  }
}

/**
 * Resolves the title based on explicit `title` or hash-based fallback.
 * @param {string} title
 * @param {boolean} fromHash
 * @returns {string}
 */
function resolveTitle(title, fromHash) {
  if (!fromHash) return title;
  const hash = (window.location.hash.replace(/^#\/?/, '') || 'dashboard').split('/')[0];
  return capitalizeFirstLetter(hash);
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
