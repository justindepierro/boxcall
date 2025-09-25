import React from "react";
import { useNavigate } from "react-router-dom";

import { ProgressiveAuthFlow } from "../components/ui/Auth/ProgressiveAuthFlow";
import { ROUTES } from "../routes/paths";

/**
 * Login Page
 *
 * Enhanced authentication page with progressive UX flow.
 * Redirects authenticated users to dashboard.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Redirect to dashboard after successful login
    navigate(ROUTES.DASHBOARD);
  };

  return <ProgressiveAuthFlow onSuccess={handleLoginSuccess} />;
};

export default LoginPage;
