import React from "react";
import { Typography } from "../components/design-system";
import { Auth } from "../components/auth";

/**
 * Login Page
 * 
 * Public route for user authentication.
 * Redirects authenticated users to dashboard.
 */
export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Typography variant="headline-xl" className="mb-2">
            🏈 BoxCall
          </Typography>
          <Typography variant="body-lg" color="muted">
            Sign in to your football management platform
          </Typography>
        </div>

        <Auth />
      </div>
    </div>
  );
};
