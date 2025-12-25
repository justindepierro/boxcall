import type { Play } from "../types/play";

/**
 * Utility functions for Smart Playbook Glossary category filtering
 */

// Subcategory matching rules - maps subcategory to required terms
const SUBCATEGORY_RULES: Record<
  string,
  { required?: string[]; any?: string[]; allOf?: string[] }
> = {
  power: { any: ["power"] },
  "inside zone": { required: ["zone"], any: ["inside", "izo", "izr"] },
  zone: { required: ["zone"] },
  "outside zone": { allOf: ["outside", "zone"] },
  sweeps: { any: ["sweep", "toss"] },
  draws: { any: ["draw"] },
  counters: { any: ["counter"] },
  "quick game": { any: ["quick", "slant", "hitch"] },
  intermediate: { any: ["dig", "comeback", "out"] },
  "deep shots": { any: ["go", "post", "corner"] },
  screens: { any: ["screen"] },
  "crossing routes": { any: ["cross", "drag"] },
  bubble: { any: ["bubble"] },
  stick: { any: ["stick"] },
  "slant/flat": { any: ["slant", "flat"] },
  "speed option": { allOf: ["speed", "option"] },
  "quick slants": { any: ["slant"] },
  boot: { any: ["boot"] },
  rollout: { any: ["roll"] },
  "tight end seams": { any: ["seam"] },
  "red zone": { any: ["red zone", "fade", "corner"] },
  "goal line": { any: ["goal"] },
  "2-minute": { any: ["2-minute", "hurry"] },
  "3rd down": { any: ["3rd", "third"] },
  "4th down": { any: ["4th", "fourth"] },
};

/** Check if text contains all of the specified terms */
function containsAll(text: string, terms: string[]): boolean {
  return terms.every((term) => text.includes(term));
}

/** Check if text contains any of the specified terms */
function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

// Map play attributes to categories
export const getPlayCategory = (play: Play): string[] => {
  const categories: string[] = [];
  const playType = (play.p_type || "").toLowerCase();
  const playTypeKey = playType.replace(/[^a-z0-9]+/g, "");

  // Primary category mapping (supports custom variants like "RPO Read")
  if (playTypeKey.includes("run")) categories.push("runs");
  if (playTypeKey.includes("pass")) categories.push("passes");
  if (playTypeKey.includes("rpo")) categories.push("rpos");
  if (playTypeKey.includes("playaction")) categories.push("play-action");

  // Situational categories based on play characteristics
  const playName = play.play_name.toLowerCase();
  const formation = play.formation.toLowerCase();
  const notes = play.notes?.toLowerCase() || "";
  const allText = `${playName} ${formation} ${notes}`;

  if (
    allText.includes("red zone") ||
    allText.includes("goal line") ||
    allText.includes("2-minute") ||
    allText.includes("3rd down") ||
    allText.includes("4th down") ||
    allText.includes("short yardage")
  ) {
    categories.push("situational");
  }

  return categories;
};

// Check if play matches subcategory using rule-based matching
export const playMatchesSubcategory = (
  play: Play,
  subcategory: string
): boolean => {
  const searchTerm = subcategory.toLowerCase();
  const playName = play.play_name.toLowerCase();
  const formation = play.formation.toLowerCase();
  const notes = play.notes?.toLowerCase() || "";
  const allText = `${playName} ${formation} ${notes}`;

  // Direct text matching first
  if (allText.includes(searchTerm)) {
    return true;
  }

  // Rule-based matching
  const rule = SUBCATEGORY_RULES[searchTerm];
  if (!rule) return false;

  if (rule.allOf && !containsAll(allText, rule.allOf)) return false;
  if (rule.required && !containsAll(allText, rule.required)) return false;
  if (rule.any && !containsAny(allText, rule.any)) return false;

  return true;
};

// Calculate play counts for categories (mock implementation)
export const calculatePlayCounts = (plays: Play[]) => {
  const counts: Record<string, number> = {};

  // Initialize counts
  const categories = ["runs", "passes", "rpos", "play-action", "situational"];
  const subcategories = [
    "power",
    "inside zone",
    "outside zone",
    "sweeps",
    "draws",
    "counters",
    "quick game",
    "intermediate",
    "deep shots",
    "screens",
    "crossing routes",
    "bubble",
    "stick",
    "slant/flat",
    "speed option",
    "quick slants",
    "boot",
    "rollout",
    "tight end seams",
    "red zone",
    "goal line",
    "2-minute",
    "3rd down",
    "4th down",
  ];

  categories.forEach((cat) => (counts[cat] = 0));
  subcategories.forEach((sub) => (counts[sub] = 0));

  // Count plays in each category
  plays.forEach((play) => {
    const playCategories = getPlayCategory(play);
    playCategories.forEach((category) => {
      counts[category] = (counts[category] || 0) + 1;
    });

    // Count subcategories
    subcategories.forEach((subcategory) => {
      if (playMatchesSubcategory(play, subcategory)) {
        counts[subcategory] = (counts[subcategory] || 0) + 1;
      }
    });
  });

  return counts;
};
