import React, { useState } from "react";
import {
  useAuth,
  useAuthError,
  useAuthLoading,
  useAuthProfile,
  useAuthUser,
  useIsAuthenticated,
} from "../app/auth-store";
import { Button } from "../components/ui";
import { Auth } from "./auth";

/**
 * AuthTest Component
 *
 * Comprehensive testing interface for our authentication system
 * Shows real authentication status and provides both quick tests and full forms
 */
export const AuthTest: React.FC = () => {
  const { signOut, clearError, resetPassword } = useAuth();
  const loading = useAuthLoading();
  const error = useAuthError();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const profile = useAuthProfile();

  const [showFullAuth, setShowFullAuth] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleTestSignOut = async () => {
    await signOut();
    console.log("SignOut completed");
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      alert("Please enter an email for password reset");
      return;
    }

    const result = await resetPassword(resetEmail);
    if (result.success) {
      alert("Password reset email sent! Check your inbox.");
      setResetEmail("");
    }
  };

  if (showFullAuth) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Full Authentication Forms</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullAuth(false)}
          >
            ← Back to Test Panel
          </Button>
        </div>

        <Auth onSuccess={() => setShowFullAuth(false)} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        🔐 Auth System Test Panel
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Panel */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Authentication Status
          </h3>

          <div className="text-sm space-y-2">
            <div>
              <strong>Status:</strong>{" "}
              <span
                className={isAuthenticated ? "text-green-600" : "text-red-600"}
              >
                {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
              </span>
            </div>

            {user && (
              <div>
                <strong>Email:</strong> {user.email}
              </div>
            )}

            {profile && (
              <>
                <div>
                  <strong>Name:</strong>{" "}
                  {profile.display_name || profile.full_name}
                </div>
                <div>
                  <strong>Role:</strong>{" "}
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {profile.role}
                  </span>
                </div>
              </>
            )}

            {loading && <div className="text-blue-600">⏳ Loading...</div>}

            {error && (
              <div className="text-red-600 text-sm">
                <div>❌ Error: {error}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearError}
                  className="mt-1"
                >
                  Clear Error
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Actions Panel */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>

          <div className="space-y-2">
            {!isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => setShowFullAuth(true)}
                disabled={loading}
                fullWidth
              >
                🚀 Open Login/Register Forms
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleTestSignOut}
                disabled={loading}
                fullWidth
              >
                👋 Sign Out
              </Button>
            )}

            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium mb-2">Password Reset Test</h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Email for reset"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 border-t pt-4">
        💡 <strong>Testing Guide:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Use the forms to create a real account with Supabase</li>
          <li>Check the browser console for detailed auth logs</li>
          <li>Profile data will be stored in the 'profiles' table</li>
          <li>Authentication state persists across browser reloads</li>
        </ul>
      </div>
    </div>
  );
};
