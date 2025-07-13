// src/render/renderAppShell.js
import { renderSidebar } from "../components/sidebar.js";

export function renderAppShell(contentHTML) {
  const root = document.getElementById("app");

  root.innerHTML = `
    <div class="flex h-screen">
      <aside id="sidebar-root" class="w-64"></aside>
      <div class="flex-1 overflow-y-auto p-4 bg-gray-100 text-black" id="page-view">
        ${contentHTML}
      </div>
    </div>
  `;

  renderSidebar();
}
