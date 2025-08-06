/**
 * Play Complexity Analysis System
 *
 * Week 3 Gamification: Complexity Challenge System
 * Analyzes play designs and awards appropriate badges based on complexity metrics
 */

import type { Play } from "../types/play";

export interface ComplexityMetrics {
  routeCount: number;
  formationComplexity: number;
  personnelVariety: number;
  conceptDifficulty: number;
  totalScore: number;
  badge: ComplexityBadgeType;
}

export type ComplexityBadgeType =
  | "beginner" // 0-25 points
  | "intermediate" // 26-50 points
  | "advanced" // 51-75 points
  | "expert" // 76-90 points
  | "innovative"; // 91+ points

/**
 * Analyze play complexity and determine appropriate badge
 */
export function analyzePlayComplexity(play: Play): ComplexityMetrics {
  const routeCount = calculateRouteComplexity(play);
  const formationComplexity = calculateFormationComplexity(play.formation);
  const personnelVariety = calculatePersonnelComplexity(play.personnel || "11");
  const conceptDifficulty = calculateConceptDifficulty(play);

  const totalScore =
    routeCount + formationComplexity + personnelVariety + conceptDifficulty;
  const badge = determineBadgeType(totalScore);

  return {
    routeCount,
    formationComplexity,
    personnelVariety,
    conceptDifficulty,
    totalScore,
    badge,
  };
}

/**
 * Calculate route complexity based on play type and tags
 */
function calculateRouteComplexity(play: Play): number {
  let score = 0;

  // Base points by play type
  switch (play.p_type) {
    case "Run":
      score += 10; // Simpler base
      break;
    case "Pass":
      score += 15; // Medium complexity
      break;
    case "RPO":
      score += 25; // High complexity - read-based
      break;
    case "Play Action":
      score += 30; // Highest complexity
      break;
    default:
      score += 10;
  }

  // Bonus points for specific concepts
  const complexConcepts = [
    "concept",
    "combo",
    "smash",
    "flood",
    "pick",
    "rub",
    "double-move",
    "deep",
    "vertical",
    "crossing",
  ];

  const simpleRoutes = ["slant", "hitch", "curl", "quick", "bubble", "smoke"];

  play.tags?.forEach((tag) => {
    if (complexConcepts.some((concept) => tag.includes(concept))) {
      score += 8;
    } else if (simpleRoutes.some((route) => tag.includes(route))) {
      score += 3;
    } else {
      score += 5; // Default tag value
    }
  });

  return Math.min(score, 40); // Cap at 40 points
}

/**
 * Calculate formation complexity
 */
function calculateFormationComplexity(formation: string): number {
  const complexFormations = [
    "Pistol",
    "Wildcat",
    "Wing-T",
    "Double Wing",
    "Flexbone",
    "Trips",
    "Bunch",
    "Stack",
    "Empty",
  ];

  const standardFormations = [
    "Shotgun",
    "Under Center",
    "I-Formation",
    "Split Back",
  ];

  const formationLower = formation.toLowerCase();

  if (complexFormations.some((f) => formationLower.includes(f.toLowerCase()))) {
    return 20;
  } else if (
    standardFormations.some((f) => formationLower.includes(f.toLowerCase()))
  ) {
    return 10;
  }

  return 15; // Default
}

/**
 * Calculate personnel complexity
 */
function calculatePersonnelComplexity(personnel: string): number {
  // 11 Personnel (3 WR, 1 TE, 1 RB) = Standard
  // 12 Personnel (2 WR, 2 TE, 1 RB) = More complex
  // 21 Personnel (2 WR, 1 TE, 2 RB) = Complex
  // 10 Personnel (4 WR, 1 RB) = Specialized

  if (personnel.includes("10")) return 15; // 4 wide spread
  if (personnel.includes("12")) return 20; // Two tight ends
  if (personnel.includes("21")) return 25; // Two backs
  if (personnel.includes("22")) return 30; // Heavy personnel
  if (personnel.includes("11")) return 10; // Standard

  return 15; // Default
}

/**
 * Calculate concept difficulty based on play characteristics
 */
function calculateConceptDifficulty(play: Play): number {
  let score = 0;

  // Success rate indicates difficulty - lower success = harder concept
  if (play.success_rate) {
    if (play.success_rate < 50)
      score += 15; // Very difficult
    else if (play.success_rate < 65)
      score += 10; // Difficult
    else if (play.success_rate < 80) score += 5; // Moderate
    // High success rate adds no complexity points
  }

  // Description length can indicate complexity (using notes field)
  if (play.notes) {
    const wordCount = play.notes.split(" ").length;
    if (wordCount > 20) score += 10;
    else if (wordCount > 15) score += 5;
  }

  // Times called vs success - if called often but low success = complex
  if (play.times_called && play.times_successful) {
    const callSuccessRatio = play.times_successful / play.times_called;
    if (callSuccessRatio < 0.5 && play.times_called > 5) {
      score += 10; // Frequently attempted but difficult to execute
    }
  }

  return Math.min(score, 25); // Cap at 25 points
}

/**
 * Determine badge type based on total complexity score
 */
function determineBadgeType(totalScore: number): ComplexityBadgeType {
  if (totalScore >= 91) return "innovative";
  if (totalScore >= 76) return "expert";
  if (totalScore >= 51) return "advanced";
  if (totalScore >= 26) return "intermediate";
  return "beginner";
}

/**
 * Get badge display information
 */
export function getComplexityBadgeInfo(badge: ComplexityBadgeType) {
  const badgeInfo = {
    beginner: {
      title: "Getting Started",
      description: "Learning the fundamentals",
      color: "information", // Blue
      icon: "🎯",
    },
    intermediate: {
      title: "Building Skills",
      description: "Developing more complex concepts",
      color: "attention", // Yellow
      icon: "⚡",
    },
    advanced: {
      title: "Advanced Strategist",
      description: "Mastering complex play designs",
      color: "achievement", // Green
      icon: "🧠",
    },
    expert: {
      title: "Play Design Expert",
      description: "Creating sophisticated game plans",
      color: "premium", // Purple
      icon: "👑",
    },
    innovative: {
      title: "Innovative Genius",
      description: "Pioneering revolutionary concepts",
      color: "premium", // Purple with special styling
      icon: "💎",
    },
  } as const;

  return badgeInfo[badge];
}

/**
 * Check if a complexity milestone was reached
 */
export function checkComplexityMilestones(
  newMetrics: ComplexityMetrics,
  previousBestScore: number = 0
): { isNewMilestone: boolean; milestone?: string } {
  // Check if this is their first badge of this type
  const milestones = [
    { score: 26, badge: "intermediate", message: "First Intermediate Play!" },
    { score: 51, badge: "advanced", message: "Advanced Play Designer!" },
    { score: 76, badge: "expert", message: "Expert Level Reached!" },
    { score: 91, badge: "innovative", message: "Innovation Unlocked!" },
  ];

  for (const milestone of milestones) {
    if (
      newMetrics.totalScore >= milestone.score &&
      previousBestScore < milestone.score
    ) {
      return {
        isNewMilestone: true,
        milestone: milestone.message,
      };
    }
  }

  return { isNewMilestone: false };
}
