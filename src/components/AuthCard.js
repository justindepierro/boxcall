// src/lib/authCard.js

/**
 * Renders a styled card UI shell with a title + slot for form content.
 * @param {string} title
 * @param {string} contentHTML
 * @returns {string} full HTML string
 */
export function authCard(title, contentHTML) {
  return `
    <div class="max-w-md mx-auto mt-10 p-6 bg-white text-black rounded shadow">
      <h1 class="text-2xl font-semibold mb-4">${title}</h1>
      ${contentHTML}
    </div>
  `
}