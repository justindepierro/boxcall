import React from "react";
import { useNavigate } from "react-router-dom";

import { Auth } from "../components/auth";
import { Typography } from "../components/design-system";
import { Icon } from "../components/ui/Icon/Icon";
import { ROUTES } from "../routes/paths";

/**
 * Login Page
 *
 * Public route for user authentication.
 * Redirects authenticated users to dashboard.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Redirect to dashboard after successful login
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen surface-app flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Typography
            variant="headline-xl"
            className="mb-2 flex items-center justify-center"
          >
            <Icon name="target" size="xl" className="mr-3" color="primary" />
            BoxCall
          </Typography>
          <Typography variant="body-lg" color="muted">
            Sign in to your football management platform
          </Typography>
        </div>
        <Auth onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
