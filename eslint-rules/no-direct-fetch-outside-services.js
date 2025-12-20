function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

function isAllowedFile(filename) {
  const normalized = normalizePath(filename);

  // Allow fetch only inside the service layer (and the API client wrapper).
  // The service worker legitimately uses fetch but is not a service.
  return (
    normalized.includes("/src/services/") ||
    normalized.includes("/src/lib/api/") ||
    normalized.endsWith("/src/sw.ts")
  );
}

function isFetchCallee(callee) {
  if (!callee) return false;

  // fetch(...)
  if (callee.type === "Identifier" && callee.name === "fetch") return true;

  // window.fetch(...), globalThis.fetch(...), self.fetch(...)
  if (callee.type === "MemberExpression" && !callee.computed) {
    const obj = callee.object;
    const prop = callee.property;

    if (prop && prop.type === "Identifier" && prop.name === "fetch") {
      if (obj && obj.type === "Identifier") {
        return ["window", "globalThis", "self"].includes(obj.name);
      }
    }
  }

  return false;
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow direct fetch() outside the service/API layer. Route network calls through src/services/* or src/lib/api/*.",
    },
    schema: [],
    messages: {
      noDirectFetch:
        "Do not call fetch() directly outside the service/API layer. Move this into src/services/* (or use src/lib/api/client.ts).",
    },
  },
  create(context) {
    const filename = context.getFilename ? context.getFilename() : "";
    if (isAllowedFile(filename)) return {};

    return {
      CallExpression(node) {
        if (!isFetchCallee(node.callee)) return;
        context.report({ node, messageId: "noDirectFetch" });
      },
    };
  },
};

export default {
  rules: {
    "no-direct-fetch-outside-services": rule,
  },
};
