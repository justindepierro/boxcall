import type { SidebarItem } from "../components/ui/Sidebar";

function isRouteMatch(href: string | undefined, pathname: string): boolean {
  if (!href) return false;
  if (pathname === href) return true;
  // treat parent paths as matching prefixes on segment boundaries
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.endsWith("/") ? href : `${href}/`);
}

export type ActiveState = {
  activeId: string | null;
  pathIds: string[]; // chain of ids from root to active
  expandedIds: Set<string>; // parents that should be expanded
};

/**
 * Compute the active item and which parents should be expanded given a pathname.
 * Chooses the deepest matching item (longest href match) across the tree.
 */
export function computeActiveState(
  items: SidebarItem[],
  pathname: string
): ActiveState {
  let best: { depth: number; hrefLen: number; pathIds: string[] } | null = null;

  const visit = (nodes: SidebarItem[], chain: string[]) => {
    for (const node of nodes) {
      if (node.divider || node.disabled) continue;
      const nextChain = [...chain, node.id];
      const matches = isRouteMatch(node.href, pathname);
      if (matches) {
        const hrefLen = node.href ? node.href.length : 0;
        const depth = nextChain.length;
        if (!best || hrefLen > best.hrefLen || depth > best.depth) {
          best = { depth, hrefLen, pathIds: nextChain };
        }
      }
      if (node.children && node.children.length) {
        visit(node.children, nextChain);
      }
    }
  };

  visit(items, []);

  if (!best)
    return { activeId: null, pathIds: [], expandedIds: new Set<string>() };
  const pathIds = (best as { pathIds: string[] }).pathIds;
  const activeId = pathIds[pathIds.length - 1] ?? null;
  const expandedIds = new Set<string>(pathIds.slice(0, -1));
  return { activeId, pathIds, expandedIds };
}

/** True if item should be marked active based on current pathname */
export function isActiveItem(item: SidebarItem, pathname: string): boolean {
  return isRouteMatch(item.href, pathname) || !!item.active;
}

/** True if a parent should be expanded because any descendant matches */
export function shouldExpand(item: SidebarItem, pathname: string): boolean {
  if (!item.children || !item.children.length) return false;
  const stack: SidebarItem[] = [...item.children];
  while (stack.length) {
    const n = stack.pop()!;
    if (isRouteMatch(n.href, pathname)) return true;
    if (n.children) stack.push(...n.children);
  }
  return false;
}
