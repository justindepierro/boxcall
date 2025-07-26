// src/pages/dashboard/index.js
import { Card, Tabs, createDropdown, Modal } from '@components/index.js';
import { createPage, devLog } from '@utils/index.js';

export default function renderDashboardPage() {
  // --- Build Content ---
  const content = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
      <!-- Column 1 -->
      <div class="space-y-3 md:space-y-4">
        ${Card({
          title: 'Welcome to BoxCall!',
          subtitle: 'Dashboard Overview',
          content: '<p class="text-sm leading-snug">Reusable components demo.</p>',
        })}
        ${Card({
          title: 'Collapsible Card',
          content: '<p class="text-sm leading-snug">Try me!</p>',
          collapsible: true,
        })}
      </div>

      <!-- Column 2 -->
      <div class="space-y-3 md:space-y-4">
        ${Tabs({
          tabs: ['Tab 1', 'Tab 2'],
          contents: [
            '<p class="text-sm leading-snug">Tab 1 Content</p>',
            '<p class="text-sm leading-snug">Tab 2 Content</p>',
          ],
        })}
        <div class="flex justify-center">
          ${createDropdown({ label: 'Menu', items: ['Action 1', 'Action 2'] }).outerHTML}
        </div>
      </div>

      <!-- Column 3 -->
      <div class="space-y-3 md:space-y-4 text-center">
        ${Card({
          title: 'Modal Demo',
          content: `
            <button id="openModalBtn"
              class="bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-500 transition">
              Open Modal
            </button>
          `,
        })}
      </div>
    </div>
  `;

  // --- Use Modern Page Factory ---
  return createPage({
    name: 'Dashboard',
    content,
    containerOptions: {
      headerContent: `
        <button 
          class="bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-500 text-sm">
          Action
        </button>
      `,
    },
    onMount: (page) => {
      const openModalBtn = page.querySelector('#openModalBtn');
      if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
          const modal = Modal({
            title: 'Demo Modal',
            content:
              '<p class="text-sm leading-snug">This is a modal example. Click × to close.</p>',
            onClose: () => devLog('Modal closed.'),
          });
          document.body.appendChild(modal);
        });
      }
    },
  });
}
