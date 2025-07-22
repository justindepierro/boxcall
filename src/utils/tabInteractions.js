/**
 * Initializes all Tabs components on the page.
 */
export function initTabs() {
  const tabsContainers = document.querySelectorAll('[data-tabs]');

  tabsContainers.forEach((container) => {
    if (!(container instanceof HTMLElement)) return;

    /** @type {HTMLElement[]} */
    const tabButtons = Array.from(container.querySelectorAll('[role="tab"]')).filter(
      (btn) => btn instanceof HTMLElement
    );

    /** @type {HTMLElement[]} */
    const tabPanels = Array.from(container.querySelectorAll('[role="tabpanel"]')).filter(
      (panel) => panel instanceof HTMLElement
    );

    if (!tabButtons.length || !tabPanels.length) return;

    tabButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => activateTab(container, index, tabButtons, tabPanels));

      btn.addEventListener('keydown', (e) => {
        if (!(e instanceof KeyboardEvent)) return;

        let newIndex = index;
        if (e.key === 'ArrowRight') newIndex = (index + 1) % tabButtons.length;
        if (e.key === 'ArrowLeft') newIndex = (index - 1 + tabButtons.length) % tabButtons.length;

        if (newIndex !== index) {
          e.preventDefault();
          activateTab(container, newIndex, tabButtons, tabPanels);
          tabButtons[newIndex]?.focus();
        }
      });
    });
  });
}

/**
 * Activates the tab and its corresponding panel.
 * @param {HTMLElement} container
 * @param {number} index
 * @param {HTMLElement[]} tabButtons
 * @param {HTMLElement[]} tabPanels
 */
function activateTab(container, index, tabButtons, tabPanels) {
  tabButtons.forEach((btn, i) => {
    const isActive = i === index;
    btn.setAttribute('aria-selected', String(isActive));
    btn.tabIndex = isActive ? 0 : -1;
    btn.classList.toggle('text-[var(--color-accent)]', isActive);
    btn.classList.toggle('border-[var(--color-accent)]', isActive);
  });

  tabPanels.forEach((panel, i) => {
    panel.classList.toggle('hidden', i !== index);
  });
}
