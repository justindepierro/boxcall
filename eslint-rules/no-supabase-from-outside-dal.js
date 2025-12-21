/**
 * Prevent direct Supabase table access outside the DAL.
 *
 * Enforces Step 14: all table/view access must go through:
 * - table("...") for typed tables
 * - fromAny("...") for untyped tables/views
 *
 * Allowed:
 * - DAL implementation files under src/data/supabase/
 * - Supabase Storage bucket access: supabase.storage.from("bucket")
 * - Test/mocks under src/test/
 */

const BUILTIN_FROM_OBJECTS = new Set([
  "Array",
  "Buffer",
  "Uint8Array",
  "Uint16Array",
  "Uint32Array",
  "Int8Array",
  "Int16Array",
  "Int32Array",
  "Float32Array",
  "Float64Array",
  "BigInt64Array",
  "BigUint64Array",
]);

function unwrapExpression(node) {
  let current = node;
  // Unwrap common TS/ES wrappers
  while (current) {
    if (current.type === "ChainExpression") {
      current = current.expression;
      continue;
    }
    if (current.type === "TSNonNullExpression") {
      current = current.expression;
      continue;
    }
    if (current.type === "TSAsExpression") {
      current = current.expression;
      continue;
    }
    if (current.type === "TSTypeAssertion") {
      current = current.expression;
      continue;
    }
    break;
  }
  return current;
}

function isStringLiteralNode(node) {
  if (!node) return false;
  if (node.type === "Literal" && typeof node.value === "string") return true;
  if (
    node.type === "TemplateLiteral" &&
    Array.isArray(node.expressions) &&
    node.expressions.length === 0
  ) {
    return true;
  }
  return false;
}

function isStorageFromCall(memberExpr) {
  // Matches supabase.storage.from(...)
  const obj = unwrapExpression(memberExpr.object);
  return (
    obj &&
    obj.type === "MemberExpression" &&
    !obj.computed &&
    obj.property &&
    obj.property.type === "Identifier" &&
    obj.property.name === "storage"
  );
}

function isBuiltinFromCall(memberExpr) {
  const obj = unwrapExpression(memberExpr.object);
  return (
    obj &&
    obj.type === "Identifier" &&
    BUILTIN_FROM_OBJECTS.has(obj.name)
  );
}

function isAllowedFile(filename) {
  if (!filename || filename === "<input>") return false;

  // Normalize Windows paths just in case
  const normalized = filename.replace(/\\/g, "/");

  // Allow the DAL implementation itself
  if (normalized.includes("/src/data/supabase/")) return true;

  // Allow test helpers/mocks
  if (normalized.includes("/src/test/")) return true;

  return false;
}

export default {
  rules: {
    "no-supabase-from-outside-dal": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow calling .from(\"...\") outside the Supabase DAL",
        },
        schema: [],
        messages: {
          noFrom:
            "Do not call .from(\"...\") directly. Use table(\"...\") or fromAny(\"...\") from src/data/supabase/db.ts.",
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            const filename = context.getFilename();
            if (isAllowedFile(filename)) return;

            const callee = unwrapExpression(node.callee);
            if (!callee || callee.type !== "MemberExpression") return;

            if (callee.computed) return;
            if (!callee.property || callee.property.type !== "Identifier") return;
            if (callee.property.name !== "from") return;

            // Reduce false positives: only enforce when first arg is a string literal
            const firstArg = node.arguments && node.arguments[0];
            if (!isStringLiteralNode(firstArg)) return;

            if (isStorageFromCall(callee)) return;
            if (isBuiltinFromCall(callee)) return;

            context.report({ node: callee.property, messageId: "noFrom" });
          },
        };
      },
    },
  },
};
