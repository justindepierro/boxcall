// =============================================================================
// PRACTICE PLANNING TYPES - Complete Type Safety for Practice Management
// Phase 2: Database-First Implementation with 8-Box Layout System
// Generated from Migration 006: Practice Planning System
// =============================================================================

// =============================================================================
// CORE PRACTICE BLOCK TYPES
// =============================================================================

export type BlockType =
  | "warmup"
  | "individual"
  | "group"
  | "team"
  | "special_teams"
  | "conditioning"
  | "cool_down"
  | "meeting"
  | "film_study";

export type FocusArea =
  | "passing"
  | "running"
  | "defense"
  | "special_teams"
  | "conditioning"
  | "fundamentals";

export type FieldArea =
  | "end_zone"
  | "hash_marks"
  | "sideline"
  | "middle_field"
  | "goal_line"
  | "red_zone";

export type PersonnelGrouping =
  | "11" // 1 RB, 1 TE, 3 WR
  | "12" // 1 RB, 2 TE, 2 WR
  | "21" // 2 RB, 1 TE, 2 WR
  | "22" // 2 RB, 2 TE, 1 WR
  | "10" // 1 RB, 0 TE, 4 WR
  | "13" // 1 RB, 3 TE, 1 WR
  | "special"
  | "defense"
  | "kicking";

// Database Types
export interface PracticeBlock {
  id: string;
  schedule_id: string;

  // Block Identification
  name: string;
  block_type: BlockType;

  // Timing and Sequence
  sequence_order: number;
  duration_minutes: number;
  start_offset_minutes: number;

  // Organization and Focus
  focus_area?: FocusArea;
  intensity_level: number; // 1-10

  // Resources Required
  equipment_needed: string[];
  field_areas: FieldArea[];
  personnel_groupings: PersonnelGrouping[];

  // Coaching Information
  coaching_points: string[];
  safety_considerations: string[];
  success_criteria?: string;

  // Metadata
  is_template: boolean;
  template_category?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PracticeBlockInsert {
  schedule_id: string;
  name: string;
  block_type: BlockType;
  sequence_order: number;
  duration_minutes: number;
  start_offset_minutes?: number;
  focus_area?: FocusArea;
  intensity_level?: number;
  equipment_needed?: string[];
  field_areas?: FieldArea[];
  personnel_groupings?: PersonnelGrouping[];
  coaching_points?: string[];
  safety_considerations?: string[];
  success_criteria?: string;
  is_template?: boolean;
  template_category?: string;
  notes?: string;
  created_by: string;
}

export interface PracticeBlockUpdate {
  name?: string;
  block_type?: BlockType;
  sequence_order?: number;
  duration_minutes?: number;
  start_offset_minutes?: number;
  focus_area?: FocusArea;
  intensity_level?: number;
  equipment_needed?: string[];
  field_areas?: FieldArea[];
  personnel_groupings?: PersonnelGrouping[];
  coaching_points?: string[];
  safety_considerations?: string[];
  success_criteria?: string;
  is_template?: boolean;
  template_category?: string;
  notes?: string;
  updated_at?: string;
}

// =============================================================================
// PRACTICE ACTIVITIES TYPES
// =============================================================================

export type ActivityType =
  | "drill"
  | "play_run"
  | "conditioning"
  | "walkthrough"
  | "scrimmage"
  | "meeting"
  | "individual_instruction"
  | "group_work"
  | "competition";

export type MeasurementMethod =
  | "completion_rate"
  | "time"
  | "accuracy"
  | "form"
  | "distance"
  | "repetitions";

export type ScoringMethod =
  | "points"
  | "winner_take_all"
  | "bracket"
  | "elimination"
  | "time_based";

export type WeatherSuitability =
  | "any"
  | "sunny"
  | "rainy"
  | "hot"
  | "cold"
  | "windy"
  | "indoor_only";

export interface PracticeActivity {
  id: string;
  block_id: string;

  // Activity Identification
  activity_type: ActivityType;
  name: string;
  description?: string;

  // Timing and Execution
  sequence_order: number;
  duration_minutes?: number;
  repetitions: number;
  rest_between_reps_seconds: number;

  // Play Integration
  play_id?: string;
  play_variations: string[];

  // Coaching and Performance
  coaching_emphasis: string[];
  technique_focus: string[];
  common_mistakes: string[];
  success_criteria?: string;
  measurement_method?: MeasurementMethod;
  target_performance?: string;

  // Organization
  personnel_requirements?: string;
  formation_requirements?: string;
  field_setup?: string;
  equipment_specific: string[];

  // Competition and Motivation
  is_competitive: boolean;
  scoring_method?: ScoringMethod;
  winner_reward?: string;
  loser_consequence?: string;

  // Metadata
  difficulty_level: number; // 1-10
  injury_risk_level: number; // 1-5
  weather_suitability: WeatherSuitability[];

  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PracticeActivityInsert {
  block_id: string;
  activity_type: ActivityType;
  name: string;
  description?: string;
  sequence_order: number;
  duration_minutes?: number;
  repetitions?: number;
  rest_between_reps_seconds?: number;
  play_id?: string;
  play_variations?: string[];
  coaching_emphasis?: string[];
  technique_focus?: string[];
  common_mistakes?: string[];
  success_criteria?: string;
  measurement_method?: MeasurementMethod;
  target_performance?: string;
  personnel_requirements?: string;
  formation_requirements?: string;
  field_setup?: string;
  equipment_specific?: string[];
  is_competitive?: boolean;
  scoring_method?: ScoringMethod;
  winner_reward?: string;
  loser_consequence?: string;
  difficulty_level?: number;
  injury_risk_level?: number;
  weather_suitability?: WeatherSuitability[];
  notes?: string;
  created_by: string;
}

// =============================================================================
// PRACTICE TEMPLATES TYPES
// =============================================================================

export type TemplateCategory =
  | "preseason"
  | "regular_season"
  | "playoffs"
  | "off_season"
  | "game_prep"
  | "fundamentals"
  | "conditioning"
  | "walkthrough";

export type CoachingLevel = "youth" | "high_school" | "college" | "pro";

export type SeasonTiming =
  | "preseason"
  | "early_season"
  | "mid_season"
  | "late_season"
  | "playoffs"
  | "off_season";

export interface PracticeTemplate {
  id: string;
  team_id?: string; // NULL for public templates

  // Template Identification
  name: string;
  description?: string;
  category: TemplateCategory;

  // Template Configuration
  total_duration_minutes: number;
  recommended_participants?: number;
  equipment_list: string[];
  field_requirements: string[];

  // Usage and Performance
  usage_count: number;
  avg_rating: number;
  last_used_date?: string;

  // Template Metadata
  is_public: boolean;
  created_by: string;
  shared_by_coach?: string;
  coaching_level: CoachingLevel[];

  // Seasonal Information
  best_season: SeasonTiming[];
  weather_suitability: WeatherSuitability[];

  created_at: string;
  updated_at: string;
}

export interface PracticeTemplateInsert {
  team_id?: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  total_duration_minutes: number;
  recommended_participants?: number;
  equipment_list?: string[];
  field_requirements?: string[];
  is_public?: boolean;
  created_by: string;
  shared_by_coach?: string;
  coaching_level?: CoachingLevel[];
  best_season?: SeasonTiming[];
  weather_suitability?: WeatherSuitability[];
}

// =============================================================================
// PRACTICE EXECUTION TRACKING TYPES
// =============================================================================

export interface PracticeExecution {
  id: string;
  practice_id: string;
  activity_id?: string;

  // Execution Context
  executed_at: string;
  actual_duration_minutes?: number;
  participants_present?: number;
  weather_conditions?: string;
  field_conditions?: string;

  // Performance Metrics
  execution_quality?: number; // 1-10
  completion_rate?: number; // 0.00-100.00
  success_count: number;
  attempt_count: number;

  // Coaching Observations
  what_went_well: string[];
  areas_for_improvement: string[];
  coaching_adjustments_made: string[];
  player_standouts: string[]; // User IDs or names

  // Metrics and Analytics
  energy_level?: number; // 1-10
  focus_level?: number; // 1-10
  injury_incidents: number;
  equipment_issues: string[];

  // Follow-up Actions
  needs_repeat: boolean;
  repeat_reason?: string;
  next_practice_notes?: string;

  recorded_by: string;
  created_at: string;
}

export interface PracticeExecutionInsert {
  practice_id: string;
  activity_id?: string;
  executed_at?: string;
  actual_duration_minutes?: number;
  participants_present?: number;
  weather_conditions?: string;
  field_conditions?: string;
  execution_quality?: number;
  completion_rate?: number;
  success_count?: number;
  attempt_count?: number;
  what_went_well?: string[];
  areas_for_improvement?: string[];
  coaching_adjustments_made?: string[];
  player_standouts?: string[];
  energy_level?: number;
  focus_level?: number;
  injury_incidents?: number;
  equipment_issues?: string[];
  needs_repeat?: boolean;
  repeat_reason?: string;
  next_practice_notes?: string;
  recorded_by: string;
}

// =============================================================================
// 8-BOX LAYOUT SYSTEM TYPES
// =============================================================================

export type LayoutStyle = "standard" | "compact" | "detailed" | "time_focused";

export interface PracticeLayoutBox {
  id: string;
  schedule_id: string;

  // Box Position in 2x4 Grid
  box_number: number; // 1-8
  grid_row: number; // 1-2
  grid_column: number; // 1-4

  // Box Content
  title: string;
  subtitle?: string;
  primary_color: string;
  accent_color: string;
  icon_name?: string;

  // Time Allocation
  duration_minutes: number;
  start_time?: string; // TIME format
  end_time?: string; // TIME format

  // Content References
  block_ids: string[];
  activity_count: number;
  key_activities: string[];

  // Visual Customization
  layout_style: LayoutStyle;
  show_time: boolean;
  show_equipment: boolean;
  show_personnel: boolean;

  // Print and Export Settings
  print_priority: number; // 1-3
  include_in_coach_card: boolean;
  include_in_player_card: boolean;

  created_at: string;
  updated_at: string;
}

export interface PracticeLayoutBoxInsert {
  schedule_id: string;
  box_number: number;
  grid_row: number;
  grid_column: number;
  title: string;
  subtitle?: string;
  primary_color?: string;
  accent_color?: string;
  icon_name?: string;
  duration_minutes: number;
  start_time?: string;
  end_time?: string;
  block_ids?: string[];
  activity_count?: number;
  key_activities?: string[];
  layout_style?: LayoutStyle;
  show_time?: boolean;
  show_equipment?: boolean;
  show_personnel?: boolean;
  print_priority?: number;
  include_in_coach_card?: boolean;
  include_in_player_card?: boolean;
}

// =============================================================================
// PRACTICE ANALYTICS TYPES
// =============================================================================

export type AnalysisPeriod = "weekly" | "monthly" | "season";

export interface PracticeAnalytics {
  id: string;
  team_id: string;
  practice_id?: string;

  // Aggregated Performance Data
  total_practices: number;
  avg_practice_duration?: number; // Minutes
  avg_execution_quality?: number;
  avg_completion_rate?: number;

  // Time Distribution Analysis
  warmup_time_pct?: number;
  individual_time_pct?: number;
  group_time_pct?: number;
  team_time_pct?: number;
  conditioning_time_pct?: number;

  // Effectiveness Metrics
  most_effective_activities: string[];
  least_effective_activities: string[];
  optimal_practice_duration?: number;
  fatigue_point_minutes?: number;

  // Trend Analysis
  improvement_areas: string[];
  performance_trends: Record<string, unknown>;
  seasonal_patterns: Record<string, unknown>;

  // Period Analysis
  analysis_period: AnalysisPeriod;
  period_start: string;
  period_end: string;

  calculated_at: string;
}

// =============================================================================
// HELPER TYPES AND INTERFACES
// =============================================================================

export interface PracticeScheduleWithBlocks {
  id: string;
  team_id: string;
  title: string;
  date_scheduled: string;
  start_time: string;
  end_time: string;
  total_duration?: number;
  practice_blocks: PracticeBlock[];
}

export interface PracticeBlockWithActivities {
  id: string;
  name: string;
  block_type: BlockType;
  duration_minutes: number;
  sequence_order: number;
  practice_activities: PracticeActivity[];
}

export interface EightBoxLayout {
  schedule_id: string;
  boxes: PracticeLayoutBox[];
  total_duration: number;
  practice_start_time: string;
  practice_end_time: string;
}

export interface PracticePerformanceMetrics {
  practice_id: string;
  overall_quality: number;
  completion_rate: number;
  energy_level: number;
  focus_level: number;
  participant_count: number;
  duration_minutes: number;
  weather_impact?: string;
  key_successes: string[];
  areas_for_improvement: string[];
}

// =============================================================================
// SERVICE INTERFACE TYPES
// =============================================================================

export interface CreatePracticeFromTemplate {
  template_id: string;
  team_id: string;
  date_scheduled: string;
  start_time: string;
  customizations?: {
    duration_adjustments?: Record<string, number>;
    additional_activities?: PracticeActivityInsert[];
    removed_activities?: string[];
    coaching_notes?: string;
  };
}

export interface PracticeOptimization {
  practice_id: string;
  current_structure: PracticeBlockWithActivities[];
  optimizations: {
    time_distribution: Record<BlockType, number>;
    suggested_changes: string[];
    estimated_improvement: number;
  };
}

export interface PracticeSearchFilters {
  category?: TemplateCategory;
  coaching_level?: CoachingLevel;
  duration_range?: { min: number; max: number };
  weather_suitability?: WeatherSuitability;
  season_timing?: SeasonTiming;
  is_public?: boolean;
  team_id?: string;
}

// =============================================================================
// EXPORT ALL TYPES - No need for duplicate export type declaration
// All interfaces and types are already exported above
// =============================================================================
