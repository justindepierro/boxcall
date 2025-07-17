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

  const {
    outer, // #sidebar-root
    sidebar, // <aside id="sidebar">
    mainContent,
    labels,
    title,
    icons,
    minimizeBtn,
  } = parts;

  if (!SIDEBAR_STATES.includes(newState)) {
    console.error(
      `🚨 Invalid sidebar state "${newState}". Expected one of: ${SIDEBAR_STATES.join(', ')}`
    );
    return;
  }

  console.log(`🎯 Sidebar → ${newState}`);

  // 🔄 Remove any old layout classes
  outer?.classList.remove(...Object.values(WIDTH_CLASSES));
  mainContent?.classList.remove(...Object.values(MARGIN_CLASSES));

  // 🧼 Sidebar visibility
  if (newState === 'collapsed') {
    sidebar.style.display = 'none';
  } else {
    sidebar.style.display = 'flex'; // ensure visible
    sidebar.classList.add('opacity-100', 'pointer-events-auto');
  }

  // ✅ Apply new width and margin (to wrapper + main content)
  outer?.classList.add(WIDTH_CLASSES[newState]);
  mainContent?.classList.add(MARGIN_CLASSES[newState]);

  // 🎨 Label + icon visibility
  updateSidebarVisibility({ labels, icons, title }, newState);
  adjustSidebarButtons(newState);

  // 🔘 Update icon inside toggle button
  const iconName = MINIMIZE_SYMBOLS[newState];
  if (minimizeBtn) {
    minimizeBtn.innerHTML = '';
    minimizeBtn.appendChild(createIconElement(iconName, 20));
  }

  // 💾 Save to local state
  setSidebarState(newState);
}
