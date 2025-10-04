/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@state": path.resolve(__dirname, "src/state"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@design-system": path.resolve(__dirname, "src/design-system"),
      "@adapters": path.resolve(__dirname, "src/adapters"),
      "@data": path.resolve(__dirname, "src/data"),
      "@domain": path.resolve(__dirname, "src/domain"),
      "@features": path.resolve(__dirname, "src/features"),
      "@infra": path.resolve(__dirname, "src/infra"),
      "@services": path.resolve(__dirname, "src/services"),
      "@services/": path.resolve(__dirname, "src/services/"),
      "@telemetry": path.resolve(__dirname, "src/telemetry"),
      "@types": path.resolve(__dirname, "src/types"),
    },
  },
  test: {
    // Use jsdom so component/unit tests that render React DOM nodes have access
    // to browser APIs. Node env can still be overridden per-file if needed.
    environment: "jsdom",
    coverage: {
      reporter: ["text", "lcov"],
    },
    setupFiles: ["./src/test/setup.ts"],
    projects: [
      {
        test: {
          environment: "jsdom",
          include: [
            "src/**/*.spec.ts",
            "src/**/*.spec.tsx",
            "src/**/*.test.ts",
            "src/**/*.test.tsx",
          ],
          exclude: [
            "src/**/*.stories.tsx",
            "src/**/*.stories.ts",
          ],
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
