// src/pages/Home.js
import { Header } from "../components/header.js";

export function HomePage() {
  return `
    ${Header()}
    <main class="p-6">
      <h1 class="text-2xl font-semibold">Welcome to BoxCall</h1>
    </main>
  `;
}
