// src/components/layout/pageContainer.js

/**
 * Creates a standardized page container with optional header and content.
 *
 * @param {string | HTMLElement} content - Main content (HTML string or element).
 * @param {Object} [options={}]
 * @param {string} [options.maxWidth='max-w-6xl'] - Tailwind max-width class for layout.
 * @param {string} [options.title=''] - Optional page title for the header.
 * @param {string} [options.className=''] - Extra Tailwind classes for customization.
 * @param {string} [options.headerContent=''] - Optional right-side header content.
 * @param {boolean} [options.noHeader=false] - Skip rendering the header entirely.
 * @returns {HTMLElement} The wrapped page container.
 */
export function PageContainer(
  content,
  { maxWidth = 'max-w-6xl', title = '', className = '', headerContent = '', noHeader = false } = {}
) {
  const wrapper = document.createElement('section');

  wrapper.className = `
    page-container
    ${maxWidth}
    pl-1 pr-2 md:pl-2 md:pr-3
    space-y-4
    transition-all
    ${className}
  `.trim();

  // Optional header
  if (!noHeader && (title || headerContent)) {
    const header = document.createElement('header');
    header.className = `
      page-header
      flex flex-col sm:flex-row sm:items-center sm:justify-between
      gap-1 sm:gap-2
      pb-2 border-b border-[var(--color-border)]
    `.trim();

    if (title) {
      const h1 = document.createElement('h1');
      h1.className = 'text-lg md:text-xl font-bold text-[var(--color-text)]';
      h1.textContent = title;
      header.appendChild(h1);
    }

    if (headerContent) {
      const extra = document.createElement('div');
      extra.className = 'flex-shrink-0';
      extra.innerHTML = headerContent;
      header.appendChild(extra);
    }

    wrapper.appendChild(header);
  }

  // Content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'w-full space-y-2 md:space-y-3';
  if (typeof content === 'string') {
    contentWrapper.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    contentWrapper.appendChild(content);
  }
  wrapper.appendChild(contentWrapper);

  return wrapper;
}
