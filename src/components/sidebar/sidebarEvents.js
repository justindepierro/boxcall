// src/components/sidebar/sidebarEvents.js
import { navigateTo } from '@routes/router.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';
import { applySidebarState } from './sidebarStateController.js';
import { getSidebarState } from '@state/sidebarState.js';

/**
 * Attaches nav + toggle handlers and applies stored state.
 */
export function initSidebarEvents() {
  attachNavEvents();
  initSidebarToggle();
  applySidebarState(getSidebarState()); // 🧠 Restore saved sidebar state
}

/**
 * Handles sidebar page navigation.
 */
/**
 * Handles sidebar page navigation.
 */
function attachNavEvents() {
  /** @type {NodeListOf<HTMLButtonElement>} */
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page; // Now TypeScript knows this is valid
      if (page) navigateTo(page);
    });
  });
}
