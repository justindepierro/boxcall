export function querySidebarElements() {
  const outer = document.getElementById('sidebar-root');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('page-view');
  const labels = document.querySelectorAll('.nav-label');
  const icons = document.querySelectorAll('.nav-icon');
  const title = document.getElementById('sidebar-brand');
  const minimizeBtn = document.getElementById('sidebar-minimize');

  return { outer, sidebar, mainContent, labels, icons, title, minimizeBtn };
}

export function adjustSidebarButtons(state) {
  const buttons = document.querySelectorAll('.nav-btn');

  buttons.forEach((btn) => {
    btn.classList.remove('justify-center', 'justify-start', 'px-2', 'px-4');
    btn.classList.add('items-center', 'transition', 'rounded', 'hover:bg-[var(--color-accent)]');

    if (state === 'expanded') {
      btn.classList.add('justify-start', 'gap-2', 'px-4');
    } else {
      btn.classList.add('justify-center', 'px-2');
    }
  });
}

export function updateSidebarVisibility({ labels, icons, title }, newState) {
  const isExpanded = newState === 'expanded';
  const isCollapsed = newState === 'collapsed';

  toggleElementsVisibility(labels, isExpanded);
  toggleElementsVisibility(icons, !isCollapsed);

  if (title) title.classList.toggle('hidden', !isExpanded);

  const brand = document.getElementById('sidebar-brand');
  if (brand) brand.style.display = isExpanded ? 'inline' : 'none';
}

function toggleElementsVisibility(elements, visible) {
  elements.forEach((el) => {
    el.classList.toggle('hidden', !visible);
  });
}
