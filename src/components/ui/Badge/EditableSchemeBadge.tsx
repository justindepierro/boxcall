import React, { useEffect, useRef, useState } from "react";

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
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!rootRef.current?.contains(target)) setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
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

      {open && (
        <div className="fixed z-modal w-max bg-white dark:bg-navy-800 border border-neutral-300 dark:border-navy-600 rounded-lg p-2 shadow-2xl"
          style={{
            top: rootRef.current ? rootRef.current.getBoundingClientRect().bottom + 8 : 0,
            left: rootRef.current ? rootRef.current.getBoundingClientRect().left + rootRef.current.getBoundingClientRect().width / 2 : 0,
            transform: 'translateX(-50%)',
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
        </div>
      )}
    </span>
  );
};
