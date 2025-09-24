import { AchievementTracker, type EarnedAchievement, type AchievementDefinition } from "./achievementTracker";

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
    return AchievementTracker.trackAction(userId, action, additionalData);
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
}
