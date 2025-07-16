// src/components/sidebar/sidebarStateController.js

import { setSidebarState } from '@state/sidebarState.js';
import { getSidebarParts, toggleElementsVisibility, safeSetText } from '@utils/sidebarUtils.js';

const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];

/**
 * Applies layout and visibility changes based on sidebar state.
 * @param {'expanded' | 'icon' | 'collapsed'} newState
 */
export function applySidebarState(newState) {
  const parts = getSidebarParts();
  if (!parts) {
    console.warn('❌ applySidebarState(): Sidebar DOM parts missing.');
    return;
  }

  const { outer, sidebar, mainContent, labels, title, icons, minimizeBtn } = parts;

  if (!SIDEBAR_STATES.includes(newState)) {
    console.error(
      `🚨 applySidebarState(): Invalid state "${newState}". Expected one of: ${SIDEBAR_STATES.join(', ')}`
    );
    return;
  }

  console.log(`🎯 Sidebar → ${newState}`);

  // 🔄 Reset widths and margins
  outer?.classList.remove('w-64', 'w-16', 'w-0');
  mainContent?.classList.remove('ml-64', 'ml-16', 'ml-0');

  // 🔄 Reset interaction and opacity
  sidebar?.classList.remove(
    'opacity-0',
    'opacity-100',
    'pointer-events-none',
    'pointer-events-auto'
  );

  // 📦 Apply new state classes and behavior
  switch (newState) {
    case 'expanded':
      outer?.classList.add('w-64');
      mainContent?.classList.add('ml-64');
      sidebar?.classList.add('opacity-100', 'pointer-events-auto');
      toggleElementsVisibility(labels, true);
      toggleElementsVisibility(icons, true);
      title?.classList.remove('hidden');
      safeSetText(minimizeBtn, '⇤');
      break;

    case 'icon':
      outer?.classList.add('w-16');
      mainContent?.classList.add('ml-16');
      sidebar?.classList.add('opacity-100', 'pointer-events-auto');
      toggleElementsVisibility(labels, false);
      toggleElementsVisibility(icons, true);
      title?.classList.add('hidden');
      safeSetText(minimizeBtn, '⇥');
      break;

    case 'collapsed':
      outer?.classList.add('w-0');
      mainContent?.classList.add('ml-0');
      sidebar?.classList.add('opacity-0', 'pointer-events-none');
      toggleElementsVisibility(labels, false);
      toggleElementsVisibility(icons, false);
      title?.classList.add('hidden');
      safeSetText(minimizeBtn, '☰');
      break;
  }

  setSidebarState(newState);
}
