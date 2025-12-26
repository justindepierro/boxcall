/**
 * Security Configuration
 *
 * Defines Content Security Policy, security headers, and security-related constants
 * for the BoxCall application.
 */

export interface SecurityConfig {
  csp: {
    directives: Record<string, string[]>;
    reportOnly: boolean;
    reportUri?: string;
  };
  headers: Record<string, string>;
  allowedOrigins: string[];
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
}

// Content Security Policy configuration
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    // IMPORTANT: Avoid 'unsafe-inline'/'unsafe-eval' in production.
    ...(import.meta.env.DEV ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
    "https://cdn.jsdelivr.net", // For CDN scripts
    "https://unpkg.com", // For CDN scripts
    "https://www.googletagmanager.com", // GA4 loader
    "https://www.google-analytics.com", // GA4 beacon
    "https://app.posthog.com", // PostHog loader
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    "https://fonts.googleapis.com",
  ],
  "font-src": [
    "'self'",
    "https://fonts.gstatic.com",
    "data:", // For embedded fonts
  ],
  "img-src": [
    "'self'",
    "data:", // For base64 images
    "blob:", // For generated images
    "https:", // Allow HTTPS images
    "https://lvmuiqwihlpnwppdqqfl.supabase.co", // Supabase storage
  ],
  "connect-src": [
    "'self'",
    "https://lvmuiqwihlpnwppdqqfl.supabase.co", // Supabase API
    "wss://lvmuiqwihlpnwppdqqfl.supabase.co", // Supabase realtime
    "https://www.google-analytics.com", // GA4 beacon
    "https://app.posthog.com", // PostHog ingest
    ...(import.meta.env.DEV ? ["ws://localhost:*", "http://localhost:*"] : []),
  ],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": [],
};

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // XSS Protection (legacy browsers)
  "X-XSS-Protection": "1; mode=block",

  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy (formerly Feature Policy)
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=(self)",
    "interest-cohort=()",
  ].join(", "),

  // Strict Transport Security (HTTPS only)
  ...(import.meta.env.PROD
    ? {
        "Strict-Transport-Security":
          "max-age=31536000; includeSubDomains; preload",
      }
    : {}),
};

export const securityConfig: SecurityConfig = {
  csp: {
    directives: CSP_DIRECTIVES,
    reportOnly: import.meta.env.DEV, // Report-only in development
    reportUri: import.meta.env.VITE_CSP_REPORT_URI,
  },
  headers: SECURITY_HEADERS,
  allowedOrigins: [
    "https://boxcall.app",
    "https://*.boxcall.app",
    "https://lvmuiqwihlpnwppdqqfl.supabase.co",
    ...(import.meta.env.DEV
      ? [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5173",
        ]
      : []),
  ],
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },
};

/**
 * Generate CSP header string from directives
 */
export function generateCSPHeader(config: SecurityConfig["csp"]): string {
  const directives = Object.entries(config.directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");

  return directives;
}

/**
 * Validate origin against allowed origins
 */
export function isOriginAllowed(
  origin: string,
  allowedOrigins: string[]
): boolean {
  return allowedOrigins.some((allowed) => {
    if (allowed.includes("*")) {
      const pattern = allowed.replace(/\*/g, ".*");
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return allowed === origin;
  });
}

/**
 * Security middleware for setting headers
 */
export function createSecurityHeaders(config: SecurityConfig) {
  const cspHeader = generateCSPHeader(config.csp);

  return {
    ...config.headers,
    [config.csp.reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy"]: cspHeader,
  };
}
