import { supabase } from "../lib/supabase";

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
 * Manages user achievements, helmet stickers, and BoxCall medals
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
      console.log(
        `[Trophy/Achievement] Getting achievements for user ${userId} in dev mode: ${devMode}`
      );

      // Check if we're in blank slate mode
      if (devMode === "blank_slate") {
        console.log("🆕 Returning empty achievements for blank slate mode");
        return this.getEmptyAchievements();
      }

      // For production/real modes, get real data
      if (devMode === "production" || devMode === "super_admin_real") {
        try {
          console.log(
            "[Search/Investigate] Attempting to fetch real achievements..."
          );
          const realAchievements = await Promise.race([
            this.getRealAchievements(userId),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Achievement fetch timeout")),
                5000
              )
            ),
          ]);
          console.log(
            "[Success/Complete] Real achievements fetched successfully"
          );
          return realAchievements;
        } catch (error) {
          console.warn(
            "[Warning] Could not fetch real achievements, returning empty:",
            error
          );
          return this.getEmptyAchievements();
        }
      }

      // For professional dev profiles, get dev profile data
      if (devMode?.startsWith("dev_")) {
        return this.getProfessionalDevAchievements(userId, devMode);
      }

      // For blank slate mode, return empty achievements
      if (devMode === "blank_slate") {
        console.log(
          "🆕 Achievement Service: Blank slate mode - returning empty achievements"
        );
        return this.getEmptyAchievements();
      }

      // Default - try real data first, fall back to empty
      try {
        const realAchievements = await this.getRealAchievements(userId);
        return realAchievements;
      } catch (error) {
        console.warn(
          "Could not fetch real achievements, returning empty:",
          error
        );
        return this.getEmptyAchievements();
      }
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return this.getEmptyAchievements();
    }
  }

  /**
   * Get real achievements from database
   */
  private static async getRealAchievements(
    userId: string
  ): Promise<AchievementData> {
    try {
      // Get helmet stickers without joins first
      const stickersResult = await supabase
        .from("helmet_stickers")
        .select("*")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });

      if (stickersResult.error) {
        console.warn("Error fetching helmet stickers:", stickersResult.error);
      }

      // Try to get real achievements with error handling
      const achievementsResult = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      if (achievementsResult.error) {
        console.warn("Error fetching achievements:", achievementsResult.error);
      }

      const stickers: unknown[] = stickersResult.data || [];
      const achievements: unknown[] = achievementsResult.data || [];

      // Type guard function to ensure we have valid data
      const isValidSticker = (
        sticker: unknown
      ): sticker is Record<string, unknown> => {
        return !!(sticker && typeof sticker === "object" && "id" in sticker);
      };

      const isValidAchievement = (
        achievement: unknown
      ): achievement is Record<string, unknown> => {
        return !!(
          achievement &&
          typeof achievement === "object" &&
          "id" in achievement
        );
      };

      // Safely extract stickers data
      const validStickers: Record<string, unknown>[] = [];
      if (Array.isArray(stickers)) {
        validStickers.push(...stickers.filter(isValidSticker));
      }

      // Safely extract achievements data
      const validAchievements: Record<string, unknown>[] = [];
      if (Array.isArray(achievements)) {
        validAchievements.push(...achievements.filter(isValidAchievement));
      }

      const helmetStickers: HelmetSticker[] = validStickers.map((sticker) => ({
        id: String(sticker.id || ""),
        name: String(sticker.reason || "Sticker"),
        icon: this.getStickerIcon(String(sticker.sticker_type || "star")),
        awardedBy: String(sticker.awarded_by || ""),
        awardedByName: "Coach", // Simplified for now
        date: String(sticker.awarded_at || new Date().toISOString()),
        teamId: String(sticker.team_id || ""),
        teamName: "Team", // Simplified for now
      }));

      const boxcallMedals: BoxCallMedal[] = validAchievements.map(
        (achievement) => ({
          id: String(achievement.id || ""),
          name: String(achievement.title || "Achievement"),
          icon: String(achievement.icon_name || "award"),
          description: String(achievement.description || ""),
          earned: true,
          earnedDate: String(achievement.earned_at || new Date().toISOString()),
        })
      );

      return {
        helmetStickers,
        boxcallMedals,
        weeklyStreak: 0, // Calculate real streak later
        totalPoints: this.calculateTotalPoints({
          helmetStickers,
          boxcallMedals,
          weeklyStreak: 0,
          totalPoints: 0,
          recentAchievements: [],
        }),
        recentAchievements: [
          ...helmetStickers.slice(0, 2),
          ...boxcallMedals.slice(0, 1),
        ],
      };
    } catch (error) {
      console.error("Error in getRealAchievements:", error);
      throw error; // Re-throw to be caught by calling function
    }
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

  private static getStickerIcon(stickerType: string | null): string {
    switch (stickerType) {
      case "star":
        return "star";
      case "flame":
        return "zap";
      case "lightning":
        return "zap";
      case "crown":
        return "crown";
      case "diamond":
        return "award";
      default:
        return "award";
    }
  }

  /**
   * Get helmet stickers awarded to user
   * TODO: Implement real database query
   */
  static async getHelmetStickers(_userId: string): Promise<HelmetSticker[]> {
    try {
      // TODO: Query team_achievements or similar table
      // const { data, error } = await supabase
      //   .from('helmet_stickers')
      //   .select(`
      //     *,
      //     teams (name),
      //     awarded_by_profile:profiles!awarded_by (display_name)
      //   `)
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false });

      // TODO: Implement real helmet stickers from database
      return [];
    } catch (error) {
      console.error("Error fetching helmet stickers:", error);
      return [];
    }
  }

  /**
   * Get BoxCall platform medals for user
   */
  static async getBoxCallMedals(_userId: string): Promise<BoxCallMedal[]> {
    try {
      // TODO: Implement medal calculation based on user activity
      return [];
    } catch (error) {
      console.error("Error calculating BoxCall medals:", error);
      return [];
    }
  }

  /**
   * Calculate user's activity streak
   */
  static async getActivityStreak(userId: string): Promise<number> {
    try {
      // TODO: Calculate based on user login/activity data
      // For now, return mock data
      console.log("Calculating activity streak for user:", userId);
      return Math.floor(Math.random() * 14) + 1; // 1-14 days
    } catch (error) {
      console.error("Error calculating activity streak:", error);
      return 0;
    }
  }

  /**
   * Calculate total achievement points
   */
  static calculateTotalPoints(achievements: AchievementData): number {
    const stickerPoints = achievements.helmetStickers.length * 25; // 25 points per sticker
    const medalPoints =
      achievements.boxcallMedals.filter((m) => m.earned).length * 50; // 50 points per medal
    const streakBonus = achievements.weeklyStreak * 5; // 5 points per day streak

    return stickerPoints + medalPoints + streakBonus;
  }

  /**
   * Get professional dev profile achievements
   */
  private static getProfessionalDevAchievements(
    _userId: string,
    devMode: string
  ): AchievementData {
    // Professional dev profiles have realistic achievements based on their role
    const baseAchievements = {
      weeklyStreak: 3,
      totalPoints: 850,
      recentAchievements: [],
    };

    switch (devMode) {
      case "dev_head_coach":
        return {
          ...baseAchievements,
          helmetStickers: [
            {
              id: "dev-leadership-1",
              name: "Leadership Excellence",
              icon: "star",
              awardedBy: "dev-system",
              awardedByName: "Development System",
              date: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              teamId: "dev-team",
              teamName: "BoxCall Dev Team",
            },
            {
              id: "dev-coaching-1",
              name: "Outstanding Coaching",
              icon: "trophy",
              awardedBy: "dev-system",
              awardedByName: "Development System",
              date: new Date(
                Date.now() - 14 * 24 * 60 * 60 * 1000
              ).toISOString(),
              teamId: "dev-team",
              teamName: "BoxCall Dev Team",
            },
          ],
          boxcallMedals: [
            {
              id: "dev-season-excellence",
              name: "Season Excellence",
              description: "Led team to outstanding season performance",
              icon: "medal",
              earned: true,
              earnedDate: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ],
        };

      case "dev_assistant_coach":
        return {
          ...baseAchievements,
          totalPoints: 620,
          helmetStickers: [
            {
              id: "dev-defensive-1",
              name: "Defensive Coordinator",
              icon: "shield",
              awardedBy: "dev-system",
              awardedByName: "Development System",
              date: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000
              ).toISOString(),
              teamId: "dev-team",
              teamName: "BoxCall Dev Team",
            },
          ],
          boxcallMedals: [
            {
              id: "dev-player-development",
              name: "Player Development",
              description: "Exceptional player mentoring and development",
              icon: "medal",
              earned: true,
              earnedDate: new Date(
                Date.now() - 21 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ],
        };

      case "dev_player":
        return {
          ...baseAchievements,
          totalPoints: 1250,
          weeklyStreak: 5,
          helmetStickers: [
            {
              id: "dev-touchdown-1",
              name: "Touchdown Pass",
              icon: "football", // fallback to help-circle if not in registry
              awardedBy: "dev-coach",
              awardedByName: "Coach Martinez",
              date: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              teamId: "dev-team",
              teamName: "BoxCall Dev Team",
            },
            {
              id: "dev-leadership-player",
              name: "Team Captain",
              icon: "star",
              awardedBy: "dev-coach",
              awardedByName: "Coach Martinez",
              date: new Date(
                Date.now() - 10 * 24 * 60 * 60 * 1000
              ).toISOString(),
              teamId: "dev-team",
              teamName: "BoxCall Dev Team",
            },
          ],
          boxcallMedals: [
            {
              id: "dev-player-of-week",
              name: "Player of the Week",
              description: "Outstanding performance in last game",
              icon: "trophy",
              earned: true,
              earnedDate: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ],
        };

      case "dev_super_admin":
        return {
          ...baseAchievements,
          totalPoints: 2000,
          weeklyStreak: 10,
          helmetStickers: [
            {
              id: "dev-admin-excellence",
              name: "Platform Excellence",
              icon: "crown",
              awardedBy: "dev-system",
              awardedByName: "BoxCall System",
              date: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              teamId: "dev-team",
              teamName: "BoxCall Dev Team",
            },
          ],
          boxcallMedals: [
            {
              id: "dev-system-admin",
              name: "System Administrator",
              description: "Excellence in platform management",
              icon: "target",
              earned: true,
              earnedDate: new Date(
                Date.now() - 14 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ],
        };

      default:
        return this.getEmptyAchievements();
    }
  }
}
