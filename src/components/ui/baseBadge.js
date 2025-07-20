// src/components/ui/BaseBadge.js

/**
 * Creates a reusable badge element.
 *
 * @param {Object} config
 * @param {string} [config.text=''] - Text inside the badge.
 * @param {string} [config.variant='default'] - Color variant: 'default', 'primary', 'success', 'warning', 'error'.
 * @param {string} [config.size='sm'] - Size variant: 'sm', 'md', 'lg'.
 * @param {string} [config.className=''] - Additional Tailwind classes.
 * @param {HTMLElement} [config.icon=null] - Optional icon to prepend.
 * @returns {HTMLSpanElement} The badge element.
 */
export function BaseBadge({
  text = '',
  variant = 'default',
  size = 'sm',
  className = '',
  icon = null,
} = {}) {
  const badge = document.createElement('span');

  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  badge.className = `
    inline-flex items-center gap-1 rounded-full font-semibold shadow-sm
    ${variantClasses[variant] || variantClasses.default}
    ${sizeClasses[size] || sizeClasses.sm}
    ${className}
  `.trim();

  // Add icon if provided
  if (icon instanceof HTMLElement) {
    badge.appendChild(icon);
  }

  // Add text
  if (text) {
    const textEl = document.createElement('span');
    textEl.textContent = text;
    badge.appendChild(textEl);
  }

  return badge;
}
