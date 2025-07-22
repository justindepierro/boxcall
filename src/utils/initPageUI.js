// src/utils/initPageUI.js

import { initCollapsibleCards } from './cardInteractions.js';
import { initTooltips } from './tooltipInteractions.js';
import { initModals } from './modalInteractions.js';
import { initDropdowns } from './dropDownInteractions.js';
import { initTabs } from './tabInteractions.js';
import { devLog } from './devLogger.js';

/**
 * Initializes all shared UI behaviors on page load.
 * This should be called after rendering any page content.
 */
export function initPageUI() {
  devLog('🎨 initPageUI(): Initializing shared UI components...');

  // Collapsible cards
  initCollapsibleCards();

  // Tooltips
  initTooltips();

  // Modals
  initModals();

  // Dropdowns
  initDropdowns();

  // Tabs
  initTabs();
}
