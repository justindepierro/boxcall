function getMemberChain(node) {
  const chain = [];
  let current = node;

  // Unwrap optional chaining
  if (current && current.type === "ChainExpression") {
    current = current.expression;
  }

  while (current && current.type === "MemberExpression") {
    const prop = current.property;
    if (current.computed) return null;
    if (!prop || prop.type !== "Identifier") return null;
    chain.unshift(prop.name);

    let obj = current.object;
    if (obj && obj.type === "ChainExpression") obj = obj.expression;

    if (obj && obj.type === "Identifier") {
      chain.unshift(obj.name);
      return chain;
    }

    current = obj;
  }

  if (current && current.type === "Identifier") {
    chain.unshift(current.name);
    return chain;
  }

  return null;
}

function isAllowedFile(filename) {
  // Only allow direct location navigation in the centralized fallback.
  return /src\/utils\/softNavigate\.ts$/.test(filename);
}

function isLocationHrefAssignment(chain) {
  // location.href = ...
  // window.location.href = ...
  // document.location.href = ...
  if (!chain) return false;
  if (chain[chain.length - 1] !== "href") return false;

  // Must include `location` in the chain
  return chain.includes("location");
}

function isLocationObjectAssignment(chain) {
  // window.location = ... or document.location = ...
  if (!chain) return false;
  if (chain.length !== 2) return false;
  return (
    (chain[0] === "window" && chain[1] === "location") ||
    (chain[0] === "document" && chain[1] === "location")
  );
}

function isLocationNavigationCall(chain) {
  // window.location.reload(), location.assign(), document.location.replace(), etc
  if (!chain || chain.length < 2) return false;
  const method = chain[chain.length - 1];
  const allowedMethods = new Set(["reload", "assign", "replace"]);
  if (!allowedMethods.has(method)) return false;

  // Ensure the call is on a `location` object.
  // Examples chains:
  // - ["window","location","reload"]
  // - ["location","reload"]
  // - ["document","location","replace"]
  return chain.includes("location");
}

export default {
  rules: {
    "no-window-location-navigation": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow window/document location navigation (href assignment, reload/assign/replace) in app code; use router navigation or softNavigate instead.",
          recommended: false,
        },
        schema: [],
        messages: {
          noHref:
            "Do not use location href assignment for SPA navigation. Use react-router's navigate() (preferred) or softNavigate() when hooks are unavailable.",
          noCall:
            "Do not use location navigation/reload calls. Use router navigation (preferred) or requestAppReset()/softNavigate() as appropriate.",
          noLocationObj:
            "Do not assign to window.location/document.location. Use router navigation (preferred) or softNavigate() when hooks are unavailable.",
        },
      },
      create(context) {
        const filename = context.getFilename();
        if (isAllowedFile(filename)) return {};

        return {
          AssignmentExpression(node) {
            const chain = getMemberChain(node.left);
            if (isLocationHrefAssignment(chain)) {
              context.report({ node, messageId: "noHref" });
            }
            if (isLocationObjectAssignment(chain)) {
              context.report({ node, messageId: "noLocationObj" });
            }
          },
          CallExpression(node) {
            const chain = getMemberChain(node.callee);
            if (isLocationNavigationCall(chain)) {
              context.report({ node, messageId: "noCall" });
            }
          },
        };
      },
    },
  },
};
