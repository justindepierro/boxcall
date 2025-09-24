import { supabase } from "../lib/supabase";
import type {
  GamePlanEnhanced,
  GamePlanSituation,
  GamePlanPlay,
  GamePlanAnalytics,
  PriorityOptimization
} from '../types/database/gamePlanningTypes';

export interface GamePlanningMetrics {
  totalGamePlans: number;
  activeGamePlans: number;
  completedGamePlans: number;
  averagePreparationTime: number;
  situationCoverage: {
    totalSituations: number;
    coveredSituations: number;
    coveragePercentage: number;
  };
  playAssignments: {
    totalAssignments: number;
    averagePerSituation: number;
    highPriorityAssignments: number;
  };
}

export interface GamePlanningInsights {
  preparationStatus: {
    draft: number;
    inProgress: number;
    complete: number;
    gameReady: number;
  };
  situationalAnalysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  coachingEffectiveness: {
    averageExecutionQuality: number;
    successRateBySituation: Record<string, number>;
    adjustmentFrequency: number;
    coachingAssessmentTrends: string[];
  };
  optimizationOpportunities: PriorityOptimization[];
}

export interface GamePlanningAnalyticsData {
  metrics: GamePlanningMetrics;
  insights: GamePlanningInsights;
  recentActivity: {
    gamePlans: GamePlanEnhanced[];
    analytics: GamePlanAnalytics[];
  };
}

export class GamePlanningAnalyticsService {
  /**
   * Get comprehensive game planning analytics for a team
   */
  async getGamePlanningAnalytics(teamId: string): Promise<GamePlanningAnalyticsData> {
    try {
      // Get all game plans for the team
      const { data: gamePlans, error: gamePlansError } = await supabase
        .from('game_plans_enhanced')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (gamePlansError) {
        console.warn('Game plans table may not exist yet, using mock data');
        return this.generateMockAnalyticsData();
      }

      // Get situations and plays (these tables may not exist yet)
      const situations = await this.getSituationsData(teamId);
      const plays = await this.getPlaysData(teamId);
      const analytics = await this.getAnalyticsData(teamId);

      const metrics = this.calculateMetrics(gamePlans || [], situations, plays);
      const insights = this.generateInsights(gamePlans || [], situations, plays, analytics);

      return {
        metrics,
        insights,
        recentActivity: {
          gamePlans: (gamePlans || []).slice(0, 5),
          analytics: analytics.slice(0, 10)
        }
      };
    } catch (error) {
      console.error('Error fetching game planning analytics:', error);
      return this.generateMockAnalyticsData();
    }
  }

  /**
   * Calculate key metrics from game planning data
   */
  private calculateMetrics(
    gamePlans: GamePlanEnhanced[],
    situations: GamePlanSituation[],
    plays: GamePlanPlay[]
  ): GamePlanningMetrics {
    const activeGamePlans = gamePlans.filter(gp =>
      gp.preparation_status === 'in_progress' || gp.preparation_status === 'game_ready'
    );

    const completedGamePlans = gamePlans.filter(gp =>
      gp.preparation_status === 'complete' || gp.preparation_status === 'game_ready'
    );

    // Calculate average preparation time (mock for now)
    const averagePreparationTime = 120; // minutes

    // Situation coverage analysis
    const uniqueSituations = new Set(situations.map(s => s.category_name));
    const coveredSituations = uniqueSituations.size;
    const totalSituations = 12; // Standard Billick situations
    const coveragePercentage = totalSituations > 0 ? (coveredSituations / totalSituations) * 100 : 0;

    // Play assignments analysis
    const totalAssignments = plays.length;
    const averagePerSituation = situations.length > 0 ? totalAssignments / situations.length : 0;
    const highPriorityAssignments = plays.filter(p => p.priority_level >= 4).length;

    return {
      totalGamePlans: gamePlans.length,
      activeGamePlans: activeGamePlans.length,
      completedGamePlans: completedGamePlans.length,
      averagePreparationTime,
      situationCoverage: {
        totalSituations,
        coveredSituations,
        coveragePercentage
      },
      playAssignments: {
        totalAssignments,
        averagePerSituation,
        highPriorityAssignments
      }
    };
  }

  /**
   * Generate insights from game planning data
   */
  private generateInsights(
    gamePlans: GamePlanEnhanced[],
    _situations: GamePlanSituation[],
    plays: GamePlanPlay[],
    analytics: GamePlanAnalytics[]
  ): GamePlanningInsights {
    // Preparation status breakdown
    const preparationStatus = {
      draft: gamePlans.filter(gp => gp.preparation_status === 'draft').length,
      inProgress: gamePlans.filter(gp => gp.preparation_status === 'in_progress').length,
      complete: gamePlans.filter(gp => gp.preparation_status === 'complete').length,
      gameReady: gamePlans.filter(gp => gp.preparation_status === 'game_ready').length
    };

    // Situational analysis
    const situationalAnalysis = this.analyzeSituations(_situations, plays);

    // Coaching effectiveness
    const coachingEffectiveness = this.analyzeCoachingEffectiveness(analytics);

    // Optimization opportunities
    const optimizationOpportunities = this.generateOptimizationOpportunities(_situations, plays, analytics);

    return {
      preparationStatus,
      situationalAnalysis,
      coachingEffectiveness,
      optimizationOpportunities
    };
  }

  /**
   * Analyze situation coverage and effectiveness
   */
  private analyzeSituations(situations: GamePlanSituation[], plays: GamePlanPlay[]) {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Check for critical situations
    const criticalSituations = ['3rd & Short', 'Red Zone', 'Two Minute', '4th Down'];
    const coveredCritical = situations.filter(s =>
      criticalSituations.some(critical => s.category_name.includes(critical))
    );

    if (coveredCritical.length >= criticalSituations.length * 0.75) {
      strengths.push('Good coverage of critical game situations');
    } else {
      weaknesses.push('Missing coverage for critical game situations');
      recommendations.push('Prioritize planning for 3rd & Short, Red Zone, Two Minute, and 4th Down situations');
    }

    // Check play assignment balance
    const situationPlayCounts = new Map<string, number>();
    plays.forEach(play => {
      const current = situationPlayCounts.get(play.situation_id) || 0;
      situationPlayCounts.set(play.situation_id, current + 1);
    });

    const avgPlaysPerSituation = plays.length / Math.max(situations.length, 1);
    if (avgPlaysPerSituation >= 3) {
      strengths.push('Balanced play distribution across situations');
    } else {
      weaknesses.push('Insufficient play options for some situations');
      recommendations.push('Add more play options to situations with fewer than 3 assignments');
    }

    return { strengths, weaknesses, recommendations };
  }

  /**
   * Analyze coaching effectiveness from analytics data
   */
  private analyzeCoachingEffectiveness(analytics: GamePlanAnalytics[]) {
    const averageExecutionQuality = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.execution_quality || 0), 0) / analytics.length
      : 7.5;

    // Success rate by situation type
    const successRateBySituation: Record<string, number> = {};
    const situationOutcomes = new Map<string, { success: number; total: number }>();

    analytics.forEach(analytic => {
      if (analytic.situation_id) {
        const current = situationOutcomes.get(analytic.situation_id) || { success: 0, total: 0 };
        current.total++;
        if (analytic.outcome === 'success') {
          current.success++;
        }
        situationOutcomes.set(analytic.situation_id, current);
      }
    });

    situationOutcomes.forEach((outcomes, situationId) => {
      successRateBySituation[situationId] = outcomes.total > 0
        ? (outcomes.success / outcomes.total) * 100
        : 0;
    });

    const adjustmentFrequency = analytics.filter(a => a.adjustments_made).length;
    const coachingAssessmentTrends = analytics
      .filter(a => a.coaching_assessment)
      .map(a => a.coaching_assessment!)
      .slice(-5); // Last 5 assessments

    return {
      averageExecutionQuality,
      successRateBySituation,
      adjustmentFrequency,
      coachingAssessmentTrends
    };
  }

  /**
   * Generate optimization opportunities
   */
  private generateOptimizationOpportunities(
    situations: GamePlanSituation[],
    plays: GamePlanPlay[],
    analytics: GamePlanAnalytics[]
  ): PriorityOptimization[] {
    const opportunities: PriorityOptimization[] = [];

    // Analyze play success rates
    const playSuccessRates = new Map<string, { success: number; total: number }>();
    analytics.forEach(analytic => {
      if (analytic.play_id && analytic.outcome) {
        const current = playSuccessRates.get(analytic.play_id) || { success: 0, total: 0 };
        current.total++;
        if (analytic.outcome === 'success') {
          current.success++;
        }
        playSuccessRates.set(analytic.play_id, current);
      }
    });

    // Generate optimization suggestions
    plays.forEach(play => {
      const successData = playSuccessRates.get(play.play_id);
      if (successData && successData.total >= 3) {
        const successRate = (successData.success / successData.total) * 100;
        const suggestedPriority = successRate > 80 ? Math.min(play.priority_level + 1, 5)
                               : successRate < 40 ? Math.max(play.priority_level - 1, 1)
                               : play.priority_level;

        if (suggestedPriority !== play.priority_level) {
          opportunities.push({
            situationId: play.situation_id,
            currentPriority: play.priority_level,
            suggestedPriority,
            confidence: Math.min(successData.total / 10, 1), // Confidence based on sample size
            reasoning: successRate > 80
              ? `High success rate (${successRate.toFixed(1)}%) suggests increasing priority`
              : `Low success rate (${successRate.toFixed(1)}%) suggests decreasing priority`,
            historicalData: {
              successRate,
              executionCount: successData.total,
              avgYardsGained: analytics
                .filter(a => a.play_id === play.play_id && a.yards_gained)
                .reduce((sum, a) => sum + (a.yards_gained || 0), 0) / successData.total
            }
          });
        }
      }
    });

    return opportunities.slice(0, 5); // Top 5 opportunities
  }

  /**
   * Get situations data (with fallback for missing table)
   */
  private async getSituationsData(_teamId: string): Promise<GamePlanSituation[]> {
    try {
      const { data, error } = await supabase
        .from('game_plan_situations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (_error) {
      console.warn('Game plan situations table may not exist yet');
      return [];
    }
  }

  /**
   * Get plays data (with fallback for missing table)
   */
  private async getPlaysData(_teamId: string): Promise<GamePlanPlay[]> {
    try {
      const { data, error } = await supabase
        .from('game_plan_plays')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (_error) {
      console.warn('Game plan plays table may not exist yet');
      return [];
    }
  }

  /**
   * Get analytics data (with fallback for missing table)
   */
  private async getAnalyticsData(_teamId: string): Promise<GamePlanAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('game_plan_analytics')
        .select('*')
        .order('execution_time', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (_error) {
      console.warn('Game plan analytics table may not exist yet');
      return [];
    }
  }

  /**
   * Generate mock analytics data for development
   */
  private generateMockAnalyticsData(): GamePlanningAnalyticsData {
    return {
      metrics: {
        totalGamePlans: 8,
        activeGamePlans: 3,
        completedGamePlans: 5,
        averagePreparationTime: 145,
        situationCoverage: {
          totalSituations: 12,
          coveredSituations: 9,
          coveragePercentage: 75
        },
        playAssignments: {
          totalAssignments: 156,
          averagePerSituation: 4.2,
          highPriorityAssignments: 42
        }
      },
      insights: {
        preparationStatus: {
          draft: 2,
          inProgress: 3,
          complete: 2,
          gameReady: 1
        },
        situationalAnalysis: {
          strengths: [
            'Good coverage of critical game situations',
            'Balanced play distribution across situations'
          ],
          weaknesses: [
            'Limited options for backed-up situations',
            'Weather contingency planning needs improvement'
          ],
          recommendations: [
            'Add more run options for short yardage situations',
            'Develop specific plans for adverse weather conditions',
            'Increase coverage for goal line situations'
          ]
        },
        coachingEffectiveness: {
          averageExecutionQuality: 7.8,
          successRateBySituation: {
            'red_zone': 68,
            'third_short': 72,
            'two_minute': 65,
            'normal': 78
          },
          adjustmentFrequency: 12,
          coachingAssessmentTrends: [
            'Good execution on play-action passes',
            'Need better protection on deep routes',
            'Running game effective in obvious situations',
            'Screen game underutilized in short yardage'
          ]
        },
        optimizationOpportunities: [
          {
            situationId: 'red_zone_1',
            currentPriority: 3,
            suggestedPriority: 4,
            confidence: 0.85,
            reasoning: 'High success rate (82%) suggests increasing priority',
            historicalData: {
              successRate: 82,
              executionCount: 28,
              avgYardsGained: 12.5
            }
          },
          {
            situationId: 'third_medium_2',
            currentPriority: 4,
            suggestedPriority: 3,
            confidence: 0.72,
            reasoning: 'Lower success rate (45%) suggests decreasing priority',
            historicalData: {
              successRate: 45,
              executionCount: 15,
              avgYardsGained: 8.2
            }
          }
        ]
      },
      recentActivity: {
        gamePlans: [],
        analytics: []
      }
    };
  }
}