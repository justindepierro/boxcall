import { Typography } from "@components/design-system/Typography";
import React, { useEffect } from "react";

import { useAuth } from "../app/auth-store";

/**
 * Logout Page
 * Performs a signOut on mount and then redirects to /login.
 */
const Logout: React.FC = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        await signOut();
      } catch (_err) {
        // ignore, we’ll redirect anyway
      } finally {
        // allow a brief tick for state to settle
        setTimeout(() => {
          window.location.replace("/login");
        }, 50);
      }
    })();
  }, [signOut]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Typography variant="body-md" as="p" className="text-text-secondary">
        Signing you out…
      </Typography>
    </div>
  );
};

export default Logout;
