/**
 * 404 Component — returns a DOM element
 */
import { createPage } from '@utils/index.js';

export default function NotFoundPage() {
  const content = `
    <div class="text-center py-20 font-body text-[var(--color-text)]">
      <h1 class="text-4xl font-header text-red-600 mb-4">404</h1>
      <p class="text-lg">Oops! The page you're looking for doesn't exist.</p>
      <a href="#/dashboard" class="inline-block mt-6 text-blue-600 underline">← Back to Dashboard</a>
    </div>
  `;

  return createPage({
    name: '404 Not Found',
    content,
  });
}
