import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ConfettiBurst
 * Lightweight, reduced-motion-aware confetti burst overlay.
 * - Renders a small number of particles (defaults to 60) with CSS transforms.
 * - Auto-disposes after duration.
 * - Provides optional onClose, and a small footer with "Don't show again" toggle hook handled by caller.
 */
export interface ConfettiBurstProps {
  open: boolean;
  onClose?: () => void;
  durationMs?: number; // total lifespan
  particleCount?: number;
  className?: string;
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  open,
  onClose,
  durationMs = 1600,
  particleCount = 60,
  className,
}) => {
  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [visible, setVisible] = useState(open && !prefersReduced);
  const timerRef = useRef<number | null>(null);

  // Memoize particles array to prevent regeneration on every render
  const particles = useMemo(
    () => Array.from({ length: particleCount }, (_, i) => i),
    [particleCount]
  );

  useEffect(() => {
    if (prefersReduced) {
      setVisible(false);
      return;
    }
    if (open) {
      setVisible(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, durationMs);
    } else {
      setVisible(false);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [open, durationMs, onClose, prefersReduced]);

  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-tooltip overflow-hidden ${
        className || ""
      }`}
      aria-hidden
    >
      <div className="absolute inset-0">
        {particles.map((i) => {
          const left = rand(10, 90);
          const hue = Math.floor(rand(0, 360));
          const size = rand(6, 10);
          const rotate = rand(-90, 90);
          const delay = rand(0, 150);
          const duration = rand(900, 1400);
          const bez =
            Math.random() > 0.5
              ? "cubic-bezier(0.22,1,0.36,1)"
              : "cubic-bezier(0.17,0.67,0.83,0.67)";
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                top: "-10px",
                left: `${left}%`,
                width: `${size}px`,
                height: `${size * 0.5}px`,
                background: `hsl(${hue} 80% 55%)`,
                transform: `rotate(${rotate}deg)`,
                borderRadius: 2,
                filter: "saturate(1.1)",
                animation:
                  `bc-confetti-fall ${duration}ms ${bez} ${delay}ms forwards` as unknown as string,
              }}
            />
          );
        })}
      </div>
      <style>{`
        @keyframes bc-confetti-fall {
          0% { transform: translate3d(0,0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(0, 100vh, 0) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
