import { devWarn, devLog } from '@utils/devLogger.js';

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
    devWarn(`❌ Invalid sidebar state: "${newState}"`);
    return;
  }
  sidebarState = newState;
  localStorage.setItem('sidebarState', sidebarState);
  devLog(`📦 Sidebar state set to: ${newState}`);
}

/**
 * @param {any} value
 * @returns {value is SidebarState}
 */
function isSidebarState(value) {
  return SIDEBAR_STATES.includes(value);
}
/**
 * Loads the sidebar state from localStorage.
 */
export function loadSidebarStateFromStorage() {
  const stored = localStorage.getItem('sidebarState');
  sidebarState = isSidebarState(stored) ? stored : DEFAULT_STATE;
}

/**
 * Cycles through sidebar states: expanded → icon → collapsed → expanded.
 */
export function cycleSidebarState() {
  const current = getSidebarState();
  const index = SIDEBAR_STATES.indexOf(current);
  const nextState = SIDEBAR_STATES[(index + 1) % SIDEBAR_STATES.length];
  setSidebarState(nextState);
  return nextState; // <--- THIS FIXES TS ERROR
}

export function resetSidebarState() {
  sidebarState = DEFAULT_STATE;
  localStorage.removeItem('sidebarState');
}
