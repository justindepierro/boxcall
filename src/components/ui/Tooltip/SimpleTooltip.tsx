import React from "react";
import { colorTokens } from "../../../design-system/tokens";

/**
 * Super minimal tooltip for debugging
 */
export const SimpleTooltip = ({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) => {
  const [show, setShow] = React.useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => {
        setShow(true);
      }}
      onMouseLeave={() => {
        setShow(false);
      }}
    >
      {children}
      {show && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 py-2 px-3 text-white rounded-lg text-xs whitespace-nowrap pointer-events-none"
          style={{
            background: colorTokens.gray[800],
            zIndex: 99999,
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
};
