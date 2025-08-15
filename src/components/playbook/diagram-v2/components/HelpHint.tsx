import React, { useEffect, useMemo, useState } from "react";

/**
 * HelpHint
 * Bottom-right on-canvas hint: "Press H for help" that fades after 5s and hides
 * permanently after help is viewed or user opts out. Respects reduced-motion.
 */
export const HelpHint: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [t0, setT0] = useState<number | null>(null);
  const prefersReduced = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissed =
        window.localStorage.getItem("diagram.help.dismissed") === "1";
      const viewed = window.localStorage.getItem("diagram.help.viewed") === "1";
      if (!dismissed && !viewed) {
        setVisible(true);
        setT0(performance.now());
      }
    } catch {
      // no-op
    }
  }, []);

  // Auto-hide after 5s; also hide immediately on custom help events
  useEffect(() => {
    if (!visible) return;
    const onOpened = () => setVisible(false);
    const onClosed = () => setVisible(false);
    window.addEventListener("diagram:help-opened", onOpened as EventListener);
    window.addEventListener("diagram:help-closed", onClosed as EventListener);
    let raf = 0;
    const loop = () => {
      if (!t0) return;
      const elapsed = performance.now() - t0;
      if (elapsed > 5200) {
        setVisible(false);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener(
        "diagram:help-opened",
        onOpened as EventListener
      );
      window.removeEventListener(
        "diagram:help-closed",
        onClosed as EventListener
      );
      cancelAnimationFrame(raf);
    };
  }, [visible, t0]);

  if (!visible) return null;
  // Compute opacity for fade over last 800ms
  const opacity = (() => {
    if (prefersReduced || !t0) return 0.8;
    const elapsed = performance.now() - t0;
    if (elapsed < 4400) return 0.8;
    const p = Math.min(1, (elapsed - 4400) / 800);
    return 0.8 * (1 - p);
  })();

  return (
    <div
      className="pointer-events-none absolute bottom-3 right-3 z-20 select-none"
      aria-hidden
    >
      <div
        className="text-[11px] font-medium tracking-wide"
        style={{
          color: "rgba(255,255,255,0.7)",
          textShadow: "0 1px 1px rgba(0,0,0,0.35)",
          opacity,
          transition: prefersReduced ? undefined : "opacity 200ms ease",
        }}
      >
        Press H for help
      </div>
    </div>
  );
};

export default HelpHint;
