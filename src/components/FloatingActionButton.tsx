import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./ui/Icon/Icon";
import type { IconName } from "./ui/Icon/Icon";
import type { FABAction } from "./FABPresets";
import { triggerHapticFeedback } from "../lib/hapticFeedback";

interface FloatingActionButtonProps {
  /** Quick actions to show in radial menu */
  actions: FABAction[];
  /** Main FAB icon (default: "plus") */
  icon?: IconName;
  /** Position from bottom (default: 16px) */
  bottom?: number;
  /** Position from right (default: 16px) */
  right?: number;
  /** Size of main FAB (default: 56px) */
  size?: number;
  /** Z-index (default: 50) */
  zIndex?: number;
}

/**
 * FloatingActionButton - Mobile-first FAB with radial menu
 *
 * Features:
 * - Large touch target (56px)
 * - Radial menu expansion
 * - Spring animations
 * - Accessible with keyboard support
 */
export function FloatingActionButton({
  actions,
  icon = "plus",
  bottom = 16,
  right = 16,
  size = 56,
  zIndex = 50,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    triggerHapticFeedback("light");
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: FABAction) => {
    triggerHapticFeedback("medium");
    action.onClick();
    setIsOpen(false);
  };

  // Calculate action positions in a radial pattern
  const getActionPosition = (index: number, total: number) => {
    // Start from top-left and go counter-clockwise
    const angleStart = -135; // degrees
    const angleRange = 90; // spread across 90 degrees
    const angle = angleStart + (angleRange / (total - 1)) * index;
    const angleRad = (angle * Math.PI) / 180;
    const distance = size + 60; // Distance from FAB center

    return {
      x: Math.cos(angleRad) * distance,
      y: Math.sin(angleRad) * distance,
    };
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: zIndex - 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen &&
          actions.map((action, index) => {
            const position = getActionPosition(index, actions.length);

            return (
              <motion.button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`
                  fixed flex items-center gap-2 px-4 py-3 rounded-full shadow-lg
                  ${action.color || "bg-surface-card"} text-primary
                  hover:scale-105 active:scale-95
                  transition-transform
                `}
                style={{
                  bottom: bottom + size / 2,
                  right: right + size / 2,
                  zIndex: zIndex + 1,
                }}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: position.x,
                  y: position.y,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  delay: index * 0.05,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name={action.icon} size="sm" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={toggleMenu}
        className="fixed rounded-full shadow-2xl bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center justify-center"
        style={{
          bottom,
          right,
          width: size,
          height: size,
          zIndex: zIndex + 2,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        aria-label={isOpen ? "Close menu" : "Open quick actions"}
        aria-expanded={isOpen}
      >
        <Icon name={icon} size="lg" className="text-white" />
      </motion.button>
    </>
  );
}
