import type { ModularIconName } from "./ModularIcon";
import type { ComponentType } from "react";
// Use 'any' for ComponentType to match dynamic icon usage and suppress TS errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic icon registry, safe here
export const __iconRegistry: Map<ModularIconName, ComponentType<any>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic icon loaders, safe here
export const __iconLoaders: Record<
  ModularIconName,
  () => Promise<{ default?: ComponentType<any> } | ComponentType<any>>
>;
