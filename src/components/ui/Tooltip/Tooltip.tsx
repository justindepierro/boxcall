import React from "react";
import { createPortal } from "react-dom";

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  disabled?: boolean;
  maxWidth?: number | string;
}

/**
 * Tooltip that uses Portal to escape overflow:hidden containers
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  delay = 140,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false);
  const [timer, setTimer] = React.useState<number | null>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const id = React.useId();
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    // Use viewport coordinates (no scroll offset needed with position: fixed)
    switch (placement) {
      case "top":
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
        break;
    }
    
    setPosition({ top, left });
  }, [placement]);

  const show = () => {
    if (disabled) return;
    updatePosition();
    if (delay === 0) {
      setOpen(true);
      return;
    }
    const t = window.setTimeout(() => {
      setOpen(true);
    }, delay);
    setTimer(t);
  };

  const hide = () => {
    if (timer) window.clearTimeout(timer);
    setTimer(null);
    setOpen(false);
  };

  // Update position on scroll or resize
  React.useEffect(() => {
    if (!open) return;
    
    const handleUpdate = () => updatePosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [open, updatePosition]);

  const getTooltipStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "fixed", // Changed from absolute to fixed for viewport-relative positioning
      zIndex: 9999,
      padding: "8px 12px",
      background: "#1f2937",
      color: "white",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 500,
      whiteSpace: "nowrap",
      pointerEvents: "none",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      maxWidth: "280px",
    };

    let transform = "";
    let finalTop = position.top;
    let finalLeft = position.left;
    const padding = 10;

    // Calculate transform and adjust for viewport boundaries
    switch (placement) {
      case "top":
      case "bottom": {
        transform = "translate(-50%, " + (placement === "top" ? "-100%" : "0") + ")";
        // For centered tooltips, ensure we don't go off the left or right edges
        // Account for the -50% transform by checking if centered position would clip
        const minLeft = padding + 140; // Half of max tooltip width (280px / 2)
        const maxLeft = window.innerWidth - padding - 140;
        
        if (finalLeft < minLeft) {
          finalLeft = minLeft;
        } else if (finalLeft > maxLeft) {
          finalLeft = maxLeft;
        }
        
        // Also check top boundary for "top" placement
        if (placement === "top" && finalTop < padding + 50) {
          // Not enough space above, flip to bottom
          transform = "translate(-50%, 0)";
        }
        break;
      }
        
      case "left":
      case "right": {
        transform = "translate(" + (placement === "left" ? "-100%" : "0") + ", -50%)";
        // Prevent going off top
        const minTop = padding + 20;
        const maxTop = window.innerHeight - padding - 20;
        
        if (finalTop < minTop) {
          finalTop = minTop;
        } else if (finalTop > maxTop) {
          finalTop = maxTop;
        }
        break;
      }
    }

    return {
      ...base,
      top: finalTop,
      left: finalLeft,
      transform,
    };
  };

  return (
    <>
      <span
        ref={triggerRef}
        style={{ display: "inline-flex", position: "relative" }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={open ? id : undefined}
      >
        {children}
      </span>
      {open && !disabled && createPortal(
        <span
          id={id}
          role="tooltip"
          style={getTooltipStyle()}
        >
          {content}
        </span>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
