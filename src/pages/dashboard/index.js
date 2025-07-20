import { Card } from '@components/ui/card.js';
import { DashboardMessages } from '@components/dashboard/DashboardMessages.js';
import { getUser } from '@auth/auth.js';
import { showToast } from '@utils/toast.js';
import { devLog } from '@utils/devLogger.js';

/**
 * Renders the Dashboard page with modular cards.
 * @param {HTMLElement} container
 */
export default async function renderDashboardPage(container) {
  container.innerHTML = '';

  const user = await getUser();
  if (!user) {
    showToast('❌ No user found. Please log in.', 'error');
    return;
  }

  devLog(`✅ Dashboard loaded for user: ${user.email}`);

  // Example messages
  const messages = [
    'Welcome to BoxCall! 🎉',
    'Remember to update your profile in Settings.',
    'New feature: Dev Tools Panel (accessible for dev accounts).',
  ];

  container.innerHTML = `
    <section class="p-6 space-y-4 max-w-2xl mx-auto">
      
      <!-- LEFT COLUMN -->
      <div class="lg:col-span-2 space-y-6">
        ${Card({
          title: `Hello, ${user.email.split('@')[0]} 👋`,
          content: `
            <p class="text-gray-700 dark:text-gray-300">
              Here’s what’s happening with your team and account today.
            </p>
          `,
        })}

        ${Card({
          title: 'Quick Actions',
          content: `
            <div class="grid grid-cols-2 gap-4">
              <button class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-500">
                View Playbook
              </button>
              <button class="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-500">
                Start Practice Mode
              </button>
              <button class="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-500">
                Check Calendar
              </button>
              <button class="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-500">
                Manage Team
              </button>
            </div>
          `,
        })}
      </div>

      <!-- RIGHT COLUMN -->
      <div class="space-y-6">
        ${DashboardMessages(messages)}
      </div>

    </section>
  `;
}
