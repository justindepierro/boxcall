import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scroll to top on route change for SPA navigation
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Use native smooth behavior where supported
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};

export default ScrollToTop;
