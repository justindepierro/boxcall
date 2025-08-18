import React from "react";

export interface NavItemProps {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  id,
  label,
  href,
  active,
  disabled,
  icon,
  badge,
  onClick,
}) => {
  const className = [
    "flex items-center gap-2 px-3 py-2 rounded-md",
    active ? "bg-brand-navy text-white" : "text-text-secondary hover:bg-muted",
    disabled ? "opacity-50 pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li id={id} role="none">
      <a
        role="menuitem"
        href={href}
        aria-current={active ? "page" : undefined}
        className={className}
        onClick={onClick}
      >
        <span className="w-5 h-5 flex items-center justify-center" aria-hidden>
          {icon ?? <span>■</span>}
        </span>
        <span className="flex-1 text-left">{label}</span>
        {badge != null && (
          <span className="ml-auto text-xs bg-jade-600 text-white rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
      </a>
    </li>
  );
};

export default NavItem;
