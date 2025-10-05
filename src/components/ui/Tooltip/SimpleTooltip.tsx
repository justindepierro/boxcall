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
            marginBottom: "8px",
            padding: "8px 12px",
            background: colorTokens.gray[800],
            color: "white",
            borderRadius: "6px",
            fontSize: "12px",
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
