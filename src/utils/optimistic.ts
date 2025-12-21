export type OptimisticIdPrefix = "temp" | "optimistic";

export function makeOptimisticId(prefix: OptimisticIdPrefix = "temp"): string {
  const randomSuffix = Math.random().toString(16).slice(2, 8);
  return `${prefix}-${Date.now()}-${randomSuffix}`;
}

export function isOptimisticId(
  id: unknown,
  prefixes: readonly OptimisticIdPrefix[] = ["temp", "optimistic"]
): boolean {
  if (typeof id !== "string") return false;
  return prefixes.some((p) => id.startsWith(`${p}-`));
}

export function withoutOptimisticIds<T extends { id: string }>(
  items: readonly T[] | undefined,
  prefixes: readonly OptimisticIdPrefix[] = ["temp", "optimistic"]
): T[] {
  if (!items) return [];
  return items.filter((i) => !isOptimisticId(i.id, prefixes));
}

export function replaceById<T extends { id: string }>(
  items: readonly T[] | undefined,
  id: string,
  next: T
): T[] {
  if (!items) return [next];
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return [...items, next];
  return items.map((i) => (i.id === id ? next : i));
}

export function removeById<T extends { id: string }>(
  items: readonly T[] | undefined,
  id: string
): T[] {
  if (!items) return [];
  return items.filter((i) => i.id !== id);
}
