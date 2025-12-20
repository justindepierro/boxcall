function isAllowedImporter(filename) {
  // Allow pages to import other pages (within the pages layer) and
  // allow routes to import pages (routing layer).
  return /src\/(routes|pages)\//.test(filename);
}

function isPagesImportPath(value) {
  if (typeof value !== "string") return false;
  // Match relative imports like "../pages/..." or "../../pages/..."
  // and absolute-ish aliases that may include "pages/" in the path.
  return /(^|\/|\\)pages\//.test(value);
}

export default {
  rules: {
    "no-import-from-pages": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow importing from src/pages outside routes/pages. Move shared logic into hooks/services/utils/features.",
          recommended: false,
        },
        schema: [],
        messages: {
          noPagesImport:
            "Do not import from src/pages here. Move shared logic to src/hooks, src/services, src/utils, or a feature module; routes/pages may import pages.",
        },
      },
      create(context) {
        const filename = context.getFilename();
        if (isAllowedImporter(filename)) return {};

        return {
          ImportDeclaration(node) {
            const sourceValue = node.source && node.source.value;
            if (!isPagesImportPath(sourceValue)) return;

            context.report({ node, messageId: "noPagesImport" });
          },
        };
      },
    },
  },
};
