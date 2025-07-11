// src/render/layout.js
//import { renderSidebar } from '../components/sidebar.js'

export function withSidebar(contentHTML) {
  return `
    <div class="flex h-screen">
      <div id="sidebar-root" class="w-64"></div>
      <main class="flex-1 p-6 overflow-y-auto">
        ${contentHTML}
      </main>
    </div>
  `
}