import { devLog, devWarn } from '@utils/devLogger.js';
import { cycleSidebarState, setSidebarState } from '@state/sidebarState.js';

import { applySidebarState } from './sidebarStateController.js';
import { querySidebarElements } from './sidebarDOMHelpers.js';

/**
 * Cycles sidebar through expanded → icon → collapsed.
 */
export function handleSidebarToggle() {
  const nextState = cycleSidebarState(); // Ensure cycleSidebarState returns the new state
  if (!nextState) {
    devWarn('⚠️ handleSidebarToggle: cycleSidebarState() returned no state');
    return;
  }
  devLog(`🔁 Sidebar toggle → ${nextState}`);
  applySidebarState(nextState);
}

/**
 * Forces sidebar into a specific state.
 * @param {'expanded' | 'icon' | 'collapsed'} state
 */
export function forceSidebarState(state) {
  if (!state) return devWarn('⚠️ forceSidebarState: No state provided');
  devLog(`🔪 Forcing sidebar to: ${state}`);
  setSidebarState(state);
  applySidebarState(state);
}

/**
 * Initializes sidebar toggle button.
 */
export function initSidebarToggle() {
  const { minimizeBtn } = querySidebarElements();
  if (!minimizeBtn) {
    devWarn('❌ initSidebarToggle(): Minimize button not found');
    return;
  }
  minimizeBtn.addEventListener('click', handleSidebarToggle);
}
