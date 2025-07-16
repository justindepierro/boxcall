// /state/sidebarState.js
// 🧠 Centralized sidebar state manager
// Handles: reading, writing, cycling states like 'expanded', 'icon', and 'collapsed'

const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];
const DEFAULT_STATE = 'expanded';

let sidebarState = DEFAULT_STATE;

/**
 * 📦 Returns the current sidebar state
 * @returns {'expanded' | 'icon' | 'collapsed'}
 */
export function getSidebarState() {
  return sidebarState;
}

/**
 * 💾 Sets the current sidebar state and saves to localStorage
 * @param {'expanded' | 'icon' | 'collapsed'} newState
 */
export function setSidebarState(newState) {
  if (!SIDEBAR_STATES.includes(newState)) {
    console.warn(`❌ Invalid sidebar state: "${newState}".`);
    return;
  }

  sidebarState = newState;
  saveSidebarStateToStorage();
}

/**
 * 🔁 Cycles sidebar state:
 * expanded → icon → collapsed → expanded ...
 */
export function cycleSidebarState() {
  const currentIndex = SIDEBAR_STATES.indexOf(sidebarState);
  const nextIndex = (currentIndex + 1) % SIDEBAR_STATES.length;
  setSidebarState(SIDEBAR_STATES[nextIndex]);
}

/**
 * 📤 Save sidebar state to localStorage
 */
export function saveSidebarStateToStorage() {
  try {
    localStorage.setItem('sidebarState', sidebarState);
  } catch (err) {
    console.warn('⚠️ Failed to save sidebarState to localStorage:', err);
  }
}

/**
 * 📥 Restore sidebar state from localStorage
 */
export function loadSidebarStateFromStorage() {
  try {
    const stored = localStorage.getItem('sidebarState');
    if (SIDEBAR_STATES.includes(stored)) {
      sidebarState = stored;
    }
  } catch (err) {
    console.warn('⚠️ Failed to load sidebarState from localStorage:', err);
  }
}
