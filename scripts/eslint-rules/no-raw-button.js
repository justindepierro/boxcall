/**
 * Custom ESLint rule: no-raw-button
 * Disallows raw <button> elements outside approved exemption list.
 * Reports when a JSXOpeningElement name is 'button'.
 */
export const noRawButtonRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow raw <button> usage; enforce design-system Button",
      recommended: false,
    },
    messages: {
      noRaw:
        "Use the shared <Button> component instead of a raw <button>. If this is a dense-grid or upload exemption, add it to the allowlist or convert to role=button container.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options?.[0] || {};
    const allow = new Set(options.allow || []);
    return {
      JSXOpeningElement(node) {
        if (node.name && node.name.name === "button") {
          const filename = context.getFilename();
          if ([...allow].some((allowed) => filename.includes(allowed))) return;
          context.report({ node, messageId: "noRaw" });
        }
      },
    };
  },
};

export default noRawButtonRule;
