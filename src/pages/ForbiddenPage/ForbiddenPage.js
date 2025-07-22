// src/pages/ForbiddenPage/ForbiddenPage.js
import { PageContainer } from '@components/layout/pageContainer.js';

/**
 * 403 Forbidden Page
 * @param {string} [message]
 * @returns {HTMLElement}
 */
function ForbiddenPage(message = 'You do not have permission to view this page.') {
  const content = `
    <div class="flex flex-col items-center justify-center text-center py-16 space-y-4">
      <h1 class="text-5xl font-bold text-red-500">403</h1>
      <p class="text-lg text-gray-700">${message}</p>
      <button 
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        onclick="window.location.hash='#/dashboard'">
        Return to Dashboard
      </button>
    </div>
  `;

  return PageContainer(content, {
    title: 'Access Denied',
    className: 'text-center',
    noHeader: true,
  });
}

export default ForbiddenPage; // <-- FIXED (was export function ForbiddenPage)
