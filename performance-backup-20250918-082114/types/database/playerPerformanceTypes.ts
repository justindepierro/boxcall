// =============================================================================
// PLAYER PERFORMANCE ANALYTICS TYPES
// TypeScript interfaces for Migration 007 - Complete Player Analytics System
// Generated: August 7, 2025
// =============================================================================

/**
 * Player Performance Tracking - Individual Statistics
 */
export interface PlayerPerformance {
  id: string;
  user_id: string; // References auth.users
  team_id: string;
  recorded_date: string; // Date string (YYYY-MM-DD)
  activity_type: "practice" | "game" | "drill" | "conditioning" | "evaluation";
  activity_id?: string; // References practice_schedules, games, etc.
  position_played: string;
  role_in_activity?: string; // 'starter', 'backup', 'special_teams', 'scout'

  // Basic performance metrics
  snaps_played: number;
  plays_executed: number;
  successful_plays: number;

  // Position-specific statistics (JSONB for flexibility)
  passing_stats: PassingStats;
  rushing_stats: RushingStats;
  receiving_stats: ReceivingStats;
  defensive_stats: DefensiveStats;
  special_teams_stats: SpecialTeamsStats;

  // Performance ratings (1-10 scale)
  technique_rating?: number;
  effort_rating?: number;
  knowledge_rating?: number;
  leadership_rating?: number;
  overall_rating?: number;

  // Coaching observations
  strengths_observed: string[];
  weaknesses_observed: string[];
  improvement_areas: string[];
  coaching_notes?: string;

  // Development tracking
  goals_for_next_session: string[];
  specific_drills_assigned: string[];
  injury_concerns: string[];

  // Contextual information
  weather_conditions?: string;
  opponent_quality?: "weak" | "average" | "strong";
  game_situation?: "practice" | "scrimmage" | "game" | "playoffs";

  // Recording information
  recorded_by: string;
  evaluation_method: "observation" | "video" | "stats";
  confidence_level: number; // 1-10 scale

  created_at: string;
  updated_at: string;
}

/**
 * Position-Specific Statistics Interfaces
 */
export interface PassingStats {
  completions?: number;
  attempts?: number;
  yards?: number;
  touchdowns?: number;
  interceptions?: number;
  completion_percentage?: number;
  yards_per_attempt?: number;
  passer_rating?: number;
  sacks_taken?: number;
  fumbles?: number;
}

export interface RushingStats {
  attempts?: number;
  yards?: number;
  touchdowns?: number;
  fumbles?: number;
  yards_per_carry?: number;
  longest_run?: number;
  first_downs?: number;
  red_zone_attempts?: number;
}

export interface ReceivingStats {
  receptions?: number;
  targets?: number;
  yards?: number;
  touchdowns?: number;
  drops?: number;
  yards_per_reception?: number;
  yards_after_catch?: number;
  longest_reception?: number;
  first_downs?: number;
}

export interface DefensiveStats {
  tackles?: number;
  assists?: number;
  sacks?: number;
  tackles_for_loss?: number;
  interceptions?: number;
  pass_breakups?: number;
  forced_fumbles?: number;
  fumble_recoveries?: number;
  defensive_touchdowns?: number;
}

export interface SpecialTeamsStats {
  kick_returns?: number;
  punt_returns?: number;
  return_yards?: number;
  return_touchdowns?: number;
  tackles?: number;
  blocks?: number;
  coverage_grade?: number;
}

/**
 * Player Progress Tracking - Long-term Development
 */
export interface PlayerProgress {
  id: string;
  user_id: string;
  team_id: string;
  tracking_period: string; // 'Fall 2024', 'Spring 2025', etc.
  skill_category: string; // 'passing_accuracy', 'route_running', etc.
  current_rating: number; // 1-10 scale
  previous_rating?: number; // 1-10 scale
  improvement_target: number; // 1-10 scale
  target_date?: string;
  progress_notes?: string;
  training_focus_areas: string[];
  milestones_achieved: string[];
  challenges_identified: string[];
  support_needed: string[];
  measurable_goals: string[];
  assessment_method?: string;
  last_assessment_date?: string;
  next_assessment_date?: string;
  coach_feedback?: string;
  player_self_assessment?: string;
  parent_feedback?: string;
  is_priority_area: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Achievement Categories - Configurable Achievement Types
 */
export interface AchievementCategory {
  id: string;
  team_id: string;
  category_name: string;
  category_type:
    | "individual"
    | "team"
    | "academic"
    | "leadership"
    | "improvement";
  description?: string;
  criteria: string; // Achievement criteria
  points_value: number;
  badge_icon?: string;
  badge_color: string;
  is_active: boolean;
  requires_coach_approval: boolean;
  can_be_repeated: boolean;
  difficulty_level: number; // 1-5 scale
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Player Achievements - Recognition and Awards
 */
export interface PlayerAchievement {
  id: string;
  user_id: string;
  team_id: string;
  achievement_category_id: string;
  achievement_name: string;
  description?: string;
  date_earned: string;
  performance_data: Record<string, unknown>; // JSONB data
  awarded_by: string;
  approval_status: "pending" | "approved" | "rejected";
  approval_notes?: string;
  points_earned: number;
  is_featured: boolean;
  public_recognition: boolean;
  achievement_notes?: string;
  related_activity_id?: string;
  celebration_date?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// UTILITY TYPES AND INTERFACES
// =============================================================================

/**
 * Performance Summary for Dashboard
 */
export interface PlayerPerformanceSummary {
  player_id: string;
  period: string;
  position: string;
  overall_rating: number;
  improvement_trend: "improving" | "declining" | "stable";
  key_strengths: string[];
  priority_improvements: string[];
  recent_achievements: PlayerAchievement[];
  next_goals: string[];
}

/**
 * Progress Tracking Summary
 */
export interface ProgressTrackingSummary {
  player_id: string;
  tracking_period: string;
  skills_tracked: number;
  skills_improved: number;
  average_improvement: number;
  priority_areas: PlayerProgress[];
  upcoming_assessments: PlayerProgress[];
}

/**
 * Team Performance Analytics
 */
export interface TeamPerformanceAnalytics {
  team_id: string;
  period: string;
  total_players: number;
  average_overall_rating: number;
  top_performers: PlayerPerformance[];
  improvement_leaders: PlayerProgress[];
  recent_achievements: PlayerAchievement[];
  focus_areas: string[];
}

/**
 * Performance Creation Payloads
 */
export interface CreatePlayerPerformancePayload {
  user_id: string;
  activity_type: PlayerPerformance["activity_type"];
  activity_id?: string;
  position_played: string;
  role_in_activity?: string;
  snaps_played?: number;
  plays_executed?: number;
  successful_plays?: number;
  passing_stats?: PassingStats;
  rushing_stats?: RushingStats;
  receiving_stats?: ReceivingStats;
  defensive_stats?: DefensiveStats;
  special_teams_stats?: SpecialTeamsStats;
  technique_rating?: number;
  effort_rating?: number;
  knowledge_rating?: number;
  leadership_rating?: number;
  overall_rating?: number;
  strengths_observed?: string[];
  weaknesses_observed?: string[];
  improvement_areas?: string[];
  coaching_notes?: string;
  goals_for_next_session?: string[];
  specific_drills_assigned?: string[];
  injury_concerns?: string[];
}

export interface CreatePlayerProgressPayload {
  user_id: string;
  tracking_period: string;
  skill_category: string;
  current_rating: number;
  improvement_target: number;
  target_date?: string;
  progress_notes?: string;
  training_focus_areas?: string[];
  measurable_goals?: string[];
  is_priority_area?: boolean;
}

export interface CreateAchievementCategoryPayload {
  category_name: string;
  category_type: AchievementCategory["category_type"];
  description?: string;
  criteria: string;
  points_value?: number;
  badge_icon?: string;
  badge_color?: string;
  requires_coach_approval?: boolean;
  can_be_repeated?: boolean;
  difficulty_level?: number;
}

// =============================================================================
// PERFORMANCE FILTERS AND REPORTS
// =============================================================================

export interface PerformanceFilters {
  startDate?: string;
  endDate?: string;
  activityType?: PlayerPerformance["activity_type"];
  position?: string;
  ratingRange?: { min: number; max: number };
}

export interface PerformanceReport {
  summary: {
    totalActivities: number;
    averageRating: number;
    improvementTrend: "improving" | "declining" | "stable";
    periodCovered: { start: string; end: string };
  };
  performances: PlayerPerformance[];
  achievements: PlayerAchievement[];
  progressTracking: PlayerProgress[];
  recommendations: string[];
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

/**
 * Player Performance Service Interface
 */
export interface PlayerPerformanceService {
  // Performance tracking
  recordPerformance(
    teamId: string,
    payload: CreatePlayerPerformancePayload
  ): Promise<PlayerPerformance>;
  updatePerformance(
    performanceId: string,
    payload: Partial<CreatePlayerPerformancePayload>
  ): Promise<PlayerPerformance>;
  getPerformance(performanceId: string): Promise<PlayerPerformance | null>;
  listPlayerPerformances(
    playerId: string,
    filters?: PerformanceFilters
  ): Promise<PlayerPerformance[]>;
  deletePerformance(performanceId: string): Promise<void>;

  // Progress tracking
  createProgressTracking(
    teamId: string,
    payload: CreatePlayerProgressPayload
  ): Promise<PlayerProgress>;
  updateProgress(
    progressId: string,
    payload: Partial<CreatePlayerProgressPayload>
  ): Promise<PlayerProgress>;
  getPlayerProgress(
    playerId: string,
    period: string
  ): Promise<PlayerProgress[]>;
  deleteProgressTracking(progressId: string): Promise<void>;

  // Achievement system
  createAchievementCategory(
    teamId: string,
    payload: CreateAchievementCategoryPayload
  ): Promise<AchievementCategory>;
  awardAchievement(
    playerId: string,
    categoryId: string,
    performanceData?: Record<string, unknown>
  ): Promise<PlayerAchievement>;
  approveAchievement(
    achievementId: string,
    approvalNotes?: string
  ): Promise<PlayerAchievement>;
  listPlayerAchievements(playerId: string): Promise<PlayerAchievement[]>;
  listTeamAchievements(teamId: string): Promise<PlayerAchievement[]>;

  // Analytics and reporting
  getPlayerPerformanceSummary(
    playerId: string,
    period: string
  ): Promise<PlayerPerformanceSummary>;
  getProgressTrackingSummary(
    playerId: string,
    period: string
  ): Promise<ProgressTrackingSummary>;
  getTeamPerformanceAnalytics(
    teamId: string,
    period: string
  ): Promise<TeamPerformanceAnalytics>;
  generatePerformanceReport(
    playerId: string,
    startDate: string,
    endDate: string
  ): Promise<PerformanceReport>;
}

// =============================================================================
// EXPORTS - No redeclaration, all interfaces already exported above
// =============================================================================
