import { devLog, devError } from '@utils/devLogger.js';
import { loadSidebarStateFromStorage, getSidebarState } from '@state/sidebarState.js';

import { renderSidebar } from './renderSidebar.js';
import { applySidebarState } from './sidebarStateController.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';

/**
 * 🚀 Initializes the sidebar system safely and in order:
 * 1. Loads saved state
 * 2. Renders sidebar HTML
 * 3. Applies layout and visibility
 * 4. Hooks up interactions
 */
export async function initSidebar() {
  devLog('🧱 initSidebar(): Loading sidebar...');

  try {
    // 1. Load state from localStorage FIRST
    loadSidebarStateFromStorage();

    // 2. NOW read the actual current state
    const currentState = getSidebarState() || 'expanded';
    devLog(`🔍 Current sidebar state: "${currentState}"`);

    // 3. Render sidebar using currentState (for correct toggle icon)
    renderSidebar(currentState);

    // 4. Apply layout changes for currentState
    applySidebarState(currentState);

    // 5. Set up toggle button listener
    initSidebarToggle();

    devLog(`✅ Sidebar initialized in "${currentState}" state`);
  } catch (err) {
    // Convert error to string so devError only gets one argument
    devError(`❌ initSidebar(): Failed to initialize sidebar — ${err}`);
  }
}
