// src/components/sidebar/sidebarToggleHandler.js

import { getSidebarState, setSidebarState } from '../../state/sidebarState.js';
import { applySidebarState } from './sidebarStateController.js';
import { getSidebarParts } from '../../utils/sidebarUtils.js';

/**
 * Toggles between expanded and icon-only states.
 * Removes 'collapsed' from the cycle.
 */
export function handleSidebarToggle() {
  const current = getSidebarState();
  const next = current === 'expanded' ? 'icon' : 'expanded';

  console.log(`🔁 Toggling sidebar: ${current} ➝ ${next}`);
  setSidebarState(next);
  applySidebarState(next);
}

/**
 * Attaches the toggle button listener to cycle between expanded/icon
 */
export function initSidebarToggle() {
  const { minimizeBtn } = getSidebarParts();
  if (!minimizeBtn) {
    console.warn('❌ Minimize button not found!');
    return;
  }

  minimizeBtn.addEventListener('click', () => {
    console.log(`🔘 Minimize clicked — current state: ${getSidebarState()}`);
    handleSidebarToggle();
  });
}
