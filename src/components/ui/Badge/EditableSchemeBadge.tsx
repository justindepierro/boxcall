import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

import type { BadgeColorScheme } from "../../../types/badge";
import { Badge } from "./Badge";
import Icon from "../Icon/Icon";

const GRID_SCHEMES: BadgeColorScheme[] = [
  "jade",
  "navy",
  "blue",
  "cyan",
  "orange",
  "purple",
  "amber",
  "red",
  "pink",
];

export type EditableSchemeBadgeProps = {
  label: string;
  scheme: BadgeColorScheme;
  onChangeScheme: (scheme: BadgeColorScheme) => Promise<void>;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
};

export const EditableSchemeBadge: React.FC<EditableSchemeBadgeProps> = ({
  label,
  scheme,
  onChangeScheme,
  size = "sm",
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Calculate position when opening
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    
    const rect = rootRef.current.getBoundingClientRect();
    const popoverWidth = 120; // Approximate width of 3-column grid
    
    // Calculate centered position below the badge
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    const top = rect.bottom + 8;
    
    // Keep within viewport bounds
    const padding = 8;
    if (left < padding) left = padding;
    if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding;
    }
    
    setPosition({ top, left });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Close on escape key
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const trimmed = label.trim();
  if (!trimmed) return null;

  return (
    <span ref={rootRef} className="relative inline-flex">
      <Badge
        variant="neutral"
        scheme={scheme}
        size={size}
        onClick={() => setOpen((v) => !v)}
        ariaLabel={ariaLabel ?? `Change ${trimmed} badge color`}
      >
        {trimmed}
      </Badge>

      {open && createPortal(
        <div 
          ref={popoverRef}
          className="fixed z-modal bg-white dark:bg-navy-800 border border-neutral-300 dark:border-navy-600 rounded-lg p-2 shadow-2xl"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="grid grid-cols-3 gap-2">
            {GRID_SCHEMES.map((opt) => {
              const isSelected = opt === scheme;
              return (
                <button
                  key={opt}
                  type="button"
                  className="relative"
                  onClick={async () => {
                    if (saving) return;
                    setSaving(true);
                    try {
                      await onChangeScheme(opt);
                      setOpen(false);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  aria-label={`Set badge color to ${opt}`}
                >
                  <Badge
                    variant="neutral"
                    scheme={opt}
                    size="sm"
                    pill={false}
                    className="w-8 px-0 justify-center"
                  >
                    {isSelected ? (
                      <Icon name="check" size={12} color="primary" />
                    ) : (
                      <span aria-hidden="true">&nbsp;</span>
                    )}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </span>
  );
};
