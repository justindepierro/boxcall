// src/components/sidebar/initSidebar.js

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
  console.log('🧱 initSidebar(): Loading sidebar...');

  // 1. Load state from localStorage FIRST
  loadSidebarStateFromStorage();

  // 2. NOW read the actual current state
  const currentState = getSidebarState();

  // 3. Render sidebar using currentState (for correct toggle icon)
  renderSidebar(currentState);

  // 4. Apply layout changes for currentState
  applySidebarState(currentState);

  // 5. Set up toggle button listener
  initSidebarToggle();

  console.log(`✅ Sidebar initialized in "${currentState}" state`);
}
