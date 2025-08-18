import React, { useCallback, useId, useState } from "react";
import { Icon } from "../Icon/Icon";
import type { IconProps } from "../Icon/Icon";
import { Button } from "../Button";

export interface NavGroupProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}

const NavGroupImpl: React.FC<NavGroupProps> = ({
  id,
  label,
  icon,
  defaultExpanded = false,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();
  const toggle = useCallback(() => setExpanded((e) => !e), []);

  // Detect RTL context
  const isRTL = typeof document !== "undefined" && document.dir === "rtl";
  // Only mirror if icon is our Icon component
  const renderIcon = () => {
    if (!icon) return <span>{isRTL ? "◂" : "▸"}</span>;
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
    <li className="my-1" id={id}>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={toggle}
          className="w-full justify-start gap-2"
          dir={isRTL ? "rtl" : undefined}
        >
          <span
            className="w-5 h-5 flex items-center justify-center"
            aria-hidden
          >
            {renderIcon()}
          </span>
          <span className="flex-1 text-left">{label}</span>
        </Button>
      </div>
      <div id={contentId} role="group" hidden={!expanded} className="pl-4 mt-1">
        <ul role="menu" aria-label={label}>
          {children}
        </ul>
      </div>
    </li>
  );
};

NavGroupImpl.displayName = "NavGroup";
export const NavGroup = React.memo(NavGroupImpl);
export default NavGroup;
