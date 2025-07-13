// src/lib/authCard.js

/**
 * Renders a styled card UI shell with a title + slot for form content.
 * @param {string} title
 * @param {string} contentHTML
 * @returns {string} full HTML string
 */
export function authCard(title = '', html = '', subtitle = '') {
  return `
    <div class="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 class="text-xl font-bold mb-2">${title}</h2>
      ${subtitle ? `<p class="text-gray-600 text-sm mb-4">${subtitle}</p>` : ''}
      ${html}
    </div>
  `;
}
