// src/components/sidebar/sidebarStateController.js

import { setSidebarState } from '@state/sidebarState.js';
import {
  querySidebarElements,
  adjustSidebarButtons,
  updateSidebarVisibility,
} from '@utils/sidebarUtils.js';
import {
  SIDEBAR_STATES,
  WIDTH_CLASSES,
  MARGIN_CLASSES,
  MINIMIZE_SYMBOLS,
} from '@config/sidebarConfig.js';
import { createIconElement } from '@utils/iconRenderer.js';
import { devLog, devError } from '@utils/devLogger.js';

/**
 * Applies layout and visibility changes based on sidebar state.
 * @param {'expanded' | 'icon' | 'collapsed'} newState
 */
export function applySidebarState(newState) {
  const parts = querySidebarElements();

  if (!parts) {
    devError('❌ applySidebarState(): Sidebar DOM parts missing.');
    return;
  }

  const {
    outer, // #sidebar-root
    sidebar, // <aside id="sidebar">
    mainContent,
    labels,
    title,
    icons,
    minimizeBtn,
  } = parts;

  // Validate newState
  if (!SIDEBAR_STATES.includes(newState)) {
    devError(
      `🚨 Invalid sidebar state "${newState}". Expected one of: ${SIDEBAR_STATES.join(', ')}`
    );
    return;
  }

  devLog(`🎯 Sidebar → ${newState}`);

  // Remove previous layout classes
  outer?.classList.remove(...Object.values(WIDTH_CLASSES));
  mainContent?.classList.remove(...Object.values(MARGIN_CLASSES));

  // Update sidebar visibility
  sidebar.style.display = newState === 'collapsed' ? 'none' : 'flex';
  if (newState !== 'collapsed') {
    sidebar.classList.add('opacity-100', 'pointer-events-auto');
  }

  // Apply new width and margin
  outer?.classList.add(WIDTH_CLASSES[newState]);
  mainContent?.classList.add(MARGIN_CLASSES[newState]);

  // Update visibility of labels, icons, and title
  updateSidebarVisibility({ labels, icons, title }, newState);
  adjustSidebarButtons(newState);

  // Update icon inside toggle button
  if (minimizeBtn) {
    minimizeBtn.innerHTML = '';
    minimizeBtn.appendChild(createIconElement(MINIMIZE_SYMBOLS[newState], '20'));
  }

  // Save to local state
  setSidebarState(newState);
}
