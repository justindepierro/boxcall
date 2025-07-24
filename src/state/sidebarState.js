/**
 * @typedef {'expanded' | 'icon' | 'collapsed'} SidebarState
 */

/** @type {SidebarState[]} */
export const SIDEBAR_STATES = ['expanded', 'icon', 'collapsed'];

/** @type {SidebarState} */
export const DEFAULT_STATE = 'icon';

/** @type {SidebarState} */
let sidebarState = DEFAULT_STATE;

/**
 * Returns the current sidebar state.
 * @returns {SidebarState}
 */
export function getSidebarState() {
  return sidebarState;
}

/**
 * Sets the current sidebar state and saves to localStorage.
 * @param {SidebarState} newState
 */
export function setSidebarState(newState) {
  if (!SIDEBAR_STATES.includes(newState)) {
    console.warn(`❌ Invalid sidebar state: "${newState}"`);
    return;
  }
  sidebarState = newState;
  localStorage.setItem('sidebarState', sidebarState);
}

/**
 * Cycles through expanded → icon → collapsed states.
 * @returns {SidebarState}
 */
export function cycleSidebarState() {
  const currentIndex = SIDEBAR_STATES.indexOf(sidebarState);
  const nextIndex = (currentIndex + 1) % SIDEBAR_STATES.length;
  sidebarState = SIDEBAR_STATES[nextIndex];
  localStorage.setItem('sidebarState', sidebarState);
  return sidebarState;
}

/**
 * Loads the sidebar state from localStorage.
 */
export function loadSidebarStateFromStorage() {
  const stored = localStorage.getItem('sidebarState');
  if (isSidebarState(stored)) {
    sidebarState = /** @type {SidebarState} */ (stored); // TS now knows this is valid
  }
}

/**
 * Type guard to check if a value is a SidebarState.
 * @param {string | null} value
 * @returns {value is SidebarState}
 */
function isSidebarState(value) {
  return value !== null && SIDEBAR_STATES.includes(/** @type {SidebarState} */ (value));
}
