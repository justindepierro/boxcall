import React, { useRef, useEffect, useState } from "react";

export interface ScrollingTextProps {
  children: string;
  className?: string;
  speed?: number; // pixels per second, default 30
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  title?: string;
  mode?: "infinite" | "bounce"; // infinite = continuous scroll, bounce = back and forth
}

/**
 * ScrollingText - A reusable component that scrolls text on hover when it overflows
 *
 * Features:
 * - Only scrolls when text is longer than container
 * - Smooth, continuous animation on hover
 * - Configurable scroll speed
 * - Accessible with title attribute
 * - Performance optimized (animation only on hover)
 *
 * @example
 * ```tsx
 * <ScrollingText className="font-bold text-lg">
 *   Really Long Play Name That Needs To Scroll
 * </ScrollingText>
 * ```
 */
export const ScrollingText: React.FC<ScrollingTextProps> = ({
  children,
  className = "",
  speed = 30,
  as: Component = "span",
  title,
  mode = "bounce",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Check if text overflows on mount and resize
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        const overflows = textWidth > containerWidth;

        setIsOverflowing(overflows);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [children, speed]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (!isOverflowing || !textRef.current || !containerRef.current) return;

    const textWidth = textRef.current.scrollWidth;
    const containerWidth = containerRef.current.clientWidth;
    const scrollDistance = textWidth - containerWidth; // Distance to scroll

    if (mode === "bounce") {
      // Back and forth animation - scroll just enough to show all text
      const duration = (scrollDistance * 2) / speed; // *2 because it goes back and forth
      textRef.current.style.animation = `scroll-text-bounce ${duration}s ease-in-out infinite alternate`;
      textRef.current.style.setProperty(
        "--scroll-distance",
        `-${scrollDistance}px`
      );
    } else {
      // Infinite loop animation
      const totalDistance = textWidth + containerWidth;
      const infiniteDuration = totalDistance / speed;
      textRef.current.style.animation = `scroll-text-infinite ${infiniteDuration}s linear infinite`;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (!textRef.current) return;
    textRef.current.style.animation = "none";
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={title || children}
    >
      <Component
        ref={textRef as any}
        className={`${className} ${isOverflowing && isHovering ? "whitespace-nowrap" : "truncate"}`}
        style={
          isOverflowing && isHovering
            ? {
                // Remove ellipsis and ensure full width when scrolling
                display: "inline-block",
                textOverflow: "clip",
                maxWidth: "none",
                width: "max-content",
                ...(mode === "infinite"
                  ? { paddingLeft: "100%", animation: "none" }
                  : {}),
              }
            : undefined
        }
      >
        {children}
      </Component>
    </div>
  );
};
