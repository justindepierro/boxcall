// src/components/sidebar/sidebarStateController.js
import { devLog, devError } from '@utils/devLogger.js';
import { setSidebarState } from '@state/sidebarState.js';
import { SIDEBAR_STATES } from '@config/sidebarConfig.js';

/**
 * Applies a new sidebar state by updating classes only.
 * @param {'expanded' | 'icon' | 'collapsed'} newState
 */
export function applySidebarState(newState) {
  if (!SIDEBAR_STATES.includes(newState)) {
    devError(`🚨 Invalid sidebar state "${newState}"`);
    return;
  }

  devLog(`🎯 Sidebar → ${newState}`);

  const root = document.getElementById('sidebar-root');
  const shell = document.getElementById('shell');

  if (!root || !shell) {
    devError('❌ Sidebar or shell element not found');
    return;
  }

  // Remove previous classes
  root.classList.remove('expanded', 'icon', 'collapsed');
  shell.classList.remove('sidebar-expanded', 'sidebar-icon', 'sidebar-collapsed');

  // Add new classes
  root.classList.add(newState);
  shell.classList.add(`sidebar-${newState}`);

  setSidebarState(newState);
}
