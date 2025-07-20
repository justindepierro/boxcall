import { Card } from '@components/ui/card.js';

/**
 * Renders a dashboard messages widget.
 * @param {string[]} messages - List of dashboard messages.
 * @returns {string}
 */
export function DashboardMessages(messages = []) {
  const content = messages.length
    ? messages
        .map((msg) => `<div class="p-2 border-b border-gray-200 last:border-none">${msg}</div>`)
        .join('')
    : '<p class="text-gray-500 text-sm">No updates available.</p>';

  return Card({
    title: 'Latest Updates',
    content,
  });
}
