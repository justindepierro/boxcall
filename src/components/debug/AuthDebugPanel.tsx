/**
 * Temporary Auth Debug Component
 * Add this to PlaybookPage to see auth state
 */

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { colorTokens } from "../../design-system/tokens";

export function AuthDebugPanel() {
  const [authState, setAuthState] = useState<{
    hasSession: boolean;
    userId: string | null;
    error: string | null;
  }>({
    hasSession: false,
    userId: null,
    error: null,
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        setAuthState({
          hasSession: !!session,
          userId: session?.user?.id || null,
          error: error?.message || null,
        });

        console.log("🔐 AUTH DEBUG:", {
          session: !!session,
          userId: session?.user?.id,
          accessToken: session?.access_token ? "PRESENT" : "MISSING",
          expiresAt: session?.expires_at,
          error,
        });
      } catch (err) {
        setAuthState({
          hasSession: false,
          userId: null,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    checkAuth();
  }, []);

  return (
    <div
      className="fixed bottom-5 right-5 p-3 text-white rounded-xl text-xs max-w-xs"
      style={{
        background: authState.hasSession
          ? colorTokens.emerald[500]
          : colorTokens.red[500],
        zIndex: 9999,
      }}
    >
      <div className="font-bold mb-1">
        🔐 Auth Status
      </div>
      <div>Session: {authState.hasSession ? "✅ ACTIVE" : "❌ NONE"}</div>
      <div>User ID: {authState.userId || "NULL"}</div>
      {authState.error && (
        <div className="mt-1" style={{ fontSize: "0.625rem" }}>
          Error: {authState.error}
        </div>
      )}
    </div>
  );
}
