/**
 * Generic Card component for wrapping content with a consistent style.
 * @param {object} props
 * @param {string} [props.title] - Optional card title.
 * @param {string} [props.content] - Inner HTML content of the card.
 * @param {string} [props.footer] - Optional footer content.
 * @param {string} [props.theme='default'] - Theme variant for the card.
 * @param {string} [props.className] - Extra CSS classes for the card.
 * @returns {string}
 */
// src/components/ui/card.js
export function Card({ title = '', content = '', footer = '', className = '' } = {}) {
  return `
    <div class="rounded-md shadow-sm border p-4 bg-[var(--color-card-bg)] text-[var(--color-text)] transition-colors ${className}">
      ${title ? `<h3 class="text-lg font-semibold mb-3">${title}</h3>` : ''}
      <div class="text-sm space-y-2">${content}</div>
      ${footer ? `<div class="border-t mt-3 pt-2 text-right text-xs">${footer}</div>` : ''}
    </div>
  `;
}
