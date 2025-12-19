/**
 * Data Quality Scoring System
 *
 * Calculates data completeness scores for plays and formations
 * Provides recommendations for improving data quality
 *
 * Phase 2: Data Quality & Validation System
 */

import type { Play } from "../types/play";
import type { Formation } from "../types/formation";

// ========================================
// Interfaces
// ========================================

export interface DataQualityScore {
  total: number; // 0-100
  breakdown: {
    required: number; // 40 points max
    metadata: number; // 30 points max
    advanced: number; // 30 points max
  };
  recommendations: string[];
  grade: "A" | "B" | "C" | "D" | "F";
  completeness: "Complete" | "Good" | "Fair" | "Poor" | "Minimal";
}

export interface FormationQualityScore {
  total: number; // 0-100
  breakdown: {
    required: number; // 50 points max
    metadata: number; // 30 points max
    diagram: number; // 20 points max
  };
  recommendations: string[];
  grade: "A" | "B" | "C" | "D" | "F";
}

function hasPlayDiagram(play: Partial<Play>): boolean {
  if (play.diagram_image_url) return true;
  if (play.diagram_url) return true;
  if (Array.isArray(play.diagram_data) && play.diagram_data.length > 0)
    return true;
  return false;
}

// ========================================
// Play Quality Scoring
// ========================================

function scoreRequiredFields(
  play: Partial<Play>,
  recommendations: string[]
): number {
  let points = 0;

  // Play name (15 points)
  if (play.play_name && play.play_name.trim().length > 0) {
    points += 15;
  } else {
    recommendations.push("Add a play name");
  }

  // Formation (15 points)
  if (play.formation && play.formation.trim().length > 0) {
    points += 15;
  } else {
    recommendations.push("Specify a formation");
  }

  // Play type (10 points)
  if (play.p_type && play.p_type.trim().length > 0) {
    points += 10;
  } else {
    recommendations.push("Select a play type (Run, Pass, RPO, etc.)");
  }

  return points;
}

function scoreMetadataFields(
  play: Partial<Play>,
  recommendations: string[]
): number {
  let points = 0;

  // Personnel (10 points)
  if (play.personnel && play.personnel.trim().length > 0) {
    points += 10;
  } else {
    recommendations.push("Add personnel grouping (e.g., '11 Personnel')");
  }

  // Tags (5 points)
  if (play.tags && play.tags.length > 0) {
    points += 5;
  } else {
    recommendations.push("Add tags for better organization");
  }

  // Key positions (5 points)
  if (play.key_positions && play.key_positions.length > 0) {
    points += 5;
  } else {
    recommendations.push("Identify key positions for this play");
  }

  // Key players (5 points)
  if (play.key_players && play.key_players.length > 0) {
    points += 5;
  } else {
    recommendations.push("Assign key players to this play");
  }

  // Notes (5 points)
  if (play.notes && play.notes.trim().length > 20) {
    points += 5;
  } else if (!play.notes || play.notes.trim().length === 0) {
    recommendations.push("Add coaching notes or play description");
  }

  return points;
}

function hasAnyPlayPreferences(play: Partial<Play>): boolean {
  return Boolean(
    play.r_str ||
      play.p_str ||
      play.pref_hash ||
      play.pref_front ||
      play.pref_cov ||
      play.pref_down ||
      play.pref_dis ||
      play.pref_field_pos ||
      play.pref_situation
  );
}

function scoreAdvancedFields(
  play: Partial<Play>,
  recommendations: string[]
): number {
  let points = 0;

  // Diagram (15 points)
  if (hasPlayDiagram(play)) {
    points += 15;
  } else {
    recommendations.push("Create a diagram for visual reference");
  }

  // Play preferences (strength, hash) (5 points)
  if (hasAnyPlayPreferences(play)) {
    points += 5;
  } else {
    recommendations.push("Add play preferences (front, coverage, hash, etc.)");
  }

  // Protection scheme (5 points)
  if (play.protection && play.protection.trim().length > 0) {
    points += 5;
  } else {
    recommendations.push("Document protection scheme");
  }

  // Flags (5 points)
  if (play.flags && play.flags.length > 0) {
    points += 5;
  } else {
    recommendations.push("Add situational flags (Red Zone, Goal Line, etc.)");
  }

  return points;
}

function getPlayQualityGrade(total: number): DataQualityScore["grade"] {
  if (total >= 90) return "A";
  if (total >= 80) return "B";
  if (total >= 70) return "C";
  if (total >= 60) return "D";
  return "F";
}

function getPlayQualityCompleteness(
  total: number
): DataQualityScore["completeness"] {
  if (total >= 90) return "Complete";
  if (total >= 75) return "Good";
  if (total >= 50) return "Fair";
  if (total >= 30) return "Poor";
  return "Minimal";
}

/**
 * Calculate data quality score for a play
 */
export function calculatePlayQuality(play: Partial<Play>): DataQualityScore {
  const recommendations: string[] = [];
  const requiredPoints = scoreRequiredFields(play, recommendations); // Max 40
  const metadataPoints = scoreMetadataFields(play, recommendations); // Max 30
  const advancedPoints = scoreAdvancedFields(play, recommendations); // Max 30

  const total = requiredPoints + metadataPoints + advancedPoints;
  const grade = getPlayQualityGrade(total);
  const completeness = getPlayQualityCompleteness(total);

  return {
    total,
    breakdown: {
      required: requiredPoints,
      metadata: metadataPoints,
      advanced: advancedPoints,
    },
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    grade,
    completeness,
  };
}

// ========================================
// Formation Quality Scoring
// ========================================

/**
 * Calculate data quality score for a formation
 */
export function calculateFormationQuality(
  formation: Partial<Formation>
): FormationQualityScore {
  let requiredPoints = 0; // Max 50
  let metadataPoints = 0; // Max 30
  let diagramPoints = 0; // Max 20
  const recommendations: string[] = [];

  // ========================================
  // REQUIRED FIELDS (50 points)
  // ========================================

  // Formation name (25 points)
  if (formation.name && formation.name.trim().length > 0) {
    requiredPoints += 25;
  } else {
    recommendations.push("Add a formation name");
  }

  // Direction (15 points)
  if (formation.direction) {
    requiredPoints += 15;
  } else {
    recommendations.push("Specify formation direction (L, R, or Middle)");
  }

  // Personnel (10 points)
  if (
    (formation.personnel_name && formation.personnel_name.trim().length > 0) ||
    (Array.isArray(formation.personnel_packages) &&
      formation.personnel_packages.length > 0)
  ) {
    requiredPoints += 10;
  } else {
    recommendations.push("Add personnel grouping (e.g., '11 Personnel')");
  }

  // ========================================
  // METADATA FIELDS (30 points)
  // ========================================

  // Notes (15 points)
  if (formation.description && formation.description.trim().length > 20) {
    metadataPoints += 15;
  } else if (
    !formation.description ||
    formation.description.trim().length === 0
  ) {
    recommendations.push("Add coaching notes or formation description");
  }

  // Play count (15 points) - formations with plays are more valuable
  if (formation.usage_count && formation.usage_count > 0) {
    metadataPoints += 15;
  } else {
    recommendations.push("Add plays to this formation");
  }

  // ========================================
  // DIAGRAM FIELDS (20 points)
  // ========================================

  // Diagram data (20 points)
  if (formation.diagram_data) {
    diagramPoints += 20;
  } else {
    recommendations.push("Create a formation diagram for visual reference");
  }

  // ========================================
  // Calculate Total & Grade
  // ========================================

  const total = requiredPoints + metadataPoints + diagramPoints;

  // Determine grade (A-F scale)
  let grade: "A" | "B" | "C" | "D" | "F";
  if (total >= 90) grade = "A";
  else if (total >= 80) grade = "B";
  else if (total >= 70) grade = "C";
  else if (total >= 60) grade = "D";
  else grade = "F";

  return {
    total,
    breakdown: {
      required: requiredPoints,
      metadata: metadataPoints,
      diagram: diagramPoints,
    },
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    grade,
  };
}

// ========================================
// Playbook Quality Analysis
// ========================================

export interface PlaybookQualityAnalysis {
  totalPlays: number;
  averageScore: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  topIssues: {
    issue: string;
    count: number;
    percentage: number;
  }[];
  recommendations: string[];
}

/**
 * Analyze data quality across an entire playbook
 */
export function analyzePlaybookQuality(
  plays: Partial<Play>[]
): PlaybookQualityAnalysis {
  const scores = plays.map((play) => calculatePlayQuality(play));

  const gradeDistribution = {
    A: scores.filter((s) => s.grade === "A").length,
    B: scores.filter((s) => s.grade === "B").length,
    C: scores.filter((s) => s.grade === "C").length,
    D: scores.filter((s) => s.grade === "D").length,
    F: scores.filter((s) => s.grade === "F").length,
  };

  const averageScore =
    scores.reduce((sum, s) => sum + s.total, 0) / scores.length || 0;

  // Aggregate recommendations to find top issues
  const issueMap = new Map<string, number>();
  scores.forEach((score) => {
    score.recommendations.forEach((rec) => {
      issueMap.set(rec, (issueMap.get(rec) || 0) + 1);
    });
  });

  const topIssues = Array.from(issueMap.entries())
    .map(([issue, count]) => ({
      issue,
      count,
      percentage: Math.round((count / plays.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Generate overall recommendations
  const recommendations: string[] = [];

  if (averageScore < 70) {
    recommendations.push(
      "📊 Overall data quality is below target. Focus on completing required fields."
    );
  }

  if (gradeDistribution.F > plays.length * 0.2) {
    recommendations.push(
      "⚠️ More than 20% of plays have minimal data. Consider a cleanup initiative."
    );
  }

  if (topIssues[0] && topIssues[0].percentage > 50) {
    recommendations.push(
      `🎯 Top priority: ${topIssues[0].issue} (${topIssues[0].percentage}% of plays)`
    );
  }

  if (gradeDistribution.A > plays.length * 0.5) {
    recommendations.push("✅ Great job! Over 50% of plays have complete data.");
  }

  return {
    totalPlays: plays.length,
    averageScore: Math.round(averageScore),
    gradeDistribution,
    topIssues,
    recommendations,
  };
}

// ========================================
// Quality Improvement Helpers
// ========================================

/**
 * Get priority actions to improve play quality
 */
export function getPriorityActions(play: Partial<Play>): string[] {
  const score = calculatePlayQuality(play);
  const actions: string[] = [];

  // Prioritize required fields first
  if (score.breakdown.required < 40) {
    if (!play.play_name) actions.push("Add play name (HIGH PRIORITY)");
    if (!play.formation) actions.push("Add formation (HIGH PRIORITY)");
    if (!play.p_type) actions.push("Select play type (HIGH PRIORITY)");
  }

  // Then metadata
  if (score.breakdown.metadata < 20 && score.breakdown.required === 40) {
    if (!play.personnel) actions.push("Add personnel grouping");
    if (!play.tags || play.tags.length === 0) actions.push("Add tags");
    if (!play.notes || play.notes.length < 20)
      actions.push("Add coaching notes");
  }

  // Finally advanced fields
  if (score.breakdown.advanced < 15 && score.breakdown.required === 40) {
    if (!hasPlayDiagram(play)) actions.push("Create diagram");
    if (!play.protection) actions.push("Document protection");
  }

  return actions.slice(0, 3); // Top 3 actions
}

/**
 * Check if play meets minimum quality standards
 */
export function meetsMinimumStandards(play: Partial<Play>): {
  meets: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  if (!play.play_name || play.play_name.trim().length === 0) {
    missingFields.push("Play name");
  }

  if (!play.formation || play.formation.trim().length === 0) {
    missingFields.push("Formation");
  }

  if (!play.p_type || play.p_type.trim().length === 0) {
    missingFields.push("Play type");
  }

  return {
    meets: missingFields.length === 0,
    missingFields,
  };
}
