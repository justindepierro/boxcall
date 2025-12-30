/**
 * Playbook Health Score System (Simplified - December 2025)
 *
 * Practical scoring system that evaluates playbook data quality
 * based on what coaches ACTUALLY fill out.
 *
 * Total Score: 100 points
 * - Play Essentials (40pts): name, type, formation text, personnel
 * - Diagrams (25pts): uploaded diagram images
 * - Organization (20pts): tags, flags, situational preferences
 * - Coaching Notes (15pts): notes, protection, key players
 */

import { table } from "../data/supabase/db";
import { info, error as logError } from "./logger";

// ========================================
// Types
// ========================================

export type HealthIssueSeverity = "critical" | "warning" | "info";

export interface HealthIssue {
  severity: HealthIssueSeverity;
  category: string;
  description: string;
  affectedItems: string[]; // play IDs
  howToFix: string;
  pointsToGain: number;
}

export interface PlaybookHealthBreakdown {
  playEssentials: number; // 0-40 points
  diagrams: number; // 0-25 points
  organization: number; // 0-20 points
  coachingNotes: number; // 0-15 points
}

export interface PlaybookHealthScore {
  overall: number; // 0-100
  breakdown: PlaybookHealthBreakdown;
  issues: HealthIssue[];
  recommendations: string[];
  stats: {
    totalPlays: number;
    playsWithDiagrams: number;
    playsWithTags: number;
    playsWithNotes: number;
    uniqueFormations: number;
    playTypeDistribution: Record<string, number>;
  };
}

// ========================================
// Play Essentials Score (40 points)
// ========================================
// Checks: play_name, p_type, formation, personnel

interface PlayEssentialsResult {
  score: number;
  issues: HealthIssue[];
  plays: Array<{
    id: string;
    play_name: string;
    p_type: string | null;
    formation: string | null;
    personnel: string | null;
  }>;
}

async function calculatePlayEssentialsScore(
  playbookId: string
): Promise<PlayEssentialsResult> {
  info("[PlaybookHealth] Calculating play essentials score");

  const { data: plays, error } = await table("plays")
    .select("id, play_name, p_type, formation, personnel")
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[PlaybookHealth] Failed to fetch plays:", error);
    return { score: 0, issues: [], plays: [] };
  }

  const totalPlays = plays?.length || 0;
  if (totalPlays === 0) {
    return {
      score: 40, // Full points if no plays yet
      issues: [
        {
          severity: "info",
          category: "Getting Started",
          description: "No plays in playbook yet",
          affectedItems: [],
          howToFix: "Create your first play using the New Play button",
          pointsToGain: 0,
        },
      ],
      plays: [],
    };
  }

  let score = 0;
  const issues: HealthIssue[] = [];

  // Check play_name (10 points) - all plays should have names
  const playsWithName = plays.filter(
    (p) => p.play_name && p.play_name.trim().length > 0
  );
  const nameRate = playsWithName.length / totalPlays;
  score += Math.round(nameRate * 10);

  // Check p_type (10 points) - Run, Pass, RPO, etc.
  const playsWithType = plays.filter(
    (p) => p.p_type && p.p_type.trim().length > 0
  );
  const typeRate = playsWithType.length / totalPlays;
  score += Math.round(typeRate * 10);

  if (typeRate < 1) {
    const missingType = plays.filter(
      (p) => !p.p_type || p.p_type.trim() === ""
    );
    issues.push({
      severity: missingType.length > totalPlays * 0.3 ? "critical" : "warning",
      category: "Play Type",
      description: `${missingType.length} plays missing play type (Run/Pass/RPO)`,
      affectedItems: missingType.map((p) => p.id),
      howToFix: "Edit play → Select type from dropdown",
      pointsToGain: Math.round((1 - typeRate) * 10),
    });
  }

  // Check formation (10 points) - formation text field
  const playsWithFormation = plays.filter(
    (p) => p.formation && p.formation.trim().length > 0
  );
  const formationRate = playsWithFormation.length / totalPlays;
  score += Math.round(formationRate * 10);

  if (formationRate < 1) {
    const missingFormation = plays.filter(
      (p) => !p.formation || p.formation.trim() === ""
    );
    issues.push({
      severity: missingFormation.length > totalPlays * 0.3 ? "warning" : "info",
      category: "Formation",
      description: `${missingFormation.length} plays missing formation`,
      affectedItems: missingFormation.map((p) => p.id),
      howToFix: "Edit play → Enter formation name (e.g., Ace, I-Form, Shotgun)",
      pointsToGain: Math.round((1 - formationRate) * 10),
    });
  }

  // Check personnel (10 points) - 11, 12, 21, etc.
  const playsWithPersonnel = plays.filter(
    (p) => p.personnel && p.personnel.trim().length > 0
  );
  const personnelRate = playsWithPersonnel.length / totalPlays;
  score += Math.round(personnelRate * 10);

  if (personnelRate < 0.5) {
    const missingPersonnel = plays.filter(
      (p) => !p.personnel || p.personnel.trim() === ""
    );
    issues.push({
      severity: "info",
      category: "Personnel",
      description: `${missingPersonnel.length} plays missing personnel grouping`,
      affectedItems: missingPersonnel.slice(0, 10).map((p) => p.id), // Limit to 10
      howToFix:
        "Edit play → Select personnel (11 = 1 RB 1 TE, 12 = 1 RB 2 TE, etc.)",
      pointsToGain: Math.round((1 - personnelRate) * 10),
    });
  }

  return { score, issues, plays: plays || [] };
}

// ========================================
// Diagrams Score (25 points)
// ========================================
// Checks: diagram_image_url (uploaded images)

async function calculateDiagramsScore(
  playbookId: string
): Promise<{ score: number; issues: HealthIssue[] }> {
  info("[PlaybookHealth] Calculating diagrams score");

  const { data: plays, error } = await table("plays")
    .select("id, play_name, diagram_image_url")
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[PlaybookHealth] Failed to fetch plays:", error);
    return { score: 0, issues: [] };
  }

  const totalPlays = plays?.length || 0;
  if (totalPlays === 0) {
    return { score: 25, issues: [] }; // Full points if no plays
  }

  const issues: HealthIssue[] = [];

  // Check for uploaded diagrams
  const playsWithDiagram = plays.filter(
    (p) => p.diagram_image_url && p.diagram_image_url.trim().length > 0
  );
  const diagramRate = playsWithDiagram.length / totalPlays;
  const score = Math.round(diagramRate * 25);

  if (diagramRate < 0.8) {
    const missingDiagrams = plays.filter(
      (p) => !p.diagram_image_url || p.diagram_image_url.trim() === ""
    );

    let severity: HealthIssueSeverity = "info";
    if (diagramRate < 0.3) {
      severity = "critical";
    } else if (diagramRate < 0.6) {
      severity = "warning";
    }

    issues.push({
      severity,
      category: "Diagrams",
      description: `${missingDiagrams.length} plays without diagrams (${Math.round(diagramRate * 100)}% coverage)`,
      affectedItems: missingDiagrams.slice(0, 20).map((p) => p.id), // Limit to 20
      howToFix: "Edit play → Upload a diagram image",
      pointsToGain: Math.round((1 - diagramRate) * 25),
    });
  }

  return { score, issues };
}

// ========================================
// Organization Score (20 points)
// ========================================
// Checks: tags, flags, preferences (situational fit)

async function calculateOrganizationScore(
  playbookId: string
): Promise<{ score: number; issues: HealthIssue[] }> {
  info("[PlaybookHealth] Calculating organization score");

  const { data: plays, error } = await table("plays")
    .select(
      "id, play_name, tags, flags, pref_down, pref_dis, pref_hash, pref_field_pos"
    )
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[PlaybookHealth] Failed to fetch plays:", error);
    return { score: 0, issues: [] };
  }

  const totalPlays = plays?.length || 0;
  if (totalPlays === 0) {
    return { score: 20, issues: [] };
  }

  let score = 0;
  const issues: HealthIssue[] = [];

  // Tags (10 points)
  const playsWithTags = plays.filter(
    (p) => p.tags && Array.isArray(p.tags) && p.tags.length > 0
  );
  const tagRate = playsWithTags.length / totalPlays;
  score += Math.round(tagRate * 10);

  if (tagRate < 0.5) {
    issues.push({
      severity: "info",
      category: "Tags",
      description: `Only ${Math.round(tagRate * 100)}% of plays have tags`,
      affectedItems: plays
        .filter((p) => !p.tags || p.tags.length === 0)
        .slice(0, 10)
        .map((p) => p.id),
      howToFix:
        "Add tags like 'Red Zone', 'Short Yardage', 'Screen' for better filtering",
      pointsToGain: Math.round((0.5 - tagRate) * 10),
    });
  }

  // Situational Preferences (10 points)
  const playsWithPrefs = plays.filter(
    (p) =>
      (p.pref_down && p.pref_down.trim()) ||
      (p.pref_dis && p.pref_dis.trim()) ||
      (p.pref_hash && p.pref_hash.trim()) ||
      (p.pref_field_pos && p.pref_field_pos.trim()) ||
      (p.flags && Array.isArray(p.flags) && p.flags.length > 0)
  );
  const prefRate = playsWithPrefs.length / totalPlays;
  score += Math.round(prefRate * 10);

  if (prefRate < 0.3) {
    issues.push({
      severity: "info",
      category: "Situational Fit",
      description: `Only ${Math.round(prefRate * 100)}% of plays have situational preferences`,
      affectedItems: [],
      howToFix:
        "Add preferred down, distance, or field position to help with game planning",
      pointsToGain: Math.round((0.3 - prefRate) * 10),
    });
  }

  return { score, issues };
}

// ========================================
// Coaching Notes Score (15 points)
// ========================================
// Checks: notes, protection, key_positions, key_players

async function calculateCoachingNotesScore(
  playbookId: string
): Promise<{ score: number; issues: HealthIssue[] }> {
  info("[PlaybookHealth] Calculating coaching notes score");

  const { data: plays, error } = await table("plays")
    .select("id, play_name, notes, protection, key_positions, key_players")
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[PlaybookHealth] Failed to fetch plays:", error);
    return { score: 0, issues: [] };
  }

  const totalPlays = plays?.length || 0;
  if (totalPlays === 0) {
    return { score: 15, issues: [] };
  }

  let score = 0;
  const issues: HealthIssue[] = [];

  // Notes (8 points)
  const playsWithNotes = plays.filter(
    (p) => p.notes && p.notes.trim().length > 10
  );
  const notesRate = playsWithNotes.length / totalPlays;
  score += Math.round(notesRate * 8);

  if (notesRate < 0.3) {
    issues.push({
      severity: "info",
      category: "Coaching Notes",
      description: `Only ${Math.round(notesRate * 100)}% of plays have coaching notes`,
      affectedItems: [],
      howToFix: "Add coaching points, technique cues, or opponent tendencies",
      pointsToGain: Math.round((0.3 - notesRate) * 8),
    });
  }

  // Protection or Key Players (7 points)
  const playsWithDetails = plays.filter(
    (p) =>
      (p.protection && p.protection.trim().length > 0) ||
      (p.key_positions &&
        Array.isArray(p.key_positions) &&
        p.key_positions.length > 0) ||
      (p.key_players &&
        Array.isArray(p.key_players) &&
        p.key_players.length > 0)
  );
  const detailsRate = playsWithDetails.length / totalPlays;
  score += Math.round(detailsRate * 7);

  return { score, issues };
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
  info(
    "[PlaybookHealth] Starting health calculation for playbook:",
    playbookId
  );

  // Run all calculations
  const [playEssentials, diagrams, organization, coachingNotes] =
    await Promise.all([
      calculatePlayEssentialsScore(playbookId),
      calculateDiagramsScore(playbookId),
      calculateOrganizationScore(playbookId),
      calculateCoachingNotesScore(playbookId),
    ]);

  // Calculate overall score
  const overall =
    playEssentials.score +
    diagrams.score +
    organization.score +
    coachingNotes.score;

  // Combine all issues and sort by severity
  const allIssues = [
    ...playEssentials.issues,
    ...diagrams.issues,
    ...organization.issues,
    ...coachingNotes.issues,
  ].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Generate recommendations based on score
  const recommendations: string[] = [];

  if (overall >= 90) {
    recommendations.push("🎉 Excellent! Your playbook is game-ready!");
    recommendations.push(
      "✅ Keep maintaining this quality as you add new plays."
    );
  } else if (overall >= 80) {
    recommendations.push("💪 Great job! Your playbook is well-organized.");
    recommendations.push("🎯 Focus on the suggestions below to reach 90+.");
  } else if (overall >= 70) {
    recommendations.push("📊 Your playbook has a solid foundation.");
    recommendations.push("🔧 Address the issues below to improve quality.");
  } else if (overall >= 50) {
    recommendations.push("⚠️ Your playbook needs some attention.");
    recommendations.push(
      "📝 Focus on adding diagrams and filling in play types."
    );
  } else {
    recommendations.push("🚀 Let's build out your playbook!");
    recommendations.push(
      "📝 Start by ensuring plays have: name, type, and formation."
    );
  }

  // Add specific recommendations based on top issues
  const criticalIssues = allIssues.filter((i) => i.severity === "critical");
  criticalIssues.forEach((issue) => {
    recommendations.push(`🔴 ${issue.description}`);
  });

  // Calculate stats
  const plays = playEssentials.plays;
  const uniqueFormations = new Set(
    plays.map((p) => p.formation?.toLowerCase().trim()).filter(Boolean)
  );

  // Get diagram count
  const { data: diagramPlays } = await table("plays")
    .select("diagram_image_url")
    .eq("playbook_id", playbookId);

  const playsWithDiagrams =
    diagramPlays?.filter((p) => p.diagram_image_url).length || 0;

  // Get tags count
  const { data: tagPlays } = await table("plays")
    .select("tags")
    .eq("playbook_id", playbookId);

  const playsWithTags =
    tagPlays?.filter(
      (p) => p.tags && Array.isArray(p.tags) && p.tags.length > 0
    ).length || 0;

  // Get notes count
  const { data: notesPlays } = await table("plays")
    .select("notes")
    .eq("playbook_id", playbookId);

  const playsWithNotes =
    notesPlays?.filter((p) => p.notes && p.notes.trim().length > 10).length ||
    0;

  // Play type distribution
  const playTypeDistribution: Record<string, number> = {};
  plays.forEach((p) => {
    const type = p.p_type || "Unknown";
    playTypeDistribution[type] = (playTypeDistribution[type] || 0) + 1;
  });

  const stats = {
    totalPlays: plays.length,
    playsWithDiagrams,
    playsWithTags,
    playsWithNotes,
    uniqueFormations: uniqueFormations.size,
    playTypeDistribution,
  };

  info("[PlaybookHealth] Calculation complete. Overall score:", overall);

  return {
    overall,
    breakdown: {
      playEssentials: playEssentials.score,
      diagrams: diagrams.score,
      organization: organization.score,
      coachingNotes: coachingNotes.score,
    },
    issues: allIssues,
    recommendations,
    stats,
  };
}

/**
 * Get health status color based on score
 */
export function getHealthColor(
  score: number
): "success" | "warning" | "danger" {
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
