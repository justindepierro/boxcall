import React from "react";
import { Icon } from "../Icon/Icon";
import type { IconProps } from "../Icon/Icon";

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

const NavItemImpl: React.FC<NavItemProps> = ({
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
    active
      ? "bg-[var(--semantic-bg-muted)] text-text-primary shadow-sm ring-1 ring-[color:var(--semantic-primary)]/20 border-l-2 border-[color:var(--semantic-primary)]"
      : "text-text-secondary hover:bg-[var(--semantic-bg-muted)] hover:text-text-primary",
    disabled ? "opacity-50 pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Detect RTL context
  const isRTL = typeof document !== "undefined" && document.dir === "rtl";
  // Only mirror if icon is our Icon component
  const renderIcon = () => {
    if (!icon) return <span>■</span>;
    if (
      React.isValidElement(icon) &&
      icon.type === Icon &&
      (icon.props as IconProps).name &&
      ["chevron-right", "chevron-left", "arrow-right", "arrow-left"].includes(
        (icon.props as IconProps).name
      )
    ) {
      const name = (icon.props as IconProps).name;
      const mirroredName =
        name === "chevron-right"
          ? isRTL
            ? "chevron-left"
            : "chevron-right"
          : name === "chevron-left"
            ? isRTL
              ? "chevron-right"
              : "chevron-left"
            : name === "arrow-right"
              ? isRTL
                ? "arrow-left"
                : "arrow-right"
              : name === "arrow-left"
                ? isRTL
                  ? "arrow-right"
                  : "arrow-left"
                : name;
      return React.cloneElement(icon as React.ReactElement<IconProps>, {
        name: mirroredName,
      });
    }
    return icon;
  };
  return (
    <li id={id} role="none">
      <a
        role="menuitem"
        href={href}
        aria-current={active ? "page" : undefined}
        className={className}
        onClick={onClick}
        dir={isRTL ? "rtl" : undefined}
      >
        <span className="w-5 h-5 flex items-center justify-center" aria-hidden>
          {renderIcon()}
        </span>
        <span className="flex-1 text-left">{label}</span>
        {badge != null && (
          <span
            className="ml-auto text-xs rounded-full px-2 py-0.5"
            style={{
              backgroundColor: "var(--semantic-primary)",
              color: "var(--semantic-text-inverse)",
            }}
          >
            {badge}
          </span>
        )}
      </a>
    </li>
  );
};
NavItemImpl.displayName = "NavItem";
export const NavItem = React.memo(NavItemImpl);
export default NavItem;
