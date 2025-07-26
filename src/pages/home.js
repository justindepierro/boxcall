// src/pages/home.js
import { createPage } from '@utils/index.js';

export default function renderHomePage() {
  const content = `
    <div class="p-6 text-center space-y-4">
      <h1 class="text-3xl font-bold text-[var(--color-accent)]">Welcome Home!</h1>
      <p class="text-gray-600">This is the home page.</p>
    </div>
  `;

  return createPage({
    name: 'Home',
    content,
  });
}
