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

      // For legacy mock dev modes, return mock data
      if (devMode === "super_admin_mock" || devMode?.startsWith("view_as_")) {
        return this.getMockAchievements(userId);
      }

      // Default fallback - try real data first
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

      const stickers = stickersResult.data || [];
      const achievements = achievementsResult.data || [];

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

      const helmetStickers: HelmetSticker[] = stickers
        .filter(isValidSticker)
        .map((sticker) => ({
          id: sticker.id as string,
          name: (sticker.reason as string) || "Sticker",
          icon: this.getStickerIcon(sticker.sticker_type as string),
          awardedBy: (sticker.awarded_by as string) || "",
          awardedByName: "Coach", // Simplified for now
          date: (sticker.awarded_at as string) || new Date().toISOString(),
          teamId: (sticker.team_id as string) || "",
          teamName: "Team", // Simplified for now
        }));

      const boxcallMedals: BoxCallMedal[] = achievements
        .filter(isValidAchievement)
        .map((achievement) => ({
          id: achievement.id as string,
          name: (achievement.title as string) || "Achievement",
          icon: (achievement.icon_name as string) || "award",
          description: (achievement.description as string) || "",
          earned: true,
          earnedDate:
            (achievement.earned_at as string) || new Date().toISOString(),
        }));

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
        return "⭐";
      case "flame":
        return "[Fire/Hot streak]";
      case "lightning":
        return "[Lightning/Power]";
      case "crown":
        return "[Crown/Leadership]";
      case "diamond":
        return "[Diamond/Premium]";
      default:
        return "award";
    }
  }

  /**
   * Get helmet stickers awarded to user
   * TODO: Implement real database query
   */
  static async getHelmetStickers(userId: string): Promise<HelmetSticker[]> {
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

      // For now, return mock data
      return this.getMockHelmetStickers(userId);
    } catch (error) {
      console.error("Error fetching helmet stickers:", error);
      return [];
    }
  }

  /**
   * Get BoxCall platform medals for user
   */
  static async getBoxCallMedals(userId: string): Promise<BoxCallMedal[]> {
    try {
      // TODO: Implement medal calculation based on user activity
      return this.calculateBoxCallMedals(userId);
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
   * Mock data for development
   */
  private static getMockAchievements(userId: string): AchievementData {
    const helmetStickers = this.getMockHelmetStickers(userId);
    const boxcallMedals = this.getMockBoxCallMedals();
    const weeklyStreak = Math.floor(Math.random() * 14) + 1;

    const achievements: AchievementData = {
      helmetStickers,
      boxcallMedals,
      weeklyStreak,
      totalPoints: 0,
      recentAchievements: [],
    };

    achievements.totalPoints = this.calculateTotalPoints(achievements);
    achievements.recentAchievements = [
      ...helmetStickers.slice(0, 2),
      ...boxcallMedals.filter((m) => m.earned).slice(0, 1),
    ];

    return achievements;
  }

  private static getMockHelmetStickers(userId: string): HelmetSticker[] {
    // Create different stickers based on user ID for variety
    const stickerSets = [
      [
        {
          name: "First Touchdown",
          icon: "target",
          awardedBy: "coach-1",
          awardedByName: "Coach Johnson",
        },
        {
          name: "Perfect Practice",
          icon: "⭐",
          awardedBy: "coach-2",
          awardedByName: "Coach Williams",
        },
        {
          name: "Team Leader",
          icon: "crown",
          awardedBy: "coach-1",
          awardedByName: "Coach Johnson",
        },
      ],
      [
        {
          name: "Defensive Stop",
          icon: "shield",
          awardedBy: "coach-3",
          awardedByName: "Coach Davis",
        },
        {
          name: "Hustle Award",
          icon: "activity",
          awardedBy: "coach-1",
          awardedByName: "Coach Johnson",
        },
      ],
      [
        {
          name: "Game Winner",
          icon: "award",
          awardedBy: "coach-2",
          awardedByName: "Coach Williams",
        },
        {
          name: "Sportsmanship",
          icon: "🤝",
          awardedBy: "coach-1",
          awardedByName: "Coach Johnson",
        },
        {
          name: "Study Hall",
          icon: "book",
          awardedBy: "coach-3",
          awardedByName: "Coach Davis",
        },
        {
          name: "Community Service",
          icon: "star",
          awardedBy: "coach-1",
          awardedByName: "Coach Johnson",
        },
      ],
    ];

    const userIndex = userId.length % stickerSets.length;
    const stickers = stickerSets[userIndex];

    return stickers.map((sticker, index) => ({
      id: `sticker-${index + 1}`,
      ...sticker,
      date: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      teamId: "team-1",
      teamName: "BoxCall Dev Team",
    }));
  }

  private static getMockBoxCallMedals(): BoxCallMedal[] {
    return [
      {
        id: "profile-complete",
        name: "Profile Complete",
        icon: "check",
        description: "Completed profile setup with photo and info",
        earned: true,
        earnedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      {
        id: "team-player",
        name: "Team Player",
        icon: "🤝",
        description: "Joined your first team",
        earned: true,
        earnedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      {
        id: "week-warrior",
        name: "Week Warrior",
        icon: "zap",
        description: "Active for 7 consecutive days",
        earned: false,
        progress: Math.floor(Math.random() * 7),
        maxProgress: 7,
      },
      {
        id: "social-butterfly",
        name: "Social Butterfly",
        icon: "message",
        description: "Send 10 team messages",
        earned: Math.random() > 0.5,
        progress: Math.floor(Math.random() * 10),
        maxProgress: 10,
      },
      {
        id: "calendar-keeper",
        name: "Calendar Keeper",
        icon: "calendar",
        description: "RSVP to 5 team events",
        earned: false,
        progress: Math.floor(Math.random() * 5),
        maxProgress: 5,
      },
    ];
  }

  private static async calculateBoxCallMedals(
    userId: string
  ): Promise<BoxCallMedal[]> {
    const medals = this.getMockBoxCallMedals();

    // TODO: Calculate real progress based on user data
    // - Profile completion: Check if user has filled out profile
    // - Team membership: Check team_members table
    console.log("Calculating BoxCall medals for user:", userId);
    // - Activity streak: Check login history
    // - Social activity: Check message/post counts
    // - Calendar activity: Check RSVP history

    return medals;
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
              icon: "⭐",
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
              icon: "[Trophy/Achievement]",
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
              icon: "[Gold Medal]",
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
              icon: "[Shield/Defense]",
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
              icon: "[Medal]",
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
              icon: "[Football]",
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
              icon: "⭐",
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
              icon: "[Trophy/Achievement]",
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
              icon: "[Crown/Leadership]",
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
              icon: "[Target]",
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
