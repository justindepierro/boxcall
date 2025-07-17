// src/components/ui/BaseButton.js
import { createIconElement } from '@utils/iconRenderer.js';

/**
 * Fully featured, theme-aware, accessible button component.
 *
 * @param {Object} options
 * @param {string} [options.label] - Visible text (ignored if slotMain is used)
 * @param {string} [options.icon] - Lucide icon name (placed before label)
 * @param {string} [options.iconEnd] - Icon after the label
 * @param {string} [options.variant='primary']
 * @param {string} [options.size='md']
 * @param {boolean} [options.fullWidth=false]
 * @param {boolean} [options.disabled=false]
 * @param {boolean} [options.loading=false]
 * @param {boolean} [options.iconOnly=false]
 * @param {boolean} [options.selected=false]
 * @param {boolean} [options.focused=false]
 * @param {boolean} [options.uppercase=false]
 * @param {string}  [options.rounded='md']
 * @param {string}  [options.tooltip] - Shown on hover
 * @param {string}  [options.ariaLabel] - Required for icon-only
 * @param {Object}  [options.dataAttrs] - Custom data-* attributes
 * @param {string}  [options.slotStart] - HTML before label
 * @param {string}  [options.slotMain] - Replaces label + icon
 * @param {string}  [options.slotEnd] - HTML after label
 * @param {Function} [options.onClick]
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
  const btn = document.createElement('button');
  btn.type = 'button';

  // ✅ Accessibility
  if (iconOnly && ariaLabel) {
    btn.setAttribute('aria-label', ariaLabel);
    btn.title = tooltip || ariaLabel;
  } else if (tooltip) {
    btn.title = tooltip;
  }

  // 🧼 Tailwind classes
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

  // 🧩 Build content
  btn.innerHTML = ''; // clear first

  // Slot overrides everything
  if (slotMain) {
    const temp = document.createElement('div');
    temp.innerHTML = `${slotStart}${slotMain}${slotEnd}`;
    [...temp.childNodes].forEach((n) => btn.appendChild(n));
  } else if (loading) {
    if (slotStart) {
      const temp = document.createElement('div');
      temp.innerHTML = slotStart;
      [...temp.childNodes].forEach((n) => btn.appendChild(n));
    }

    const spinner = document.createElement('span');
    spinner.className = 'animate-spin h-4 w-4';
    spinner.appendChild(createIconElement('loader', 16));
    btn.appendChild(spinner);

    if (!iconOnly) {
      const span = document.createElement('span');
      span.textContent = 'Loading...';
      btn.appendChild(span);
    }

    if (slotEnd) {
      const temp = document.createElement('div');
      temp.innerHTML = slotEnd;
      [...temp.childNodes].forEach((n) => btn.appendChild(n));
    }
  } else {
    if (slotStart) {
      const temp = document.createElement('div');
      temp.innerHTML = slotStart;
      [...temp.childNodes].forEach((n) => btn.appendChild(n));
    } else if (icon) {
      btn.appendChild(createIconElement(icon, 18));
    }

    if (label && !iconOnly) {
      const span = document.createElement('span');
      span.textContent = label;
      btn.appendChild(span);
    }

    if (iconEnd) {
      btn.appendChild(createIconElement(iconEnd, 18));
    }

    if (slotEnd) {
      const temp = document.createElement('div');
      temp.innerHTML = slotEnd;
      [...temp.childNodes].forEach((n) => btn.appendChild(n));
    }
  }

  // ⚙️ Behavior
  if (disabled || loading) btn.disabled = true;
  if (onClick) btn.addEventListener('click', onClick);

  // 🧩 data-* attributes
  for (const [key, val] of Object.entries(dataAttrs)) {
    btn.dataset[key] = val;
  }

  return btn;
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
