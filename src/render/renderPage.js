// src/render/renderPage.js
import { clearAllUIZones } from '@render/UIZones.js';
import { PageWrapper } from '@components/layout/pageWrapper.js';
import { devError, devLog, devWarn } from '@utils/devLogger';

export function renderPage({ component, container, props = {} }) {
  if (!(container instanceof HTMLElement)) {
    devError('❌ renderPage(): Invalid container ${ontainer}');
    return;
  }

  clearAllUIZones();
  container.innerHTML = '';

  let content;
  try {
    content = component(container, props);
    // Pass container first, so components can mutate it directly.
  } catch (err) {
    console.error('❌ renderPage(): Component threw an error during render()', err);
    container.innerHTML = `<p class="text-red-500 text-center">Error loading page.</p>`;
    return;
  }

  // If component returns something, validate it
  if (content instanceof HTMLElement) {
    const wrapped = PageWrapper(content);
    container.innerHTML = '';
    container.appendChild(wrapped);
  } else if (content !== undefined) {
    devWarn('⚠️ renderPage(): Component returned a non-HTMLElement value ${content}');
  }

  devLog(`✅ Page rendered into #${container.id || container.tagName.toLowerCase()}`);
}
