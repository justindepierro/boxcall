function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

function isAllowedFile(filename) {
  const normalized = normalizePath(filename);

  // Only allow console usage inside the logger module.
  // (Tests are excluded from lint via eslint.config.js ignores.)
  return normalized.endsWith("/src/utils/logger.ts");
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow console usage outside src/utils/logger.ts; use the logger utilities instead.",
    },
    schema: [],
    messages: {
      noConsole:
        "Do not use console directly. Use src/utils/logger.ts (debug/info/warn/error) instead.",
    },
  },
  create(context) {
    const filename = context.getFilename ? context.getFilename() : "";
    if (isAllowedFile(filename)) return {};

    function report(node) {
      context.report({ node, messageId: "noConsole" });
    }

    return {
      MemberExpression(node) {
        // console.log(...)
        if (node.object && node.object.type === "Identifier") {
          if (node.object.name === "console") {
            report(node);
          }
        }
      },
      Identifier(node) {
        // Guard against patterns like: const c = console;
        if (node.name !== "console") return;

        // Ignore MemberExpression "console" identifier; MemberExpression handler covers it.
        const parent = node.parent;
        if (parent && parent.type === "MemberExpression" && parent.object === node) {
          return;
        }

        report(node);
      },
    };
  },
};

export default {
  rules: {
    "no-console-outside-logger": rule,
  },
};
