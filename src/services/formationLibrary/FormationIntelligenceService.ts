/**
 * Formation Intelligence Service
 *
 * Analyzes plays to derive formation metadata using majority-vote algorithm.
 * Auto-detects opposite formations via pattern matching.
 * Clean, focused, 250 lines max per design pattern.
 */

import { supabase } from "../../lib/supabase";
import type {
  IntelligenceAnalysis,
  FieldAnalysis,
  ConfidenceLevel,
  OppositeDetection,
} from "../../types/library";

interface PlayData {
  id: string;
  formation: string;
  formation_id: string | null;
  f_type: string | null;
  r_str: string | null;
  p_str: string | null;
  personnel: string | null;
}

export class FormationIntelligenceService {
  /**
   * Analyze all formations in a playbook from existing plays
   */
  static async analyzePlaybookFormations(
    playbookId: string
  ): Promise<Map<string, IntelligenceAnalysis>> {
    // Fetch all non-archived plays
    console.log("🔍 [Intelligence] Playbook ID:", playbookId);
    console.log("🔍 [Intelligence] Querying plays table...");
    
    // Debug: Find all playbooks with plays
    const { data: allPlaybooks, error: playbooksError } = await supabase
      .from("plays")
      .select("playbook_id")
      .eq("is_archived", false);
    
    if (allPlaybooks) {
      const playbookCounts = allPlaybooks.reduce((acc: Record<string, number>, play: any) => {
        acc[play.playbook_id] = (acc[play.playbook_id] || 0) + 1;
        return acc;
      }, {});
      console.log("🔍 [Intelligence] Playbooks with plays:", playbookCounts);
    }
    
    const { data: plays, error } = await supabase
      .from("plays")
      .select("id, formation, formation_id, f_type, r_str, p_str, personnel")
      .eq("playbook_id", playbookId)
      .eq("is_archived", false);

    console.log("🔍 [Intelligence] Fetched plays count:", plays?.length || 0);
    console.log("🔍 [Intelligence] Sample play:", plays?.[0]);
    console.log("🔍 [Intelligence] Query error:", error);

    if (error) {
      console.error(
        "[FormationIntelligenceService] Error fetching plays:",
        error
      );
      throw new Error(`Failed to fetch plays: ${error.message}`);
    }

    // Check if playbook has any plays at all (without is_archived filter)
    if (plays?.length === 0) {
      console.log("🔍 [Intelligence] No plays found. Checking if playbook exists and has plays...");
      const { data: allPlays, error: allPlaysError } = await supabase
        .from("plays")
        .select("id, is_archived")
        .eq("playbook_id", playbookId);
      
      console.log("🔍 [Intelligence] Total plays in playbook (including archived):", allPlays?.length || 0);
      console.log("🔍 [Intelligence] All plays error:", allPlaysError);
    }

    // Group plays by formation name
    const formationGroups = new Map<string, PlayData[]>();
    for (const play of plays || []) {
      if (!play.formation) {
        console.log("⚠️ [Intelligence] Play has no formation:", play);
        continue;
      }

      const formationName = play.formation.trim().toLowerCase();
      if (!formationGroups.has(formationName)) {
        formationGroups.set(formationName, []);
      }
      formationGroups.get(formationName)!.push(play as PlayData);
    }

    console.log("📊 [Intelligence] Formation groups count:", formationGroups.size);
    console.log("📊 [Intelligence] Formation names:", Array.from(formationGroups.keys()));

    // Analyze each formation
    const results = new Map<string, IntelligenceAnalysis>();
    for (const [formationName, formationPlays] of formationGroups.entries()) {
      const analysis = this.analyzeFormationPlays(formationPlays);
      results.set(formationName, analysis);
    }

    console.log("✅ [Intelligence] Analysis complete, results:", results.size);
    return results;
  }

  /**
   * Analyze plays for a single formation
   */
  static analyzeFormationPlays(plays: PlayData[]): IntelligenceAnalysis {
    const total = plays.length;
    const analyzed_at = new Date().toISOString();

    // Analyze f_type (formation type)
    const formation_type = this.analyzeField(plays, (p) => p.f_type, total);

    // Analyze r_str (run strength)
    const run_strength = this.analyzeField(plays, (p) => p.r_str, total);

    // Analyze p_str (pass strength)
    const pass_strength = this.analyzeField(plays, (p) => p.p_str, total);

    // Analyze personnel
    const personnel = this.analyzeField(plays, (p) => p.personnel, total);

    // Calculate overall confidence
    const confidence_score = this.calculateOverallConfidence([
      formation_type,
      run_strength,
      pass_strength,
      personnel,
    ]);

    // Detect inconsistencies
    const warnings = this.detectInconsistencies({
      formation_type,
      run_strength,
      pass_strength,
      personnel,
    });

    return {
      total_plays: total,
      analyzed_at,
      formation_type,
      run_strength,
      pass_strength,
      personnel,
      confidence_score,
      warnings,
    };
  }

  /**
   * Analyze a single field using majority vote
   */
  private static analyzeField<T>(
    plays: PlayData[],
    extractor: (play: PlayData) => string | null,
    total: number
  ): FieldAnalysis<string> | undefined {
    const valueCounts = new Map<string, number>();

    // Count occurrences
    for (const play of plays) {
      const value = extractor(play);
      if (value) {
        const normalized = value.trim().toLowerCase();
        valueCounts.set(normalized, (valueCounts.get(normalized) || 0) + 1);
      }
    }

    if (valueCounts.size === 0) {
      return undefined;
    }

    // Find most common value
    let maxCount = 0;
    let mostCommon = "";
    for (const [value, count] of valueCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = value;
      }
    }

    const percentage = Math.round((maxCount / total) * 100);
    const confidence = this.getConfidenceLevel(percentage);

    return {
      value: mostCommon,
      count: maxCount,
      percentage,
      confidence,
    };
  }

  /**
   * Calculate overall confidence from individual field analyses
   */
  private static calculateOverallConfidence(
    analyses: Array<FieldAnalysis<string> | undefined>
  ): number {
    const validAnalyses = analyses.filter(
      (a) => a !== undefined
    ) as FieldAnalysis<string>[];
    if (validAnalyses.length === 0) return 0;

    const avgPercentage =
      validAnalyses.reduce((sum, a) => sum + a.percentage, 0) /
      validAnalyses.length;

    return Math.round(avgPercentage);
  }

  /**
   * Get confidence level from percentage
   */
  private static getConfidenceLevel(percentage: number): ConfidenceLevel {
    if (percentage >= 90) return "high";
    if (percentage >= 70) return "medium";
    if (percentage >= 50) return "low";
    return "unknown";
  }

  /**
   * Detect inconsistencies in formation data
   */
  private static detectInconsistencies(data: {
    formation_type?: FieldAnalysis<string>;
    run_strength?: FieldAnalysis<string>;
    pass_strength?: FieldAnalysis<string>;
    personnel?: FieldAnalysis<string>;
  }): string[] {
    const warnings: string[] = [];

    if (data.formation_type && data.formation_type.percentage < 70) {
      warnings.push(
        `Formation type inconsistent: only ${data.formation_type.percentage}% agreement`
      );
    }

    if (data.run_strength && data.run_strength.percentage < 70) {
      warnings.push(
        `Run strength inconsistent: only ${data.run_strength.percentage}% agreement`
      );
    }

    if (data.pass_strength && data.pass_strength.percentage < 70) {
      warnings.push(
        `Pass strength inconsistent: only ${data.pass_strength.percentage}% agreement`
      );
    }

    if (data.personnel && data.personnel.percentage < 80) {
      warnings.push(
        `Personnel inconsistent: only ${data.personnel.percentage}% agreement`
      );
    }

    return warnings;
  }

  /**
   * Detect opposite formations using pattern matching
   */
  static async detectOppositeFormations(
    playbookId: string
  ): Promise<OppositeDetection[]> {
    const { data, error } = await supabase.rpc("detect_opposite_formations");

    if (error) {
      console.error(
        "[FormationIntelligenceService] Error detecting opposites:",
        error
      );
      throw new Error(`Failed to detect opposites: ${error.message}`);
    }

    // Filter for this playbook
    const { data: formations } = await supabase
      .from("formations")
      .select("id, playbook_id, name")
      .eq("playbook_id", playbookId);

    const formationIds = new Set((formations || []).map((f) => f.id));

    return (data || [])
      .filter((d: any) => formationIds.has(d.formation_id))
      .map((d: any) => ({
        formation_id: d.formation_id,
        formation_name: d.formation_name,
        opposite_id: d.opposite_id,
        opposite_name: d.opposite_name,
        match_confidence: d.match_confidence,
        match_reason: this.getMatchReason(d.formation_name, d.opposite_name),
      }));
  }

  /**
   * Get human-readable match reason
   */
  private static getMatchReason(name1: string, name2: string): string {
    const n1 = name1.toLowerCase();
    const n2 = name2.toLowerCase();

    if (n1.includes("rip") && n2.includes("liz")) return "Rip↔Liz pattern";
    if (n1.includes("liz") && n2.includes("rip")) return "Liz↔Rip pattern";
    if (n1.includes("larry") && n2.includes("ringo"))
      return "Larry↔Ringo pattern";
    if (n1.includes("ringo") && n2.includes("larry"))
      return "Ringo↔Larry pattern";
    if (n1.includes("left") && n2.includes("right"))
      return "Left↔Right keywords";
    if (n1.includes("right") && n2.includes("left"))
      return "Right↔Left keywords";
    return "Name pattern match";
  }

  /**
   * Populate formation library from play analysis
   */
  static async populateLibraryFromPlays(playbookId: string): Promise<number> {
    const analyses = await this.analyzePlaybookFormations(playbookId);
    let updatedCount = 0;

    for (const [formationName, analysis] of analyses.entries()) {
      // Find matching formation
      const { data: formations } = await supabase
        .from("formations")
        .select("id")
        .eq("playbook_id", playbookId)
        .ilike("name", formationName)
        .limit(1);

      if (!formations || formations.length === 0) continue;

      const formationId = formations[0].id;

      // Update with analyzed metadata
      const { error } = await supabase
        .from("formations")
        .update({
          formation_type: analysis.formation_type?.value || null,
          run_strength: analysis.run_strength?.value || null,
          pass_strength: analysis.pass_strength?.value || null,
          confidence_score: analysis.confidence_score,
          last_analyzed_at: analysis.analyzed_at,
          analysis_play_count: analysis.total_plays,
        })
        .eq("id", formationId);

      if (!error) {
        updatedCount++;
      }
    }

    return updatedCount;
  }
}
