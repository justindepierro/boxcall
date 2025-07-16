// src/components/sidebar/sidebarToggleHandler.js

import { getSidebarState, setSidebarState } from '@state/sidebarState.js';
import { applySidebarState } from './sidebarStateController.js';
import { getSidebarParts } from '@utils/sidebarUtils.js'; // 🔁 keep utils close if local

/**
 * 🔁 Toggle between 'expanded' and 'icon' sidebar states
 */
export function handleSidebarToggle() {
  const current = getSidebarState();
  const next = current === 'expanded' ? 'icon' : 'expanded';

  console.log(`🔁 Toggling sidebar: ${current} ➝ ${next}`);
  setSidebarState(next);
  applySidebarState(next);
}

/**
 * 🧩 Initialize sidebar toggle button
 */
export function initSidebarToggle() {
  const { minimizeBtn } = getSidebarParts();

  if (!minimizeBtn) {
    console.warn('❌ initSidebarToggle(): Minimize button not found');
    return;
  }

  minimizeBtn.addEventListener('click', () => {
    console.log(`🔘 Sidebar minimize clicked — current: ${getSidebarState()}`);
    handleSidebarToggle();
  });
}
