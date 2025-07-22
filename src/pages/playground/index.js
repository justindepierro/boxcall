import { withDevGuard } from '@utils/withDevGuard.js';
import { PageContainer } from '@components/layout/pageContainer.js';
import { Card } from '@components/ui/card.js';
import { Tabs } from '@components/ui/tabs.js';
import { createDropdown } from '@components/ui/dropdown.js';
import { Modal } from '@components/ui/modal.js';
import { initPageUI } from '@utils/initPageUI.js';
import { devLog } from '@utils/devLogger';

/**
 * Playground Page — interactive component showcase
 * @param {HTMLElement} container
 */
function renderPlaygroundPage(container) {
  const content = `
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      
      <!-- Column 1 -->
      <div class="space-y-6">
        ${Card({
          title: 'Interactive Card',
          subtitle: 'Click me!',
          content: `
            <p class="text-sm">This card includes a button to open a modal.</p>
            <button id="playgroundModalBtn" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500">
              Show Modal
            </button>
          `,
        })}

        ${Card({
          title: 'Collapsible Example',
          content: `<p class="text-sm">Toggle this card using the header button.</p>`,
          collapsible: true,
        })}
      </div>

      <!-- Column 2 -->
      <div class="space-y-6">
        ${Tabs({
          tabs: ['Overview', 'Code', 'Play'],
          contents: [
            '<p>Here you can test BoxCall components.</p>',
            '<pre class="text-xs bg-gray-100 p-2 rounded">Sample code block</pre>',
            '<p>Use the dropdown below to trigger events.</p>',
          ],
        })}

        <div class="flex justify-center">
          ${
            createDropdown({
              label: 'Select Action',
              items: ['Alert 1', 'Alert 2', 'Alert 3'],
              onSelect: (item) => alert(`Selected: ${item}`),
            }).outerHTML
          }
        </div>
      </div>

      <!-- Column 3 -->
      <div class="space-y-6">
        ${Card({
          title: 'Tooltip Demo',
          content: `
            <p>Hover over this button to see a tooltip:</p>
            <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500" data-tooltip="I am a tooltip!">
              Hover me
            </button>
          `,
        })}

        ${Card({
          title: 'Playground Zone',
          content: `
            <p class="text-sm">This is a free area to test components.</p>
            <button class="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-500" id="playgroundAlertBtn">
              Click for Alert
            </button>
          `,
        })}
      </div>
    </div>
  `;

  // Wrap in PageContainer
  const page = PageContainer(content, {
    title: 'Playground',
    headerContent: `<span class="text-sm text-gray-500">Experiment with components</span>`,
  });

  container.innerHTML = '';
  container.appendChild(page);

  // Initialize tooltips, dropdowns, tabs, etc.
  initPageUI();

  // Modal example
  const modalBtn = container.querySelector('#playgroundModalBtn');
  if (modalBtn) {
    modalBtn.addEventListener('click', () => {
      const modal = Modal({
        title: 'Playground Modal',
        content: `<p class="text-sm">This is an example modal with BoxCall components.</p>`,
        onClose: () => devLog('Playground modal closed.'),
      });
      document.body.appendChild(modal);
    });
  }

  // Alert example
  const alertBtn = container.querySelector('#playgroundAlertBtn');
  if (alertBtn) {
    alertBtn.addEventListener('click', () => alert('Playground Alert Button clicked!'));
  }
}

// ✅ Export Playground Page with DevGuard
export default withDevGuard(renderPlaygroundPage, {
  fallbackMessage: `
    <div class="text-center py-20">
      <h1 class="text-4xl font-bold text-red-500 mb-4">🚫 Unauthorized</h1>
      <p class="text-lg">You do not have access to this page.</p>
      <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              onclick="window.location.hash='#/dashboard'">
        Go Back
      </button>
    </div>
  `,
});
