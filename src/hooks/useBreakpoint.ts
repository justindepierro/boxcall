import { useEffect, useState, useCallback } from "react";

// Custom hook to detect current breakpoint with throttled resize listener
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState("desktop");

  const updateBreakpoint = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) setBreakpoint("mobile");
    else if (width < 1024) setBreakpoint("tablet");
    else if (width < 1280) setBreakpoint("laptop");
    else setBreakpoint("desktop");
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
