import { useState, useEffect } from "react";

export type Orientation = "portrait" | "landscape";

/**
 * Hook to detect device orientation
 * Portrait: height > width
 * Landscape: width > height
 */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    // Initialize based on current window dimensions
    if (typeof window === "undefined") return "landscape";
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  });

  useEffect(() => {
    const updateOrientation = () => {
      const newOrientation =
        window.innerHeight > window.innerWidth ? "portrait" : "landscape";
      setOrientation(newOrientation);
    };

    // Listen to both resize and orientation change events
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    // Check for Screen Orientation API (better for mobile)
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener("change", updateOrientation);
    }

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener(
          "change",
          updateOrientation
        );
      }
    };
  }, []);

  return orientation;
}

/**
 * Hook to check if device is in portrait mode
 */
export function useIsPortrait(): boolean {
  const orientation = useOrientation();
  return orientation === "portrait";
}

/**
 * Hook to check if device is in landscape mode
 */
export function useIsLandscape(): boolean {
  const orientation = useOrientation();
  return orientation === "landscape";
}

/**
 * Combined hook to check if device is mobile AND in portrait mode
 * This is when we want to show the landscape prompt
 */
export function useIsMobilePortrait(): {
  isMobilePortrait: boolean;
  orientation: Orientation;
  isMobile: boolean;
} {
  const orientation = useOrientation();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  return {
    isMobilePortrait: isMobile && orientation === "portrait",
    orientation,
    isMobile,
  };
}
