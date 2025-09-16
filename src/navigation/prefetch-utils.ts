// Lightweight navigation prefetch utilities with no router coupling

/**
 * Prefetch a dynamically imported module when the element is first hovered.
 * Caller should gate with environment or heuristics as needed.
 */
export function prefetchOnHover(
  el: HTMLElement | null,
  importer: () => Promise<unknown>
): void {
  if (!el) return;
  let done = false;
  const handler = () => {
    if (done) return;
    done = true;
    importer().catch(() => void 0);
  };
  el.addEventListener("mouseenter", handler, { once: true });
}
