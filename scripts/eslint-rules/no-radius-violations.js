/**
 * ESLint rule: no-radius-violations
 * Enforces allowed radius tokens only (rounded, rounded-none|sm|md|lg|full and directional variants with same scale).
 * Disallows arbitrary values (rounded-[...]), unsupported scales (e.g., rounded-xs if design intent excludes), and custom invented tokens.
 */
export const noRadiusViolationsRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow unsupported border radius utilities; enforce sanctioned radius scale",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          allowScale: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      arbitrary:
        "Arbitrary radius value '{{token}}' not allowed. Use sanctioned scale (none|sm|md|lg|full).",
      unsupportedScale:
        "Unsupported radius scale '{{token}}'. Allowed: none, sm, md, lg, full.",
      malformed: "Unrecognized radius token '{{token}}'.",
    },
  },
  create(context) {
    const option = context.options?.[0] || {};
    const allowScale = new Set(
      option.allowScale || ["", "none", "sm", "md", "lg", "full"]
    );

    function checkToken(token, node, classString) {
      if (/rounded-\[/.test(token)) {
        context.report({ node, messageId: "arbitrary", data: { token } });
        return;
      }
      // Directional e.g., rounded-t-md, rounded-tr-lg
      if (/^rounded-[tblr]{1,2}-/.test(token)) {
        const scale = token.split("-").slice(-1)[0];
        if (!allowScale.has(scale)) {
          context.report({
            node,
            messageId: "unsupportedScale",
            data: { token },
          });
        }
        return;
      }
      // Simple / global forms
      if (/^rounded(-[a-z0-9]+)?$/.test(token)) {
        const scale = token.includes("-") ? token.split("-")[1] : ""; // plain 'rounded' => default scale
        if (!allowScale.has(scale)) {
          context.report({
            node,
            messageId: "unsupportedScale",
            data: { token },
          });
        }
        return;
      }
      if (token.startsWith("rounded-")) {
        context.report({ node, messageId: "malformed", data: { token } });
      }
    }

    return {
      JSXAttribute(attr) {
        if (attr.name && attr.name.name === "className" && attr.value) {
          let classString = "";
          if (
            attr.value.type === "Literal" &&
            typeof attr.value.value === "string"
          )
            classString = attr.value.value;
          else if (
            attr.value.type === "JSXExpressionContainer" &&
            attr.value.expression.type === "Literal" &&
            typeof attr.value.expression.value === "string"
          )
            classString = attr.value.expression.value;
          if (!classString || !/rounded-/.test(classString)) return;
          for (const token of classString.split(/\s+/)) {
            if (token.startsWith("rounded-"))
              checkToken(token, attr, classString);
          }
        }
      },
    };
  },
};

export default noRadiusViolationsRule;
