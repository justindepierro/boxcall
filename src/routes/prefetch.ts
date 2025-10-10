// Enhanced opportunistic route prefetching for faster navigations
// Gated by env and connection heuristics; uses requestIdleCallback where available.
// Now includes priority-based prefetching and user behavior analysis.

type VoidFn = () => void;
type PrefetchPriority = "high" | "medium" | "low";

interface PrefetchConfig {
  priority: PrefetchPriority;
  condition?: () => boolean;
  timeout?: number;
}

const ric: (cb: VoidFn, timeout?: number) => void = (cb, timeout = 1500) => {
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
      maybeRic(() => cb(), { timeout });
      return;
    }
  }
  setTimeout(cb, 300);
};

function goodNetwork(): boolean {
  const nav = navigator as Navigator & {
    connection?: {
      saveData?: boolean;
      effectiveType?: string;
      downlink?: number;
    };
  };

  // Respect data saver mode
  if (nav.connection?.saveData) return false;

  const type = nav.connection?.effectiveType;
  const downlink = nav.connection?.downlink;

  // Avoid on very slow connections
  if (type && /(^|-)2g$/.test(type)) return false;
  if (downlink && downlink < 1) return false; // Less than 1 Mbps

  return true;
}

// Check if user is likely to navigate (based on interaction patterns)
function userIsActive(): boolean {
  // Consider user active if they've interacted recently
  const lastInteraction = (window as any).__lastInteraction || Date.now();
  const timeSinceInteraction = Date.now() - lastInteraction;

  // User active if interacted within last 30 seconds
  return timeSinceInteraction < 30000;
}

// Track user interactions for smarter prefetching
function trackUserActivity(): void {
  if (typeof window === "undefined") return;

  const updateLastInteraction = () => {
    (window as any).__lastInteraction = Date.now();
  };

  // Track various interaction events
  ["mousedown", "keydown", "touchstart", "scroll"].forEach((event) => {
    window.addEventListener(event, updateLastInteraction, { passive: true });
  });
}

// Enhanced prefetchers with priority and conditions
const prefetchers: Array<{
  load: () => Promise<unknown>;
  config: PrefetchConfig;
}> = [
  {
    load: () => import("../pages/DashboardPage"),
    config: { priority: "high" }, // Always prefetch dashboard
  },
  {
    load: () => import("../pages/CalendarShellPage"),
    config: {
      priority: "medium",
      condition: () => userIsActive(), // Only if user is active
    },
  },
  {
    load: () => import("../pages/PlaybookPage"),
    config: {
      priority: "medium",
      condition: () => goodNetwork(), // Only on good networks
    },
  },
  {
    load: () => import("../pages/ProfilePage"),
    config: { priority: "low" }, // Lower priority
  },
  {
    load: () => import("../pages/TeamSettings"),
    config: {
      priority: "low",
      condition: () => userIsActive() && goodNetwork(),
    },
  },
];

function getPriorityDelay(priority: PrefetchPriority, index: number): number {
  const baseDelays = { high: 100, medium: 200, low: 500 };
  return baseDelays[priority] + index * 50; // Stagger within priority groups
}

export function initRoutePrefetch(): void {
  if (typeof window === "undefined") return;
  if (!goodNetwork()) return;

  // Start tracking user activity
  trackUserActivity();

  // Group by priority for better scheduling
  const groupedPrefetchers = prefetchers.reduce(
    (groups, prefetcher, index) => {
      const priority = prefetcher.config.priority;
      if (!groups[priority]) groups[priority] = [];
      groups[priority].push({ ...prefetcher, index });
      return groups;
    },
    {} as Record<
      PrefetchPriority,
      Array<(typeof prefetchers)[0] & { index: number }>
    >
  );

  // Schedule prefetches by priority
  const priorities: PrefetchPriority[] = ["high", "medium", "low"];

  priorities.forEach((priority) => {
    const group = groupedPrefetchers[priority];
    if (!group) return;

    group.forEach(({ load, config, index }) => {
      // Check condition if provided
      if (config.condition && !config.condition()) {
        return;
      }

      ric(() => {
        const delay = getPriorityDelay(priority, index);
        setTimeout(() => {
          load().catch((error) => {
            console.warn(`⚠️ Failed to prefetch route:`, error);
          });
        }, delay);
      }, config.timeout);
    });
  });
}

// Hover-based prefetch helper for nav links
// Note: Hover-based prefetch utility moved to navigation/prefetch-utils
