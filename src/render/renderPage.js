import { devLog } from '@utils/devLogger.js';
import { clearAllUIZones } from '@render/UIZones.js';
import { PageWrapper } from '@components/layout/pageWrapper.js';

/**
 * Renders a given page/component into the app
 * @param {Object} opts
 * @param {Function} opts.component – Must return an HTMLElement
 * @param {string} [opts.containerId='page-content'] – Where to inject the component
 * @param {Object} [opts.props={}] – Props to pass into the component function
 */
export function renderPage({ component, containerId = 'page-content', props = {} }) {
  // 🧼 Clear all overlays (modals, zooms, toasts)
  clearAllUIZones();

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ renderPage(): Missing container #${containerId}`);
    return;
  }

  container.innerHTML = ''; // Clear old content
  const content = component(props);
  if (!(content instanceof HTMLElement)) {
    console.error('❌ renderPage(): Failed — component did not return an HTMLElement');
    return;
  }

  // 🧱 Wrap in layout
  const wrapped = PageWrapper(content);

  container.innerHTML = '';
  container.appendChild(wrapped);

  devLog(`✅ Page rendered into #${containerId}`);
}
