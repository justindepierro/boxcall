import { renderIcon } from '@utils/iconRenderer.js';

/**
 * Renders a button element with flexible props.
 *
 * @param {Object} options
 * @param {string} options.label - Button text
 * @param {string} [options.icon] - Lucide icon name
 * @param {string} [options.variant='primary'] - Button style variant
 * @param {string} [options.size='md'] - Button size
 * @param {boolean} [options.fullWidth=false] - Stretch to full width
 * @param {boolean} [options.disabled=false] - Disable the button
 * @param {boolean} [options.loading=false] - Show loading spinner
 * @param {Function} [options.onClick] - Click handler
 * @returns {HTMLButtonElement}
 */
export function BaseButton({
  label,
  icon,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
}) {
  const btn = document.createElement('button');
  btn.type = 'button';

  // 🎨 Base classes
  btn.className = `
    base-btn
    ${variantMap[variant] || variantMap.primary}
    ${sizeMap[size] || sizeMap.md}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-105'}
    flex items-center gap-2 px-4 py-2 rounded transition
  `.trim();

  // 🧩 Icon
  if (icon && !loading) {
    btn.innerHTML = `
      ${renderIcon(icon, 18)}
      <span>${label}</span>
    `;
  } else if (loading) {
    btn.innerHTML = `
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">${renderIcon('Loader', 16)}</svg>
      <span>Loading...</span>
    `;
  } else {
    btn.textContent = label;
  }

  // ⚙️ Behavior
  if (disabled) btn.disabled = true;
  if (onClick) btn.addEventListener('click', onClick);

  return btn;
}

// 🧾 Style variants
const variantMap = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-100 text-gray-800',
  danger: 'bg-red-600 text-white',
  outline: 'border border-gray-400 text-gray-800',
};

// 📏 Size variants
const sizeMap = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-5 py-3',
};
