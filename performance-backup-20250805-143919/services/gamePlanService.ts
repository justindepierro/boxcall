/**
 * Game Plan Service - Handles game planning with situational organization
 *
 * Inspired by Brian Billick's "Developing an Offensive Game Plan"
 * Organizes plays by down/distance, field position, and game situations
 */

import type { Play } from "../types/play";

export interface GamePlanSituation {
  id: string;
  name: string;
  description: string;
  plays: GamePlanPlay[];
  category:
    | "base_run"
    | "base_pass"
    | "second_long"
    | "third_down"
    | "red_zone"
    | "goal_line"
    | "two_minute"
    | "short_yardage"
    | "special_situations";
  priority: number; // 1-10, higher = more important
}

export interface GamePlanPlay {
  id: string;
  playId: string;
  play: Play;
  situations: string[]; // Situation IDs this play can be used in
  priority: number; // 1-5, 1 = primary call, 5 = backup
  notes?: string;
  successRate?: number;
  timesUsed: number;
  addedAt: Date;
}

export interface GamePlan {
  id: string;
  name: string;
  weekNumber: number;
  opponent: string;
  date: Date;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  situations: GamePlanSituation[];
  totalPlays: number;
  notes?: string;
  tags: string[];
}

export interface CreateGamePlanData {
  name: string;
  weekNumber: number;
  opponent: string;
  date: Date;
  teamId: string;
  isTemplate?: boolean;
  copyFromGamePlanId?: string;
  tags?: string[];
}

export interface AddPlayToGamePlanData {
  gamePlanId: string;
  situationId: string;
  playId: string;
  priority?: number;
  notes?: string;
}

export class GamePlanService {
  // Mock data for development - replace with actual API calls
  private static gamePlans: GamePlan[] = [];

  /**
   * Default game plan situations based on Brian Billick's methodology
   */
  private static getDefaultSituations(): GamePlanSituation[] {
    return [
      {
        id: "base_run",
        name: "Base Run",
        description: "1st & 10, 2nd & short running plays",
        plays: [],
        category: "base_run",
        priority: 10,
      },
      {
        id: "base_pass",
        name: "Base Pass",
        description: "1st & 10, 2nd & medium passing plays",
        plays: [],
        category: "base_pass",
        priority: 10,
      },
      {
        id: "second_long",
        name: "2nd Long",
        description: "2nd & 7+, need chunk plays",
        plays: [],
        category: "second_long",
        priority: 8,
      },
      {
        id: "third_11_plus",
        name: "3rd 11+",
        description: "3rd & 11+, need big plays",
        plays: [],
        category: "third_down",
        priority: 9,
      },
      {
        id: "third_7_10",
        name: "3rd 7-10",
        description: "3rd & 7-10, intermediate routes",
        plays: [],
        category: "third_down",
        priority: 9,
      },
      {
        id: "third_4_6",
        name: "3rd 4-6",
        description: "3rd & 4-6, possession routes",
        plays: [],
        category: "third_down",
        priority: 9,
      },
      {
        id: "third_2_3",
        name: "3rd 2-3",
        description: "3rd & 2-3, short routes & runs",
        plays: [],
        category: "third_down",
        priority: 9,
      },
      {
        id: "red_zone",
        name: "Pred Red Zone",
        description: "20-yard line to 10-yard line",
        plays: [],
        category: "red_zone",
        priority: 8,
      },
      {
        id: "red_zone_run",
        name: "Red Zone Run",
        description: "10-yard line to 5-yard line runs",
        plays: [],
        category: "red_zone",
        priority: 8,
      },
      {
        id: "goal_line",
        name: "Goal",
        description: "5-yard line and in",
        plays: [],
        category: "goal_line",
        priority: 7,
      },
      {
        id: "plus_10",
        name: "+10",
        description: "Plus territory, field position plays",
        plays: [],
        category: "special_situations",
        priority: 6,
      },
      {
        id: "two_minute",
        name: "2-Minute",
        description: "End of half/game situations",
        plays: [],
        category: "two_minute",
        priority: 7,
      },
    ];
  }

  /**
   * Create a new game plan
   */
  static async createGamePlan(data: CreateGamePlanData): Promise<GamePlan> {
    let situations = this.getDefaultSituations();

    // If copying from existing game plan, copy the plays
    if (data.copyFromGamePlanId) {
      const sourceGamePlan = this.gamePlans.find(
        (gp) => gp.id === data.copyFromGamePlanId
      );
      if (sourceGamePlan) {
        situations = sourceGamePlan.situations.map((situation) => ({
          ...situation,
          id: `${situation.id}_${Date.now()}`,
          plays: situation.plays.map((play) => ({
            ...play,
            id: `${play.id}_${Date.now()}`,
            addedAt: new Date(),
          })),
        }));
      }
    }

    const gamePlan: GamePlan = {
      id: `gameplan-${Date.now()}`,
      name: data.name,
      weekNumber: data.weekNumber,
      opponent: data.opponent,
      date: data.date,
      teamId: data.teamId,
      createdBy: "current-user", // Replace with actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemplate: data.isTemplate || false,
      situations,
      totalPlays: situations.reduce((total, s) => total + s.plays.length, 0),
      tags: data.tags || [],
    };

    this.gamePlans.push(gamePlan);
    return gamePlan;
  }

  /**
   * Add a play to a specific situation in the game plan
   */
  static async addPlayToGamePlan(
    data: AddPlayToGamePlanData,
    play: Play
  ): Promise<GamePlan> {
    const gamePlanIndex = this.gamePlans.findIndex(
      (gp) => gp.id === data.gamePlanId
    );

    if (gamePlanIndex === -1) {
      throw new Error("Game plan not found");
    }

    const gamePlan = this.gamePlans[gamePlanIndex];
    const situation = gamePlan.situations.find(
      (s) => s.id === data.situationId
    );

    if (!situation) {
      throw new Error("Situation not found");
    }

    const gamePlanPlay: GamePlanPlay = {
      id: `gameplan-play-${Date.now()}`,
      playId: data.playId,
      play,
      situations: [data.situationId],
      priority: data.priority || 3,
      notes: data.notes,
      timesUsed: 0,
      addedAt: new Date(),
    };

    situation.plays.push(gamePlanPlay);
    gamePlan.totalPlays += 1;
    gamePlan.updatedAt = new Date();

    this.gamePlans[gamePlanIndex] = gamePlan;
    return gamePlan;
  }

  /**
   * Get all game plans for a team
   */
  static async getGamePlans(teamId: string): Promise<GamePlan[]> {
    return this.gamePlans.filter((gp) => gp.teamId === teamId);
  }

  /**
   * Get a specific game plan by ID
   */
  static async getGamePlan(gamePlanId: string): Promise<GamePlan | null> {
    return this.gamePlans.find((gp) => gp.id === gamePlanId) || null;
  }

  /**
   * Generate a practice script based on game plan priorities
   */
  static async generatePracticeScriptFromGamePlan(gamePlanId: string): Promise<{
    name: string;
    description: string;
    plays: Array<{
      play: Play;
      situation: string;
      priority: number;
      repetitions: number;
      estimatedTime: number;
    }>;
  }> {
    const gamePlan = await this.getGamePlan(gamePlanId);
    if (!gamePlan) {
      throw new Error("Game plan not found");
    }

    // Create practice script with plays organized by priority
    const practiceData = {
      name: `${gamePlan.name} Practice Script`,
      description: `Auto-generated from ${gamePlan.name} game plan`,
      plays: [] as Array<{
        play: Play;
        situation: string;
        priority: number;
        repetitions: number;
        estimatedTime: number;
      }>,
    };

    // Add high-priority plays from each situation
    gamePlan.situations.forEach((situation) => {
      const priorityPlays = situation.plays
        .filter((play) => play.priority <= 2) // Primary and secondary calls
        .sort((a, b) => a.priority - b.priority);

      priorityPlays.forEach((play) => {
        practiceData.plays.push({
          play: play.play,
          situation: situation.name,
          priority: play.priority,
          repetitions: play.priority === 1 ? 8 : 5, // More reps for primary calls
          estimatedTime: 4,
        });
      });
    });

    return practiceData;
  }

  /**
   * Quick game plan creation for workflow integration
   */
  static async createQuickGamePlan(
    opponent: string,
    teamId: string
  ): Promise<GamePlan> {
    return this.createGamePlan({
      name: `Week vs ${opponent}`,
      weekNumber: Math.ceil(
        (Date.now() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)
      ),
      opponent,
      date: new Date(),
      teamId,
      tags: ["quick-add", "workflow"],
    });
  }
}
