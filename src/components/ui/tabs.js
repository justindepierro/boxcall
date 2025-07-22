// src/components/ui/tabs.js

/**
 * @typedef {Object} TabsProps
 * @property {string[]} tabs - The tab labels.
 * @property {string[]} contents - The tab panel contents.
 * @property {string} [activeClass] - Classes for the active tab.
 * @property {string} [className] - Additional classes for the wrapper.
 */

/**
 * Renders a Tabs component.
 * @param {TabsProps} props
 * @returns {string}
 */
export function Tabs(props) {
  const {
    tabs,
    contents,
    activeClass = 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]',
    className = '',
  } = props || {};

  if (!Array.isArray(tabs) || !Array.isArray(contents)) {
    console.error('❌ Tabs component requires `tabs` and `contents` arrays.');
    return '';
  }

  if (tabs.length !== contents.length) {
    console.warn('⚠️ Tabs and contents arrays should have the same length.');
  }

  const tabButtons = tabs
    .map(
      (tab, i) => `
        <button
          type="button"
          role="tab"
          aria-selected="${i === 0 ? 'true' : 'false'}"
          aria-controls="tab-panel-${i}"
          data-tab-index="${i}"
          class="px-4 py-2 transition-colors border-b-2 ${
            i === 0 ? activeClass : 'border-transparent'
          } hover:text-[var(--color-accent)] focus:outline-none"
        >
          ${tab}
        </button>
      `
    )
    .join('');

  const tabPanels = contents
    .map(
      (content, i) => `
        <div
          id="tab-panel-${i}"
          role="tabpanel"
          class="tab-panel ${i === 0 ? '' : 'hidden'} p-4"
        >
          ${content}
        </div>
      `
    )
    .join('');

  return `
    <div class="tabs-component ${className}">
      <div role="tablist" class="flex border-b mb-4 overflow-x-auto">${tabButtons}</div>
      <div class="tab-panels">${tabPanels}</div>
    </div>
  `;
}

/**
 * Initializes tab behavior for a container.
 * @param {Document | HTMLElement} root
 */
export function initTabs(root = document) {
  const tabLists = root.querySelectorAll('[role="tablist"]');

  tabLists.forEach((tabList) => {
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]')).filter(
      (t) => t instanceof HTMLElement
    );
    const panels = Array.from(tabList.nextElementSibling?.children || []);

    /**
     * Activates a selected tab.
     * @param {HTMLElement} newTab
     */
    function activateTab(newTab) {
      tabs.forEach((tab, i) => {
        const isActive = tab === newTab;
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.classList.toggle('border-[var(--color-accent)]', isActive);
        tab.classList.toggle('text-[var(--color-accent)]', isActive);

        if (panels[i] instanceof HTMLElement) {
          panels[i].classList.toggle('hidden', !isActive);
        }
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab));

      tab.addEventListener('keydown', (e) => {
        if (!(e instanceof KeyboardEvent)) return;

        const idx = tabs.indexOf(tab);
        if (e.key === 'ArrowRight') {
          const nextTab = tabs[(idx + 1) % tabs.length];
          nextTab.focus?.();
          activateTab(nextTab);
        } else if (e.key === 'ArrowLeft') {
          const prevTab = tabs[(idx - 1 + tabs.length) % tabs.length];
          prevTab.focus?.();
          activateTab(prevTab);
        }
      });
    });
  });
}
