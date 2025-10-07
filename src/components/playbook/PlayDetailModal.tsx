import { memo, useState, useCallback } from "react";
import { Icon } from "../ui/Icon/Icon";
import type { Play } from "../../types/play";

interface PlayDetailModalProps {
  play: Play;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const PLAY_TYPE_GRADIENTS = {
  Pass: "from-electric-500 to-purple-500",
  Run: "from-jade-500 to-emerald-500",
  RPO: "from-navy-600 to-blue-600",
  "Play Action": "from-amber-500 to-orange-500",
} as const;

export const PlayDetailModal = memo<PlayDetailModalProps>(
  ({ play, isOpen, onClose, onEdit, onDuplicate, onDelete }) => {
    const [activeTab, setActiveTab] = useState<
      "overview" | "details" | "analytics"
    >("overview");

    // Close on escape key
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      },
      [onClose]
    );

    if (!isOpen) return null;

    const playTypeGradient =
      PLAY_TYPE_GRADIENTS[play.p_type as keyof typeof PLAY_TYPE_GRADIENTS] ||
      "from-gray-500 to-slate-500";

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="play-detail-title"
      >
        {/* Modal Container - No padding gap */}
        <div
          className="relative w-full max-w-6xl max-h-[94vh] mx-4 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl border-2 border-white/30 dark:border-slate-700/30 shadow-2xl animate-genie-open flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Header with pattern and shine */}
          <div
            className={`relative h-32 bg-gradient-to-br ${playTypeGradient} rounded-t-[30px] overflow-hidden flex-shrink-0`}
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          >
            {/* Shine overlay - single layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
              aria-label="Close modal"
            >
              <Icon name="close" className="w-5 h-5 text-white" />
            </button>

            {/* Play Title - More compact */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wide`}
                >
                  {play.p_type}
                </span>
                {play.f_type && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
                    {play.f_type}
                  </span>
                )}
              </div>
              <h2
                id="play-detail-title"
                className="text-3xl font-bold text-white mb-1.5 drop-shadow-lg"
              >
                {play.formation} {play.play_name}
              </h2>
              {play.one_word_play && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-white text-sm font-bold border border-white/30">
                  <Icon name="zap" className="w-3.5 h-3.5 mr-1.5" />
                  {play.one_word_play.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Action Bar - More compact */}
          <div className="flex items-center justify-between px-6 py-3 border-b border dark:border-slate-700/50 bg-surface-secondary/50 dark:bg-slate-800/30 flex-shrink-0">
            {/* Tabs */}
            <div className="flex gap-2">
              {(["overview", "details", "analytics"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-electric-100 dark:bg-electric-900/30 text-electric-700 dark:text-electric-400"
                      : "text-secondary dark:text-muted hover:bg-surface-muted dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Action Buttons - More compact */}
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 rounded-lg bg-electric-500 hover:bg-electric-600 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Icon name="edit" className="w-4 h-4" />
                  Edit
                </button>
              )}
              {onDuplicate && (
                <button
                  onClick={onDuplicate}
                  className="w-9 h-9 rounded-lg bg-jade-100 dark:bg-jade-900/30 hover:bg-jade-200 dark:hover:bg-jade-800/40 flex items-center justify-center transition-all hover:scale-105"
                  aria-label="Duplicate play"
                >
                  <Icon
                    name="copy"
                    className="w-4 h-4 text-jade-600 dark:text-jade-400"
                  />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="w-9 h-9 rounded-lg bg-error-bg dark:bg-error-900/30 hover:bg-error-200 dark:hover:bg-error-800/40 flex items-center justify-center transition-all hover:scale-105"
                  aria-label="Delete play"
                >
                  <Icon
                    name="delete"
                    className="w-4 h-4 text-error-600 dark:text-error-500"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Content Area - More compact with more space and bottom rounding */}
          <div className="overflow-y-auto flex-1 rounded-b-[30px]">
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Diagram Preview */}
                  {play.diagram_url && (
                    <div className="relative rounded-2xl overflow-hidden border-2 dark:border-slate-700 shadow-lg">
                      <img
                        src={play.diagram_url}
                        alt={`${play.formation} ${play.play_name} diagram`}
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Quick Stats Grid - More compact */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="backdrop-blur-xl bg-surface-secondary dark:bg-slate-800/50 rounded-xl p-4 border border/50 dark:border-slate-700/50">
                      <div className="text-xs font-semibold text-muted dark:text-muted mb-2 uppercase tracking-wide">
                        Type
                      </div>
                      <div className="text-lg font-bold text-primary dark:text-white">
                        {play.p_type}
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-surface-secondary dark:bg-slate-800/50 rounded-xl p-4 border border/50 dark:border-slate-700/50">
                      <div className="text-xs font-semibold text-muted dark:text-muted mb-2 uppercase tracking-wide">
                        Confidence
                      </div>
                      <div className="text-lg font-bold text-jade-600 dark:text-jade-400">
                        {play.confidence_base}%
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-surface-secondary dark:bg-slate-800/50 rounded-xl p-4 border border/50 dark:border-slate-700/50">
                      <div className="text-xs font-semibold text-muted dark:text-muted mb-2 uppercase tracking-wide">
                        Called
                      </div>
                      <div className="text-lg font-bold text-primary dark:text-white">
                        {play.times_called}x
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-surface-secondary dark:bg-slate-800/50 rounded-xl p-4 border border/50 dark:border-slate-700/50">
                      <div className="text-xs font-semibold text-muted dark:text-muted mb-2 uppercase tracking-wide">
                        Success
                      </div>
                      <div className="text-lg font-bold text-electric-600 dark:text-electric-400">
                        {play.times_called > 0
                          ? Math.round(
                              (play.times_successful / play.times_called) * 100
                            )
                          : 0}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Key Information - More compact */}
                  <div className="backdrop-blur-xl bg-surface-secondary dark:bg-slate-800/50 rounded-2xl p-5 border border/50 dark:border-slate-700/50">
                    <h3 className="text-lg font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
                      <Icon
                        name="shield"
                        className="w-4 h-4 text-electric-600"
                      />
                      Formation Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {play.personnel && (
                        <div>
                          <div className="text-xs font-semibold text-muted dark:text-muted mb-2 uppercase tracking-wide">
                            Personnel
                          </div>
                          <div className="text-base font-semibold text-primary dark:text-white">
                            {play.personnel}
                          </div>
                        </div>
                      )}
                      {play.f_type && (
                        <div>
                          <div className="text-xs font-semibold text-muted dark:text-muted mb-2 uppercase tracking-wide">
                            Type
                          </div>
                          <div className="text-base font-semibold text-primary dark:text-white">
                            {play.f_type}
                          </div>
                        </div>
                      )}
                      {play.f_dir && (
                        <div>
                          <div className="text-xs font-semibold text-muted dark:text-muted mb-2 uppercase tracking-wide">
                            Direction
                          </div>
                          <div className="text-base font-semibold text-primary dark:text-white">
                            {play.f_dir}
                          </div>
                        </div>
                      )}
                      {play.protection && (
                        <div>
                          <div className="text-xs font-semibold text-muted dark:text-muted mb-2 uppercase tracking-wide">
                            Protection
                          </div>
                          <div className="text-base font-semibold text-primary dark:text-white">
                            {play.protection}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="backdrop-blur-xl bg-surface-secondary dark:bg-slate-800/50 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-primary dark:text-white mb-4">
                      Play Execution
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "Back Alignment", value: play.back_align },
                        { label: "Shift", value: play.shift },
                        { label: "Motion", value: play.motion },
                        { label: "Run Strength", value: play.r_str },
                        { label: "Pass Strength", value: play.p_str },
                        { label: "Key Player 1", value: play.key_player1 },
                        { label: "Key Player 2", value: play.key_player2 },
                      ].map(
                        (item) =>
                          item.value && (
                            <div
                              key={item.label}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm text-secondary dark:text-slate-400">
                                {item.label}
                              </span>
                              <span className="text-sm font-medium text-primary dark:text-white">
                                {item.value}
                              </span>
                            </div>
                          )
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {(play.p_tag1 || play.p_tag2 || play.ftag1 || play.ftag2) && (
                    <div className="backdrop-blur-xl bg-surface-secondary dark:bg-slate-800/50 rounded-2xl p-5">
                      <h3 className="text-lg font-bold text-primary dark:text-white mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {[play.p_tag1, play.p_tag2, play.ftag1, play.ftag2]
                          .filter(Boolean)
                          .map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 text-secondary dark:text-slate-300 text-sm font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-4">
                  <div className="backdrop-blur-xl bg-surface-secondary dark:bg-slate-800/50 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-primary dark:text-white mb-4">
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-secondary dark:text-slate-400">
                            Success Rate
                          </span>
                          <span className="text-lg font-bold text-jade-600 dark:text-jade-400">
                            {play.times_called > 0
                              ? Math.round(
                                  (play.times_successful / play.times_called) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-surface-muted dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-jade-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                play.times_called > 0
                                  ? (play.times_successful /
                                      play.times_called) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted dark:text-muted mb-1">
                            Times Called
                          </div>
                          <div className="text-2xl font-bold text-primary dark:text-white">
                            {play.times_called}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted dark:text-muted mb-1">
                            Successful
                          </div>
                          <div className="text-2xl font-bold text-electric-600 dark:text-electric-400">
                            {play.times_successful}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PlayDetailModal.displayName = "PlayDetailModal";
