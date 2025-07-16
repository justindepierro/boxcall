// src/components/sidebar/sidebarUtils.js

/**
 * 🧠 Returns the current page ID from the URL hash.
 * Example: #/dashboard → 'dashboard'
 */
export function getCurrentPage() {
  const hash = location.hash.replace(/^#\/?/, '').split('/')[0];
  return hash || 'dashboard';
}

/**
 * 🎭 Shows or hides a list of elements using `.hidden`
 * @param {NodeListOf<HTMLElement>} elements
 * @param {boolean} show - true to show, false to hide
 */
export function toggleElementsVisibility(elements, show = true) {
  if (!elements?.length) return;
  elements.forEach((el) => el.classList.toggle('hidden', !show));
}

/**
 * 🖊️ Safely updates textContent of a DOM element
 * @param {HTMLElement | null} el
 * @param {string} text
 */
export function safeSetText(el, text) {
  if (el) el.textContent = text;
}

/**
 * 🧩 Queries all major sidebar DOM parts and returns them in one object
 * Used for state handling and layout control
 *
 * @returns {{
 *   outer: HTMLElement | null,
 *   sidebar: HTMLElement | null,
 *   mainContent: HTMLElement | null,
 *   labels: NodeListOf<HTMLElement>,
 *   icons: NodeListOf<HTMLElement>,
 *   title: HTMLElement | null,
 *   minimizeBtn: HTMLElement | null
 * }}
 */
export function querySidebarElements() {
  const outer = document.getElementById('sidebar-root');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('page-view');
  const labels = document.querySelectorAll('.nav-label');
  const icons = document.querySelectorAll('.nav-icon');
  const title = document.querySelector('.sidebar-title');
  const minimizeBtn = document.getElementById('sidebar-minimize');

  if (!sidebar || !outer || !mainContent || !minimizeBtn) {
    console.warn('⚠️ querySidebarElements(): Some required sidebar parts are missing.', {
      outer,
      sidebar,
      mainContent,
      labels,
      icons,
      title,
      minimizeBtn,
    });
    return null;
  }

  return { outer, sidebar, mainContent, labels, icons, title, minimizeBtn };
}

export function adjustSidebarButtons(newState) {
  const sidebar = document.getElementById('sidebar');
  const width = sidebar?.offsetWidth || 0;

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.remove('gap-2', 'justify-start', 'justify-center', 'pl-4', 'px-2', 'px-1');

    // Decide alignment based on sidebar width
    const isNarrow = width <= 64;
    btn.classList.add(isNarrow ? 'justify-center' : 'justify-start');

    if (newState === 'expanded') {
      btn.classList.add('gap-2', 'pl-4');
    } else if (newState === 'icon') {
      btn.classList.add('px-2');
    } else if (newState === 'collapsed') {
      btn.classList.add('px-1');
    }
  });
}

export function updateSidebarVisibility({ labels, icons, title }, newState) {
  const isExpanded = newState === 'expanded';
  const isCollapsed = newState === 'collapsed';

  toggleElementsVisibility(labels, isExpanded);
  toggleElementsVisibility(icons, !isCollapsed);
  title?.classList.toggle('hidden', !isExpanded);

  const toggleWrapper = document.getElementById('sidebar-toggle-wrapper');
  const allSidebarChildren = Array.from(document.getElementById('sidebar')?.children || []);
  const brand = document.getElementById('sidebar-brand');
  if (brand) {
    brand.style.display = isExpanded ? 'inline' : 'none';
  }
  allSidebarChildren.forEach((child) => {
    if (newState === 'collapsed') {
      // 👇 Only keep the toggle wrapper visible, hide all others
      child.style.display = child.contains(toggleWrapper) ? 'flex' : 'none';
    } else {
      child.style.display = '';
    }
  });
}

export function applyDynamicSidebarWidth() {
  const sidebar = document.getElementById('sidebar');
  const labelEls = document.querySelectorAll('.nav-btn .label'); // assuming each label has class 'label'

  if (!sidebar || !labelEls.length) return;

  let maxWidth = 0;

  labelEls.forEach((label) => {
    const width = label.offsetWidth;
    if (width > maxWidth) maxWidth = width;
  });

  const paddingBuffer = 64; // ⬅️ adjust as needed
  const totalWidth = maxWidth + paddingBuffer;

  sidebar.style.width = `${totalWidth}px`;
}
