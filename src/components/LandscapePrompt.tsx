import { useState } from "react";
import { RotateCw } from "lucide-react";

interface LandscapePromptProps {
  onContinueAnyway?: () => void;
}

/**
 * Full-screen overlay prompting user to rotate device to landscape
 * Shows on mobile devices in portrait orientation
 */
export function LandscapePrompt({
  onContinueAnyway,
}: LandscapePromptProps = {}) {
  const [dismissed, setDismissed] = useState(false);

  const handleContinue = () => {
    setDismissed(true);
    onContinueAnyway?.();
  };

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="landscape-prompt-title"
    >
      <div className="flex flex-col items-center space-y-6 text-center">
        {/* Rotating icon animation */}
        <div className="relative">
          <div className="animate-rotate-phone">
            <RotateCw
              className="text-primary"
              size={80}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Title */}
        <h1
          id="landscape-prompt-title"
          className="text-2xl font-semibold text-primary"
        >
          Please Rotate Device
        </h1>

        {/* Message */}
        <p className="max-w-md text-lg text-secondary">
          The Play Diagram Editor works best in{" "}
          <strong className="text-primary">landscape mode</strong> for maximum
          screen space and easier editing.
        </p>

        {/* Visual hint */}
        <div className="flex items-center gap-4 text-muted">
          <div className="flex h-16 w-12 items-center justify-center rounded-lg border-2 border-current">
            <span className="text-xs">📱</span>
          </div>
          <RotateCw size={24} className="animate-pulse" />
          <div className="flex h-12 w-16 items-center justify-center rounded-lg border-2 border-current">
            <span className="text-xs">📱</span>
          </div>
        </div>

        {/* Continue anyway button */}
        <button
          onClick={handleContinue}
          className="mt-8 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-medium text-secondary transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          type="button"
        >
          Continue in portrait anyway
        </button>
      </div>

      {/* Custom rotation animation */}
      <style>{`
        @keyframes rotate-phone {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-15deg);
          }
          50% {
            transform: rotate(0deg);
          }
          75% {
            transform: rotate(15deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .animate-rotate-phone {
          animation: rotate-phone 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
