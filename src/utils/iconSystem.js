/**
 * Enhanced Lucide Icon System
 *
 * This provides a more dynamic way to use Lucide icons throughout the app.
 * It allows for easier icon discovery and usage with better TypeScript support.
 */

import * as LucideIcons from 'lucide';

import { devWarn } from './devLogger';

/**
 * Cache for created icon elements to improve performance
 */
const iconCache = new Map();

/**
 * Convert camelCase to kebab-case for icon names
 * @param {string} str - camelCase string
 * @returns {string} kebab-case string
 */
function camelToKebab(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase for Lucide component names
 * @param {string} str - kebab-case string
 * @returns {string} camelCase string
 */
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Enhanced icon creation with dynamic Lucide icon support
 *
 * @param {string} name - Icon name (kebab-case or camelCase)
 * @param {Object} options - Icon options
 * @param {string} [options.size] - Size class (default: 'h-5 w-5')
 * @param {string} [options.color] - Color class (default: 'text-current')
 * @param {string} [options.className] - Additional classes
 * @param {number} [options.strokeWidth] - Stroke width (default: 2)
 * @returns {HTMLElement} Icon element
 */
export function createIcon(name, options = {}) {
  const { size = 'h-5 w-5', color = 'text-current', className = '', strokeWidth = 2 } = options;

  // Convert to camelCase if needed for Lucide component lookup
  const camelName = name.includes('-') ? kebabToCamel(name) : name;
  const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);

  // Create cache key
  const cacheKey = `${name}-${size}-${color}-${className}-${strokeWidth}`;

  // Return cached element if available
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey).cloneNode(true);
  }

  // Try to find the icon component
  let IconComponent = LucideIcons[pascalName];

  if (!IconComponent) {
    devWarn(`❌ Icon "${name}" (${pascalName}) not found in Lucide, using Info fallback`);
    IconComponent = LucideIcons.Info;
  }

  // Create wrapper element
  const wrapper = document.createElement('span');
  wrapper.className = 'inline-flex items-center justify-center';

  // Create the SVG element
  const svg = LucideIcons.createElement(IconComponent, {
    class: `${size} ${color} ${className}`.trim(),
    'stroke-width': strokeWidth,
  });

  wrapper.appendChild(svg);

  // Cache the element
  iconCache.set(cacheKey, wrapper.cloneNode(true));

  return wrapper;
}

/**
 * Get all available Lucide icon names in kebab-case
 * Useful for development and debugging
 * @returns {string[]} Array of available icon names
 */
export function getAvailableIcons() {
  return Object.keys(LucideIcons)
    .filter((key) => typeof LucideIcons[key] === 'object' && key !== 'createElement')
    .map(camelToKebab)
    .sort();
}

/**
 * Search for icons by name pattern
 * @param {string} pattern - Search pattern
 * @returns {string[]} Matching icon names
 */
export function searchIcons(pattern) {
  const regex = new RegExp(pattern, 'i');
  return getAvailableIcons().filter((name) => regex.test(name));
}

/**
 * Common icon presets for consistent usage
 */
export const IconPresets = {
  small: { size: 'h-4 w-4' },
  medium: { size: 'h-5 w-5' },
  large: { size: 'h-6 w-6' },
  button: { size: 'h-5 w-5', color: 'text-current' },
  nav: { size: 'h-5 w-5', color: 'text-sidebar-icon' },
  sidebar: { size: 'h-5 w-5', color: 'text-white' },
};

/**
 * Backward compatibility with existing createIconElement function
 * @param {string} name - Icon name
 * @param {string} className - CSS classes
 * @returns {HTMLElement} Icon element
 */
export function createIconElement(name, className = 'h-5 w-5 text-gray-700') {
  return createIcon(name, { className });
}

// Export commonly used icons for easy access
export const CommonIcons = {
  // Navigation
  home: () => createIcon('home', IconPresets.nav),
  dashboard: () => createIcon('layout-dashboard', IconPresets.nav),
  users: () => createIcon('users', IconPresets.nav),
  settings: () => createIcon('settings', IconPresets.nav),

  // Actions
  edit: () => createIcon('edit', IconPresets.button),
  delete: () => createIcon('trash', IconPresets.button),
  save: () => createIcon('save', IconPresets.button),
  cancel: () => createIcon('x', IconPresets.button),

  // UI
  menu: () => createIcon('menu', IconPresets.button),
  close: () => createIcon('x', IconPresets.button),
  back: () => createIcon('arrow-left', IconPresets.button),
  forward: () => createIcon('arrow-right', IconPresets.button),

  // Sidebar
  collapse: () => createIcon('arrow-left-to-line', IconPresets.sidebar),
  expand: () => createIcon('arrow-right-from-line', IconPresets.sidebar),
};
