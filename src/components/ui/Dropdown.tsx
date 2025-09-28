import React from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => (
  <div className="relative inline-block text-left">{children}</div>
);

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      ...props,
    });
  }
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
  className?: string;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = "start",
  className = "",
  ...props
}) => {
  const alignment = align === "end" ? "right-0" : "left-0";
  return (
    <div
      className={`absolute z-50 mt-2 w-56 origin-top ${alignment} rounded-md bg-surface-card shadow-lg border border-surface-subtle focus:outline-none ${className}`}
      role="menu"
      {...props}
    >
      {children}
    </div>
  );
};

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ children, className = "", isActive, ...props }, ref) => (
  <button
    ref={ref}
    className={`w-full px-3 py-2 text-sm text-left transition-colors ${
      isActive
        ? "bg-jade-100 text-jade-700 dark:bg-jade-900/40 dark:text-jade-200"
        : "text-text-primary hover:bg-surface-hover dark:hover:bg-surface-hover"
    } ${className}`}
    role="menuitem"
    {...props}
  >
    {children}
  </button>
));
DropdownMenuItem.displayName = "DropdownMenuItem";
