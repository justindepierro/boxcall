import type { Play } from "../types/play";

/**
 * Utility functions for Smart Playbook Glossary category filtering
 */

// Map play attributes to categories
export const getPlayCategory = (play: Play): string[] => {
  const categories: string[] = [];
  const playType = play.p_type.toLowerCase();

  // Primary category mapping
  switch (playType) {
    case "run":
      categories.push("runs");
      break;
    case "pass":
      categories.push("passes");
      break;
    case "rpo":
      categories.push("rpos");
      break;
    case "play action":
      categories.push("play-action");
      break;
    default:
      break;
  }

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

// Check if play matches subcategory
export const playMatchesSubcategory = (
  play: Play,
  subcategory: string
): boolean => {
  const searchTerm = subcategory.toLowerCase();
  const playName = play.play_name.toLowerCase();
  const formation = play.formation.toLowerCase();
  const notes = play.notes?.toLowerCase() || "";

  // Direct text matching
  if (
    playName.includes(searchTerm) ||
    formation.includes(searchTerm) ||
    notes.includes(searchTerm)
  ) {
    return true;
  }

  // Specific subcategory mappings
  switch (searchTerm) {
    case "power":
      return playName.includes("power") || formation.includes("power");
    case "inside zone":
    case "zone":
      return playName.includes("zone") && !playName.includes("outside");
    case "outside zone":
      return playName.includes("outside") && playName.includes("zone");
    case "sweeps":
      return playName.includes("sweep") || playName.includes("toss");
    case "draws":
      return playName.includes("draw");
    case "counters":
      return playName.includes("counter");
    case "quick game":
      return (
        playName.includes("quick") ||
        playName.includes("slant") ||
        playName.includes("hitch")
      );
    case "intermediate":
      return (
        playName.includes("dig") ||
        playName.includes("comeback") ||
        playName.includes("out")
      );
    case "deep shots":
      return (
        playName.includes("go") ||
        playName.includes("post") ||
        playName.includes("corner")
      );
    case "screens":
      return playName.includes("screen");
    case "crossing routes":
      return playName.includes("cross") || playName.includes("drag");
    case "bubble":
      return playName.includes("bubble");
    case "stick":
      return playName.includes("stick");
    case "slant/flat":
      return playName.includes("slant") || playName.includes("flat");
    case "speed option":
      return playName.includes("speed") && playName.includes("option");
    case "quick slants":
      return playName.includes("slant");
    case "boot":
      return playName.includes("boot");
    case "rollout":
      return playName.includes("roll");
    case "tight end seams":
      return (
        playName.includes("seam") ||
        (playName.includes("tight") && playName.includes("end"))
      );
    case "red zone":
      return (
        notes.includes("red zone") ||
        playName.includes("fade") ||
        playName.includes("corner")
      );
    case "goal line":
      return notes.includes("goal") || playName.includes("goal");
    case "2-minute":
      return notes.includes("2-minute") || notes.includes("hurry");
    case "3rd down":
      return notes.includes("3rd") || notes.includes("third");
    case "4th down":
      return notes.includes("4th") || notes.includes("fourth");
    default:
      return false;
  }
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
