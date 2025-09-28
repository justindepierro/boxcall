// =============================================================================
// GAME PLANNING SERVICE - Brian Billick Methodology Implementation
// Phase 2: Core Football Features - Simplified Working Version
// =============================================================================

import { supabase } from "../../lib/supabase";

import type {
  GamePlanEnhanced,
  GamePlanEnhancedInsert,
  GamePlanSituation,
  GamePlanSituationInsert,
  GamePlanPlay,
  GamePlanPlayInsert,
  // ...existing code...
  BillickSituation,
  PlayAssignment,
  PriorityOptimization,
  GameContext,
  SuccessProbability,
} from "../../types/database/gamePlanningTypes";

// =============================================================================
// BRIAN BILLICK GAME PLANNING SERVICE
// =============================================================================

export class GamePlanService {
  // =============================================================================
  // CORE CRUD OPERATIONS
  // =============================================================================

  /**
   * Create a new game plan
   */
  async create(data: GamePlanEnhancedInsert): Promise<GamePlanEnhanced> {
    const { data: gameplan, error } = await supabase
      .from("game_plans")
      .insert(data)
      .select("*")
      .single();

    if (error) throw error;
    return gameplan as GamePlanEnhanced;
  }

  /**
   * Get game plan by ID
   */
  async findById(id: string): Promise<GamePlanEnhanced | null> {
    const { data: gameplan, error } = await supabase
      .from("game_plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return gameplan as GamePlanEnhanced;
  }

  // =============================================================================
  // BRIAN BILLICK METHODOLOGY - SITUATIONAL CATEGORIES
  // =============================================================================

  /**
   * Create default Brian Billick situational categories for a game plan
   * This implements Billick's systematic approach to organizing plays
   */
  async createBillickSituations(
    gamePlanId: string,
    customSituations: BillickSituation[] = []
  ): Promise<GamePlanSituation[]> {
    const defaultSituations: BillickSituation[] = [
      // Down & Distance Categories (Core Billick System)
      {
        name: "1st & 10",
        type: "down_distance",
        priority: 1,
        description: "Standard first down situations",
        successCriteria: "Gain 4+ yards, avoid negative plays",
        preferredPersonnel: "11",
      },
      {
        name: "2nd & Medium (4-7)",
        type: "down_distance",
        priority: 2,
        description: "Second down with manageable distance",
        successCriteria: "Convert to manageable 3rd down",
        preferredPersonnel: "11",
      },
      {
        name: "2nd & Long (8+)",
        type: "down_distance",
        priority: 3,
        description: "Second and long situations",
        successCriteria: "Get back in manageable down/distance",
        preferredPersonnel: "11",
      },
      {
        name: "3rd & Short (1-3)",
        type: "down_distance",
        priority: 1,
        description: "High conversion probability situations",
        successCriteria: "90%+ conversion rate",
        preferredPersonnel: "12",
      },
      {
        name: "3rd & Medium (4-7)",
        type: "down_distance",
        priority: 2,
        description: "Intermediate third down conversions",
        successCriteria: "65%+ conversion rate",
        preferredPersonnel: "11",
      },
      {
        name: "3rd & Long (8+)",
        type: "down_distance",
        priority: 3,
        description: "Difficult conversion situations",
        successCriteria: "35%+ conversion rate",
        preferredPersonnel: "10",
      },

      // Field Position Categories
      {
        name: "Red Zone (Inside 20)",
        type: "field_position",
        priority: 1,
        description: "Goal line to 20-yard line",
        successCriteria: "Score touchdowns on 65%+ of possessions",
        fieldPosition: "red_zone",
      },
      {
        name: "Goal Line (Inside 5)",
        type: "field_position",
        priority: 1,
        description: "Critical scoring situations",
        successCriteria: "Score touchdowns on 85%+ of possessions",
        fieldPosition: "goal_line",
      },
      {
        name: "Plus Territory (Opp 40-20)",
        type: "field_position",
        priority: 2,
        description: "Good field position, potential points",
        successCriteria: "Score on 75%+ of possessions",
        fieldPosition: "plus_territory",
      },
      {
        name: "Backed Up (Own 10 or less)",
        type: "field_position",
        priority: 2,
        description: "Poor field position, avoid safety",
        successCriteria: "Get first down, flip field position",
        fieldPosition: "backed_up",
      },

      // Game Situation Categories (Billick Specialties)
      {
        name: "Two Minute Drill",
        type: "game_situation",
        priority: 1,
        description: "End of half/game situations",
        successCriteria: "Score before time expires",
        gameSituation: "two_minute",
      },
      {
        name: "Clock Management",
        type: "game_situation",
        priority: 2,
        description: "Control game tempo and clock",
        successCriteria: "Manage clock according to game plan",
        gameSituation: "clock_management",
      },
      {
        name: "4th Down Conversion",
        type: "game_situation",
        priority: 1,
        description: "Critical conversion attempts",
        successCriteria: "Convert when decision is made to go",
        gameSituation: "fourth_down",
      },
      {
        name: "Short Yardage",
        type: "game_situation",
        priority: 1,
        description: "3 yards or less needed",
        successCriteria: "85%+ success rate",
        gameSituation: "short_yardage",
      },
    ];

    // Combine default and custom situations
    const allSituations = [...defaultSituations, ...customSituations];

    // Insert situations in database
    const createdSituations: GamePlanSituation[] = [];
    for (let i = 0; i < allSituations.length; i++) {
      const situation = allSituations[i];
      const situationData: GamePlanSituationInsert = {
        game_plan_id: gamePlanId,
        category_name: situation.name,
        category_type: situation.type,
        description: situation.description,
        success_criteria: situation.successCriteria,
        preferred_personnel: situation.preferredPersonnel,
        down_distance_range: situation.downDistanceRange,
        field_position: situation.fieldPosition,
        game_situation: situation.gameSituation,
        priority_level: situation.priority,
        sequence_order: i + 1,
        created_by: "system", // Will be overridden by auth
      };

      const { data: created, error } = await supabase
        .from("game_plan_situations")
        .insert(situationData)
        .select("*")
        .single();

      if (error) throw error;
      createdSituations.push(created as GamePlanSituation);
    }

    return createdSituations;
  }

  // =============================================================================
  // PLAY ASSIGNMENT WITH BILLICK PRIORITIES
  // =============================================================================

  /**
   * Assign plays to situations with Billick methodology priorities
   */
  async assignPlaysToSituations(
    gamePlanId: string,
    assignments: PlayAssignment[]
  ): Promise<GamePlanPlay[]> {
    const createdPlays: GamePlanPlay[] = [];

    for (const assignment of assignments) {
      const playData: GamePlanPlayInsert = {
        game_plan_id: gamePlanId,
        situation_id: assignment.situationId,
        play_id: assignment.playId,
        priority_level: assignment.priority,
        personnel_required: assignment.personnelRequired,
        formation_strength: assignment.formationStrength as
          | "strong_right"
          | "strong_left"
          | "weak_right"
          | "weak_left"
          | "balanced"
          | undefined,
        expected_coverage: assignment.expectedCoverage || [],
        success_probability: assignment.successProbability || 0.5,
        risk_level: assignment.riskLevel || 3,
        coaching_notes: assignment.coachingNotes,
        sequence_order: assignment.sequenceOrder,
        created_by: "coach", // Will be overridden by auth
      };

      const { data: created, error } = await supabase
        .from("game_plan_plays")
        .insert(playData)
        .select("*")
        .single();

      if (error) throw error;
      createdPlays.push(created as GamePlanPlay);
    }

    return createdPlays;
  }

  // ...existing code...

  // =============================================================================
  // PRIORITY OPTIMIZATION (SIMPLIFIED)
  // =============================================================================

  /**
   * Analyze historical data to optimize play priorities
   */
  async optimizePriorityLevels(
    gamePlanId: string
  ): Promise<PriorityOptimization[]> {
    const { data: gamePlanPlays, error } = await supabase
      .from("game_plan_plays")
      .select(
        `
        *,
        game_plan_situations (category_name, category_type),
        plays (name)
      `
      )
      .eq("game_plan_id", gamePlanId);

    if (error) throw error;

    const optimizations: PriorityOptimization[] = [];

    type OptimizationPlay = {
      priority_level: number;
      success_probability: number;
      execution_count?: number;
      situation_id: string;
    };

    gamePlanPlays?.forEach((play: OptimizationPlay) => {
      // Simple optimization logic based on success probability
      let suggestedPriority = play.priority_level;

      if (play.success_probability > 0.8 && play.priority_level > 1) {
        suggestedPriority = Math.max(1, play.priority_level - 1);
      } else if (play.success_probability < 0.4 && play.priority_level < 4) {
        suggestedPriority = Math.min(5, play.priority_level + 1);
      }

      if (suggestedPriority !== play.priority_level) {
        optimizations.push({
          situationId: play.situation_id,
          currentPriority: play.priority_level,
          suggestedPriority,
          confidence: 0.75,
          reasoning: `Based on ${Math.round(
            play.success_probability * 100
          )}% success rate`,
          historicalData: {
            successRate: play.success_probability,
            executionCount: play.execution_count || 0,
            avgYardsGained: 0, // Would come from analytics
          },
        });
      }
    });

    return optimizations;
  }

  // =============================================================================
  // PREDICTIVE ANALYTICS (SIMPLIFIED)
  // =============================================================================

  /**
   * Predict play success probability based on context
   */
  async predictPlaySuccess(
    gameContext: GameContext
  ): Promise<SuccessProbability> {
    // Simplified prediction logic for Phase 2
    let baseProbability = 0.5;
    const confidence = 0.6;

    // Simple contextual adjustments
    if (gameContext.down === 1) {
      baseProbability += 0.15;
    } else if (gameContext.down === 3 && gameContext.distance <= 3) {
      baseProbability += 0.1;
    } else if (gameContext.down === 3 && gameContext.distance > 7) {
      baseProbability -= 0.2;
    }

    // Field position adjustments
    if (gameContext.fieldPosition > 80) {
      // Red zone
      baseProbability += 0.1;
    } else if (gameContext.fieldPosition < 20) {
      // Own territory
      baseProbability -= 0.1;
    }

    // Normalize probability
    baseProbability = Math.max(0.0, Math.min(1.0, baseProbability));

    return {
      probability: baseProbability,
      confidence,
      factors: {
        historicalSuccess: 0.25,
        gameContext: 0.4,
        opponentTendencies: 0.2,
        playerFitness: 0.15,
      },
      recommendation:
        baseProbability > 0.7
          ? "high_recommend"
          : baseProbability > 0.55
            ? "recommend"
            : baseProbability > 0.45
              ? "neutral"
              : baseProbability > 0.3
                ? "caution"
                : "avoid",
    };
  }

  // =============================================================================
  // ENHANCED QUERIES
  // =============================================================================

  /**
   * Get game plan with all related data
   */
  async getGamePlanWithDetails(gamePlanId: string) {
    const { data, error } = await supabase
      .from("game_plans")
      .select(
        `
        *,
        game_plan_situations (
          *,
          game_plan_plays (
            *,
            plays (name, formation, p_type, description)
          )
        ),
        coach_cards (*),
        teams (name)
      `
      )
      .eq("id", gamePlanId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update game plan preparation status
   */
  async updatePreparationStatus(
    gamePlanId: string,
    status: "draft" | "in_progress" | "complete" | "game_ready"
  ) {
    const { data, error } = await supabase
      .from("game_plans")
      .update({
        preparation_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gamePlanId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const gamePlanService = new GamePlanService();
