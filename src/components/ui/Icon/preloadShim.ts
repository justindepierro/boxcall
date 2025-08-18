// Internal shim to expose icon loaders/registry for preloading without exporting from the component module.
// This file is intentionally separate to avoid Fast Refresh constraints.
import { iconRegistry, iconLoaders } from "./iconSingletons";

// Access module-scoped singletons via module namespace (relies on bundler not mangling names)
export const __iconRegistry = iconRegistry;
export const __iconLoaders = iconLoaders;
