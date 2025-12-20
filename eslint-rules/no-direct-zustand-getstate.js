import path from "node:path";

function isAllowedFile(filename) {
  const normalized = filename.split(path.sep).join("/");

  // ESLint virtual filenames
  if (normalized === "<input>" || normalized === "<text>") return true;

  // Allow in tests
  if (/(^|\/)src\/.*\.(test|spec)\.(ts|tsx)$/.test(normalized)) return true;

  // Allow within store modules
  if (/(^|\/)src\/stores\//.test(normalized)) return true;

  // Allow within auth store module (centralized snapshot helpers)
  if (/(^|\/)src\/app\/auth-store\.(ts|tsx)$/.test(normalized)) return true;

  return false;
}

export default {
  rules: {
    "no-direct-zustand-getstate": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow direct Zustand .getState() usage outside store modules",
          recommended: false,
        },
        schema: [],
        messages: {
          noDirectGetState:
            "Do not call Zustand .getState() outside store modules. Use selector hooks (e.g. useStore(s => s.x)) or a centralized helper.",
        },
      },
      create(context) {
        const filename = context.getFilename?.() ?? "";
        if (isAllowedFile(filename)) return {};

        return {
          CallExpression(node) {
            const callee = node.callee;
            if (
              callee &&
              callee.type === "MemberExpression" &&
              !callee.computed &&
              callee.property &&
              callee.property.type === "Identifier" &&
              callee.property.name === "getState"
            ) {
              context.report({
                node,
                messageId: "noDirectGetState",
              });
            }
          },
        };
      },
    },
  },
};
