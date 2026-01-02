/**
 * Play AI-Powered Suggestions
 * Smart formation, play name, and personnel suggestions based on patterns
 */

import { table } from "../../data/supabase/db";
import { error as logError } from "../../utils/logger";
import { PlayHelperService } from "./helperService";

/**
 * Service for AI-powered play suggestions
 */
export class PlaySuggestionService {
  /**
   * AI-POWERED SUGGESTIONS
   * Get smart formation suggestions based on play patterns
   */
  static async getAISuggestedFormations(
    currentFormation?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    try {
      let query = table("plays")
        .select("formation, play_name, p_type")
        .not("formation", "is", null)
        .neq("formation", "");

      // Filter by playbook if specified
      if (playbookId) {
        query = query.eq("playbook_id", playbookId);
      }

      const { data, error } = await query.limit(1000);

      if (error || !data) {
        logError("❌ Error getting formation data:", error);
        return [];
      }

      // Analyze formation patterns
      const formationStats = new Map<
        string,
        { count: number; playTypes: Set<string> }
      >();

      (data as any[]).forEach((play: any) => {
        const formation = play.formation;
        if (!formationStats.has(formation)) {
          formationStats.set(formation, { count: 0, playTypes: new Set() });
        }
        const stats = formationStats.get(formation)!;
        stats.count++;
        if (play.p_type) stats.playTypes.add(play.p_type);
      });

      // Sort formations by usage frequency and versatility
      const sortedFormations = Array.from(formationStats.entries())
        .sort((a, b) => {
          const scoreA = a[1].count + a[1].playTypes.size * 2; // Bonus for versatility
          const scoreB = b[1].count + b[1].playTypes.size * 2;
          return scoreB - scoreA;
        })
        .map(([formation]) => formation);

      // If current formation provided, prioritize similar formations
      if (currentFormation) {
        const baseCurrent =
          PlayHelperService.extractBaseFormation(currentFormation);
        const similarFormations = sortedFormations.filter(
          (f) =>
            PlayHelperService.extractBaseFormation(f) === baseCurrent &&
            f !== currentFormation
        );
        const otherFormations = sortedFormations.filter(
          (f) => PlayHelperService.extractBaseFormation(f) !== baseCurrent
        );
        return [...similarFormations, ...otherFormations].slice(0, limit);
      }

      return sortedFormations.slice(0, limit);
    } catch (error) {
      logError(
        "❌ PlaySuggestionService.getAISuggestedFormations failed:",
        error
      );
      return [];
    }
  }

  /**
   * Get AI-suggested play names based on formation and context
   */
  static async getAISuggestedPlayNames(
    formation?: string,
    playType?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    try {
      let query = table("plays")
        .select("play_name, formation, p_type")
        .not("play_name", "is", null)
        .neq("play_name", "");

      // Filter by playbook if specified
      if (playbookId) {
        query = query.eq("playbook_id", playbookId);
      }

      // Filter by formation if specified
      if (formation) {
        const baseFormation = PlayHelperService.extractBaseFormation(formation);
        query = query.ilike("formation", `%${baseFormation}%`);
      }

      // Filter by play type if specified
      if (playType) {
        query = query.eq("p_type", playType);
      }

      const { data, error } = await query.limit(500);

      if (error || !data) {
        logError("❌ Error getting play name data:", error);
        return [];
      }

      // Count frequency of each play name
      const nameCounts = new Map<string, number>();
      (data as any[]).forEach((play: any) => {
        const count = nameCounts.get(play.play_name) || 0;
        nameCounts.set(play.play_name, count + 1);
      });

      // Sort by frequency
      return Array.from(nameCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name)
        .slice(0, limit);
    } catch (error) {
      logError(
        "❌ PlaySuggestionService.getAISuggestedPlayNames failed:",
        error
      );
      return [];
    }
  }

  /**
   * Get smart personnel suggestions based on formation patterns
   */
  static async getAISuggestedPersonnel(
    formation?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    try {
      let query = table("plays")
        .select("personnel, formation")
        .not("personnel", "is", null)
        .neq("personnel", "");

      // Filter by playbook if specified
      if (playbookId) {
        query = query.eq("playbook_id", playbookId);
      }

      // Filter by formation if specified
      if (formation) {
        const baseFormation = PlayHelperService.extractBaseFormation(formation);
        query = query.ilike("formation", `%${baseFormation}%`);
      }

      const { data, error } = await query.limit(500);

      if (error || !data) {
        logError("❌ Error getting personnel data:", error);
        return [];
      }

      // Count frequency of each personnel grouping
      const personnelCounts = new Map<string, number>();
      (data as any[]).forEach((play: any) => {
        const count = personnelCounts.get(play.personnel) || 0;
        personnelCounts.set(play.personnel, count + 1);
      });

      // Sort by frequency
      return Array.from(personnelCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([personnel]) => personnel)
        .slice(0, limit);
    } catch (error) {
      logError(
        "❌ PlaySuggestionService.getAISuggestedPersonnel failed:",
        error
      );
      return [];
    }
  }

  /**
   * Generate contextual play name suggestions based on formation and play type
   */
  static generatePlayNameSuggestions(
    formation?: string,
    playType?: string,
    existingNames: string[] = []
  ): string[] {
    const suggestions: string[] = [];

    if (!formation) return suggestions;

    const baseFormation = PlayHelperService.extractBaseFormation(formation);
    const direction =
      PlayHelperService.extractDirectionFromFormation(formation);

    // Common play patterns by formation type
    const playPatterns: Record<string, string[]> = {
      shotgun: ["Shotgun", "Shotgun Spread", "Shotgun Trips", "Shotgun Empty"],
      pistol: ["Pistol", "Pistol Power", "Pistol Read", "Pistol Counter"],
      "under center": ["Power", "Counter", "Trap", "Draw", "Keeper"],
      trips: [
        "Trips",
        "Trips Wheel",
        "Trips Corner",
        "Trips Smash",
        "Trips Out",
      ],
      bunch: ["Bunch", "Bunch Slants", "Bunch Crossers", "Bunch Outs"],
      empty: ["Empty", "Empty Slants", "Empty Wheels", "Empty Corners"],
      ace: ["Ace", "Ace Slants", "Ace Outs", "Ace Crossers"],
      doubles: [
        "Doubles",
        "Doubles Slants",
        "Doubles Outs",
        "Doubles Crossers",
      ],
      trio: ["Trio", "Trio Slants", "Trio Outs", "Trio Crossers"],
    };

    // Find matching formation patterns
    const matchingPatterns = Object.entries(playPatterns)
      .filter(([key]) => baseFormation.toLowerCase().includes(key))
      .flatMap(([, patterns]) => patterns);

    // Add direction-specific suggestions
    if (direction) {
      matchingPatterns.forEach((pattern) => {
        if (!pattern.includes(direction)) {
          suggestions.push(`${pattern} ${direction}`);
        }
      });
    }

    // Add base patterns
    suggestions.push(...matchingPatterns);

    // Add play type specific suggestions
    if (playType) {
      const typePrefixes: Record<string, string[]> = {
        run: ["Power", "Counter", "Trap", "Draw", "Keeper", "Read"],
        pass: ["Slants", "Outs", "Crossers", "Corners", "Wheels", "Posts"],
        screen: ["Screen", "Bubble Screen", "Slip Screen"],
        "play action": ["Play Action", "PA Boot", "PA Rollout"],
      };

      const prefixes = typePrefixes[playType.toLowerCase()] || [];
      prefixes.forEach((prefix) => {
        suggestions.push(`${baseFormation} ${prefix}`);
        if (direction) {
          suggestions.push(`${baseFormation} ${prefix} ${direction}`);
        }
      });
    }

    // Filter out existing names and limit results
    return suggestions
      .filter((name) => !existingNames.includes(name))
      .slice(0, 8);
  }
}
