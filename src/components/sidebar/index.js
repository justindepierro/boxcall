// src/components/sidebar/index.js

// Modern consolidated sidebar (recommended)
export {
  initSidebar,
  destroySidebar,
  getSidebarState,
  setSidebarState,
  toggleSidebar,
  refreshSidebar,
} from './modernSidebar.js';

// Legacy exports (deprecated - will be removed)
export { renderSidebar } from './renderSidebar.js';
export { applySidebarState } from './sidebarStateController.js';
export { forceSidebarState, initSidebarToggle } from './sidebarToggleHandler.js';
