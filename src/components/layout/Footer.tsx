import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";

/**
 * Footer Component
 *
 * Minimal, professional footer with essential legal links
 * and company information.
 */

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Mobile-first footer with proper spacing and safe area support */}
      <div className="max-w-7xl mx-auto py-4 px-4 pb-safe sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col items-center space-y-3 text-center md:flex-row md:justify-between md:space-y-0 md:text-left">
          {/* Left side - Brand */}
          <div className="flex items-center gap-2">
            <Icon name="boxcall" size="sm" color="primary" />
            <Typography variant="body-sm" color="muted">
              © {currentYear} BoxCall. All rights reserved.
            </Typography>
          </div>

          {/* Right side - Legal Links - Mobile optimized */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <Link
              to="/about"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors min-h-[44px] flex items-center px-2"
            >
              About
            </Link>
            <Link
              to="/privacy-policy"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors min-h-[44px] flex items-center px-2"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors min-h-[44px] flex items-center px-2"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors min-h-[44px] flex items-center px-2"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
