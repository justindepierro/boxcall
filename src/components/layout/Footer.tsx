import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { getRouteImporter } from "../../routes/importers";
import { prefetchOnHover } from "../../navigation/prefetch-utils";
import { Typography } from "../design-system";
import { LogoIcon } from "../ui/Logo";

/**
 * Footer Component
 *
 * Minimal, professional footer with essential legal links
 * and company information.
 */

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const aboutRef = useRef<HTMLAnchorElement | null>(null);
  const privacyRef = useRef<HTMLAnchorElement | null>(null);
  const termsRef = useRef<HTMLAnchorElement | null>(null);
  const contactRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    // Attach hover prefetch only when prefetch is enabled via env
    const enabled = String(import.meta.env.VITE_PREFETCH_ROUTES) === "true";
    if (!enabled) return;
    prefetchOnHover(aboutRef.current, getRouteImporter("/about")!);
    prefetchOnHover(privacyRef.current, getRouteImporter("/privacy-policy")!);
    prefetchOnHover(termsRef.current, getRouteImporter("/terms-of-service")!);
    prefetchOnHover(contactRef.current, getRouteImporter("/contact")!);
  }, []);

  return (
    <footer className="surface-header border-t border-border-medium">
      {/* Mobile-first footer with proper spacing and safe area support */}
      <div className="max-w-7xl mx-auto py-4 pb-safe sm:py-6 bc-container-padding">
        <div className="flex flex-col items-center space-y-3 text-center md:flex-row md:justify-between md:space-y-0 md:text-left">
          {/* Left side - Brand */}
          <div className="flex items-center gap-2">
            <LogoIcon size="sm" color="brand" />
            <Typography variant="body-sm" color="muted">
              © {currentYear} BoxCall. All rights reserved.
            </Typography>
          </div>

          {/* Right side - Legal Links - Mobile optimized */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <Link
              ref={aboutRef}
              to="/about"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] flex items-center px-2"
            >
              About
            </Link>
            <Link
              ref={privacyRef}
              to="/privacy-policy"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] flex items-center px-2"
            >
              Privacy Policy
            </Link>
            <Link
              ref={termsRef}
              to="/terms-of-service"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] flex items-center px-2"
            >
              Terms of Service
            </Link>
            <Link
              ref={contactRef}
              to="/contact"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] flex items-center px-2"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
