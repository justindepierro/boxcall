/**
 * Simple Diagram Service
 * Starting fresh with basic formation saving functionality
 */

import { supabase } from "../lib/supabase";
import type { Play } from "../types/play";
import type { FormationPlayerPosition } from "../types/formation";

export interface SaveDiagramResult {
  success: boolean;
  play?: any;
  error?: string;
}

/**
 * Save formation diagram data to a play
 */
export async function saveDiagram(
  play: Play,
  teamId: string,
  players: FormationPlayerPosition[]
): Promise<SaveDiagramResult> {
  try {
    const diagramData = {
      version: 1,
      players,
      lastModified: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('plays')
      .update({
        diagram_data: diagramData as any,
        updated_at: new Date().toISOString()
      })
      .eq('id', play.id)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      play: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
