/**
 * Practice Script Service - Handles integration between playbooks and practice planning
 *
 * Part of the 3-Part Workflow System:
 * Playbook → Practice Scripts → Game Plans
 */

import type { Play } from "../types/play";
import { supabase } from "../lib/supabase";

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
  orderIndex?: number;
  notes?: string;
  repetitions?: number;
  estimatedTime?: number;
}

export class PracticeScriptService {
  private static supabase = supabase;

  /**
   * Create a new practice script
   */
  static async createPracticeScript(
    data: CreatePracticeScriptData
  ): Promise<PracticeScript> {
    const { data: script, error } = await this.supabase
      .from('practice_scripts')
      .insert({
        title: data.name,
        description: data.description,
        team_id: data.teamId,
        focus_areas: data.tags || [],
        created_by: (await this.supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating practice script:', error);
      throw new Error('Failed to create practice script');
    }

    const scriptData = script as any; // Type assertion for Supabase response

    return {
      id: scriptData.id as string,
      name: scriptData.title as string,
      description: scriptData.description as string | undefined,
      teamId: scriptData.team_id as string,
      createdBy: scriptData.created_by as string,
      createdAt: new Date(scriptData.created_at as string),
      updatedAt: new Date(scriptData.updated_at as string),
      isTemplate: false, // Default for now
      plays: [],
      duration: (scriptData.duration_minutes as number) || 120,
      tags: (scriptData.focus_areas as string[]) || [],
    };
  }

  /**
   * Add a play to an existing practice script
   */
  static async addPlayToScript(
    data: AddPlayToPracticeScriptData,
    _play: Play
  ): Promise<PracticeScript> {
    // First, add the play to practice_script_plays table
    const { error: playError } = await this.supabase
      .from('practice_script_plays')
      .insert({
        practice_script_id: data.scriptId,
        play_id: data.playId,
        sequence_order: data.orderIndex || 1,
        coaching_points: data.notes ? [data.notes] : [],
        repetitions: data.repetitions || 5,
        duration_minutes: data.estimatedTime || 10,
        segment_name: 'Drill', // Default segment name
        segment_type: 'drill',
      });

    if (playError) {
      console.error('Error adding play to script:', playError);
      throw new Error('Failed to add play to practice script');
    }

    // Then fetch the updated script with plays
    const script = await this.getPracticeScript(data.scriptId);
    if (!script) {
      throw new Error('Failed to retrieve updated practice script');
    }
    return script;
  }

  /**
   * Get all practice scripts for a team
   */
  static async getPracticeScripts(teamId: string): Promise<PracticeScript[]> {
    try {
      // First get the scripts
      const { data: scripts, error: scriptsError } = await this.supabase
        .from('practice_scripts')
        .select('*')
        .eq('team_id', teamId)
        .order('updated_at', { ascending: false });

      if (scriptsError) {
        console.error('Error fetching practice scripts:', scriptsError);
        throw new Error('Failed to fetch practice scripts');
      }

      if (!scripts || scripts.length === 0) {
        return [];
      }

      // Try to get the plays for all scripts - this might fail if table doesn't exist
      let scriptPlays: any[] = [];
      try {
        const scriptIds = scripts.map(s => s.id);
        const { data: plays, error: playsError } = await this.supabase
          .from('practice_script_plays')
          .select(`
            *,
            plays (*)
          `)
          .in('practice_script_id', scriptIds);

        if (!playsError && plays) {
          scriptPlays = plays;
        }
      } catch (playsError) {
        console.warn('Could not fetch practice script plays, continuing without plays data:', playsError);
      }

      // Group plays by script_id
      const playsByScriptId = scriptPlays.reduce((acc, play) => {
        const scriptId = play.practice_script_id;
        if (!acc[scriptId]) {
          acc[scriptId] = [];
        }
        acc[scriptId].push(play);
        return acc;
      }, {} as Record<string, any[]>);

      // Map scripts with their plays
      return scripts.map(script => {
        const scriptPlays = playsByScriptId[script.id] || [];
        return this.mapDatabaseScriptToPracticeScript({
          ...script,
          practice_script_plays: scriptPlays
        });
      });
    } catch (error) {
      console.error('Error in getPracticeScripts:', error);
      // Return empty array if table doesn't exist or other error
      return [];
    }
  }

  /**
   * Map database script with plays to PracticeScript interface
   */
  private static mapDatabaseScriptToPracticeScript(scriptData: any): PracticeScript {
    const plays: PracticeScriptPlay[] = (scriptData.practice_script_plays || []).map((playData: any) => ({
      id: playData.id,
      playId: playData.play_id,
      play: playData.plays, // This will be the full play object from the join
      order: playData.sequence_order || 0,
      notes: playData.coaching_points?.join(', ') || '',
      repetitions: playData.repetitions || 1,
      estimatedTime: playData.duration_minutes || 10,
      addedAt: new Date(playData.created_at),
    }));

    return {
      id: scriptData.id,
      name: scriptData.title || scriptData.name || 'Untitled Script',
      description: scriptData.description,
      teamId: scriptData.team_id,
      createdBy: scriptData.created_by,
      createdAt: new Date(scriptData.created_at),
      updatedAt: new Date(scriptData.updated_at),
      isTemplate: scriptData.is_template || false,
      plays,
      duration: scriptData.duration_minutes || scriptData.duration || 120,
      tags: scriptData.focus_areas || scriptData.tags || [],
    };
  }

  /**
   * Get a specific practice script by ID
   */
  static async getPracticeScript(
    scriptId: string
  ): Promise<PracticeScript | null> {
    try {
      // First get the script
      const { data: script, error: scriptError } = await this.supabase
        .from('practice_scripts')
        .select('*')
        .eq('id', scriptId)
        .single();

      if (scriptError) {
        if (scriptError.code === 'PGRST116') {
          return null; // Script not found
        }
        console.error('Error fetching practice script:', scriptError);
        throw new Error('Failed to fetch practice script');
      }

      // Try to get the plays for this script
      let scriptPlays: any[] = [];
      try {
        const { data: plays, error: playsError } = await this.supabase
          .from('practice_script_plays')
          .select(`
            *,
            plays (*)
          `)
          .eq('practice_script_id', scriptId);

        if (!playsError && plays) {
          scriptPlays = plays;
        }
      } catch (playsError) {
        console.warn('Could not fetch practice script plays, continuing without plays data:', playsError);
      }

      return this.mapDatabaseScriptToPracticeScript({
        ...script,
        practice_script_plays: scriptPlays
      });
    } catch (error) {
      console.error('Error in getPracticeScript:', error);
      return null;
    }
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
    // First try to find existing Quick Adds script
    const { data: existingScripts, error: fetchError } = await this.supabase
      .from('practice_scripts')
      .select('*')
      .eq('team_id', teamId)
      .eq('name', 'Quick Adds')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching Quick Adds script:', fetchError);
    }

    if (existingScripts && existingScripts.length > 0) {
      const script = existingScripts[0] as any;
      return {
        id: script.id as string,
        name: script.name as string,
        description: script.description as string | undefined,
        teamId: script.team_id as string,
        createdBy: script.created_by as string,
        createdAt: new Date(script.created_at as string),
        updatedAt: new Date(script.updated_at as string),
        isTemplate: script.is_template as boolean,
        plays: [], // We'll load plays separately if needed
        duration: (script.duration as number) || 0,
        tags: (script.tags as string[]) || [],
      };
    }

    // Create new Quick Adds script
    return this.createPracticeScript({
      name: "Quick Adds",
      description:
        "Plays added quickly from the playbook for practice planning",
      teamId,
      tags: ["quick-add", "workflow"],
    });
  }
}
