import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@components/playbook/diagram-editor/types/Player";
import { Icon } from "@components/ui/Icon";

interface PlayerPropertiesDrawerProps {
  /** Selected player (null if none selected) */
  player: Player | null;

  /** Called when drawer should close */
  onClose: () => void;

  /** Called when "Flip Side" is clicked */
  onFlipSide: (playerId: string) => void;

  /** Called when "Edit Position" is clicked */
  onEditPosition: (playerId: string) => void;

  /** Called when "Copy" is clicked */
  onCopy: (playerId: string) => void;

  /** Called when "Delete" is clicked */
  onDelete: (playerId: string) => void;
}

/**
 * PlayerPropertiesDrawer - Mobile-optimized player quick actions
 *
 * Features:
 * - Slide-up panel on player selection
 * - Quick actions: Flip Side, Edit Position, Copy, Delete
 * - Shows player coordinates and jersey number
 * - Touch-optimized action buttons
 * - Auto-closes on outside tap
 */
export const PlayerPropertiesDrawer: React.FC<PlayerPropertiesDrawerProps> = ({
  player,
  onClose,
  onFlipSide,
  onEditPosition,
  onCopy,
  onDelete,
}) => {
  const isOpen = player !== null;

  return (
    <AnimatePresence>
      {isOpen && player && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 bg-surface-primary rounded-t-3xl shadow-2xl z-50 max-w-lg mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-border rounded-full" />
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              {/* Player Info Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-lg font-semibold text-primary">
                    Player #{player.jerseyNumber}
                  </div>
                  <div className="text-sm text-secondary mt-0.5">
                    {player.team === "offense" ? "Offense" : "Defense"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-secondary">Position</div>
                  <div className="text-sm font-medium text-primary">
                    X: {player.x.toFixed(1)}, Y: {player.y.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Flip Side */}
                <button
                  onClick={() => {
                    onFlipSide(player.id);
                    onClose();
                  }}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-surface-secondary hover:bg-surface-tertiary active:bg-border rounded-xl transition-colors touch-manipulation"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="move" className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">
                    Flip Side
                  </span>
                </button>

                {/* Edit Position */}
                <button
                  onClick={() => {
                    onEditPosition(player.id);
                    onClose();
                  }}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-surface-secondary hover:bg-surface-tertiary active:bg-border rounded-xl transition-colors touch-manipulation"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="edit" className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">
                    Edit Position
                  </span>
                </button>

                {/* Copy */}
                <button
                  onClick={() => {
                    onCopy(player.id);
                    onClose();
                  }}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-surface-secondary hover:bg-surface-tertiary active:bg-border rounded-xl transition-colors touch-manipulation"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="copy" className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">Copy</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    onDelete(player.id);
                    onClose();
                  }}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-error-bg hover:bg-error-bg/80 active:bg-error-bg/60 rounded-xl transition-colors touch-manipulation"
                >
                  <div className="w-10 h-10 rounded-full bg-error-fg/10 flex items-center justify-center">
                    <Icon name="delete" className="w-5 h-5 text-error-fg" />
                  </div>
                  <span className="text-sm font-medium text-error-fg">
                    Delete
                  </span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full mt-4 px-4 py-3 bg-surface-secondary hover:bg-surface-tertiary active:bg-border rounded-xl transition-colors touch-manipulation"
              >
                <span className="text-sm font-medium text-primary">Cancel</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
