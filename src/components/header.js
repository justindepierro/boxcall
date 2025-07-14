// src/components/Header.js

export function renderHeader() {
  const container = document.createElement('header');

  container.className = `
    w-full px-6 py-4 flex items-center justify-between
    border-b font-header
    text-xl md:text-2xl 
    bg-white text-black
    dark:bg-gray-950 dark:text-white
    transition-colors duration-300
  `;

  container.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-3xl">📦</span>
      <h1 class="tracking-tight font-semibold">BoxCall</h1>
    </div>

    <div class="text-sm font-body text-right hidden sm:block">
      <div>Powered by Coaches</div>
      <div class="text-xs text-gray-500 dark:text-gray-400">v0.1 Beta</div>
    </div>
  `;

  return container;
}
