// Centralized scroll container helpers.
// BoxCall uses a single scroll container for consistency and better support
// across drag-and-drop, virtual lists, and overlays.

export function getAppScrollContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;

  // In BoxCall, #root is the canonical scroll container.
  const root = document.getElementById("root");
  if (root) return root;

  return (document.scrollingElement as HTMLElement | null) ?? document.body;
}

export function getAppScrollTop(): number {
  const container = getAppScrollContainer();
  if (!container) return 0;

  // If container is the document scroller, window.scrollY is authoritative.
  if (container === document.scrollingElement) return window.scrollY;

  return container.scrollTop;
}

export function scrollAppTo(options: {
  top: number;
  behavior?: ScrollBehavior;
}) {
  const container = getAppScrollContainer();
  if (!container) return;

  if (container === document.scrollingElement) {
    window.scrollTo({ top: options.top, behavior: options.behavior });
    return;
  }

  container.scrollTo({ top: options.top, behavior: options.behavior });
}

export function addAppScrollListener(
  handler: () => void,
  options?: AddEventListenerOptions
): () => void {
  const container = getAppScrollContainer();
  if (!container) return () => undefined;

  container.addEventListener("scroll", handler, options);
  return () => container.removeEventListener("scroll", handler, options);
}
