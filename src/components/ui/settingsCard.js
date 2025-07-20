/**
 * Creates a reusable card component for settings or forms.
 * @param {string} title - Card title.
 * @param {string} contentHTML - Inner HTML for the card body.
 * @returns {string} - HTML string for the card.
 */
export function SettingsCard(title, contentHTML) {
  return `
    <div class="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-xl font-semibold mb-4">${title}</h3>
      <div class="space-y-4">
        ${contentHTML}
      </div>
    </div>
  `;
}
