// src/components/sidebar/sidebarStateController.js

import { setSidebarState } from '@state/sidebarState.js';
import {
  querySidebarElements,
  safeSetText,
  adjustSidebarButtons,
  updateSidebarVisibility,
} from '@utils/sidebarUtils.js';
import {
  SIDEBAR_STATES,
  WIDTH_CLASSES,
  MARGIN_CLASSES,
  MINIMIZE_SYMBOLS,
} from '@config/sidebarConfig.js';

/**
 * Applies layout and visibility changes based on sidebar state.
 * @param {'expanded' | 'icon' | 'collapsed'} newState
 */
export function applySidebarState(newState) {
  const parts = querySidebarElements();
  if (!parts) {
    console.warn('❌ applySidebarState(): Sidebar DOM parts missing.');
    return;
  }

  const { outer, sidebar, mainContent, labels, title, icons, minimizeBtn } = parts;

  if (!SIDEBAR_STATES.includes(newState)) {
    console.error(
      `🚨 Invalid sidebar state "${newState}". Expected one of: ${SIDEBAR_STATES.join(', ')}`
    );
    return;
  }

  console.log(`🎯 Sidebar → ${newState}`);

  // 🔄 Reset layout classes
  outer?.classList.remove(...Object.values(WIDTH_CLASSES));
  mainContent?.classList.remove(...Object.values(MARGIN_CLASSES));
  sidebar?.classList.remove(
    'opacity-0',
    'opacity-100',
    'pointer-events-none',
    'pointer-events-auto'
  );

  // ✅ Apply new layout classes
  outer?.classList.add(WIDTH_CLASSES[newState]);
  mainContent?.classList.add(MARGIN_CLASSES[newState]);

  const isVisible = newState !== 'collapsed';
  sidebar?.classList.add(isVisible ? 'opacity-100' : 'opacity-0');
  sidebar?.classList.add(isVisible ? 'pointer-events-auto' : 'pointer-events-none');

  // 🎨 Handle visibility and layout
  updateSidebarVisibility({ labels, icons, title }, newState);
  adjustSidebarButtons(newState);

  // 🔘 Update toggle symbol
  safeSetText(minimizeBtn, MINIMIZE_SYMBOLS[newState]);

  // 💾 Save current state
  setSidebarState(newState);
}

export function applySidebarVisualState(state, parts) {
  const { labels, icons, title } = parts;

  const isExpanded = state === 'expanded';
  const isVisible = state !== 'collapsed';

  updateSidebarVisibility(labels, isExpanded);
  updateSidebarVisibility(icons, isVisible);
  title?.classList.toggle('hidden', !isExpanded);
  labels?.forEach((el) => el.classList.toggle('hidden', !isExpanded));

  adjustSidebarButtons(state);
}
