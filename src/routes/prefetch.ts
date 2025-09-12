// Opportunistic route prefetching for faster navigations
// Gated by env and connection heuristics; uses requestIdleCallback where available.

type VoidFn = () => void;

const ric: (cb: VoidFn) => void = (cb) => {
  if (typeof window !== "undefined") {
    const maybeRic = (
      window as unknown as {
        requestIdleCallback?: (
          cb: (deadline: {
            didTimeout: boolean;
            timeRemaining: () => number;
          }) => void,
          opts?: { timeout?: number }
        ) => number;
      }
    ).requestIdleCallback;
    if (typeof maybeRic === "function") {
      maybeRic(() => cb(), { timeout: 1500 });
      return;
    }
  }
  setTimeout(cb, 300);
};

function goodNetwork(): boolean {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const saveData = nav.connection?.saveData;
  const type = nav.connection?.effectiveType;
  if (saveData) return false;
  if (!type) return true;
  // Avoid on 2g/slow-2g
  return !/(^|-)2g$/.test(type);
}

// Keep these aligned with dynamic imports in SplitRouter
const prefetchers: Array<() => Promise<unknown>> = [
  () => import("../pages/DashboardPage"),
  () => import("../pages/CalendarShellPage"),
  () => import("../pages/PlaybookPage"),
  () => import("../pages/ProfilePage"),
  () => import("../pages/TeamSettings"),
];

export function initRoutePrefetch(): void {
  if (typeof window === "undefined") return;
  if (!goodNetwork()) return;
  // Stagger prefetches across idle callbacks to stay out of the way
  prefetchers.forEach((load, i) => {
    ric(() => {
      // Small delay between each to reduce burst
      setTimeout(() => {
        load().catch(() => void 0);
      }, i * 150);
    });
  });
}

// Hover-based prefetch helper for nav links
export function prefetchOnHover(
  el: HTMLElement | null,
  importer: () => Promise<unknown>
) {
  if (!el) return;
  let done = false;
  const handler = () => {
    if (done) return;
    done = true;
    importer().catch(() => void 0);
  };
  el.addEventListener("mouseenter", handler, { once: true });
}
