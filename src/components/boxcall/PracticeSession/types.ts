/**
 * PracticeSession Types
 *
 * Type definitions for the Practice Session component family
 */

import type { ExecutionResult } from "../../../types/session";
import type {
  PracticeScript,
  PracticeScriptPlay,
} from "@services";
import type { Play } from "../../../types/play";
import type { SessionStats } from "../../../hooks/usePracticeSession";

/**
 * Props for PracticeSessionHeader component
 */
export interface PracticeSessionHeaderProps {
  practiceScript: PracticeScript;
  mode: "live" | "retroactive";
  hasPendingSync: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

/**
 * Props for OverallProgressBar component
 */
export interface OverallProgressBarProps {
  progress: number;
}

/**
 * Props for CurrentPlayCard component
 */
export interface CurrentPlayCardProps {
  currentPlay: PracticeScriptPlay | null;
  currentPlayIndex: number;
  totalPlays: number;
  playProgress: number;
  isPaused: boolean;
  isLastPlay: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Props for SessionStatsCard component
 */
export interface SessionStatsCardProps {
  computedStats: SessionStats;
}

/**
 * Props for ScriptPlaysList component
 */
export interface ScriptPlaysListProps {
  scriptPlays: PracticeScriptPlay[];
  currentPlayIndex: number;
  isPaused: boolean;
}

/**
 * Props for NotesSection component
 */
export interface NotesSectionProps {
  notes: string;
  showNotes: boolean;
  isPaused: boolean;
  onNotesChange: (notes: string) => void;
  onToggleNotes: () => void;
}

/**
 * Props for RepTrackerSection component
 */
export interface RepTrackerSectionProps {
  currentRep: number;
  totalReps: number;
  repHistory: Map<number, { result: ExecutionResult; notes?: string }>;
  isPaused: boolean;
  onResult: (
    result: ExecutionResult,
    notes?: string,
    tags?: string[]
  ) => Promise<void>;
  onSkip: () => Promise<void>;
  onGoToRep: (repNumber: number) => void;
}

/**
 * Props for state components (Loading, NoTeam, Error, PreSession)
 */
export interface LoadingStateProps {}

export interface NoTeamStateProps {
  onNavigate: () => void;
}

export interface ErrorStateProps {
  error: Error | null;
  scriptId: string | undefined;
  onBack: () => void;
  onCreate: () => void;
}

export interface PreSessionStateProps {
  practiceScript: PracticeScript;
  scriptPlays: PracticeScriptPlay[];
  mode: "live" | "retroactive";
  onCancel: () => void;
  onStart: () => Promise<void>;
}

/**
 * Play display info helper return type
 */
export interface PlayDisplayInfo {
  displayName: string;
  subtitle: string | null;
}

/**
 * Get play display info from play object
 */
export function getPlayDisplayInfo(play: Play | undefined): PlayDisplayInfo {
  if (!play)
    return {
      displayName: "Unknown Play",
      subtitle: null,
    };

  // Use play_name as the primary display, one_word_play as subtitle if both exist
  return {
    displayName: play.one_word_play || play.play_name || "Unknown Play",
    subtitle: play.play_name && play.one_word_play ? play.play_name : null,
  };
}
