// Global test setup for Vitest
// - Adds jest-dom matchers (e.g., toBeInTheDocument)
// - Can host other global test config/mocks later
import "@testing-library/jest-dom/vitest";
// Load global styles so getComputedStyle in JSDOM sees our Tailwind utilities and tokens
import "../index.css";
