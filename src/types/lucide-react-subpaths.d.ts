// Type shim for lucide-react ESM subpath icon imports used by ModularIcon
// These modules export a default React component (Lucide icon)

declare module "lucide-react/dist/esm/icons/*.js" {
  import * as React from "react";

  const Icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }>;
  export default Icon;
}

// Some tooling may strip the .js extension from specifiers when resolving types.
// Provide a second wildcard to be safe under different TS module resolution behaviors.
declare module "lucide-react/dist/esm/icons/*" {
  import * as React from "react";

  const Icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }>;
  export default Icon;
}
