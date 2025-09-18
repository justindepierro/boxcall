/**
 * Practice Script Service - Handles integration between playbooks and practice planning
 *
 * Part of the 3-Part Workflow System:
 * Playbook → Practice Scripts → Game Plans
 */

import type { Play } from "../types/play";

export interface PracticeScript {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  plays: PracticeScriptPlay[];
  duration: number; // estimated duration in minutes
  tags: string[];
}

export interface PracticeScriptPlay {
  id: string;
  playId: string;
  play: Play;
  order: number;
  notes?: string;
  repetitions: number;
  estimatedTime: number; // in minutes
  addedAt: Date;
}

export interface CreatePracticeScriptData {
  name: string;
  description?: string;
  teamId: string;
  isTemplate?: boolean;
  tags?: string[];
}

export interface AddPlayToPracticeScriptData {
  scriptId: string;
  playId: string;
  notes?: string;
  repetitions?: number;
  estimatedTime?: number;
}

export class PracticeScriptService {
  // Mock data for development - replace with actual API calls
  private static scripts: PracticeScript[] = [];

  /**
   * Create a new practice script
   */
  static async createPracticeScript(
    data: CreatePracticeScriptData
  ): Promise<PracticeScript> {
    const script: PracticeScript = {
      id: `script-${Date.now()}`,
      name: data.name,
      description: data.description,
      teamId: data.teamId,
      createdBy: "current-user", // Replace with actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemplate: data.isTemplate || false,
      plays: [],
      duration: 0,
      tags: data.tags || [],
    };

    this.scripts.push(script);
    return script;
  }

  /**
   * Add a play to an existing practice script
   */
  static async addPlayToScript(
    data: AddPlayToPracticeScriptData,
    play: Play
  ): Promise<PracticeScript> {
    const scriptIndex = this.scripts.findIndex((s) => s.id === data.scriptId);

    if (scriptIndex === -1) {
      throw new Error("Practice script not found");
    }

    const script = this.scripts[scriptIndex];
    const scriptPlay: PracticeScriptPlay = {
      id: `script-play-${Date.now()}`,
      playId: data.playId,
      play,
      order: script.plays.length + 1,
      notes: data.notes,
      repetitions: data.repetitions || 5,
      estimatedTime: data.estimatedTime || 3, // Default 3 minutes per play
      addedAt: new Date(),
    };

    script.plays.push(scriptPlay);
    script.duration += scriptPlay.estimatedTime;
    script.updatedAt = new Date();

    this.scripts[scriptIndex] = script;
    return script;
  }

  /**
   * Get all practice scripts for a team
   */
  static async getPracticeScripts(teamId: string): Promise<PracticeScript[]> {
    return this.scripts.filter((script) => script.teamId === teamId);
  }

  /**
   * Get a specific practice script by ID
   */
  static async getPracticeScript(
    scriptId: string
  ): Promise<PracticeScript | null> {
    return this.scripts.find((script) => script.id === scriptId) || null;
  }

  /**
   * Quick script creation for workflow integration
   * Creates a script and immediately adds a play to it
   */
  static async createQuickScript(
    play: Play,
    teamId: string
  ): Promise<PracticeScript> {
    const script = await this.createPracticeScript({
      name: `Script with ${play.play_name}`,
      description: `Practice script featuring ${play.play_name} and related plays`,
      teamId,
      tags: [play.formation || "", play.p_type || ""].filter(Boolean),
    });

    await this.addPlayToScript(
      {
        scriptId: script.id,
        playId: play.id,
        notes: `Added from playbook workflow`,
        repetitions: 5,
        estimatedTime: 3,
      },
      play
    );

    return script;
  }

  /**
   * Get or create a "Quick Adds" script for fast workflow
   */
  static async getOrCreateQuickAddsScript(
    teamId: string
  ): Promise<PracticeScript> {
    const existingScript = this.scripts.find(
      (script) => script.teamId === teamId && script.name === "Quick Adds"
    );

    if (existingScript) {
      return existingScript;
    }

    return this.createPracticeScript({
      name: "Quick Adds",
      description:
        "Plays added quickly from the playbook for practice planning",
      teamId,
      tags: ["quick-add", "workflow"],
    });
  }
}
