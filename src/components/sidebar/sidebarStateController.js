// src/components/sidebar/sidebarStateController.js

// 🧠 This controller applies visual and layout changes based on the sidebar state
// It modifies sidebar width, label/icon visibility, and main content margin
// It also updates the internal state via setSidebarState

import { setSidebarState } from '../../state/sidebarState.js';
import {
  getSidebarParts,
  toggleElementsVisibility,
  safeSetText,
} from '../../utils/sidebarUtils.js';

// 🔒 Define the valid states in one place for consistency and validation
const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];

/**
 * Applies visual and layout changes for the given sidebar state.
 * - Updates sidebar size, label/icon visibility, main margin, and button text
 * - Updates global sidebar state using setSidebarState()
 *
 * @param {'expanded' | 'icon' | 'collapsed'} newState
 */
export function applySidebarState(newState) {
  const { sidebar, mainContent, labels, title, icons, minimizeBtn } = getSidebarParts();

  if (!sidebar || !mainContent || !minimizeBtn) {
    console.warn('❌ applySidebarState() aborted — missing sidebar elements');
    return;
  }

  if (!SIDEBAR_STATES.includes(newState)) {
    console.error(`🚨 Invalid sidebar state: "${newState}"`);
    return;
  }

  console.log(`🎯 Switching sidebar to "${newState}"`);

  // 🧼 Remove all sizing and visibility classes before applying new state
  sidebar.classList.remove(
    'w-64',
    'w-16',
    'w-0',
    'opacity-0',
    'opacity-100',
    'pointer-events-none',
    'pointer-events-auto'
  );

  mainContent.classList.remove('ml-64', 'ml-16', 'ml-0');

  // 🎯 Apply state-specific styles
  switch (newState) {
    case 'expanded':
      sidebar.classList.add('w-64', 'opacity-100', 'pointer-events-auto');
      mainContent.classList.add('ml-64');
      toggleElementsVisibility(labels, true);
      toggleElementsVisibility(icons, true);
      title?.classList.remove('hidden');
      safeSetText(minimizeBtn, '⇤');
      break;

    case 'icon':
      sidebar.classList.add('w-16', 'opacity-100', 'pointer-events-auto');
      mainContent.classList.add('ml-16');
      toggleElementsVisibility(labels, false);
      toggleElementsVisibility(icons, true);
      title?.classList.add('hidden');
      safeSetText(minimizeBtn, '⇥');
      break;

    case 'collapsed':
      sidebar.classList.add('w-0', 'opacity-0', 'pointer-events-none');
      mainContent.classList.add('ml-0');
      toggleElementsVisibility(labels, false);
      toggleElementsVisibility(icons, false);
      title?.classList.add('hidden');
      safeSetText(minimizeBtn, '☰');
      break;
  }

  // ✅ Save to global store
  setSidebarState(newState);
}
