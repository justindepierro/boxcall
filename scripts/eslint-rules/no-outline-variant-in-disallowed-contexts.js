// ESLint custom rule: forbid variant="outline" in specific low-emphasis contexts
// Policy: Disallow outline variant inside calendar filters, quick action clusters, and button clusters
// except where explicitly allowed (modal cancel separation or RSVP neutral states, etc.)

export const noOutlineVariantInDisallowedContextsRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        'Disallow <Button variant="outline"> in restricted contexts (filters, quick action clusters, low-emphasis panels)',
    },
    schema: [
      {
        type: "object",
        properties: {
          allowPatterns: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      disallowed:
        'Outline variant is disallowed here; use "ghost", "subtle", or appropriate semantic (secondary/danger).',
    },
  },
  create(context) {
    const options = context.options?.[0] || {};
    const allowPatterns = (options.allowPatterns || []).map(
      (p) => new RegExp(p)
    );
    const filename = context.getFilename();
    const isAllowedByPattern = allowPatterns.some((r) => r.test(filename));

    // Skip node_modules and generated
    if (/node_modules|generated|dist/.test(filename)) return {};

    const DISALLOWED_PATH_HINTS = [
      /components\/calendar\/CalendarFiltersPanel/,
      /components\/dashboard\/QuickActions/,
      /components\/dashboard\/PersonalProfile/,
    ];

    const isInTargetFile = DISALLOWED_PATH_HINTS.some((r) => r.test(filename));

    if (!isInTargetFile || isAllowedByPattern) return {};

    return {
      JSXOpeningElement(node) {
        if (
          node.name.type === "JSXIdentifier" &&
          node.name.name === "Button" &&
          node.attributes
        ) {
          const variantAttr = node.attributes.find(
            (a) =>
              a.type === "JSXAttribute" &&
              a.name?.name === "variant" &&
              a.value &&
              ((a.value.type === "Literal" && a.value.value === "outline") ||
                (a.value.type === "JSXExpressionContainer" &&
                  a.value.expression.type === "Literal" &&
                  a.value.expression.value === "outline"))
          );
          if (variantAttr) {
            context.report({ node: variantAttr, messageId: "disallowed" });
          }
        }
      },
    };
  },
};
