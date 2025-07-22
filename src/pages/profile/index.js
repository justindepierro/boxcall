import { PageContainer } from '@components/layout/pageContainer.js';
import { Card } from '@components/ui/card.js';
import { devLog } from '@utils/devLogger.js';

/**
 * Profile Page
 * Displays user info, avatar, and quick stats.
 */
export default function renderProfilePage(container) {
  const content = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      
      <!-- Left Column: User Info -->
      <div class="space-y-4 md:space-y-6">
        ${Card({
          title: 'Profile Overview',
          content: `
            <div class="flex flex-col items-center text-center space-y-4">
              <img src="https://via.placeholder.com/100" 
                   alt="User Avatar" 
                   class="w-24 h-24 rounded-full border border-gray-300 shadow" />
              <h2 class="text-xl font-bold text-[var(--color-text)]">John Doe</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">Coach / Admin</p>
              <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500">
                Edit Profile
              </button>
            </div>
          `,
        })}

        ${Card({
          title: 'Quick Stats',
          content: `
            <ul class="text-sm space-y-2">
              <li><strong>Email:</strong> john.doe@example.com</li>
              <li><strong>Teams:</strong> Burke Catholic</li>
              <li><strong>Role:</strong> Head Coach</li>
              <li><strong>Last Login:</strong> 3 hours ago</li>
            </ul>
          `,
        })}
      </div>

      <!-- Middle Column: Badges -->
      <div class="space-y-4 md:space-y-6">
        ${Card({
          title: 'Achievements & Badges',
          content: `
            <div class="grid grid-cols-3 gap-4">
              <div class="flex flex-col items-center space-y-1">
                <span class="text-2xl">🏅</span>
                <p class="text-xs text-gray-500">MVP</p>
              </div>
              <div class="flex flex-col items-center space-y-1">
                <span class="text-2xl">🎯</span>
                <p class="text-xs text-gray-500">Perfect Attendance</p>
              </div>
              <div class="flex flex-col items-center space-y-1">
                <span class="text-2xl">🔥</span>
                <p class="text-xs text-gray-500">PR Streak</p>
              </div>
            </div>
          `,
        })}
      </div>

      <!-- Right Column: Activity -->
      <div class="space-y-4 md:space-y-6">
        ${Card({
          title: 'Recent Activity',
          content: `
            <ul class="text-sm list-disc pl-5 space-y-2">
              <li>Updated Playbook (3 hours ago)</li>
              <li>Added new BoxCall filters (yesterday)</li>
              <li>Earned “MVP” badge (last week)</li>
            </ul>
          `,
        })}
      </div>

    </div>
  `;

  const page = PageContainer(content, {
    title: 'Profile',
    headerContent: `
      <button class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500">
        Settings
      </button>
    `,
  });

  container.innerHTML = '';
  container.appendChild(page);

  devLog('✅ Profile Page Rendered');
}
