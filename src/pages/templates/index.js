// src/pages/templates/index.js
import { createPage } from '@utils/index.js';

export default function renderTemplatesPage() {
  const content = `
    <div class="p-6 text-center">
      <h1 class="text-2xl font-bold text-[var(--color-accent)]">Templates Page</h1>
      <p class="mt-4 text-gray-600">Template management coming soon...</p>
    </div>
  `;

  return createPage({
    name: 'Templates',
    content,
  });
}
