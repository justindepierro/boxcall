import { devLog, devError } from '@utils/devLogger.js';
import { loadSidebarStateFromStorage, getSidebarState } from '@state/sidebarState.js';

import { renderSidebar } from './renderSidebar.js';
import { applySidebarState } from './sidebarStateController.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';

export async function initSidebar() {
  try {
    devLog('🧱 initSidebar(): Starting...');
    loadSidebarStateFromStorage();
    /** @type {import('@state/sidebarState.js').SidebarState} */
    const currentState = getSidebarState() || 'icon';
    renderSidebar(currentState);
    applySidebarState(currentState);
    initSidebarToggle();
    devLog(`✅ Sidebar initialized in "${currentState}" state`);
  } catch (err) {
    devError(`❌ initSidebar(): Failed — ${err}`);
  }
}
