import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Play } from "../../../types/play";

interface PlayQuickViewProps {
  play: Play;
  isOpen: boolean;
  onClose: () => void;
  anchorElement: HTMLElement | null;
}

export const PlayQuickView: React.FC<PlayQuickViewProps> = ({
  play,
  isOpen,
  onClose,
  anchorElement,
}) => {
  const quickViewRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        quickViewRef.current &&
        !quickViewRef.current.contains(event.target as Node) &&
        anchorElement &&
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, anchorElement]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!anchorElement) return null;

  // Calculate position above the tile
  const rect = anchorElement.getBoundingClientRect();
  const top = rect.top - 10; // 10px above the tile
  const left = rect.left + rect.width / 2; // Center horizontally

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={quickViewRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="fixed z-50 bg-surface-primary rounded-lg shadow-xl p-4 min-w-72 max-w-80"
          style={{
            top: `${top}px`,
            left: `${left}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {/* Arrow pointing down to tile */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-surface-primary border-r border-b border-border-subtle rotate-45" />

          {/* Content */}
          <div className="space-y-3">
            {/* Play Name */}
            <div>
              <h4 className="font-mono font-bold text-base text-text-primary">
                {play.play_name}
              </h4>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {/* Type */}
              <div>
                <span className="text-text-tertiary text-xs font-medium">
                  Type
                </span>
                <div className="font-semibold text-text-secondary mt-0.5">
                  {play.p_type}
                </div>
              </div>

              {/* Formation */}
              {play.formation && (
                <div>
                  <span className="text-text-tertiary text-xs font-medium">
                    Formation
                  </span>
                  <div className="font-semibold text-text-secondary mt-0.5">
                    {play.formation}
                  </div>
                </div>
              )}

              {/* Personnel */}
              {play.personnel && (
                <div>
                  <span className="text-text-tertiary text-xs font-medium">
                    Personnel
                  </span>
                  <div className="font-semibold text-text-secondary mt-0.5">
                    {play.personnel}
                  </div>
                </div>
              )}

              {/* One Word Call */}
              {play.one_word_play && (
                <div>
                  <span className="text-text-tertiary text-xs font-medium">
                    Call
                  </span>
                  <div className="font-semibold text-text-info mt-0.5">
                    {play.one_word_play}
                  </div>
                </div>
              )}
            </div>

            {/* Quick hint */}
            <div className="pt-2 border-t border-border-subtle">
              <p className="text-xs text-text-tertiary text-center">
                Click{" "}
                <span className="font-semibold text-text-brand">Details</span>{" "}
                for full view
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
