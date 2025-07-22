// src/components/layout/pageContainer.js

/**
 * Creates a standardized page container with optional header and content.
 *
 * @param {string | HTMLElement} content - Main content.
 * @param {Object} [options={}]
 * @param {string} [options.maxWidth='max-w-6xl'] - Tailwind max-width class for layout.
 * @param {string} [options.title=''] - Optional page title.
 * @param {string} [options.className=''] - Additional Tailwind classes.
 * @param {string} [options.headerContent=''] - Optional right-side header content.
 * @param {boolean} [options.noHeader=false] - Skip header entirely.
 * @returns {HTMLElement}
 */
export function PageContainer(
  content,
  { maxWidth = 'max-w-6xl', title = '', className = '', headerContent = '', noHeader = false } = {}
) {
  const wrapper = document.createElement('section');
  wrapper.className = `
    page-container
    ${maxWidth}
    mx-auto
    px-4 sm:px-6 md:px-8
    py-6
    space-y-6
    transition-all
    ${className}
  `.trim();

  // Optional header
  if (!noHeader && (title || headerContent)) {
    const header = document.createElement('header');
    header.className = `
      page-header
      flex flex-col sm:flex-row sm:items-center sm:justify-between
      gap-2 sm:gap-4
      pb-4 border-b border-[var(--color-border)]
    `.trim();

    if (title) {
      const h1 = document.createElement('h1');
      h1.className = 'text-2xl font-bold text-[var(--color-text)]';
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

  // Add content
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'w-full space-y-4';

  if (typeof content === 'string') {
    contentWrapper.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    contentWrapper.appendChild(content);
  }

  wrapper.appendChild(contentWrapper);
  return wrapper;
}
