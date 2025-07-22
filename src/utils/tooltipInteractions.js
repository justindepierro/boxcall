// src/utils/tooltipInteractions.js

const tooltipMap = new WeakMap();

/**
 * Creates and positions a tooltip element.
 * @param {HTMLElement} el - The target element.
 * @returns {HTMLElement} tooltip
 */
function createTooltip(el) {
  const tooltipText = el.getAttribute('data-tooltip');
  if (!tooltipText) return null;

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = tooltipText;
  document.body.appendChild(tooltip);

  // Position tooltip
  const rect = el.getBoundingClientRect();
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
  tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;

  requestAnimationFrame(() => tooltip.classList.add('show')); // Fade in
  return tooltip;
}

/**
 * Initializes all elements with [data-tooltip] attributes.
 */
export function initTooltips() {
  const tooltips = document.querySelectorAll('[data-tooltip]');

  tooltips.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;

    el.addEventListener('mouseenter', () => {
      const tooltip = createTooltip(el);
      if (tooltip) tooltipMap.set(el, tooltip);
    });

    el.addEventListener('mouseleave', () => {
      const tooltip = tooltipMap.get(el);
      if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.remove(), 150);
        tooltipMap.delete(el);
      }
    });

    el.addEventListener('focus', () => {
      const tooltip = createTooltip(el);
      if (tooltip) tooltipMap.set(el, tooltip);
    });

    el.addEventListener('blur', () => {
      const tooltip = tooltipMap.get(el);
      if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.remove(), 150);
        tooltipMap.delete(el);
      }
    });
  });
}
