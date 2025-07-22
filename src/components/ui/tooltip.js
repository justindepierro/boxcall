// src/components/ui/tooltip.js

import { initTooltips } from '@utils/tooltipInteractions.js';

/**
 * Creates a tooltip for a given target element.
 * @param {Object} options
 * @param {string|HTMLElement} options.target - The target element or a selector string.
 * @param {string} options.label - The tooltip text.
 * @param {number} [options.delay=0] - Delay in ms before showing tooltip.
 * @param {number} [options.hideDelay=100] - Delay in ms before hiding tooltip.
 */
export function Tooltip({ target, label, delay = 0, hideDelay = 100 }) {
  const targetEl = typeof target === 'string' ? document.querySelector(target) : target;

  if (!(targetEl instanceof HTMLElement)) {
    console.warn(`⚠️ Tooltip: Target not found or invalid →`, target);
    return;
  }

  // Assign the data-tooltip attribute
  targetEl.setAttribute('data-tooltip', label);

  // Use tooltip interactions logic
  initTooltips();

  // Optional show/hide control (if you want manual control)
  let showTimer, hideTimer;
  targetEl.addEventListener('mouseenter', () => {
    clearTimeout(hideTimer);
    showTimer = setTimeout(() => targetEl.dispatchEvent(new Event('mouseenter')), delay);
  });

  targetEl.addEventListener('mouseleave', () => {
    clearTimeout(showTimer);
    hideTimer = setTimeout(() => targetEl.dispatchEvent(new Event('mouseleave')), hideDelay);
  });
}
