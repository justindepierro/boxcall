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
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Brand */}
          <div className="flex items-center gap-2">
            <Icon name="boxcall" size="sm" color="jade" />
            <Typography variant="body-sm" color="muted">
              © {currentYear} BoxCall. All rights reserved.
            </Typography>
          </div>

          {/* Right side - Legal Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/about"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              About
            </Link>
            <Link
              to="/privacy-policy"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
