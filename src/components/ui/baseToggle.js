/**
 * Renders a flexible, accessible toggle switch.
 * @param {Object} options - Config object for the toggle.
 * @param {boolean} [options.checked=false] - Initial checked state.
 * @param {Function} [options.onChange] - Callback fired on toggle change with the new checked value.
 * @param {string} [options.label=''] - Optional label text displayed next to the toggle.
 * @param {'sm'|'md'|'lg'} [options.size='md'] - Size of the toggle.
 * @param {'primary'|'danger'|'neutral'} [options.variant='primary'] - Color variant for toggle when checked.
 * @param {boolean} [options.disabled=false] - Disables interaction when true.
 * @param {boolean} [options.focused=false] - Adds visual focus outline when true.
 * @param {boolean} [options.selected=false] - Adds a "selected" highlight (extra ring).
 * @param {string} [options.tooltip=''] - Tooltip text shown on hover.
 * @param {Object} [options.dataAttrs={}] - Custom dataset attributes to apply to the button.
 * @returns {HTMLDivElement} - A wrapper <div> containing the toggle button and optional label.
 */
export function BaseToggle({
  checked = false,
  onChange = null,
  label = '',
  size = 'md',
  variant = 'primary',
  disabled = false,
  focused = false,
  selected = false,
  tooltip = '',
  dataAttrs = {},
} = {}) {
  // === Outer wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'inline-flex items-center gap-2';

  // === Toggle button
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', String(checked));
  toggle.setAttribute('aria-label', label || 'Toggle switch');

  if (disabled) toggle.setAttribute('aria-disabled', 'true');
  if (tooltip) toggle.title = tooltip;

  // Apply dataset attributes
  for (const [key, val] of Object.entries(dataAttrs)) {
    toggle.dataset[key] = val;
  }

  // === Track styles (outer toggle background)
  toggle.className = `
    relative inline-flex flex-shrink-0 items-center transition-colors rounded-full
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-105'}
    ${sizeMap[size]?.track || sizeMap.md.track}
    ${checked ? colorMap[variant] || colorMap.primary : 'bg-gray-300'}
    ${selected ? 'ring-2 ring-[var(--color-accent)]' : ''}
    ${focused ? 'outline outline-2 outline-[var(--color-accent)]' : ''}
  `.trim();

  // === Thumb styles (the inner circle that slides)
  const thumb = document.createElement('span');
  thumb.className = `
    inline-block transform rounded-full bg-white shadow transition-transform
    ${sizeMap[size]?.thumb || sizeMap.md.thumb}
    ${checked ? sizeMap[size].thumbTranslate : ''}
  `.trim();

  toggle.appendChild(thumb);
  wrapper.appendChild(toggle);

  // === Label (optional)
  if (label) {
    const span = document.createElement('span');
    span.textContent = label;
    span.className = 'select-none text-[var(--color-text)]';
    wrapper.appendChild(span);
  }

  // === Toggle click handler
  toggle.addEventListener('click', () => {
    if (disabled) return;

    // Flip state
    checked = !checked;

    // Update aria-checked
    toggle.setAttribute('aria-checked', String(checked));

    // Update track color
    if (checked) {
      toggle.classList.add(colorMap[variant] || colorMap.primary);
      toggle.classList.remove('bg-gray-300');
    } else {
      toggle.classList.remove(colorMap[variant] || colorMap.primary);
      toggle.classList.add('bg-gray-300');
    }

    // Update thumb position
    thumb.classList.toggle(sizeMap[size].thumbTranslate, checked);

    // Fire external onChange callback if defined
    if (typeof onChange === 'function') {
      onChange(checked);
    }
  });

  return wrapper;
}

/* 🎨 Color variants for toggle track */
const colorMap = {
  primary: 'bg-[var(--color-accent)]',
  danger: 'bg-red-500',
  neutral: 'bg-gray-500',
};

/* 📏 Size map for track and thumb */
const sizeMap = {
  sm: {
    track: 'h-4 w-8',
    thumb: 'h-3 w-3',
    thumbTranslate: 'translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    thumbTranslate: 'translate-x-5',
  },
  lg: {
    track: 'h-8 w-14',
    thumb: 'h-7 w-7',
    thumbTranslate: 'translate-x-6',
  },
};
