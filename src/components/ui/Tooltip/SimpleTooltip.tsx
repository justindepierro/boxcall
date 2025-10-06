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
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => {
        console.log("ENTER");
        setShow(true);
      }}
      onMouseLeave={() => {
        console.log("LEAVE");
        setShow(false);
      }}
    >
      {children}
      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "0.5rem", // 8px = mb-2
            padding: "0.5rem 0.75rem", // 8px 12px = py-2 px-3
            background: colorTokens.gray[800],
            color: "white",
            borderRadius: "12px", // Tier 1: rounded-lg standard (10-12px)
            fontSize: "0.75rem", // 12px = text-xs
            whiteSpace: "nowrap",
            zIndex: 99999,
            pointerEvents: "none",
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
};
