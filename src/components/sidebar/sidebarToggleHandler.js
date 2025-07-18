// /components/sidebar/sidebarToggleHandler.js
import { getSidebarState, setSidebarState, SIDEBAR_STATES } from '@state/sidebarState.js';
import { applySidebarState } from './sidebarStateController.js';
import { querySidebarElements } from '@utils/sidebarUtils.js';

/**
 * 🔁 Cycles sidebar to the next state in sequence
 */
export function handleSidebarToggle() {
  const current = getSidebarState();
  const currentIndex = SIDEBAR_STATES.indexOf(current);
  const nextIndex = (currentIndex + 1) % SIDEBAR_STATES.length;
  /** @type {'expanded' | 'icon' | 'collapsed'} */
  const next = SIDEBAR_STATES[nextIndex];

  console.log(`🔁 Sidebar toggle: ${current} → ${next}`);
  setSidebarState(next);
  applySidebarState(next);
}

/**
 * 🧩 Force sidebar to a specific state programmatically
 * @param {'expanded' | 'icon' | 'collapsed'} state
 */
export function forceSidebarState(state) {
  console.log(`🔪 Forcing sidebar to: ${state}`);
  setSidebarState(state);
  applySidebarState(state);
}

/**
 * 🖱️ Initialize sidebar toggle button and keyboard shortcuts
 */
export function initSidebarToggle() {
  const { minimizeBtn } = querySidebarElements();

  if (!minimizeBtn) {
    console.warn('❌ initSidebarToggle(): Minimize button not found');
    return;
  }

  minimizeBtn.addEventListener('click', () => {
    console.log(`🔘 Minimize button clicked (state: ${getSidebarState()})`);
    handleSidebarToggle();
  });

  initSidebarShortcuts();
}

/**
 * ⌨️ Adds optional keyboard shortcuts for dev/test use
 * [ → toggle forward
 * ] → toggle forward (duplicate for convenience)
 */
export function initSidebarShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === '[' || e.key === ']') {
      console.log(`⌨️ Sidebar shortcut key: ${e.key}`);
      handleSidebarToggle();
    }
  });
}
