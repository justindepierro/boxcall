// src/pages/dashboard/index.js
import { PageContainer } from '@components/layout/pageContainer.js';
import { Card } from '@components/ui/card.js';
import { Tabs } from '@components/ui/tabs.js';
import { createDropdown } from '@components/ui/dropdown.js';
import { Modal } from '@components/ui/modal.js';
import { initPageUI } from '@utils/initPageUI.js';
import { devLog } from '@utils/devLogger';

export default function renderDashboardPage() {
  const content = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Column 1 -->
      <div class="space-y-4 md:space-y-6">
        ${Card({
          title: 'Welcome to BoxCall!',
          subtitle: 'Dashboard Overview',
          content: '<p class="text-sm">Reusable components demo.</p>',
        })}
        ${Card({
          title: 'Collapsible Card',
          content: '<p class="text-sm">Try me!</p>',
          collapsible: true,
        })}
      </div>

      <!-- Column 2 -->
      <div class="space-y-4 md:space-y-6">
        ${Tabs({
          tabs: ['Tab 1', 'Tab 2'],
          contents: ['<p>Tab 1 Content</p>', '<p>Tab 2 Content</p>'],
        })}
        <div class="flex justify-center">
          ${createDropdown({ label: 'Menu', items: ['Action 1', 'Action 2'] }).outerHTML}
        </div>
      </div>

      <!-- Column 3 -->
      <div class="space-y-4 md:space-y-6 text-center">
        ${Card({
          title: 'Modal Demo',
          content: `
            <button id="openModalBtn" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500">
              Open Modal
            </button>
          `,
        })}
      </div>
    </div>
  `;

  const page = PageContainer(content, {
    title: 'Dashboard',
    headerContent: `<button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500">Action</button>`,
  });

  // Initialize UI after DOM insertion
  setTimeout(() => {
    initPageUI();
    const openModalBtn = document.querySelector('#openModalBtn');
    if (openModalBtn) {
      openModalBtn.addEventListener('click', () => {
        const modal = Modal({
          title: 'Demo Modal',
          content: '<p>This is a modal example. Click × to close.</p>',
          onClose: () => devLog('Modal closed.'),
        });
        document.body.appendChild(modal);
      });
    }
  }, 0);

  return page;
}
