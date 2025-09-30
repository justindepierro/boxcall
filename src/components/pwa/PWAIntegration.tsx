/**
 * PWA Integration Component
 *
 * Provides offline detection and install prompts. Service worker registration
 * is handled by vite-plugin-pwa automatically when enabled.
 */

import React, { useEffect, useState } from "react";

export const PWAIntegration: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log("🎉 PWA was installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    const result = await deferredPrompt.prompt();
    console.log("🔧 Install prompt result:", result);

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Only show notifications in production or when PWA is enabled
  const shouldShowNotifications =
    import.meta.env.PROD || import.meta.env.VITE_ENABLE_PWA === "true";

  if (!shouldShowNotifications) {
    return null;
  }

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">You're offline</span>
          </div>
        </div>
      )}

      {/* Install App Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="mb-3">
            <h4 className="font-semibold text-sm">Install BoxCall</h4>
            <p className="text-xs opacity-90 mt-1">
              Install the app for a better experience with offline support
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 bg-white text-indigo-600 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-3 py-1 border border-white/20 rounded text-xs hover:bg-white/10 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* PWA Status Indicator (dev only) */}
      {import.meta.env.DEV && import.meta.env.VITE_ENABLE_PWA === "true" && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-1 rounded text-xs">
          PWA Enabled
        </div>
      )}
    </>
  );
};
