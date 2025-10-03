/**import { AchievementTracker, type EarnedAchievement, type AchievementDefinition } from "./achievementTracker";

 * Unified Achievement Service

 * // Achievement types

 * Consolidates achievement management from:export interface HelmetSticker {

 * - achievementService.ts (user-facing API)  id: string;

 * - achievementTracker.ts (tracking & database operations)  name: string;

 *   icon: string;

 * Handles Xbox-style achievements, progress tracking, and badge/medal systems.  awardedBy: string;

 */  awardedByName?: string;

  date: string;

import { supabase } from "../lib/supabase";  teamId: string;

  teamName?: string;

// ============================================}

// TYPE DEFINITIONS

// ============================================export interface BoxCallMedal {

  id: string;

// Achievement trigger types  name: string;

export type AchievementTrigger =  icon: string;

  | 'play_created'  description: string;

  | 'post_sent'  earned: boolean;

  | 'player_added'  progress?: number;

  | 'game_won'  maxProgress?: number;

  | 'game_won_streak'  earnedDate?: string;

  | 'points_milestone'  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

  | 'achievements_earned';  points?: number;

}

export interface AchievementDefinition {

  id: string;export interface AchievementData {

  name: string;  helmetStickers: HelmetSticker[];

  description: string;  boxcallMedals: BoxCallMedal[];

  icon: string;  weeklyStreak: number;

  category: 'gameplay' | 'social' | 'teamwork' | 'leadership' | 'milestone' | 'special';  totalPoints: number;

  trigger_type: 'action_count' | 'streak' | 'milestone' | 'special';  recentAchievements: Array<HelmetSticker | BoxCallMedal>;

  trigger_target: AchievementTrigger;}

  trigger_count: number;

  points: number;/**

  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; * Achievement Service

  is_active: boolean; * Xbox-style achievements for BoxCall

} */

export class AchievementService {

export interface AchievementProgress {

  id: string;  /**

  user_id: string;   * Get all achievements for a user

  achievement_id: string;   */

  current_count: number;  static async getUserAchievements(

  is_completed: boolean;    userId: string,

  completed_at?: string;    devMode?: string

}  ): Promise<AchievementData> {

    try {

export interface EarnedAchievement {      console.info(`[Achievement] Getting achievements for user ${userId}`);

  id: string;

  player_id: string;      // For blank slate mode, return empty achievements

  definition_id: string;      if (devMode === "blank_slate") {

  achievement_type: string;        console.info("🆕 Returning empty achievements for blank slate mode");

  description?: string;        return this.getEmptyAchievements();

  earned_date: string;      }

  points_earned: number;

  definition?: AchievementDefinition;      // Get real achievements from the new system

}      const { earned, progress, definitions } = await AchievementTracker.getUserAchievements(userId);



// Legacy types for backward compatibility      // Convert to the expected format

export interface HelmetSticker {      const boxcallMedals: BoxCallMedal[] = earned.map((achievement: any) => ({

  id: string;        id: achievement.id,

  name: string;        name: achievement.achievement_type,

  icon: string;        icon: achievement.definition?.icon || 'trophy',

  awardedBy: string;        description: achievement.description || '',

  awardedByName?: string;        earned: true,

  date: string;        earnedDate: achievement.earned_date,

  teamId: string;        rarity: achievement.definition?.rarity,

  teamName?: string;        points: achievement.points_earned

}      }));



export interface BoxCallMedal {      // Add in-progress achievements

  id: string;      const inProgressMedals: BoxCallMedal[] = progress

  name: string;        .filter((p: any) => !p.is_completed && p.achievement_id)

  icon: string;        .map((p: any) => {

  description: string;          const definition = definitions.find((d: any) => d.id === p.achievement_id);

  earned: boolean;          if (!definition) return null;

  progress?: number;

  maxProgress?: number;          return {

  earnedDate?: string;            id: `progress_${p.id}`,

  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';            name: definition.name,

  points?: number;            icon: definition.icon,

}            description: definition.description,

            earned: false,

export interface AchievementData {            progress: p.current_count,

  helmetStickers: HelmetSticker[];            maxProgress: definition.trigger_count,

  boxcallMedals: BoxCallMedal[];            rarity: definition.rarity,

  weeklyStreak: number;            points: definition.points

  totalPoints: number;          };

  recentAchievements: Array<HelmetSticker | BoxCallMedal>;        })

}        .filter(Boolean) as BoxCallMedal[];



// ============================================      // Combine earned and in-progress

// UNIFIED ACHIEVEMENT SERVICE      const allMedals = [...boxcallMedals, ...inProgressMedals];

// ============================================

      // Calculate total points

export class AchievementService {      const totalPoints = earned.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0);



  // ============================================      return {

  // USER-FACING API METHODS        helmetStickers: [], // Legacy - can be removed or repurposed

  // ============================================        boxcallMedals: allMedals,

        weeklyStreak: 0, // TODO: Implement streak tracking

  /**        totalPoints,

   * Get all achievements for a user        recentAchievements: allMedals.slice(0, 5)

   */      };

  static async getUserAchievements(

    userId: string,    } catch (error) {

    devMode?: string      console.error("Error fetching user achievements:", error);

  ): Promise<AchievementData> {      return this.getEmptyAchievements();

    try {    }

      console.info(`[Achievement] Getting achievements for user ${userId}`);  }



      // For blank slate mode, return empty achievements  /**

      if (devMode === "blank_slate") {   * Track an achievement-worthy action

        console.info("🆕 Returning empty achievements for blank slate mode");   */

        return this.getEmptyAchievements();  static async trackAction(

      }    userId: string,

    action: 'play_created' | 'post_sent' | 'player_added' | 'game_won' | 'game_won_streak',

      // Get real achievements from the database    additionalData?: Record<string, any>

      const { earned, progress, definitions } = await this.getUserAchievementsFromDb(userId);  ): Promise<EarnedAchievement[]> {

    return AchievementTracker.trackAction(userId, action, additionalData);

      // Convert to the expected format  }

      const boxcallMedals: BoxCallMedal[] = earned.map((achievement: any) => ({

        id: achievement.id,  /**

        name: achievement.achievement_type,   * Get empty achievements for blank slate mode

        icon: achievement.definition?.icon || 'trophy',   */

        description: achievement.description || '',  private static getEmptyAchievements(): AchievementData {

        earned: true,    return {

        earnedDate: achievement.earned_date,      helmetStickers: [],

        rarity: achievement.definition?.rarity,      boxcallMedals: [],

        points: achievement.points_earned      weeklyStreak: 0,

      }));      totalPoints: 0,

      recentAchievements: [],

      // Add in-progress achievements    };

      const inProgressMedals: BoxCallMedal[] = progress  }

        .filter((p: any) => !p.is_completed && p.achievement_id)

        .map((p: any) => {  /**

          const definition = definitions.find((d: any) => d.id === p.achievement_id);   * Admin: Create a new achievement definition

          if (!definition) return null;   */

  static async createAchievement(

          return {    achievement: Omit<AchievementDefinition, 'id'>

            id: `progress_${p.id}`,  ): Promise<AchievementDefinition | null> {

            name: definition.name,    return AchievementTracker.createAchievementDefinition(achievement);

            icon: definition.icon,  }

            description: definition.description,

            earned: false,  /**

            progress: p.current_count,   * Admin: Get all achievement definitions

            maxProgress: definition.trigger_count,   */

            rarity: definition.rarity,  static async getAllDefinitions(): Promise<AchievementDefinition[]> {

            points: definition.points    return AchievementTracker.getAllDefinitions();

          };  }

        })

        .filter(Boolean) as BoxCallMedal[];  /**

   * Legacy methods - kept for compatibility

      // Combine earned and in-progress   */

      const allMedals = [...boxcallMedals, ...inProgressMedals];  static async getHelmetStickers(_userId: string): Promise<HelmetSticker[]> {

    return [];

      // Calculate total points  }

      const totalPoints = earned.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0);

  static async getBoxCallMedals(userId: string): Promise<BoxCallMedal[]> {

      return {    const achievements = await this.getUserAchievements(userId);

        helmetStickers: [], // Legacy - can be removed or repurposed    return achievements.boxcallMedals;

        boxcallMedals: allMedals,  }

        weeklyStreak: 0, // TODO: Implement streak tracking

        totalPoints,  static async getActivityStreak(_userId: string): Promise<number> {

        recentAchievements: allMedals.slice(0, 5)    return 0; // TODO: Implement

      };  }



    } catch (error) {  static calculateTotalPoints(achievements: AchievementData): number {

      console.error("Error fetching user achievements:", error);    return achievements.totalPoints;

      return this.getEmptyAchievements();  }

    }}

  }

  /**
   * Track an achievement-worthy action
   */
  static async trackAction(
    userId: string,
    action: AchievementTrigger,
    additionalData?: Record<string, any>
  ): Promise<EarnedAchievement[]> {
    try {
      console.log(`[Achievement] Tracking action: ${action} for user: ${userId}`);

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
        const earned = await this.checkAndAwardAchievement(userId, achievement, additionalData);
        if (earned) {
          earnedAchievements.push(earned);
        }
      }

      // Check milestone achievements
      const milestoneAchievements = await this.checkMilestoneAchievements(userId);
      earnedAchievements.push(...milestoneAchievements);

      return earnedAchievements;

    } catch (error) {
      console.error('[Achievement] Error tracking action:', error);
      return [];
    }
  }

  /**
   * Admin: Create a new achievement definition
   */
  static async createAchievement(
    achievement: Omit<AchievementDefinition, 'id'>
  ): Promise<AchievementDefinition | null> {
    return this.createAchievementDefinition(achievement);
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

  /**
   * Initialize default achievements if none exist
   */
  static async initializeDefaultAchievements(): Promise<void> {
    try {
      const defaultAchievements = [
        // Gameplay achievements
        { name: 'First Play', description: 'Create your first play in BoxCall', icon: 'football', category: 'gameplay' as const, trigger_type: 'action_count' as const, trigger_target: 'play_created' as const, trigger_count: 1, points: 10, rarity: 'common' as const },
        { name: 'Playbook Builder', description: 'Create 10 plays for your team', icon: 'book', category: 'gameplay' as const, trigger_type: 'action_count' as const, trigger_target: 'play_created' as const, trigger_count: 10, points: 25, rarity: 'uncommon' as const },
        { name: 'Master Strategist', description: 'Create 50 plays for your team', icon: 'crown', category: 'gameplay' as const, trigger_type: 'action_count' as const, trigger_target: 'play_created' as const, trigger_count: 50, points: 100, rarity: 'rare' as const },

        // Social achievements
        { name: 'Team Communicator', description: 'Send your first team post', icon: 'message-circle', category: 'social' as const, trigger_type: 'action_count' as const, trigger_target: 'post_sent' as const, trigger_count: 1, points: 10, rarity: 'common' as const },
        { name: 'Social Butterfly', description: 'Send 25 team posts', icon: 'users', category: 'social' as const, trigger_type: 'action_count' as const, trigger_target: 'post_sent' as const, trigger_count: 25, points: 50, rarity: 'uncommon' as const },
        { name: 'Team Captain', description: 'Send 100 team posts', icon: 'star', category: 'social' as const, trigger_type: 'action_count' as const, trigger_target: 'post_sent' as const, trigger_count: 100, points: 150, rarity: 'epic' as const },

        // Teamwork achievements
        { name: 'Roster Ready', description: 'Add your first player to the roster', icon: 'user-plus', category: 'teamwork' as const, trigger_type: 'action_count' as const, trigger_target: 'player_added' as const, trigger_count: 1, points: 15, rarity: 'common' as const },
        { name: 'Team Builder', description: 'Add 10 players to your roster', icon: 'users', category: 'teamwork' as const, trigger_type: 'action_count' as const, trigger_target: 'player_added' as const, trigger_count: 10, points: 40, rarity: 'uncommon' as const },
        { name: 'Squad Leader', description: 'Add 25 players to your roster', icon: 'shield', category: 'teamwork' as const, trigger_type: 'action_count' as const, trigger_target: 'player_added' as const, trigger_count: 25, points: 75, rarity: 'rare' as const },

        // Leadership achievements
        { name: 'First Victory', description: 'Win your first game', icon: 'trophy', category: 'leadership' as const, trigger_type: 'action_count' as const, trigger_target: 'game_won' as const, trigger_count: 1, points: 50, rarity: 'uncommon' as const },
        { name: 'Undefeated', description: 'Win 5 games in a row', icon: 'zap', category: 'leadership' as const, trigger_type: 'streak' as const, trigger_target: 'game_won_streak' as const, trigger_count: 5, points: 200, rarity: 'epic' as const },
        { name: 'Champion', description: 'Win 10 games', icon: 'crown', category: 'leadership' as const, trigger_type: 'action_count' as const, trigger_target: 'game_won' as const, trigger_count: 10, points: 300, rarity: 'legendary' as const },

        // Milestone achievements
        { name: 'Century Club', description: 'Reach 100 total achievement points', icon: 'target', category: 'milestone' as const, trigger_type: 'special' as const, trigger_target: 'points_milestone' as const, trigger_count: 100, points: 100, rarity: 'rare' as const },
        { name: 'Achievement Hunter', description: 'Earn 25 different achievements', icon: 'award', category: 'milestone' as const, trigger_type: 'special' as const, trigger_target: 'achievements_earned' as const, trigger_count: 25, points: 250, rarity: 'epic' as const },
        { name: 'BoxCall Legend', description: 'Earn 50 different achievements', icon: 'gem', category: 'milestone' as const, trigger_type: 'special' as const, trigger_target: 'achievements_earned' as const, trigger_count: 50, points: 500, rarity: 'legendary' as const }
      ];

      const { error } = await supabase
        .from('achievement_definitions')
        .insert(defaultAchievements);

      if (error) {
        console.error('[Achievement] Error initializing default achievements:', error);
      } else {
        console.log('[Achievement] Successfully initialized default achievements');
      }
    } catch (error) {
      console.error('[Achievement] Error in initializeDefaultAchievements:', error);
    }
  }

  // ============================================
  // LEGACY API (for backward compatibility)
  // ============================================

  static async getHelmetStickers(_userId: string): Promise<HelmetSticker[]> {
    return [];
  }

  static async getBoxCallMedals(userId: string): Promise<BoxCallMedal[]> {
    const achievements = await this.getUserAchievements(userId);
    return achievements.boxcallMedals;
  }

  static async getActivityStreak(_userId: string): Promise<number> {
    return 0; // TODO: Implement
  }

  static calculateTotalPoints(achievements: AchievementData): number {
    return achievements.totalPoints;
  }

  // ============================================
  // INTERNAL/PRIVATE METHODS
  // ============================================

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
   * Get user achievements from database
   */
  private static async getUserAchievementsFromDb(userId: string): Promise<{
    earned: EarnedAchievement[];
    progress: AchievementProgress[];
    definitions: AchievementDefinition[];
  }> {
    try {
      // Get all active definitions
      let definitions = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .then(({ data }) => data);

      // If no definitions exist, return empty (blank slate mode)
      if (!definitions || definitions.length === 0) {
        console.log('[Achievement] No achievement definitions found, returning empty for blank slate mode');
        return {
          earned: [],
          progress: [],
          definitions: []
        };
      }

      // Get earned achievements
      const { data: earned } = await supabase
        .from('achievements')
        .select('*')
        .eq('player_id', userId);

      // Get progress from new system
      const { data: progress } = await supabase
        .from('achievement_progress')
        .select('*, achievement_definitions(*)')
        .eq('user_id', userId);

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
   * Check and potentially award an achievement
   */
  private static async checkAndAwardAchievement(
    userId: string,
    achievement: AchievementDefinition,
    additionalData?: Record<string, any>
  ): Promise<EarnedAchievement | null> {
    try {
      // Get or create progress record
      let { data: progress } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();

      if (!progress) {
        // Create new progress record
        const { data: newProgress, error } = await supabase
          .from('achievement_progress')
          .insert({
            user_id: userId,
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
            player_id: userId, // Using existing column name for now
            definition_id: achievement.id,
            achievement_type: achievement.name,
            description: achievement.description,
            earned_date: new Date().toISOString().split('T')[0],
            points_earned: achievement.points
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`[Achievement] 🎉 Awarded: ${achievement.name} to user ${userId}`);

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
  private static async checkMilestoneAchievements(userId: string): Promise<EarnedAchievement[]> {
    const earned: EarnedAchievement[] = [];

    try {
      // Check total points milestone
      const { data: totalPoints } = await supabase
        .from('achievements')
        .select('points_earned')
        .eq('player_id', userId);

      const pointsSum = totalPoints?.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0) || 0;

      const pointsMilestones = [100, 250, 500, 1000];
      for (const milestone of pointsMilestones) {
        if (pointsSum >= milestone) {
          const earnedAchievement = await this.awardMilestoneAchievement(
            userId,
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
            userId,
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
    userId: string,
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
        .eq('player_id', userId)
        .eq('achievement_type', `Milestone: ${triggerTarget} ${milestone}`);

      if (existing?.length) return null;

      // Create the achievement
      const { data: earned, error } = await supabase
        .from('achievements')
        .insert({
          player_id: userId,
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
   * Admin: Create a new achievement definition
   */
  private static async createAchievementDefinition(definition: Omit<AchievementDefinition, 'id'>): Promise<AchievementDefinition | null> {
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
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

export const AchievementTracker = AchievementService;
