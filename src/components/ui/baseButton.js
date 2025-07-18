// src/components/ui/BaseButton.js
import { createIconElement } from '@utils/iconRenderer.js';

/**
 * @typedef {Object} BaseButtonOptions
 * @property {string} [label]
 * @property {string} [icon]
 * @property {string} [iconEnd]
 * @property {string} [variant='primary']
 * @property {string} [size='md']
 * @property {boolean} [fullWidth=false]
 * @property {boolean} [disabled=false]
 * @property {boolean} [loading=false]
 * @property {boolean} [iconOnly=false]
 * @property {boolean} [selected=false]
 * @property {boolean} [focused=false]
 * @property {boolean} [uppercase=false]
 * @property {string}  [rounded='md']
 * @property {string}  [tooltip]
 * @property {string}  [ariaLabel]
 * @property {Object}  [dataAttrs]
 * @property {string}  [slotStart]
 * @property {string}  [slotMain]
 * @property {string}  [slotEnd]
 * @property {(e: MouseEvent) => void} [onClick]  // <-- Explicit type
 */

/**
 * Fully featured, theme-aware, accessible button component.
 * @param {BaseButtonOptions} options
 * @returns {HTMLButtonElement}
 */
export function BaseButton({
  label,
  icon,
  iconEnd,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  iconOnly = false,
  selected = false,
  focused = false,
  uppercase = false,
  rounded = 'md',
  tooltip = '',
  ariaLabel = '',
  dataAttrs = {},
  slotStart = '',
  slotMain = '',
  slotEnd = '',
  onClick,
}) {
  /** @type {HTMLButtonElement} */
  const btn = document.createElement('button');
  btn.type = 'button';

  // Accessibility
  if (iconOnly && ariaLabel) {
    btn.setAttribute('aria-label', ariaLabel);
    btn.title = tooltip || ariaLabel;
  } else if (tooltip) {
    btn.title = tooltip;
  }

  // Classes
  btn.className = `
    base-btn inline-flex items-center justify-center
    font-medium transition-all
    ${variantMap[variant] || variantMap.primary}
    ${sizeMap[size] || sizeMap.md}
    ${roundedMap[rounded] || 'rounded'}
    ${uppercase ? 'uppercase' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-105'}
    ${iconOnly ? 'p-2 w-auto h-auto' : 'gap-2'}
    ${selected ? 'ring-2 ring-[var(--color-accent)]' : ''}
    ${focused ? 'outline outline-2 outline-[var(--color-accent)]' : ''}
  `.trim();

  // Content
  btn.innerHTML = '';

  // Main slot or label
  if (slotMain) {
    const temp = document.createElement('div');
    temp.innerHTML = `${slotStart}${slotMain}${slotEnd}`;
    [...temp.childNodes].forEach((n) => btn.appendChild(n));
  } else if (loading) {
    if (slotStart) appendHTML(btn, slotStart);

    const spinner = document.createElement('span');
    spinner.className = 'animate-spin h-4 w-4';
    spinner.appendChild(createIconElement('loader', 16));
    btn.appendChild(spinner);

    if (!iconOnly) {
      const span = document.createElement('span');
      span.textContent = 'Loading...';
      btn.appendChild(span);
    }

    if (slotEnd) appendHTML(btn, slotEnd);
  } else {
    if (slotStart) appendHTML(btn, slotStart);
    else if (icon) btn.appendChild(createIconElement(icon, 18));

    if (label && !iconOnly) {
      const span = document.createElement('span');
      span.textContent = label;
      btn.appendChild(span);
    }

    if (iconEnd) btn.appendChild(createIconElement(iconEnd, 18));
    if (slotEnd) appendHTML(btn, slotEnd);
  }

  // Behavior
  if (disabled || loading) btn.disabled = true;
  if (onClick) btn.addEventListener('click', /** @param {MouseEvent} e */ (e) => onClick(e));

  // data-* attributes
  for (const [key, val] of Object.entries(dataAttrs)) {
    btn.dataset[key] = val;
  }

  return btn;
}

// Helper for injecting HTML fragments
function appendHTML(container, html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  [...temp.childNodes].forEach((n) => container.appendChild(n));
}

// 🎨 Variants
const variantMap = {
  primary: 'bg-[var(--color-accent)] text-[var(--color-button-text)]',
  secondary:
    'bg-[var(--color-button-secondary)] text-[var(--color-button-secondary-text)] border border-[var(--color-border)]',
  danger: 'bg-red-600 text-white',
  outline: 'border border-[var(--color-border)] text-[var(--color-text)] bg-transparent',
};

// 📏 Sizes
const sizeMap = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-5 py-3',
};

// 🟠 Rounded map
const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  pill: 'rounded-full',
};
