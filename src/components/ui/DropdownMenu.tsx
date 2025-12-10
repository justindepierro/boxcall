import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

/**
 * DropdownMenu - Action menu using Headless UI Menu
 * 
 * For value selection (form inputs), use `Select` or `Dropdown` instead.
 * This is for action menus (edit, delete, share, etc.)
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {children}
    </Menu>
  );
};

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
>(({ children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return (
      <Menu.Button as={Fragment}>
        {React.cloneElement(children, { ref, ...props } as React.Attributes)}
      </Menu.Button>
    );
  }
  return (
    <Menu.Button ref={ref} {...props}>
      {children}
    </Menu.Button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
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
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className={`absolute z-50 mt-2 w-56 origin-top ${alignment} rounded-lg bg-surface border border-border shadow-lg focus:outline-none ${className}`}
        {...props}
      >
        <div className="py-1">
          {children}
        </div>
      </Menu.Items>
    </Transition>
  );
};

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  onSelect?: () => void;
}

export const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ children, className = "", isActive, onSelect, onClick, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSelect?.();
    onClick?.(e);
  };

  return (
    <Menu.Item>
      {({ active }) => (
        <button
          ref={ref}
          className={`w-full px-3 py-2 text-sm text-left transition-colors ${
            active || isActive
              ? "bg-jade-50 dark:bg-jade-900/20 text-jade-700 dark:text-jade-200"
              : "text-primary hover:bg-surface-hover dark:hover:bg-surface-hover"
          } ${className}`}
          onClick={handleClick}
          {...props}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";
