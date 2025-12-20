function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

function getFeatureFromPath(filePath) {
  const normalized = normalizePath(filePath);
  const match = normalized.match(/\/src\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

function isFeatureDeepImport(importPath) {
  // Matches:
  //   ../features/foo/some/private
  //   @/features/foo/some/private
  // But NOT:
  //   ../features/foo
  //   @/features/foo
  const normalized = String(importPath || "").replace(/\\/g, "/");
  const match = normalized.match(/(?:^|\/)features\/([^/]+)\/(.+)$/);
  if (!match) return null;
  const feature = match[1];
  const remainder = match[2];

  // Allow importing the feature root (or index) as the public API.
  if (!remainder) return null;
  if (remainder === "index" || remainder === "index.ts" || remainder === "index.tsx") {
    return null;
  }
  return { feature };
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing deep paths from src/features/<feature>/... outside that feature; require importing from the feature root as a public API.",
    },
    schema: [],
    messages: {
      noDeepImport:
        "Do not deep-import from features/{{feature}}. Import from the feature root (src/features/{{feature}}) instead.",
    },
  },
  create(context) {
    const filename = context.getFilename ? context.getFilename() : "";
    const importerFeature = getFeatureFromPath(filename);

    function checkImport(node) {
      const importPath = node.source && node.source.value;
      if (typeof importPath !== "string") return;

      const deep = isFeatureDeepImport(importPath);
      if (!deep) return;

      // If importing within the same feature, deep imports are fine.
      if (importerFeature && importerFeature === deep.feature) return;

      context.report({
        node,
        messageId: "noDeepImport",
        data: { feature: deep.feature },
      });
    }

    return {
      ImportDeclaration: checkImport,
    };
  },
};

export default {
  rules: {
    "no-feature-deep-imports": rule,
  },
};
