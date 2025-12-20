export type SoftNavigateOptions = {
  replace?: boolean;
};

export function softNavigate(href: string, options: SoftNavigateOptions = {}) {
  if (typeof window === "undefined") return;

  try {
    if (options.replace) {
      window.history.replaceState({}, "", href);
    } else {
      window.history.pushState({}, "", href);
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
  } catch {
    window.location.href = href;
  }
}
