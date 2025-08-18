import type { ModularIconName } from "./ModularIcon";
import type { ComponentType } from "react";

// We import internal singletons from a shim to avoid Fast Refresh complaints
export async function preloadIcons(names: ModularIconName[]): Promise<void> {
  const { __iconLoaders, __iconRegistry } = await import("./preloadShim");
  const { logIconError } = await import("./iconErrorLogger");
  type LoaderResult = { default?: ComponentType } | ComponentType;
  const iconLoaders = __iconLoaders as Record<
    ModularIconName,
    () => Promise<LoaderResult>
  >;
  const iconRegistry = __iconRegistry as Map<ModularIconName, ComponentType>;
  const unique = Array.from(new Set(names));
  await Promise.allSettled(
    unique.map(async (name) => {
      if (!iconLoaders[name]) {
        logIconError(name, new Error("No loader found for icon name"));
        return;
      }
      if (iconRegistry.has(name)) return;
      try {
        const mod = await iconLoaders[name]!();
        const Comp =
          typeof mod === "function"
            ? (mod as ComponentType)
            : (mod as { default?: ComponentType }).default;
        if (Comp) iconRegistry.set(name, Comp);
        else logIconError(name, new Error("No component found in loader result"));
      } catch (error) {
        logIconError(name, error);
      }
    })
  );
}
