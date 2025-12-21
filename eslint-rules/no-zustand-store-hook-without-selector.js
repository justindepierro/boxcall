import path from "node:path";

function isAllowedFile(filename) {
  const normalized = filename.split(path.sep).join("/");

  // ESLint virtual filenames
  if (normalized === "<input>" || normalized === "<text>") return true;

  // Allow in tests
  if (/(^|\/)src\/.*\.(test|spec)\.(ts|tsx)$/.test(normalized)) return true;

  return false;
}

const STORE_HOOK_NAMES = new Set([
  "useActiveTeamStore",
  "useDashboardStore",
  "useUIStore",
]);

export default {
  rules: {
    "no-zustand-store-hook-without-selector": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Require Zustand store hook usage to provide a selector (avoid whole-state subscriptions)",
          recommended: false,
        },
        schema: [],
        messages: {
          requireSelector:
            "Call {{name}} with a selector to avoid subscribing to the entire store. Example: {{name}}(s => s.someField).",
        },
      },
      create(context) {
        const filename = context.getFilename?.() ?? "";
        if (isAllowedFile(filename)) return {};

        return {
          CallExpression(node) {
            const callee = node.callee;
            if (!callee || callee.type !== "Identifier") return;

            const name = callee.name;
            if (!STORE_HOOK_NAMES.has(name)) return;

            if ((node.arguments?.length ?? 0) === 0) {
              context.report({
                node,
                messageId: "requireSelector",
                data: { name },
              });
            }
          },
        };
      },
    },
  },
};
