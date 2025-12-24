import React from "react";

// Simple className utility
const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

interface GlassmorphicDropdownProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  width?: "full" | "auto" | string;
}

export const GlassmorphicDropdown: React.FC<GlassmorphicDropdownProps> = ({
  isOpen,
  children,
  className = "",
  maxHeight = "max-h-60",
  width = "full",
}) => {
  if (!isOpen) return null;

  const widthClass = (() => {
    if (width === "full") return "w-full";
    if (width === "auto") return "w-auto";
    return width;
  })();

  return (
    <div
      className={cn(
        "absolute z-50 mt-1",
        "backdrop-blur-xl bg-white/98 dark:bg-navy-900/98",
        "border border-white/20 dark:border-navy-700/30",
        "rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/30",
        "ring-1 ring-black/5 dark:ring-white/10",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        "overflow-y-auto",
        widthClass,
        maxHeight,
        className
      )}
    >
      {children}
    </div>
  );
};

interface GlassmorphicDropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  isLast?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const GlassmorphicDropdownItem: React.FC<
  GlassmorphicDropdownItemProps
> = ({
  children,
  onClick,
  isSelected = false,
  isLast = false,
  className = "",
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 text-left transition-all duration-200",
        "flex items-start gap-3",
        "border-b border-white/10 dark:border-navy-700/20",
        "hover:bg-white/95 dark:hover:bg-navy-800/90 hover:backdrop-blur-sm",
        isSelected &&
          "bg-jade-500/20 dark:bg-jade-400/20 backdrop-blur-sm border-jade-500/30 dark:border-jade-400/30",
        isLast && "border-b-0",
        className
      )}
    >
      {icon && (
        <div className="w-6 h-6 rounded-full bg-jade-500/20 dark:bg-jade-400/20 backdrop-blur-sm flex items-center justify-center mt-0.5 flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </button>
  );
};

interface GlassmorphicDropdownSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export const GlassmorphicDropdownSeparator: React.FC<
  GlassmorphicDropdownSeparatorProps
> = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "px-4 py-2 border-t border-white/20 dark:border-navy-700/30",
        "bg-white/90 dark:bg-navy-800/90 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

// Input enhancement wrapper for glassmorphic inputs
interface GlassmorphicInputProps {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
}

export const GlassmorphicInputWrapper: React.FC<GlassmorphicInputProps> = ({
  children,
  className = "",
  error = false,
}) => {
  return (
    <div className={cn("relative transition-all duration-200", className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-lg backdrop-blur-sm opacity-0 transition-opacity duration-200",
          "peer-focus:opacity-100",
          error
            ? "bg-error-500/5 border border-error-500/20"
            : "bg-jade-500/5 border border-jade-500/20"
        )}
      />
      {children}
    </div>
  );
};
