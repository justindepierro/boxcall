export default {
  rules: {
    "no-direct-web-storage": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow direct access to localStorage/sessionStorage; use src/utils/storage.ts instead",
          recommended: false,
        },
        schema: [],
        messages: {
          noDirect:
            "Do not access {{name}} directly; use src/utils/storage.ts helpers instead.",
        },
      },
      create(context) {
        const filename = context.getFilename?.() ?? "";
        const normalized = filename.replace(/\\/g, "/");

        // Allow tests to stub/mock localStorage/sessionStorage.
        if (
          normalized.includes("/__tests__/") ||
          normalized.endsWith(".test.ts") ||
          normalized.endsWith(".test.tsx")
        ) {
          return {};
        }

        // Allow the storage module itself to touch window.localStorage/sessionStorage.
        if (normalized.endsWith("/src/utils/storage.ts")) {
          return {};
        }

        function report(node, name) {
          context.report({
            node,
            messageId: "noDirect",
            data: { name },
          });
        }

        function isWindowishIdentifier(node) {
          return (
            node &&
            node.type === "Identifier" &&
            (node.name === "window" || node.name === "globalThis")
          );
        }

        return {
          Identifier(node) {
            if (node.name === "localStorage") {
              report(node, "localStorage");
            }
            if (node.name === "sessionStorage") {
              report(node, "sessionStorage");
            }
          },
          MemberExpression(node) {
            // window.localStorage / window.sessionStorage / globalThis.localStorage / globalThis.sessionStorage
            if (!node || node.computed) return;
            if (!isWindowishIdentifier(node.object)) return;
            if (node.property?.type !== "Identifier") return;

            if (node.property.name === "localStorage") {
              report(node, "window.localStorage");
            }
            if (node.property.name === "sessionStorage") {
              report(node, "window.sessionStorage");
            }
          },
        };
      },
    },
  },
};
