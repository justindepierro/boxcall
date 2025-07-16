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
    outer, // #sidebar-root (wraps toggle + sidebar)
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

  // 🔄 Reset layout classes
  outer?.classList.remove(...Object.values(WIDTH_CLASSES));
  mainContent?.classList.remove(...Object.values(MARGIN_CLASSES));
  sidebar?.classList.remove(
    'opacity-0',
    'opacity-100',
    'pointer-events-none',
    'pointer-events-auto'
  );

  // 🧼 Ensure sidebar is hidden only when collapsed
  if (newState === 'collapsed') {
    sidebar.style.display = 'none';
    outer.classList.add(WIDTH_CLASSES.collapsed);
    mainContent?.classList.add(MARGIN_CLASSES.collapsed);
  } else {
    sidebar.style.display = '';
    outer.classList.add(WIDTH_CLASSES[newState]);
    mainContent?.classList.add(MARGIN_CLASSES[newState]);
    sidebar.classList.add('opacity-100', 'pointer-events-auto');
  }

  // 🎨 Update visibility of labels/icons/titles and buttons
  updateSidebarVisibility({ labels, icons, title }, newState);
  adjustSidebarButtons(newState);

  // 🔘 Update toggle button symbol
  // 🔘 Swap out the minimize icon
  const iconName = MINIMIZE_SYMBOLS[newState];
  if (minimizeBtn) {
    minimizeBtn.innerHTML = ''; // clear old icon
    const iconEl = createIconElement(iconName, 20);
    minimizeBtn.appendChild(iconEl);
  }

  // 💾 Save state to storage
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
