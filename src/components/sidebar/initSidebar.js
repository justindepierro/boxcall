import { devLog, devError } from '@utils/devLogger.js';
import { loadSidebarStateFromStorage, getSidebarState } from '@state/sidebarState.js';

import { renderSidebar } from './renderSidebar.js';
import { applySidebarState } from './sidebarStateController.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';

export async function initSidebar() {
  try {
    devLog('🧱 initSidebar(): Starting...');
    loadSidebarStateFromStorage();
    const currentState = getSidebarState() || 'icon';

    renderSidebar(currentState); // Only render once
    applySidebarState(currentState); // Just apply classes
    initSidebarToggle(); // Attach toggle button
    devLog(`✅ Sidebar initialized in "${currentState}" state`);
  } catch (err) {
    devError(`❌ initSidebar(): Failed — ${err}`);
  }
}
