import clsx from "clsx";
import React from "react";

export interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode; // popover body
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  initialOpen?: boolean;
  className?: string;
  width?: number | string;
  maxWidth?: number | string;
  trapFocus?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  ariaLabel?: string;
}

/**
 * Accessible Popover (surface-inverse variant by default) with optional focus trapping.
 * No portal yet – can be extended later; collision avoidance minimal (basic placement).
 */
export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  open,
  onOpenChange,
  side = "bottom",
  align = "center",
  initialOpen = false,
  className,
  width,
  maxWidth = 360,
  trapFocus = false,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  ariaLabel,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const setOpen = React.useCallback(
    (val: boolean) => {
      if (!isControlled) setUncontrolledOpen(val);
      onOpenChange?.(val);
    },
    [isControlled, onOpenChange]
  );

  // Close handlers
  React.useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (closeOnEsc && e.key === "Escape") setOpen(false);
    }
    function handleClick(e: MouseEvent) {
      if (!closeOnOutsideClick) return;
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, closeOnOutsideClick, closeOnEsc, setOpen]);

  // Focus trap (very lightweight)
  React.useEffect(() => {
    if (!trapFocus || !isOpen || !contentRef.current) return;
    const el = contentRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        (last || first).focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        (first || last).focus();
      }
    }
    const keyHandler = handleKey as (e: KeyboardEvent) => void;
    el.addEventListener("keydown", keyHandler);
    return () => {
      el.removeEventListener("keydown", keyHandler);
    };
  }, [trapFocus, isOpen]);

  const placementStyles: Record<string, string> = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  const alignAdjust: Record<string, string> = {
    start: "-translate-x-1/2 sm:translate-x-0 left-4",
    center: "",
    end: "-translate-x-1/2 sm:translate-x-0 -left-4",
  };

  const enhancedTrigger = React.useMemo(() => {
    const t = trigger as React.ReactElement<Record<string, unknown>>;
    const props: Record<string, unknown> = {
      onClick: (e: React.MouseEvent) => {
        (t.props.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
        setOpen(!isOpen);
      },
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": isOpen ? `${ariaLabel || "popover"}-content` : undefined,
    };
    // Merge refs
    const existingRef = (t as unknown as { ref?: React.Ref<HTMLElement> }).ref;
    const composedRef = (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (!existingRef) return;
      if (typeof existingRef === "function") existingRef(node);
      else if (typeof existingRef === "object")
        (existingRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
    };
    return React.cloneElement(t, { ...props, ref: composedRef });
  }, [trigger, isOpen, ariaLabel, setOpen]);

  return (
    <span className="relative inline-flex">
      {enhancedTrigger}
      {isOpen && (
        <div
          ref={contentRef}
          id={`${ariaLabel || "popover"}-content`}
          role="dialog"
          aria-label={ariaLabel}
          className={clsx(
            "absolute z-50 surface-inverse border border-gray-700/50 rounded-md shadow-lg p-3 flex flex-col gap-2",
            placementStyles[side],
            alignAdjust[align],
            className
          )}
          style={{ width, maxWidth }}
        >
          {children}
        </div>
      )}
    </span>
  );
};

export default Popover;
