// src/pages/Home.js
import { renderHeader } from '../components/header.js';
//import renderHomePage from "./home/index.js";

export function HomePage() {
  return `
    ${renderHeader}
    <main class="p-6">
      <h1 class="text-2xl font-semibold">Welcome to BoxCall</h1>
    </main>
  `;
}
