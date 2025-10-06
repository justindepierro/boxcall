/**
 * Unified Achievement Service
 * 
 * Consolidates achievement management from:
 * - achievementService.ts (user-facing API)
 * - achievementTracker.ts (tracking & database operations)
 * 
 * Handles Xbox-style achievements, progress tracking, and badge/medal systems.
 * 
 * Phase 3B: Properly consolidated Achievement Services (2→1)
 * Previous consolidation corrupted (commit 55bea84) - this is the corrected version.
 * 
 * NOTE: achievement_definitions and achievement_progress tables don't exist in current schema.
 * Service gracefully degrades to empty achievements until tables are created.
 */
import { supabase } from "../lib/supabase";
import type { Player } from "../app/store";

// Feature flag - disable advanced achievement features until DB tables exist
const ACHIEVEMENT_SYSTEM_ENABLED = false;

// ============================================================================
// Types from achievementTracker.ts
// ============================================================================

// Achievement trigger types
export type AchievementTrigger =
  | 'play_created'
  | 'post_sent'
  | 'player_added'
  | 'game_won'
  | 'game_won_streak'
  | 'points_milestone'
  | 'achievements_earned';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'social' | 'teamwork' | 'leadership' | 'milestone' | 'special';
  trigger_type: 'action_count' | 'streak' | 'milestone' | 'special';
  trigger_target: AchievementTrigger;
  trigger_count: number;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
}

export interface AchievementProgress {
  id: string;
  player_id: string;
  achievement_id: string;
  current_count: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface EarnedAchievement {
  id: string;
  player_id: string;
  definition_id: string;
  achievement_type: string;
  description?: string;
  earned_date: string;
  points_earned: number;
  definition?: AchievementDefinition;
}

// ============================================================================
// Types from achievementService.ts (legacy)
// ============================================================================

// Achievement types
export interface HelmetSticker {
  id: string;
  name: string;
  icon: string;
  awardedBy: string;
  awardedByName?: string;
  date: string;
  teamId: string;
  teamName?: string;
}

export interface BoxCallMedal {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  earnedDate?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points?: number;
}

export interface AchievementData {
  helmetStickers: HelmetSticker[];
  boxcallMedals: BoxCallMedal[];
  weeklyStreak: number;
  totalPoints: number;
  recentAchievements: Array<HelmetSticker | BoxCallMedal>;
}

// ============================================================================
// Achievement Tracking Service (from achievementTracker.ts)
// ============================================================================

/**
 * Achievement Tracking Service
 * Handles achievement progress, unlocking, and awarding
 */
class AchievementTracker {

  /**
   * Track a user action and check for achievement unlocks
   */
  static async trackPlayerAction(
    player: Player,
    action: AchievementTrigger,
    additionalData?: Record<string, any>
  ): Promise<EarnedAchievement[]> {
    try {
      // Achievement system not enabled until DB tables are created
      if (!ACHIEVEMENT_SYSTEM_ENABLED) {
        return [];
      }

      if (!player?.id) {
        return [];
      }      // Get all active achievements that could be triggered by this action
      // Note: achievement_definitions table doesn't exist yet in schema
      const { data: relevantAchievements, error: definitionsError } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .eq('trigger_target', action);

      if (definitionsError) {
        console.warn('[Achievement] achievement_definitions table not available:', definitionsError.message);
        return []; // Gracefully return empty if table doesn't exist
      }

      if (!relevantAchievements?.length) {
        return [];
      }

      const earnedAchievements: EarnedAchievement[] = [];

      for (const achievement of relevantAchievements) {
        const earned = await this.checkAndAwardAchievement(player.id, achievement, additionalData);
        if (earned) {
          earnedAchievements.push(earned);
        }
      }

      // Check milestone achievements
      const milestoneAchievements = await this.checkMilestoneAchievements(player.id);
      earnedAchievements.push(...milestoneAchievements);

      return earnedAchievements;

    } catch (error) {
      console.error('[Achievement] Error tracking action:', error);
      return [];
    }
  }

  /**
   * Check and potentially award an achievement
   */
  private static async checkAndAwardAchievement(
    playerId: string,
    achievement: AchievementDefinition,
    additionalData?: Record<string, any>
  ): Promise<EarnedAchievement | null> {
    try {
      // Get or create progress record
      let { data: progress } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('player_id', playerId)
        .eq('achievement_id', achievement.id)
        .single();

      if (!progress) {
        // Create new progress record
        const { data: newProgress, error } = await supabase
          .from('achievement_progress')
          .insert({
            player_id: playerId,
            achievement_id: achievement.id,
            current_count: 0,
            is_completed: false
          })
          .select()
          .single();

        if (error) throw error;
        progress = newProgress;
      }

      if (progress.is_completed) {
        return null; // Already earned
      }

      // Increment progress based on trigger type
      let newCount = progress.current_count;

      switch (achievement.trigger_type) {
        case 'action_count':
          newCount += 1;
          break;
        case 'streak':
          // Handle streak logic (would need additional context)
          newCount = additionalData?.streakCount || 1;
          break;
        case 'special':
          // Special achievements handled separately
          return null;
      }

      // Check if achievement is now complete
      const isComplete = newCount >= achievement.trigger_count;

      // Update progress
      await supabase
        .from('achievement_progress')
        .update({
          current_count: newCount,
          is_completed: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', progress.id);

      if (isComplete) {
        // Award the achievement
        const { data: earnedAchievement, error } = await supabase
          .from('achievements')
          .insert({
            player_id: playerId,
            definition_id: achievement.id,
            achievement_type: achievement.name,
            description: achievement.description,
            earned_date: new Date().toISOString().split('T')[0],
            points_earned: achievement.points
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`[Achievement] 🎉 Awarded: ${achievement.name} to player ${playerId}`);

        return {
          ...earnedAchievement,
          definition: achievement
        };
      }

      return null;

    } catch (error) {
      console.error('[Achievement] Error checking achievement:', error);
      return null;
    }
  }

  /**
   * Check milestone achievements (points, total achievements earned)
   */
  private static async checkMilestoneAchievements(playerId: string): Promise<EarnedAchievement[]> {
    const earned: EarnedAchievement[] = [];

    try {
      // Check total points milestone
      const { data: totalPoints } = await supabase
        .from('achievements')
        .select('points_earned')
        .eq('player_id', playerId);

      const pointsSum = totalPoints?.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0) || 0;

      const pointsMilestones = [100, 250, 500, 1000];
      for (const milestone of pointsMilestones) {
        if (pointsSum >= milestone) {
          const earnedAchievement = await this.awardMilestoneAchievement(
            playerId,
            'points_milestone',
            milestone,
            `Reach ${milestone} total achievement points`,
            milestone
          );
          if (earnedAchievement) earned.push(earnedAchievement);
        }
      }

      // Check total achievements earned
      const totalAchievements = totalPoints?.length || 0;
      const achievementMilestones = [10, 25, 50, 100];

      for (const milestone of achievementMilestones) {
        if (totalAchievements >= milestone) {
          const earnedAchievement = await this.awardMilestoneAchievement(
            playerId,
            'achievements_earned',
            milestone,
            `Earn ${milestone} different achievements`,
            milestone * 10
          );
          if (earnedAchievement) earned.push(earnedAchievement);
        }
      }

    } catch (error) {
      console.error('[Achievement] Error checking milestones:', error);
    }

    return earned;
  }

  /**
   * Award a milestone achievement
   */
  private static async awardMilestoneAchievement(
    playerId: string,
    triggerTarget: string,
    milestone: number,
    description: string,
    points: number
  ): Promise<EarnedAchievement | null> {
    try {
      // Check if already earned
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('player_id', playerId)
        .eq('achievement_type', `Milestone: ${triggerTarget} ${milestone}`);

      if (existing?.length) return null;

      // Create the achievement
      const { data: earned, error } = await supabase
        .from('achievements')
        .insert({
          player_id: playerId,
          achievement_type: `Milestone: ${triggerTarget} ${milestone}`,
          description,
          earned_date: new Date().toISOString().split('T')[0],
          points_earned: points
        })
        .select()
        .single();

      if (error) throw error;

      return earned;

    } catch (error) {
      console.error('[Achievement] Error awarding milestone:', error);
      return null;
    }
  }

  /**
   * Get all achievements for a user
   */
  static async getUserAchievements(userId: string): Promise<{
    earned: EarnedAchievement[];
    progress: AchievementProgress[];
    definitions: AchievementDefinition[];
  }> {
    try {
      // Achievement system not enabled until DB tables are created
      if (!ACHIEVEMENT_SYSTEM_ENABLED) {
        return { earned: [], progress: [], definitions: [] };
      }

      // Get player record from profiles table (since player_roster doesn't exist)
      const { data: player, error: playerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (playerError) {
        console.warn('[Achievement] Error fetching player:', playerError.message);
        return { earned: [], progress: [], definitions: [] };
      }

      if (!player) {
        return { earned: [], progress: [], definitions: [] };
      }

      // Try to get earned achievements - handle if tables don't exist
      const { data: earned, error: earnedError } = await supabase
        .from('achievements')
        .select('*')
        .eq('player_id', player.id);

      if (earnedError) {
        console.warn('[Achievement] achievement_definitions or achievement_progress tables may not exist:', earnedError.message);
        console.info('[Achievement] Returning empty achievements - system not fully initialized');
        return { earned: [], progress: [], definitions: [] };
      }

      // Skip queries for tables that don't exist yet
      // achievement_progress and achievement_definitions are not in the current schema
      // Return simple achievements only
      return {
        earned: earned || [],
        progress: [],  // Table doesn't exist yet
        definitions: []  // Table doesn't exist yet
      };

    } catch (error) {
      console.error('[Achievement] Error getting user achievements:', error);
      return { earned: [], progress: [], definitions: [] };
    }
  }

  /**
   * Admin: Create a new achievement definition
   */
  static async createAchievementDefinition(definition: Omit<AchievementDefinition, 'id'>): Promise<AchievementDefinition | null> {
    try {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .insert(definition)
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('[Achievement] Error creating definition:', error);
      return null;
    }
  }

  /**
   * Admin: Get all achievement definitions
   */
  static async getAllDefinitions(): Promise<AchievementDefinition[]> {
    try {
      const { data } = await supabase
        .from('achievement_definitions')
        .select('*')
        .order('category', { ascending: true })
        .order('rarity', { ascending: false });

      return data || [];

    } catch (error) {
      console.error('[Achievement] Error getting definitions:', error);
      return [];
    }
  }
}

// ============================================================================
// User-Facing Achievement Service (from achievementService.ts)
// ============================================================================

/**
 * Achievement Service
 * Xbox-style achievements for BoxCall
 */
export class AchievementService {

  /**
   * Get all achievements for a user
   */
  static async getUserAchievements(
    userId: string,
    devMode?: string
  ): Promise<AchievementData> {
    try {
      console.info(`[Achievement] Getting achievements for user ${userId}`);

      // For blank slate mode, return empty achievements
      if (devMode === "blank_slate") {
        console.info("🆕 Returning empty achievements for blank slate mode");
        return this.getEmptyAchievements();
      }

      // Get real achievements from the new system
      const { earned, progress, definitions } = await AchievementTracker.getUserAchievements(userId);

      // Convert to the expected format
      const boxcallMedals: BoxCallMedal[] = earned.map((achievement: any) => ({
        id: achievement.id,
        name: achievement.achievement_type,
        icon: achievement.definition?.icon || 'trophy',
        description: achievement.description || '',
        earned: true,
        earnedDate: achievement.earned_date,
        rarity: achievement.definition?.rarity,
        points: achievement.points_earned
      }));

      // Add in-progress achievements
      const inProgressMedals: BoxCallMedal[] = progress
        .filter((p: any) => !p.is_completed && p.achievement_id)
        .map((p: any) => {
          const definition = definitions.find((d: any) => d.id === p.achievement_id);
          if (!definition) return null;

          return {
            id: `progress_${p.id}`,
            name: definition.name,
            icon: definition.icon,
            description: definition.description,
            earned: false,
            progress: p.current_count,
            maxProgress: definition.trigger_count,
            rarity: definition.rarity,
            points: definition.points
          };
        })
        .filter(Boolean) as BoxCallMedal[];

      // Combine earned and in-progress
      const allMedals = [...boxcallMedals, ...inProgressMedals];

      // Calculate total points
      const totalPoints = earned.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0);

      return {
        helmetStickers: [], // Legacy - can be removed or repurposed
        boxcallMedals: allMedals,
        weeklyStreak: 0, // TODO: Implement streak tracking
        totalPoints,
        recentAchievements: allMedals.slice(0, 5)
      };

    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return this.getEmptyAchievements();
    }
  }

  /**
   * Track an achievement-worthy action
   */
  static async trackAction(
    userId: string,
    action: 'play_created' | 'post_sent' | 'player_added' | 'game_won' | 'game_won_streak',
    additionalData?: Record<string, any>
  ): Promise<EarnedAchievement[]> {
    // Achievement system not enabled until DB tables are created
    if (!ACHIEVEMENT_SYSTEM_ENABLED) {
      return [];
    }
    
    // Create minimal player object for tracking
    const player: Player = {
      id: userId,
      name: '',
      jersey: 0,
      position: '',
      parentEmails: [],
      stats: { gamesPlayed: 0, touchdowns: 0, yards: 0, tackles: 0 }
    };
    
    return AchievementTracker.trackPlayerAction(player, action, additionalData);
  }

  /**
   * Get empty achievements for blank slate mode
   */
  private static getEmptyAchievements(): AchievementData {
    return {
      helmetStickers: [],
      boxcallMedals: [],
      weeklyStreak: 0,
      totalPoints: 0,
      recentAchievements: [],
    };
  }

  /**
   * Admin: Create a new achievement definition
   */
  static async createAchievement(
    achievement: Omit<AchievementDefinition, 'id'>
  ): Promise<AchievementDefinition | null> {
    return AchievementTracker.createAchievementDefinition(achievement);
  }

  /**
   * Admin: Get all achievement definitions
   */
  static async getAllDefinitions(): Promise<AchievementDefinition[]> {
    return AchievementTracker.getAllDefinitions();
  }

  /**
   * Legacy methods - kept for compatibility
   */
  static async getHelmetStickers(_userId: string): Promise<HelmetSticker[]> {
    // TODO: Implement real helmet stickers from database
    return [];
  }

  /**
   * Get BoxCall platform medals for user
   */
  static async getBoxCallMedals(_userId: string): Promise<BoxCallMedal[]> {
    // TODO: Implement medal calculation based on user activity
    return [];
  }

  static async getActivityStreak(_userId: string): Promise<number> {
    return 0; // TODO: Implement
  }

  static calculateTotalPoints(achievements: AchievementData): number {
    return achievements.totalPoints;
  }
}
