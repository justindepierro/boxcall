import { useEffect, useState, useCallback } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Hook to detect current device breakpoint
 * Mobile: < 768px
 * Tablet: 768px - 1023px
 * Desktop: >= 1024px
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    // Initialize based on current window width
    const width = typeof window !== "undefined" ? window.innerWidth : 1024;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  });

  const updateBreakpoint = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setBreakpoint("mobile");
    } else if (width < 1024) {
      setBreakpoint("tablet");
    } else {
      setBreakpoint("desktop");
    }
  }, []);

  useEffect(() => {
    updateBreakpoint();
    
    // Throttle resize events to improve performance
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBreakpoint, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [updateBreakpoint]);

  return breakpoint;
}

/**
 * Hook to check if current device is mobile
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "mobile";
}

/**
 * Hook to check if current device is tablet
 */
export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "tablet";
}

/**
 * Hook to check if current device is desktop
 */
export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "desktop";
}

/**
 * Hook to check if current device is mobile or tablet
 */
export function useIsMobileOrTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "mobile" || breakpoint === "tablet";
}
