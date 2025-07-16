// src/components/sidebar/initSidebar.js

import { loadSidebarStateFromStorage, getSidebarState } from '@state/sidebarState.js';
import { renderSidebar } from './sidebarRender.js';
import { applySidebarState } from './sidebarStateController.js';
import { initSidebarToggle } from './sidebarToggleHandler.js';

/**
 * 🚀 Initializes the sidebar system safely and in order:
 * 1. Loads saved state
 * 2. Renders sidebar HTML
 * 3. Applies layout and visibility
 * 4. Hooks up interactions
 */
export function initSidebar() {
  console.log('🧱 initSidebar(): Loading sidebar...');

  // 1. Load state from storage
  loadSidebarStateFromStorage();

  // 2. Render sidebar DOM structure
  renderSidebar();

  // 3. Apply visual/layout state
  const state = getSidebarState();
  applySidebarState(state);

  // 4. Hook up minimize button and shortcuts
  initSidebarToggle();

  console.log(`✅ Sidebar initialized in "${state}" state`);
}
