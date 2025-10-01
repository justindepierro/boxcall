import { memo, useState, useCallback } from 'react';
import { Icon } from '../ui/Icon/Icon';
import type { Play } from '../../types/play';

interface PlayDetailModalProps {
  play: Play;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const PLAY_TYPE_GRADIENTS = {
  Pass: 'from-electric-500 to-purple-500',
  Run: 'from-jade-500 to-emerald-500',
  RPO: 'from-navy-600 to-blue-600',
  'Play Action': 'from-amber-500 to-orange-500',
} as const;

export const PlayDetailModal = memo<PlayDetailModalProps>(({
  play,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'analytics'>('overview');

  // Close on escape key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const playTypeGradient = PLAY_TYPE_GRADIENTS[play.p_type as keyof typeof PLAY_TYPE_GRADIENTS] || 'from-gray-500 to-slate-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="play-detail-title"
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-[32px] border-2 border-white/30 dark:border-slate-700/30 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className={`relative h-32 bg-gradient-to-r ${playTypeGradient} overflow-hidden`}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            aria-label="Close modal"
          >
            <Icon name="close" className="w-5 h-5 text-white" />
          </button>

          {/* Play Title */}
          <div className="absolute bottom-4 left-6">
            <h2
              id="play-detail-title"
              className="text-3xl font-bold text-white mb-1 drop-shadow-lg"
            >
              {play.formation} {play.play_name}
            </h2>
            {play.one_word_play && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold">
                Code: {play.one_word_play.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700">
          {/* Tabs */}
          <div className="flex gap-1">
            {(['overview', 'details', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-electric-100 dark:bg-electric-900/30 text-electric-700 dark:text-electric-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-600 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Icon name="edit" className="w-4 h-4" />
                Edit
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="w-10 h-10 rounded-xl bg-jade-100 dark:bg-jade-900/30 hover:bg-jade-200 dark:hover:bg-jade-800/40 flex items-center justify-center transition-all hover:scale-105"
                aria-label="Duplicate play"
              >
                <Icon name="copy" className="w-4 h-4 text-jade-600 dark:text-jade-400" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 flex items-center justify-center transition-all hover:scale-105"
                aria-label="Delete play"
              >
                <Icon name="delete" className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-240px)] p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Diagram Preview */}
              {play.diagram_url && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                  <img
                    src={play.diagram_url}
                    alt={`${play.formation} ${play.play_name} diagram`}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="backdrop-blur-xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Type</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{play.p_type}</div>
                </div>
                <div className="backdrop-blur-xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Confidence</div>
                  <div className="text-lg font-bold text-jade-600 dark:text-jade-400">
                    {play.confidence_base}%
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Called</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {play.times_called}x
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Success</div>
                  <div className="text-lg font-bold text-electric-600 dark:text-electric-400">
                    {play.times_called > 0
                      ? Math.round((play.times_successful / play.times_called) * 100)
                      : 0}%
                  </div>
                </div>
              </div>

              {/* Key Information */}
              <div className="backdrop-blur-xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Formation Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {play.personnel && (
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Personnel</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {play.personnel}
                      </div>
                    </div>
                  )}
                  {play.f_type && (
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Type</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {play.f_type}
                      </div>
                    </div>
                  )}
                  {play.f_dir && (
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Direction</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {play.f_dir}
                      </div>
                    </div>
                  )}
                  {play.protection && (
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Protection</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {play.protection}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="backdrop-blur-xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Play Execution
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Back Alignment', value: play.back_align },
                    { label: 'Shift', value: play.shift },
                    { label: 'Motion', value: play.motion },
                    { label: 'Run Strength', value: play.r_str },
                    { label: 'Pass Strength', value: play.p_str },
                    { label: 'Key Player 1', value: play.key_player1 },
                    { label: 'Key Player 2', value: play.key_player2 },
                  ].map(
                    (item) =>
                      item.value && (
                        <div key={item.label} className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {item.label}
                          </span>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {item.value}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* Tags */}
              {(play.p_tag1 || play.p_tag2 || play.ftag1 || play.ftag2) && (
                <div className="backdrop-blur-xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {[play.p_tag1, play.p_tag2, play.ftag1, play.ftag2]
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="backdrop-blur-xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Success Rate
                      </span>
                      <span className="text-lg font-bold text-jade-600 dark:text-jade-400">
                        {play.times_called > 0
                          ? Math.round((play.times_successful / play.times_called) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-jade-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            play.times_called > 0
                              ? (play.times_successful / play.times_called) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Times Called
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {play.times_called}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
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
  );
});

PlayDetailModal.displayName = 'PlayDetailModal';
