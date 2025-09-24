import { supabase } from "../lib/supabase";

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

/**
 * Achievement Tracking Service
 * Handles achievement progress, unlocking, and awarding
 */
export class AchievementTracker {

  /**
   * Track a user action and check for achievement unlocks
   */
  static async trackAction(
    userId: string,
    action: AchievementTrigger,
    additionalData?: Record<string, any>
  ): Promise<EarnedAchievement[]> {
    try {
      console.log(`[Achievement] Tracking action: ${action} for user: ${userId}`);

      // Get the player's team player record
      const { data: player } = await supabase
        .from('team_players')
        .select('id, team_id')
        .eq('user_id', userId)
        .single();

      if (!player) {
        console.log('[Achievement] No player record found for user');
        return [];
      }

      // Get all active achievements that could be triggered by this action
      const { data: relevantAchievements } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .eq('trigger_target', action);

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
      // Get player record
      const { data: player } = await supabase
        .from('team_players')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!player) {
        return { earned: [], progress: [], definitions: [] };
      }

      // Get earned achievements
      const { data: earned } = await supabase
        .from('achievements')
        .select('*, achievement_definitions(*)')
        .eq('player_id', player.id);

      // Get progress
      const { data: progress } = await supabase
        .from('achievement_progress')
        .select('*, achievement_definitions(*)')
        .eq('player_id', player.id);

      // Get all active definitions
      const { data: definitions } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true);

      return {
        earned: earned || [],
        progress: progress || [],
        definitions: definitions || []
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