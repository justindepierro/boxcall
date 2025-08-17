import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthLoading, useIsAuthenticated } from "../app/auth-store";
import { ROUTES } from "./paths";

type GateStatus = "loading" | "redirect" | "ready";
export type AuthGateResult = {
  status: GateStatus;
  element?: React.ReactElement;
};

export function useAuthGate(options?: {
  requireAuth?: boolean;
  redirectTo?: string; // for unauthenticated -> login or custom
}): AuthGateResult {
  const requireAuth = options?.requireAuth ?? true;
  const redirectTo = options?.redirectTo ?? ROUTES.LOGIN;
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  const location = useLocation();

  if (loading) return { status: "loading" };

  // Unauthenticated on a protected route -> go to login preserving from
  if (requireAuth && !isAuthenticated) {
    return {
      status: "redirect",
      element: <Navigate to={redirectTo} state={{ from: location }} replace />,
    };
  }

  // Otherwise ready (either public route or authenticated)
  return { status: "ready" };
}

export default useAuthGate;
