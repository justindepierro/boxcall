/**
 * Renders a flexible, accessible toggle switch.
 * @param {Object} options
 * @param {boolean} [options.checked=false]
 * @param {Function} [options.onChange]
 * @param {string} [options.label]
 * @param {string} [options.size='md']
 * @param {string} [options.variant='primary']
 * @param {boolean} [options.disabled=false]
 * @param {boolean} [options.focused=false]
 * @param {boolean} [options.selected=false]
 * @param {string} [options.tooltip]
 * @param {Object} [options.dataAttrs] - Optional dataset
 * @returns {HTMLDivElement}
 */
export function BaseToggle({
  checked = false,
  onChange,
  label = '',
  size = 'md',
  variant = 'primary',
  disabled = false,
  focused = false,
  selected = false,
  tooltip = '',
  dataAttrs = {},
} = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'inline-flex items-center gap-2';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', checked);

  if (tooltip) toggle.title = tooltip;
  for (const [key, val] of Object.entries(dataAttrs)) {
    toggle.dataset[key] = val;
  }

  toggle.className = `
    relative inline-flex flex-shrink-0 items-center transition-colors rounded-full
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-105'}
    ${sizeMap[size]?.track || sizeMap.md.track}
    ${checked ? colorMap[variant] || colorMap.primary : 'bg-gray-300'}
    ${selected ? 'ring-2 ring-[var(--color-accent)]' : ''}
    ${focused ? 'outline outline-2 outline-[var(--color-accent)]' : ''}
  `.trim();

  const thumb = document.createElement('span');
  thumb.className = `
    inline-block transform rounded-full bg-white shadow transition-transform
    ${sizeMap[size]?.thumb || sizeMap.md.thumb}
    ${checked ? sizeMap[size].thumbTranslate : ''}
  `.trim();

  toggle.appendChild(thumb);
  wrapper.appendChild(toggle);

  if (label) {
    const span = document.createElement('span');
    span.textContent = label;
    span.className = 'select-none text-[var(--color-text)]';
    wrapper.appendChild(span);
  }

  toggle.addEventListener('click', () => {
    if (disabled) return;
    checked = !checked;
    toggle.setAttribute('aria-checked', checked);
    toggle.classList.toggle(colorMap[variant], checked);
    toggle.classList.toggle('bg-gray-300', !checked);
    thumb.classList.toggle(sizeMap[size].thumbTranslate, checked);
    if (onChange) onChange(checked);
  });

  return wrapper;
}

// 🎨 Color variants
const colorMap = {
  primary: 'bg-[var(--color-accent)]',
  danger: 'bg-red-500',
  neutral: 'bg-gray-500',
};

// 📏 Size map for track and thumb
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
