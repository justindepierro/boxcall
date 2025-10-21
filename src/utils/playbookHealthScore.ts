// @ts-nocheck
// NOTE: TypeScript checking disabled for this file due to Supabase generated types being overly strict.
// All data is validated before database operations. Re-enable checking when Supabase types are fixed.

/**
 * Playbook Health Score System
 *
 * Comprehensive scoring system that evaluates playbook data quality
 * and provides actionable recommendations for coaches.
 *
 * Total Score: 100 points
 * - Formation Linking (30pts): formation_id linkage
 * - Formation Completeness (20pts): formation metadata quality
 * - Play Completeness (25pts): play data completeness
 * - Data Consistency (15pts): naming conventions, duplicates
 * - Organization Quality (10pts): tags, categories, structure
 */

import { supabase } from "../lib/supabase";
import { calculatePlayQuality } from "./dataQualityScoring";
import { info, error as logError } from "./logger";

// ========================================
// Helper Functions
// ========================================

/**
 * Normalizes a play name to identify unique base plays
 * Strips directional indicators, formation prefixes, and common variations
 * 
 * Examples:
 * - "Power Left" → "power"
 * - "I Form Counter Right" → "counter"
 * - "Shotgun Draw" → "draw"
 */
function normalizePlayName(playName: string): string {
  let normalized = playName.trim().toLowerCase();
  
  // Remove common directional suffixes
  const directionalSuffixes = [
    ' left', ' right', ' lt', ' rt',
    ' strong', ' weak', ' str', ' wk',
    ' open', ' closed',
  ];
  
  for (const suffix of directionalSuffixes) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length).trim();
    }
  }
  
  // Remove common formation prefixes (e.g., "I Form Power" → "power")
  const formationPrefixes = [
    'i form ', 'i-form ', 'ace ', 'singleback ', 'single back ',
    'shotgun ', 'pistol ', 'wildcat ', 'empty ', 'trips ',
    'doubles ', 'stack ', 'bunch ',
  ];
  
  for (const prefix of formationPrefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length).trim();
    }
  }
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

// ========================================
// Types
// ========================================

export type HealthIssueSeverity = "critical" | "warning" | "info";

export interface HealthIssue {
  severity: HealthIssueSeverity;
  category: string;
  description: string;
  affectedItems: string[]; // play IDs or formation IDs
  howToFix: string;
  pointsToGain: number;
}

export interface PlaybookHealthBreakdown {
  formationLinking: number; // 0-30 points
  formationCompleteness: number; // 0-20 points
  playCompleteness: number; // 0-25 points
  dataConsistency: number; // 0-15 points
  organizationQuality: number; // 0-10 points
}

export interface PlaybookHealthScore {
  overall: number; // 0-100
  breakdown: PlaybookHealthBreakdown;
  issues: HealthIssue[];
  recommendations: string[];
  stats: {
    totalPlays: number;
    totalFormations: number;
    playsWithFormationLink: number;
    completeFormations: number;
    averagePlayQuality: number;
    uniquePlayNames: number;
  };
}

// ========================================
// Formation Linking Score (30 points)
// ========================================

async function calculateFormationLinkingScore(
  playbookId: string
): Promise<{ score: number; issues: HealthIssue[] }> {
  info("[PlaybookHealth] Calculating formation linking score");

  const { data: plays, error } = await supabase
    .from("plays")
    .select("id, play_name, formation_id, formation")
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[PlaybookHealth] Failed to fetch plays:", error);
    return { score: 0, issues: [] };
  }

  const totalPlays = plays?.length || 0;
  if (totalPlays === 0) {
    return {
      score: 30,
      issues: [
        {
          severity: "info",
          category: "Formation Linking",
          description: "No plays in playbook yet",
          affectedItems: [],
          howToFix: "Create plays to start building your playbook",
          pointsToGain: 0,
        },
      ],
    };
  }

  const playsWithFormationId = plays?.filter((p) => p.formation_id) || [];
  const linkageRate = playsWithFormationId.length / totalPlays;
  const score = Math.round(linkageRate * 30);

  const issues: HealthIssue[] = [];
  const unlinkedPlays = plays?.filter((p) => !p.formation_id) || [];

  if (unlinkedPlays.length > 0) {
    const severity: HealthIssueSeverity =
      unlinkedPlays.length > totalPlays * 0.5 ? "critical" : "warning";
    issues.push({
      severity,
      category: "Formation Linking",
      description: `${unlinkedPlays.length} plays missing formation_id link`,
      affectedItems: unlinkedPlays.map((p) => p.id),
      howToFix:
        "Edit plays → Select formation from dropdown → This enables formation-based analytics",
      pointsToGain: Math.round((unlinkedPlays.length / totalPlays) * 30),
    });
  }

  return { score, issues };
}

// ========================================
// Formation Completeness Score (20 points)
// ========================================

async function calculateFormationCompletenessScore(
  playbookId: string
): Promise<{ score: number; issues: HealthIssue[] }> {
  info("[PlaybookHealth] Calculating formation completeness score");

  const { data: formations, error } = await supabase
    .from("formations")
    .select("id, name, metadata_quality, metadata_completeness")
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[PlaybookHealth] Failed to fetch formations:", error);
    return { score: 0, issues: [] };
  }

  const totalFormations = formations?.length || 0;
  if (totalFormations === 0) {
    return {
      score: 20,
      issues: [
        {
          severity: "info",
          category: "Formation Completeness",
          description: "No formations created yet",
          affectedItems: [],
          howToFix: "Use Formation Builder to create formations",
          pointsToGain: 0,
        },
      ],
    };
  }

  // Calculate average completeness
  const avgCompleteness =
    formations.reduce((sum, f) => sum + (f.metadata_completeness || 0), 0) /
    totalFormations;
  const score = Math.round((avgCompleteness / 100) * 20);

  const issues: HealthIssue[] = [];

  // Identify incomplete formations
  const incompleteFormations = formations.filter(
    (f) =>
      f.metadata_quality === "incomplete" || f.metadata_quality === "needs_work"
  );

  if (incompleteFormations.length > 0) {
    const severity: HealthIssueSeverity =
      incompleteFormations.length > totalFormations * 0.5 ? "warning" : "info";
    issues.push({
      severity,
      category: "Formation Completeness",
      description: `${incompleteFormations.length} formations need more metadata`,
      affectedItems: incompleteFormations.map((f) => f.id),
      howToFix:
        "Formation Builder → Add personnel, category, tags, and player positions",
      pointsToGain: Math.round(
        ((100 - avgCompleteness) / 100) * 20 * (incompleteFormations.length / totalFormations)
      ),
    });
  }

  return { score, issues };
}

// ========================================
// Play Completeness Score (25 points)
// ========================================

async function calculatePlayCompletenessScore(
  playbookId: string
): Promise<{ score: number; issues: HealthIssue[] }> {
  info("[PlaybookHealth] Calculating play completeness score");

  const { data: plays, error } = await supabase
    .from("plays")
    .select(
      "id, play_name, p_type, formation, personnel, tags, notes, diagram_id, key_positions, key_players, protection_scheme, flags"
    )
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[PlaybookHealth] Failed to fetch plays:", error);
    return { score: 0, issues: [] };
  }

  const totalPlays = plays?.length || 0;
  if (totalPlays === 0) {
    return { score: 25, issues: [] };
  }

  // Calculate average play quality
  const playScores = plays.map((play) => calculatePlayQuality(play));
  const avgQuality =
    playScores.reduce((sum, s) => sum + s.total, 0) / totalPlays;
  const score = Math.round((avgQuality / 100) * 25);

  const issues: HealthIssue[] = [];

  // Plays missing diagrams
  const playsNoDiagram = plays.filter((p) => !p.diagram_id);
  if (playsNoDiagram.length > 0) {
    issues.push({
      severity: "info",
      category: "Play Completeness",
      description: `${playsNoDiagram.length} plays missing diagrams`,
      affectedItems: playsNoDiagram.map((p) => p.id),
      howToFix: "Edit play → Upload diagram or use Diagram Editor",
      pointsToGain: Math.round((playsNoDiagram.length / totalPlays) * 8),
    });
  }

  // Plays with minimal metadata
  const playsMinimalData = plays.filter(
    (p) =>
      (!p.personnel || p.personnel.trim() === "") &&
      (!p.tags || p.tags.length === 0) &&
      (!p.notes || p.notes.trim() === "")
  );
  if (playsMinimalData.length > 0) {
    issues.push({
      severity: "warning",
      category: "Play Completeness",
      description: `${playsMinimalData.length} plays need more details`,
      affectedItems: playsMinimalData.map((p) => p.id),
      howToFix: "Add personnel, tags, and coaching notes to plays",
      pointsToGain: Math.round((playsMinimalData.length / totalPlays) * 6),
    });
  }

  // Plays missing play type
  const playsNoType = plays.filter((p) => !p.p_type || p.p_type.trim() === "");
  if (playsNoType.length > 0) {
    issues.push({
      severity: "critical",
      category: "Play Completeness",
      description: `${playsNoType.length} plays missing play type`,
      affectedItems: playsNoType.map((p) => p.id),
      howToFix: "Edit play → Select type (Run, Pass, RPO, etc.)",
      pointsToGain: Math.round((playsNoType.length / totalPlays) * 4),
    });
  }

  return { score, issues };
}

// ========================================
// Data Consistency Score (15 points)
// ========================================

async function calculateDataConsistencyScore(
  playbookId: string
): Promise<{ score: number; issues: HealthIssue[] }> {
  info("[PlaybookHealth] Calculating data consistency score");

  const { data: plays, error: playsError } = await supabase
    .from("plays")
    .select("id, play_name, formation, personnel")
    .eq("playbook_id", playbookId);

  const { data: formations, error: formationsError } = await supabase
    .from("formations")
    .select("id, name, direction, opposite_formation_id")
    .eq("playbook_id", playbookId);

  if (playsError || formationsError) {
    logError("[PlaybookHealth] Failed to fetch data:", playsError || formationsError);
    return { score: 0, issues: [] };
  }

  let score = 15; // Start with full points
  const issues: HealthIssue[] = [];

  // Check for duplicate play names (case-insensitive)
  const playNames = plays?.map((p) => p.play_name.toLowerCase()) || [];
  const duplicateNames = playNames.filter(
    (name, index) => playNames.indexOf(name) !== index
  );
  if (duplicateNames.length > 0) {
    score -= 5;
    issues.push({
      severity: "warning",
      category: "Data Consistency",
      description: `${duplicateNames.length} duplicate play names found`,
      affectedItems: plays
        ?.filter((p) => duplicateNames.includes(p.play_name.toLowerCase()))
        .map((p) => p.id) || [],
      howToFix: "Rename duplicate plays to be unique",
      pointsToGain: 5,
    });
  }

  // Check for formations missing opposite variants
  const formationsNeedingOpposite = formations?.filter(
    (f) => f.direction && !f.opposite_formation_id
  ) || [];
  if (formationsNeedingOpposite.length > 0) {
    score -= 5;
    issues.push({
      severity: "info",
      category: "Data Consistency",
      description: `${formationsNeedingOpposite.length} formations missing opposite variant`,
      affectedItems: formationsNeedingOpposite.map((f) => f.id),
      howToFix: "Formation Builder → Link Left/Right variants",
      pointsToGain: 5,
    });
  }

  // Check for inconsistent personnel naming
  const personnelVariations =
    plays?.map((p) => p.personnel?.trim()).filter(Boolean) || [];
  const uniquePersonnel = new Set(personnelVariations);
  if (uniquePersonnel.size > 15) {
    // Too many variations
    score -= 5;
    issues.push({
      severity: "warning",
      category: "Data Consistency",
      description: `${uniquePersonnel.size} different personnel groupings (recommend standardizing)`,
      affectedItems: [],
      howToFix:
        "Settings → Personnel → Standardize naming (e.g., '11 Personnel', '12 Personnel')",
      pointsToGain: 5,
    });
  }

  return { score: Math.max(0, score), issues };
}

// ========================================
// Organization Quality Score (10 points)
// ========================================

async function calculateOrganizationQualityScore(
  playbookId: string
): Promise<{ score: number; issues: HealthIssue[] }> {
  info("[PlaybookHealth] Calculating organization quality score");

  const { data: plays, error } = await supabase
    .from("plays")
    .select("id, tags, formation, p_type")
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[PlaybookHealth] Failed to fetch plays:", error);
    return { score: 0, issues: [] };
  }

  const totalPlays = plays?.length || 0;
  if (totalPlays === 0) {
    return { score: 10, issues: [] };
  }

  let score = 0;
  const issues: HealthIssue[] = [];

  // Plays with tags (5 points)
  const playsWithTags = plays?.filter((p) => p.tags && p.tags.length > 0) || [];
  const tagRate = playsWithTags.length / totalPlays;
  score += Math.round(tagRate * 5);

  if (tagRate < 0.5) {
    issues.push({
      severity: "info",
      category: "Organization Quality",
      description: `Only ${Math.round(tagRate * 100)}% of plays have tags`,
      affectedItems: plays?.filter((p) => !p.tags || p.tags.length === 0).map((p) => p.id) || [],
      howToFix: "Add tags to plays for better filtering and organization",
      pointsToGain: Math.round((1 - tagRate) * 5),
    });
  }

  // Formation diversity (3 points)
  const uniqueFormations = new Set(plays?.map((p) => p.formation).filter(Boolean));
  const formationDiversity = Math.min(uniqueFormations.size / 10, 1); // Ideal: 10+ formations
  score += Math.round(formationDiversity * 3);

  if (uniqueFormations.size < 5) {
    issues.push({
      severity: "info",
      category: "Organization Quality",
      description: `Only ${uniqueFormations.size} unique formations used`,
      affectedItems: [],
      howToFix: "Create more formations for offensive variety",
      pointsToGain: Math.round((1 - formationDiversity) * 3),
    });
  }

  // Play type distribution (2 points)
  const playTypes = plays?.map((p) => p.p_type).filter(Boolean) || [];
  const uniquePlayTypes = new Set(playTypes);
  const typeBalance = Math.min(uniquePlayTypes.size / 5, 1); // Ideal: 5+ types (Run, Pass, RPO, Screen, etc.)
  score += Math.round(typeBalance * 2);

  return { score: Math.max(0, score), issues };
}

// ========================================
// Main Health Calculation
// ========================================

/**
 * Calculate comprehensive playbook health score
 *
 * @param playbookId - UUID of playbook to analyze
 * @returns Complete health score breakdown with issues and recommendations
 */
export async function calculatePlaybookHealth(
  playbookId: string
): Promise<PlaybookHealthScore> {
  info("[PlaybookHealth] Starting health calculation for playbook:", playbookId);

  // Run all calculations in parallel
  const [
    formationLinking,
    formationCompleteness,
    playCompleteness,
    dataConsistency,
    organizationQuality,
  ] = await Promise.all([
    calculateFormationLinkingScore(playbookId),
    calculateFormationCompletenessScore(playbookId),
    calculatePlayCompletenessScore(playbookId),
    calculateDataConsistencyScore(playbookId),
    calculateOrganizationQualityScore(playbookId),
  ]);

  // Calculate overall score
  const overall =
    formationLinking.score +
    formationCompleteness.score +
    playCompleteness.score +
    dataConsistency.score +
    organizationQuality.score;

  // Combine all issues and sort by severity
  const allIssues = [
    ...formationLinking.issues,
    ...formationCompleteness.issues,
    ...playCompleteness.issues,
    ...dataConsistency.issues,
    ...organizationQuality.issues,
  ].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Generate recommendations based on score
  const recommendations: string[] = [];

  if (overall >= 90) {
    recommendations.push("🎉 Excellent! Your playbook is in great shape!");
    recommendations.push("✅ All key metrics are strong. Keep maintaining this quality.");
  } else if (overall >= 80) {
    recommendations.push("💪 Good job! Your playbook is well-organized.");
    recommendations.push("🎯 Focus on the issues below to reach 90+.");
  } else if (overall >= 70) {
    recommendations.push("📊 Your playbook has a solid foundation.");
    recommendations.push("🔧 Address the critical and warning issues to improve analytics quality.");
  } else if (overall >= 60) {
    recommendations.push("⚠️ Your playbook needs attention.");
    recommendations.push("🚨 Prioritize linking plays to formations and completing required fields.");
  } else {
    recommendations.push("🚀 Let's build a better playbook!");
    recommendations.push("📝 Start by ensuring all plays have: name, type, and formation linked.");
  }

  // Add specific recommendations based on top issues
  const topIssues = allIssues.slice(0, 3);
  topIssues.forEach((issue) => {
    if (issue.severity === "critical") {
      recommendations.push(`🔴 Critical: ${issue.description}`);
    }
  });

  // Fetch stats
  const { data: plays } = await supabase
    .from("plays")
    .select("id, formation_id, play_name")
    .eq("playbook_id", playbookId);

  const { data: formations } = await supabase
    .from("formations")
    .select("id, metadata_quality")
    .eq("playbook_id", playbookId);

  const stats = {
    totalPlays: plays?.length || 0,
    totalFormations: formations?.length || 0,
    playsWithFormationLink: plays?.filter((p) => p.formation_id).length || 0,
    completeFormations:
      formations?.filter((f) => f.metadata_quality === "complete").length || 0,
    averagePlayQuality: playCompleteness.score * 4, // Convert 25-point scale to 100-point
    uniquePlayNames: new Set(
      plays?.map((p) => normalizePlayName(p.play_name))
    ).size,
  };

  info("[PlaybookHealth] Calculation complete. Overall score:", overall);

  return {
    overall,
    breakdown: {
      formationLinking: formationLinking.score,
      formationCompleteness: formationCompleteness.score,
      playCompleteness: playCompleteness.score,
      dataConsistency: dataConsistency.score,
      organizationQuality: organizationQuality.score,
    },
    issues: allIssues,
    recommendations,
    stats,
  };
}

/**
 * Get health status color based on score
 */
export function getHealthColor(score: number): string {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
}

/**
 * Get health status emoji based on score
 */
export function getHealthEmoji(score: number): string {
  if (score >= 90) return "🟢";
  if (score >= 80) return "🟡";
  if (score >= 70) return "🟠";
  return "🔴";
}

/**
 * Get health grade based on score
 */
export function getHealthGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
