// Internal shim to expose icon loaders/registry for preloading only.
// This file is intentionally separate to avoid Fast Refresh constraints and legacy leakage.
import { iconRegistry, iconLoaders } from "./iconSingletons";

// Only export the required singletons for preloading. No legacy or duplicate exports.
export const __iconRegistry = iconRegistry;
export const __iconLoaders = iconLoaders;
