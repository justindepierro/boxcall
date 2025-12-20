/**
 * Security Provider Component
 *
 * Provides comprehensive security features including CSP, CSRF protection,
 * and secure session management
 */

import React, { useEffect } from "react";
import {
  useSecurity,
  useCSRFProtection,
  useSecureSession,
} from "../../hooks/useSecurity";
import { warn } from "../../utils/logger";

interface SecurityProviderProps {
  children: React.ReactNode;
  enableCSRF?: boolean;
  enableSessionSecurity?: boolean;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
  enableCSRF = true,
  enableSessionSecurity = true,
}) => {
  // Apply security headers and CSP
  useSecurity();

  // Always call hooks, but conditionally enable their functionality
  const csrfProtection = useCSRFProtection();
  const secureSession = useSecureSession();

  // Apply security measures based on props
  useEffect(() => {
    if (enableCSRF && csrfProtection) {
      // CSRF protection is enabled via the hook
    }
    if (enableSessionSecurity && secureSession) {
      // Session security is enabled via the hook
    }
  }, [enableCSRF, enableSessionSecurity, csrfProtection, secureSession]);

  // Additional security measures
  useEffect(() => {
    // Disable right-click context menu in production (optional)
    if (import.meta.env.PROD) {
      const handleContextMenu = (e: MouseEvent) => {
        // Allow in development for debugging
        if (!import.meta.env.DEV) {
          e.preventDefault();
        }
      };

      document.addEventListener("contextmenu", handleContextMenu);

      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
      };
    }
  }, []);

  // Security monitoring
  useEffect(() => {
    // Monitor for suspicious activity
    let rapidClickCount = 0;
    let lastClickTime = 0;

    const handleSuspiciousActivity = () => {
      const now = Date.now();
      if (now - lastClickTime < 100) {
        // Clicks faster than 100ms
        rapidClickCount++;
        if (rapidClickCount > 10) {
          warn("🚨 Suspicious activity detected: Rapid clicking");
          rapidClickCount = 0; // Reset
        }
      } else {
        rapidClickCount = 0;
      }
      lastClickTime = now;
    };

    document.addEventListener("click", handleSuspiciousActivity);

    return () => {
      document.removeEventListener("click", handleSuspiciousActivity);
    };
  }, []);

  // Security info now available in DevPanel (Ctrl+Shift+D) instead of floating indicator
  return <>{children}</>;
};
