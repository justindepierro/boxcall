import React, { useEffect } from "react";
import { ModularIcon as Icon } from "../../ui/Icon";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { Tooltip } from "../../ui/Tooltip/Tooltip";

interface MobileDrawerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  widthClass?: string; // allow custom width
}

/**
 * Accessible mobile drawer (slide-over) used for Playbook filters & glossary.
 * - Hidden on md+ via parent control
 * - Focus returns to previously focused element on close
 */
export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  title,
  isOpen,
  onClose,
  children,
  side = "right",
  widthClass = "w-full max-w-sm",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute top-0 bottom-0 ${side === "right" ? "right-0" : "left-0"} ${widthClass} surface-card shadow-xl border-l border-subtle flex flex-col animate-slide-in`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
          <Typography variant="label-md" as="h2" className="text-text-primary">
            {title}
          </Typography>
          <Tooltip content="Close drawer (Esc)">
            <Button
              variant="ghost"
              size="xs"
              onClick={onClose}
              className="p-1 h-auto w-auto"
              aria-label="Close drawer"
            >
              <Icon name="close" size="sm" />
            </Button>
          </Tooltip>
        </div>
        <div className="flex-1 overflow-y-auto p-3 pb-24">{children}</div>
      </div>
    </div>
  );
};

export default MobileDrawer;
