/**
 * Security Hook
 *
 * Applies security headers and CSP policies to the application
 */

import { useEffect } from "react";
import { securityConfig, createSecurityHeaders } from "../utils/security";

/**
 * Hook to apply security headers and CSP
 */
export function useSecurity() {
  useEffect(() => {
    // Note: CSP should be set via HTTP headers on the server
    // Meta tag CSP is ignored by browsers for security reasons
    if (import.meta.env.DEV) {
      console.log(
        "🔒 Security configuration loaded (CSP should be set via server headers):",
        {
          reportOnly: securityConfig.csp.reportOnly,
          directives: securityConfig.csp.directives,
        }
      );
    }

    // Security event listeners for CSP violations (if CSP is set via server headers)
    const handleSecurityViolation = (event: SecurityPolicyViolationEvent) => {
      console.warn("🚫 CSP Violation:", {
        directive: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        originalPolicy: event.originalPolicy,
      });

      // In production, you might want to report this to your monitoring service
      if (import.meta.env.PROD) {
        // reportToMonitoring(event);
      }
    };

    // Listen for CSP violations
    document.addEventListener(
      "securitypolicyviolation",
      handleSecurityViolation
    );

    return () => {
      document.removeEventListener(
        "securitypolicyviolation",
        handleSecurityViolation
      );
    };
  }, []);

  return {
    securityConfig,
    headers: createSecurityHeaders(securityConfig),
  };
}

/**
 * Hook for CSRF protection
 */
export function useCSRFProtection() {
  useEffect(() => {
    // Generate CSRF token if not exists
    let csrfToken = sessionStorage.getItem("csrf-token");
    if (!csrfToken) {
      csrfToken = crypto.randomUUID();
      sessionStorage.setItem("csrf-token", csrfToken);
    }

    // Add CSRF token to all outgoing requests
    const originalFetch = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input.toString();

      // Only add CSRF token to same-origin requests
      if (url.startsWith("/") || url.includes(window.location.origin)) {
        const headers = new Headers(init?.headers);
        headers.set("X-CSRF-Token", csrfToken!);

        init = {
          ...init,
          headers,
        };
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}

/**
 * Hook for secure session management
 */
export function useSecureSession() {
  useEffect(() => {
    // Check for session security
    const checkSessionSecurity = () => {
      // Verify secure cookie settings
      if (
        document.cookie.includes("Secure") &&
        window.location.protocol !== "https:"
      ) {
        console.warn("🔒 Secure cookies detected on non-HTTPS connection");
      }

      // Check for session timeout
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes

        if (timeSinceLastActivity > sessionTimeout) {
          console.log("🔒 Session timeout detected");
          // In a real app, you would redirect to login
          // window.location.href = '/login';
        }
      }

      // Update last activity
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    // Check on mount
    checkSessionSecurity();

    // Check on user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Periodic security check
    const securityCheckInterval = setInterval(
      checkSessionSecurity,
      5 * 60 * 1000
    ); // 5 minutes

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(securityCheckInterval);
    };
  }, []);
}
