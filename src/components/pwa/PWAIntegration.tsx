/**
 * PWA Integration Component
 *
 * Provides offline detection and install prompts. Service worker registration
 * is handled by vite-plugin-pwa automatically when enabled.
 */
/* eslint-disable react-refresh/only-export-components */

import React, { useEffect, useState } from "react";

type InstallPrompt = any;

const INSTALL_EVENT = "pwa:install-available";

let deferredInstallPrompt: InstallPrompt | null = null;

const dispatchInstallAvailability = () => {
  window.dispatchEvent(
    new CustomEvent<{ available: boolean }>(INSTALL_EVENT, {
      detail: { available: deferredInstallPrompt !== null },
    })
  );
};

export const isPWAInstallAvailable = () => deferredInstallPrompt !== null;

export const requestPWAInstallPrompt = async () => {
  if (!deferredInstallPrompt) return null;
  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  dispatchInstallAvailability();
  promptEvent.prompt();
  if (typeof promptEvent.userChoice?.then === "function") {
    try {
      return await promptEvent.userChoice;
    } catch {
      return null;
    }
  }
  return null;
};

export const dismissPWAInstallPrompt = () => {
  deferredInstallPrompt = null;
  dispatchInstallAvailability();
};

export const PWAIntegration: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
      deferredInstallPrompt = e;
      dispatchInstallAvailability();
    };

    const handleAppInstalled = () => {
      deferredInstallPrompt = null;
      dispatchInstallAvailability();
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

  // Show offline indicator (minimal, non-intrusive)
  // PWA and other status info available in DevPanel (Ctrl+Shift+D)
  const shouldShowOfflineIndicator = !isOnline;

  if (!shouldShowOfflineIndicator) {
    return null;
  }

  return (
    <>
      {/* Minimal Offline Indicator - only when actually offline */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-fixed bg-warning-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">You're offline</span>
          </div>
        </div>
      )}
    </>
  );
};
