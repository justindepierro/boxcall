// Internal shim to expose icon loaders/registry for preloading without exporting from the component module.
// This file is intentionally separate to avoid Fast Refresh constraints.
import type { ModularIconName } from "./ModularIcon";
import type { ComponentType } from "react";
import * as Modular from "./ModularIcon";

// Access module-scoped singletons via module namespace (relies on bundler not mangling names)
export const __iconRegistry = (
  Modular as unknown as { iconRegistry: Map<ModularIconName, ComponentType> }
).iconRegistry;
export const __iconLoaders = (
  Modular as unknown as {
    iconLoaders: Record<
      ModularIconName,
      () => Promise<{ default?: ComponentType } | ComponentType>
    >;
  }
).iconLoaders;
