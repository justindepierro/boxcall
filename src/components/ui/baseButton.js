// src/components/ui/baseButton.js

// --- Imports ---
import { createIconElement } from '@utils/iconRenderer.js';

/**
 * @typedef {Object} BaseButtonOptions
 * @property {string} [label]
 * @property {string} [icon]
 * @property {string} [iconEnd]
 * @property {string} [iconClass]
 * @property {string} [iconEndClass]
 * @property {string} [variant]
 * @property {string} [size]
 * @property {string} [rounded]
 * @property {boolean} [fullWidth]
 * @property {boolean} [disabled]
 * @property {boolean} [loading]
 * @property {boolean} [iconOnly]
 * @property {boolean} [uppercase]
 * @property {boolean} [selected]
 * @property {boolean} [focused]
 * @property {string} [tooltip]
 * @property {string} [ariaLabel]
 * @property {Function} [onClick]
 * @property {Object<string, string>} [dataAttrs]
 * @property {string} [slotMain]
 * @property {string} [slotStart]
 * @property {string} [slotEnd]
 */

const variantMap = {
  primary: 'bg-[var(--color-accent)] text-white',
  secondary: 'bg-gray-200 text-black',
  outline: 'border border-gray-300 text-black',
  sidebar: `
  bg-transparent text-[var(--color-sidebar-text)]
  hover:bg-[var(--color-sidebar-hover)]
  hover:text-[var(--color-sidebar-text-hover)]
  justify-start
  [&>span]:justify-start
`.trim(),
};

const sizeMap = {
  sm: 'text-sm px-2 py-1',
  md: 'text-base px-3 py-2',
  lg: 'text-lg px-4 py-3',
  sidebar: 'text-base px-4 py-2 gap-2', // Gap for icon + label
};

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

// --- Main Function ---
/**
 * Fully featured, theme-aware, accessible button component.
 * @param {BaseButtonOptions} options
 * @returns {HTMLButtonElement}
 */
export function BaseButton(options) {
  const {
    label = '',
    icon = '',
    iconEnd = '',
    iconClass = 'h-5 w-5',
    iconEndClass = 'h-5 w-5',
    variant = 'primary',
    size = 'md',
    rounded = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    iconOnly = false,
    uppercase = false,
    selected = false,
    focused = false,
    tooltip = '',
    ariaLabel = '',
    onClick = null,
    dataAttrs = {},
    slotMain = '',
    slotStart = '',
    slotEnd = '',
  } = options;

  /** @type {HTMLButtonElement} */
  const btn = document.createElement('button');
  btn.type = 'button';

  applyAccessibility(btn, { iconOnly, ariaLabel, tooltip });
  applyButtonClasses(btn, {
    variant,
    size,
    rounded,
    uppercase,
    fullWidth,
    disabled,
    loading,
    iconOnly,
    selected,
    focused,
  });
  setButtonContent(btn, {
    slotMain,
    slotStart,
    slotEnd,
    loading,
    icon,
    iconClass,
    label,
    iconOnly,
    iconEnd,
    iconEndClass,
  });
  applyBehavior(btn, { disabled, loading, onClick });
  applyDataAttributes(btn, dataAttrs);

  return btn;
}

// --- Helper Functions ---
function applyAccessibility(btn, { iconOnly, ariaLabel, tooltip }) {
  if (iconOnly && ariaLabel) {
    btn.setAttribute('aria-label', ariaLabel);
    btn.title = tooltip || ariaLabel;
  } else if (tooltip) {
    btn.title = tooltip;
  }
}

function applyButtonClasses(
  btn,
  { variant, size, rounded, uppercase, fullWidth, disabled, loading, iconOnly, selected, focused }
) {
  btn.className = `
    base-btn inline-flex items-center ${variant === 'sidebar' ? 'justify-start' : 'justify-center'}
    font-medium transition-all
    ${variantMap[variant] || variantMap.primary}
    ${sizeMap[size] || sizeMap.md}
    ${roundedMap[rounded] || 'rounded'}
    ${uppercase ? 'uppercase' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : variant !== 'sidebar' ? 'hover:brightness-105' : ''}
    ${iconOnly ? 'p-2 w-auto h-auto' : 'gap-2'}
    ${selected ? 'ring-2 ring-[var(--color-accent)]' : ''}
    ${focused ? 'outline outline-2 outline-[var(--color-accent)]' : ''}
  `.trim();
}

function setButtonContent(
  btn,
  { slotMain, slotStart, slotEnd, loading, icon, iconClass, label, iconOnly, iconEnd, iconEndClass }
) {
  btn.innerHTML = '';

  if (slotMain) {
    appendSlots(btn, slotStart, slotMain, slotEnd);
    return;
  }

  if (loading) {
    renderLoadingState(btn, { slotStart, slotEnd, iconOnly, iconClass });
    return;
  }

  renderDefaultContent(btn, {
    slotStart,
    slotEnd,
    icon,
    iconClass,
    label,
    iconOnly,
    iconEnd,
    iconEndClass,
  });
}

function appendSlots(btn, slotStart, slotMain, slotEnd) {
  const temp = document.createElement('div');
  temp.innerHTML = `${slotStart || ''}${slotMain || ''}${slotEnd || ''}`;
  [...temp.childNodes].forEach((n) => btn.appendChild(n));
}

function renderLoadingState(btn, { slotStart, slotEnd, iconOnly, iconClass }) {
  if (slotStart) appendHTML(btn, slotStart);

  const spinner = document.createElement('span');
  spinner.className = 'animate-spin';
  spinner.appendChild(createIconElement('loader', iconClass)); // From iconRenderer
  btn.appendChild(spinner);

  if (!iconOnly) {
    const span = document.createElement('span');
    span.textContent = 'Loading...';
    btn.appendChild(span);
  }

  if (slotEnd) appendHTML(btn, slotEnd);
}

function renderDefaultContent(
  btn,
  { slotStart, slotEnd, icon, iconClass, label, iconOnly, iconEnd, iconEndClass }
) {
  if (slotStart) {
    appendHTML(btn, slotStart);
  } else if (icon) {
    btn.appendChild(createIconElement(icon, iconClass)); // From iconRenderer
  }

  if (label) {
    const span = document.createElement('span');
    span.textContent = label;
    if (iconOnly) {
      span.classList.add('hidden'); // Hide when iconOnly
    }
    btn.appendChild(span);
  }

  if (iconEnd) btn.appendChild(createIconElement(iconEnd, iconEndClass)); // From iconRenderer
  if (slotEnd) appendHTML(btn, slotEnd);
}

function applyBehavior(btn, { disabled, loading, onClick }) {
  btn.disabled = disabled || loading;
  if (onClick) btn.addEventListener('click', (e) => onClick(e));
}

function applyDataAttributes(btn, dataAttrs) {
  for (const [key, val] of Object.entries(dataAttrs)) {
    btn.dataset[key] = val;
  }
}

// --- Utilities ---
function appendHTML(el, html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  [...temp.childNodes].forEach((node) => el.appendChild(node));
}
