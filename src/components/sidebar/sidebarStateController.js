import { devLog, devWarn } from '@utils/devLogger.js';
import { setSidebarState } from '@state/sidebarState.js';
import { SIDEBAR_STATES } from '@config/sidebarConfig.js';

/**
 * Applies sidebar state by toggling shell + sidebar classes.
 * @param {'expanded' | 'icon' | 'collapsed'} newState
 */
export function applySidebarState(newState) {
  if (!SIDEBAR_STATES.includes(newState)) {
    devWarn(`🚨 Invalid sidebar state "${newState}"`);
    return;
  }

  const shell = document.getElementById('shell');
  const sidebar = document.getElementById('sidebar-root');

  if (!shell || !sidebar) {
    devWarn('❌ applySidebarState(): Missing #shell or #sidebar-root');
    return;
  }

  // Remove old states
  shell.classList.remove('sidebar-expanded', 'sidebar-icon', 'sidebar-collapsed');
  sidebar.classList.remove('expanded', 'icon', 'collapsed');

  // Add new states
  const classMap = {
    expanded: 'sidebar-expanded',
    icon: 'sidebar-icon',
    collapsed: 'sidebar-collapsed',
  };

  shell.classList.add(classMap[newState]);
  sidebar.classList.add(newState);

  devLog(`🎯 Sidebar → ${newState}`);
  setSidebarState(newState);
}
