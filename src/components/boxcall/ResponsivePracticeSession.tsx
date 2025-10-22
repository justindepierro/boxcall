/**
 * Responsive Practice Session Wrapper
 * Detects device type and loads appropriate component
 * 
 * Mobile: < 768px (md breakpoint) - One-handed thumb interface
 * Desktop: >= 768px - Full featured interface with columns
 */

import React, { useState, useEffect } from "react";
import PracticeSession from "./PracticeSession";
import { MobilePracticeSession } from "../mobile/boxcall/MobilePracticeSession";

const MOBILE_BREAKPOINT = 768;

const ResponsivePracticeSession: React.FC = () => {
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

  return isMobile ? <MobilePracticeSession /> : <PracticeSession />;
};

export default ResponsivePracticeSession;
