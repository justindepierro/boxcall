import { Card } from '@components/ui/card.js';

/**
 * Renders a dashboard messages widget.
 * @param {string[]} messages - List of dashboard messages.
 * @returns {string}
 */
export function DashboardMessages(messages = []) {
  const content = messages.length
    ? messages
        .map(
          (msg) => `
            <div class="px-4 py-3 bg-[var(--color-card-bg-alt)] rounded-md border border-[var(--color-border)] shadow-sm">
              <p class="text-sm text-[var(--color-text)]">${msg}</p>
            </div>
          `
        )
        .join('<div class="h-2"></div>') // small vertical gap between updates
    : '<p class="text-gray-500 text-sm">No updates available.</p>';

  return Card({
    title: 'Latest Updates',
    content,
    collapsible: true, // enable collapsible feature
  });
}
