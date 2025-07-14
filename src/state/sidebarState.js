// /state/sidebarState.js
// 🧠 This module centralizes all logic related to the sidebar's visibility state
// It provides helper functions to read, write, and cycle through sidebar modes
// Modes include:
// - 'expanded' (full width with labels)
// - 'icon' (narrow with icons only)
// - 'collapsed' (fully hidden or overlayed)

// ✅ Default sidebar state — used on page load unless overridden by user preference or device size
let sidebarState = 'expanded'; // possible values: 'expanded' | 'icon' | 'collapsed'

/**
 * Returns the current sidebar state
 * @returns {string} sidebarState
 */
export function getSidebarState() {
  return sidebarState;
}

/**
 * Sets a new sidebar state
 * Also a future hook point for saving to localStorage or persisting across sessions
 * @param {string} newState - one of 'expanded', 'icon', or 'collapsed'
 */
export function setSidebarState(newState) {
  // ⛑️ Optional: add validation here if needed
  sidebarState = newState;
}

/**
 * Cycles the sidebar state in order:
 * expanded ➝ icon ➝ collapsed ➝ expanded ...
 * Useful for minimizing logic tied to a single toggle button
 */
export function cycleSidebarState() {
  if (sidebarState === 'expanded') {
    setSidebarState('icon');
  } else if (sidebarState === 'icon') {
    setSidebarState('collapsed');
  } else {
    setSidebarState('expanded');
  }
}
