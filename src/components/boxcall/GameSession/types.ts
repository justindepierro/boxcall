/**
 * Types for GameSession component
 */

import type { ExecutionResult, OpponentCoverage, GameSituation } from '../../../types/session';

export interface PlayLogForm {
  yardsGained: string;
  result: ExecutionResult;
  wasTouchdown: boolean;
  wasTurnover: boolean;
  wasPenalty: boolean;
  penaltyYards: string;
  notes: string;
  quickTags: string[];
  opponentCoverage: OpponentCoverage;
}

export interface GameSessionHeaderProps {
  gamePlanName: string;
  mode: 'live' | 'retroactive';
  opponent: string;
  hasPendingSync: boolean;
  isPaused: boolean;
  isGoalLine: boolean;
  isRedZone: boolean;
  onBack: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

export interface DownDistanceCardProps {
  situation: GameSituation;
  onUpdate: (updates: Partial<GameSituation>) => void;
  onFirstDown: () => void;
  onNextQuarter: () => void;
  disabled: boolean;
}

export interface PlaySelectionCardProps {
  situation: GameSituation;
  gamePlanPlays: Array<{
    id: string;
    play_id: string;
    priority: number;
    notes?: string;
    plays: { id: string; name: string };
  }>;
  filteredPlays: Array<{ id: string; play_id: string }>;
  currentPlay: { id: string; name: string } | null;
  onSelectPlay: (play: { id: string; name: string }) => void;
  teamId: string;
  disabled: boolean;
}

export interface PlayExecutionFormProps {
  currentPlay: { id: string; name: string };
  form: PlayLogForm;
  onFormChange: (updates: Partial<PlayLogForm>) => void;
  onTagToggle: (tagId: string) => void;
  onSubmit: () => void;
  isPaused: boolean;
}

export interface DriveStatsCardProps {
  plays: number;
  yards: number;
  touchdowns: number;
  turnovers: number;
}

export interface GameStatsCardProps {
  successRate: number;
  totalPlays: number;
  totalYards: number;
  totalTouchdowns: number;
  totalTurnovers: number;
}

export const QUICK_TAGS = [
  { id: 'great-blocking', label: 'Great Blocking' },
  { id: 'broken-tackle', label: 'Broken Tackle' },
  { id: 'great-catch', label: 'Great Catch' },
  { id: 'dropped-pass', label: 'Dropped Pass' },
  { id: 'good-protection', label: 'Good Protection' },
  { id: 'pressure', label: 'Pressure' },
  { id: 'great-read', label: 'Great Read' },
  { id: 'wrong-route', label: 'Wrong Route' },
];

export const RESULT_OPTIONS = [
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
  { value: 'neutral', label: 'Neutral' },
];

export const COVERAGE_OPTIONS = [
  { value: 'Unknown', label: 'Unknown' },
  { value: 'Cover 0', label: 'Cover 0 (Man, 0 deep)' },
  { value: 'Cover 1', label: 'Cover 1 (Man, 1 deep)' },
  { value: 'Cover 2', label: 'Cover 2 (2 deep, 5 under)' },
  { value: 'Cover 3', label: 'Cover 3 (3 deep, 4 under)' },
  { value: 'Cover 4', label: 'Cover 4 (Quarters)' },
  { value: 'Cover 6', label: 'Cover 6 (Quarter-Quarter-Half)' },
  { value: 'Man', label: 'Man Coverage' },
  { value: 'Zone', label: 'Zone Coverage' },
  { value: 'Blitz', label: 'Blitz' },
];

export const DEFAULT_PLAY_LOG_FORM: PlayLogForm = {
  yardsGained: '',
  result: 'success',
  wasTouchdown: false,
  wasTurnover: false,
  wasPenalty: false,
  penaltyYards: '',
  notes: '',
  quickTags: [],
  opponentCoverage: 'Unknown',
};
