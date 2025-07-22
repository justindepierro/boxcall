import { createIconElement } from '@utils/iconRenderer.js';

let cardIdCounter = 0;

/**
 * Advanced Card Component with updated design:
 * - Square edges
 * - Subtle drop shadow (default variant)
 * - Reduced padding for tighter layout
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {string} [props.content]
 * @param {string} [props.footer]
 * @param {string} [props.icon] - Lucide icon name (kebab-case).
 * @param {string} [props.badge] - Small label displayed in the header.
 * @param {boolean} [props.collapsible]
 * @param {'default'|'elevated'|'outline'|'accent'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.className]
 * @returns {string}
 */
export function Card({
  title = '',
  subtitle = '',
  content = '',
  footer = '',
  icon = '',
  badge = '',
  collapsible = false,
  variant = 'default',
  size = 'md',
  className = '',
} = {}) {
  const variantClasses = {
    default: 'shadow-sm border bg-[var(--color-card-bg)]',
    elevated: 'shadow-md border bg-[var(--color-card-bg)]',
    outline: 'border border-[var(--color-border)] bg-transparent',
    accent: 'border-t-[4px] border-[var(--color-accent)] bg-[var(--color-card-bg)]',
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3',
    lg: 'p-5 text-lg',
  };

  const cardId = `card-${++cardIdCounter}`;
  const collapseAttr = collapsible ? `data-collapsible="true" data-card-id="${cardId}"` : '';

  return `
    <div class="card rounded-none transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}"
      ${collapseAttr}>
      ${renderHeader({ title, subtitle, icon, badge, collapsible, cardId })}
      <div class="card-content mt-2" id="${cardId}-content">${content}</div>
      ${footer ? renderFooter(footer) : ''}
    </div>
  `;
}

/** ---------------- HEADER ---------------- */
function renderHeader({ title, subtitle, icon, badge, collapsible, cardId }) {
  if (!title && !icon) return '';

  const iconHTML = icon
    ? `<span class="icon-wrapper mr-2">${createIconElement(icon, 'h-5 w-5 text-[var(--color-accent)]').outerHTML}</span>`
    : '';

  const collapseToggle = collapsible
    ? `<button class="collapse-btn ml-auto text-xs text-[var(--color-accent)] hover:underline" data-toggle="${cardId}">Toggle</button>`
    : '';

  return `
    <div class="card-header flex items-center gap-2 border-b pb-2">
      ${iconHTML}
      <div class="flex-1">
        ${title ? `<h3 class="font-semibold">${title}</h3>` : ''}
        ${subtitle ? `<p class="text-xs text-gray-500">${subtitle}</p>` : ''}
      </div>
      ${badge ? `<span class="bg-[var(--color-accent)] text-white text-xs px-2 py-0.5 rounded-full">${badge}</span>` : ''}
      ${collapseToggle}
    </div>
  `;
}

/** ---------------- FOOTER ---------------- */
function renderFooter(footer) {
  return `
    <div class="card-footer border-t mt-2 pt-2 text-right">
      ${footer}
    </div>
  `;
}
