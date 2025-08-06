import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
type AuthMode = "login" | "register";
interface AuthProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}
/**
 * Auth Component
 *
 * Main authentication component that handles switching between
 * login and registration forms
 */
export const Auth: React.FC<AuthProps> = ({
  initialMode = "login",
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const handleAuthSuccess = () => {
    onSuccess?.();
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {mode === "login" ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
};
