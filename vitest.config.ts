import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@services": path.resolve(__dirname, "src/services"),
      "@services/": path.resolve(__dirname, "src/services/"),
    },
  },
  test: {
    // Use jsdom so component/unit tests that render React DOM nodes have access
    // to browser APIs. Node env can still be overridden per-file if needed.
    environment: "jsdom",
    include: [
      "src/**/*.spec.ts",
      "src/**/*.spec.tsx",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
    ],
    coverage: {
      reporter: ["text", "lcov"],
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
