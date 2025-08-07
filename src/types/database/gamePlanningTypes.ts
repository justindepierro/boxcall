// =============================================================================
// GAME PLANNING SYSTEM TYPES
// Phase 2: Core Football Features - Brian Billick Methodology
// =============================================================================

// Helper types for structured data
export interface ScoutingReport {
  strengths: string[];
  weaknesses: string[];
  tendencies: Record<string, string>;
  keyPlayers: {
    name: string;
    position: string;
    notes: string;
  }[];
  gameFilm: {
    url: string;
    description: string;
    timestamp?: string;
  }[];
}

export interface WeatherConsiderations {
  temperature: number;
  windSpeed: number;
  precipitation: string;
  fieldConditions: string;
  adjustments: string[];
}

export interface PersonnelRotations {
  formations: Record<string, string[]>; // formation -> player positions
  substitutions: {
    situation: string;
    playersIn: string[];
    playersOut: string[];
  }[];
}

export interface SuccessMetrics {
  targets: Record<string, number>; // metric name -> target value
  thresholds: Record<string, number>; // metric name -> minimum acceptable
  weights: Record<string, number>; // metric name -> importance weight
}

export interface CoachCardContent {
  layout: 'list' | 'grid' | 'diagram';
  plays: {
    id: string;
    name: string;
    formation: string;
    priority: number;
  }[];
  notes: string[];
  diagrams?: {
    url: string;
    description: string;
  }[];
}

export interface TemplateSituationCategory {
  name: string;
  type: string;
  priority: number;
  description?: string;
}

export interface TemplateDefaultPlays {
  situationName: string;
  playIds: string[];
  priorities: Record<string, number>; // playId -> priority
}

// Enhanced Game Plan Types
export interface GamePlanEnhanced {
  id: string;
  team_id: string;
  opponent_team?: string;
  game_date?: string;
  game_type: 'regular' | 'playoff' | 'scrimmage' | 'practice';
  week_number?: number;
  season?: string;
  
  // Brian Billick methodology additions
  scouting_report: ScoutingReport;
  weather_considerations: WeatherConsiderations;
  key_matchups: string[];
  injury_considerations: string[];
  personnel_rotations: PersonnelRotations;
  coaching_points: string[];
  success_metrics: SuccessMetrics;
  preparation_status: 'draft' | 'in_progress' | 'complete' | 'game_ready';
  total_situations: number;
  total_plays_assigned: number;
  
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GamePlanEnhancedInsert {
  team_id: string;
  opponent_team?: string;
  game_date?: string;
  game_type: 'regular' | 'playoff' | 'scrimmage' | 'practice';
  week_number?: number;
  season?: string;
  scouting_report?: ScoutingReport;
  weather_considerations?: WeatherConsiderations;
  key_matchups?: string[];
  injury_considerations?: string[];
  personnel_rotations?: PersonnelRotations;
  coaching_points?: string[];
  success_metrics?: SuccessMetrics;
  preparation_status?: 'draft' | 'in_progress' | 'complete' | 'game_ready';
  created_by: string;
}

export interface GamePlanEnhancedUpdate {
  opponent_team?: string;
  game_date?: string;
  game_type?: 'regular' | 'playoff' | 'scrimmage' | 'practice';
  week_number?: number;
  season?: string;
  scouting_report?: ScoutingReport;
  weather_considerations?: WeatherConsiderations;
  key_matchups?: string[];
  injury_considerations?: string[];
  personnel_rotations?: PersonnelRotations;
  coaching_points?: string[];
  success_metrics?: SuccessMetrics;
  preparation_status?: 'draft' | 'in_progress' | 'complete' | 'game_ready';
}

// =============================================================================
// GAME PLAN SITUATIONS (Brian Billick Categories)
// =============================================================================

export interface GamePlanSituation {
  id: string;
  game_plan_id: string;
  category_name: string; // '1st & 10', '3rd & Short', 'Red Zone'
  category_type: 'down_distance' | 'field_position' | 'game_situation' | 'special_teams';
  description?: string;
  success_criteria?: string;
  preferred_personnel?: string; // '11', '12', '21', etc.
  down_distance_range?: string; // '3rd-1-3', '1st-10+', '2nd-4-7'
  field_position?: 'red_zone' | 'goal_line' | 'plus_territory' | 'midfield' | 'backed_up' | 'any';
  game_situation?: 'two_minute' | 'clock_management' | 'fourth_down' | 'short_yardage' | 'normal' | 'hurry_up';
  priority_level: number; // 1-5 scale
  sequence_order: number;
  total_plays_assigned: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GamePlanSituationInsert {
  game_plan_id: string;
  category_name: string;
  category_type: 'down_distance' | 'field_position' | 'game_situation' | 'special_teams';
  description?: string;
  success_criteria?: string;
  preferred_personnel?: string;
  down_distance_range?: string;
  field_position?: 'red_zone' | 'goal_line' | 'plus_territory' | 'midfield' | 'backed_up' | 'any';
  game_situation?: 'two_minute' | 'clock_management' | 'fourth_down' | 'short_yardage' | 'normal' | 'hurry_up';
  priority_level?: number;
  sequence_order: number;
  is_active?: boolean;
  created_by: string;
}

export interface GamePlanSituationUpdate {
  category_name?: string;
  description?: string;
  success_criteria?: string;
  preferred_personnel?: string;
  down_distance_range?: string;
  field_position?: 'red_zone' | 'goal_line' | 'plus_territory' | 'midfield' | 'backed_up' | 'any';
  game_situation?: 'two_minute' | 'clock_management' | 'fourth_down' | 'short_yardage' | 'normal' | 'hurry_up';
  priority_level?: number;
  sequence_order?: number;
  is_active?: boolean;
}

// =============================================================================
// GAME PLAN PLAYS (Enhanced with Billick methodology)
// =============================================================================

export interface GamePlanPlay {
  id: string;
  game_plan_id: string;
  situation_id: string;
  play_id: string;
  priority_level: number; // 1-5 scale
  personnel_required?: string; // '11', '12', '21', '22', etc.
  formation_strength?: 'strong_right' | 'strong_left' | 'weak_right' | 'weak_left' | 'balanced';
  expected_coverage: string[]; // ['cover_2', 'man_coverage', 'zone_blitz']
  success_probability: number; // 0.00 to 1.00
  risk_level: number; // 1-5 scale
  coaching_notes?: string;
  sequence_order: number;
  is_scripted: boolean;
  is_active: boolean;
  execution_count: number;
  success_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GamePlanPlayInsert {
  game_plan_id: string;
  situation_id: string;
  play_id: string;
  priority_level?: number;
  personnel_required?: string;
  formation_strength?: 'strong_right' | 'strong_left' | 'weak_right' | 'weak_left' | 'balanced';
  expected_coverage?: string[];
  success_probability?: number;
  risk_level?: number;
  coaching_notes?: string;
  sequence_order: number;
  is_scripted?: boolean;
  is_active?: boolean;
  created_by: string;
}

export interface GamePlanPlayUpdate {
  priority_level?: number;
  personnel_required?: string;
  formation_strength?: 'strong_right' | 'strong_left' | 'weak_right' | 'weak_left' | 'balanced';
  expected_coverage?: string[];
  success_probability?: number;
  risk_level?: number;
  coaching_notes?: string;
  sequence_order?: number;
  is_scripted?: boolean;
  is_active?: boolean;
}

// =============================================================================
// COACH CARDS (Sideline Reference System)
// =============================================================================

export interface CoachCard {
  id: string;
  game_plan_id: string;
  card_type: 'situation' | 'personnel' | 'two_minute' | 'red_zone' | 'special_teams' | 'adjustments';
  title: string;
  subtitle?: string;
  content: CoachCardContent; // Card layout data and play information
  print_order?: number;
  card_size: 'standard' | 'large' | 'pocket';
  is_active: boolean;
  last_updated: string;
  created_by: string;
  created_at: string;
}

export interface CoachCardInsert {
  game_plan_id: string;
  card_type: 'situation' | 'personnel' | 'two_minute' | 'red_zone' | 'special_teams' | 'adjustments';
  title: string;
  subtitle?: string;
  content: CoachCardContent;
  print_order?: number;
  card_size?: 'standard' | 'large' | 'pocket';
  is_active?: boolean;
  created_by: string;
}

export interface CoachCardUpdate {
  title?: string;
  subtitle?: string;
  content?: CoachCardContent;
  print_order?: number;
  card_size?: 'standard' | 'large' | 'pocket';
  is_active?: boolean;
}

// =============================================================================
// GAME PLAN TEMPLATES (Reusable Patterns)
// =============================================================================

export interface GamePlanTemplate {
  id: string;
  team_id: string;
  template_name: string;
  template_type: 'base_offense' | 'situational' | 'opponent_specific' | 'weather_specific';
  description?: string;
  situation_categories: TemplateSituationCategory[]; // Template situations to create
  default_plays: TemplateDefaultPlays[]; // Default play assignments
  coaching_philosophy?: string;
  is_public: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GamePlanTemplateInsert {
  team_id: string;
  template_name: string;
  template_type: 'base_offense' | 'situational' | 'opponent_specific' | 'weather_specific';
  description?: string;
  situation_categories?: TemplateSituationCategory[];
  default_plays?: TemplateDefaultPlays[];
  coaching_philosophy?: string;
  is_public?: boolean;
  created_by: string;
}

export interface GamePlanTemplateUpdate {
  template_name?: string;
  description?: string;
  situation_categories?: TemplateSituationCategory[];
  default_plays?: TemplateDefaultPlays[];
  coaching_philosophy?: string;
  is_public?: boolean;
}

// =============================================================================
// GAME PLAN ANALYTICS (Performance Tracking)
// =============================================================================

export interface GameContext {
  down: number;
  distance: number;
  fieldPosition: number;
  timeRemaining: number;
  score: {
    home: number;
    away: number;
  };
  quarter: number;
  weather?: {
    conditions: string;
    temperature: number;
    windSpeed: number;
  };
}

export interface GamePlanAnalytics {
  id: string;
  game_plan_id: string;
  situation_id?: string;
  play_id?: string;
  execution_time: string;
  game_context: GameContext; // Down, distance, field position, score, time
  outcome: 'success' | 'partial_success' | 'failure' | 'penalty' | 'turnover';
  yards_gained?: number;
  execution_quality?: number; // 1-10 scale
  coaching_assessment?: string;
  adjustments_made?: string;
  created_at: string;
}

export interface GamePlanAnalyticsInsert {
  game_plan_id: string;
  situation_id?: string;
  play_id?: string;
  execution_time: string;
  game_context: GameContext;
  outcome: 'success' | 'partial_success' | 'failure' | 'penalty' | 'turnover';
  yards_gained?: number;
  execution_quality?: number;
  coaching_assessment?: string;
  adjustments_made?: string;
}

// =============================================================================
// HELPER TYPES FOR SERVICES
// =============================================================================

export interface PlayAssignment {
  situationId: string;
  playId: string;
  priority: number;
  personnelRequired?: string;
  formationStrength?: string;
  expectedCoverage?: string[];
  successProbability?: number;
  riskLevel?: number;
  coachingNotes?: string;
  sequenceOrder: number;
}

export interface BillickSituation {
  name: string;
  type: 'down_distance' | 'field_position' | 'game_situation' | 'special_teams';
  priority: number;
  description?: string;
  successCriteria?: string;
  preferredPersonnel?: string;
  downDistanceRange?: string;
  fieldPosition?: 'red_zone' | 'goal_line' | 'plus_territory' | 'midfield' | 'backed_up' | 'any';
  gameSituation?: 'two_minute' | 'clock_management' | 'fourth_down' | 'short_yardage' | 'normal' | 'hurry_up';
}

export interface PriorityOptimization {
  situationId: string;
  currentPriority: number;
  suggestedPriority: number;
  confidence: number;
  reasoning: string;
  historicalData: {
    successRate: number;
    executionCount: number;
    avgYardsGained: number;
  };
}

export interface SuccessProbability {
  probability: number;
  confidence: number;
  factors: {
    historicalSuccess: number;
    gameContext: number;
    opponentTendencies: number;
    playerFitness: number;
  };
  recommendation: 'high_recommend' | 'recommend' | 'neutral' | 'caution' | 'avoid';
}
