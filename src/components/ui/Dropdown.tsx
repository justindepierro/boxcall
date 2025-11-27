import React, { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child, { isOpen, setIsOpen } as any);
          }
          if (child.type === DropdownMenuContent) {
            return React.cloneElement(child, { isOpen, setIsOpen } as any);
          }
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
  }
>(({ children, asChild, isOpen, setIsOpen, onClick, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen?.(!isOpen);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...props,
    } as any);
  }
  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = "start",
  className = "",
  isOpen,
  setIsOpen,
  ...props
}) => {
  if (!isOpen) return null;

  const alignment = align === "end" ? "right-0" : "left-0";
  return (
    <div
      className={`absolute z-50 mt-2 w-56 origin-top ${alignment} rounded-lg bg-surface-primary shadow-lg border border-surface-subtle focus:outline-none ${className}`}
      role="menu"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuItem) {
          return React.cloneElement(child, { setIsOpen } as any);
        }
        return child;
      })}
    </div>
  );
};

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  setIsOpen?: (open: boolean) => void;
  onSelect?: () => void;
}

export const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(
  (
    {
      children,
      className = "",
      isActive,
      setIsOpen,
      onSelect,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onSelect?.();
      setIsOpen?.(false); // Close dropdown after selection
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={`w-full px-3 py-2 text-sm text-left transition-colors ${
          isActive
            ? "bg-jade-100 text-jade-700 dark:bg-jade-900/40 dark:text-jade-200"
            : "text-primary hover:bg-surface-hover dark:hover:bg-surface-hover"
        } ${className}`}
        role="menuitem"
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";
