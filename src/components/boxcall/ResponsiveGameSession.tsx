/**
 * Responsive Game Session Wrapper
 * Detects device type and loads appropriate component
 *
 * Mobile: < 768px (md breakpoint) - Sideline-optimized interface
 * Desktop: >= 768px - Full featured interface with analytics
 */

import React, { useState, useEffect } from "react";
import GameSession from "./GameSession";
import { MobileGameSession } from "../mobile/boxcall/MobileGameSession";

const MOBILE_BREAKPOINT = 768;

const ResponsiveGameSession: React.FC = () => {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <MobileGameSession /> : <GameSession />;
};

export default ResponsiveGameSession;
