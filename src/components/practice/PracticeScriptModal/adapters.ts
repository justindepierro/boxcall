/**
 * Type Adapters for Practice Script Modal
 *
 * Transforms between Modal types and Service types to maintain separation of concerns
 * and handle type incompatibilities.
 */

import type { PracticeScriptPlay as ModalPlay } from "./types";
import type { AddPlayToPracticeScriptData } from "@services";

// Hash mapping
const mapHash = (hash?: string): "left" | "middle" | "right" => {
  if (hash === "left" || hash === "right") return hash;
  return "middle";
};

// Defensive front mapping
const mapDefensiveFront = (
  front?: string
): "base" | "4-3" | "3-4" | "nickel" | "dime" | "bear" | "tite" => {
  const validFronts = ["base", "4-3", "3-4", "nickel", "dime", "bear", "tite"];
  if (front && validFronts.includes(front)) {
    return front as any;
  }
  return "base";
};

// Coverage mapping
const mapCoverage = (
  coverage?: string
):
  | "cover_0"
  | "cover_1"
  | "cover_2"
  | "cover_3"
  | "cover_4"
  | "cover_6"
  | "quarters"
  | "man" => {
  const coverageMap: Record<string, string> = {
    "Cover 0": "cover_0",
    "Cover 1": "cover_1",
    "Cover 2": "cover_2",
    "Cover 3": "cover_3",
    "Cover 4": "cover_4",
    "Cover 6": "cover_6",
    Quarters: "quarters",
    "Man Coverage": "man",
    Man: "man",
  };

  if (coverage && coverageMap[coverage]) {
    return coverageMap[coverage] as any;
  }

  // Try exact match
  const validCoverages = [
    "cover_0",
    "cover_1",
    "cover_2",
    "cover_3",
    "cover_4",
    "cover_6",
    "quarters",
    "man",
  ];
  if (coverage && validCoverages.includes(coverage)) {
    return coverage as any;
  }

  return "cover_2";
};

// Blitz mapping
const mapBlitz = (
  blitz?: string
):
  | "none"
  | "edge"
  | "a_gap"
  | "b_gap"
  | "sim_pressure"
  | "zone_blitz"
  | "all_out" => {
  const blitzMap: Record<string, string> = {
    None: "none",
    Edge: "edge",
    "A Gap": "a_gap",
    "B Gap": "b_gap",
    "Sim Pressure": "sim_pressure",
    "Zone Blitz": "zone_blitz",
    "All Out": "all_out",
  };

  if (blitz && blitzMap[blitz]) {
    return blitzMap[blitz] as any;
  }

  const validBlitz = [
    "none",
    "edge",
    "a_gap",
    "b_gap",
    "sim_pressure",
    "zone_blitz",
    "all_out",
  ];
  if (blitz && validBlitz.includes(blitz)) {
    return blitz as any;
  }

  return "none";
};

/**
 * Transform modal play data to service format for database save
 */
export const modalPlayToServicePlay = (
  modalPlay: ModalPlay,
  order: number
): AddPlayToPracticeScriptData => {
  if (!modalPlay.playId) {
    throw new Error("Play ID is required to save play to script");
  }

  return {
    scriptId: "", // Will be filled in by caller
    playId: modalPlay.playId,
    orderIndex: order,
    notes: modalPlay.notes,
    repetitions: 5, // Default repetitions
    hash: mapHash(modalPlay.hash),
    downDistance: modalPlay.situation || "1st & 10",
    defensiveFront: mapDefensiveFront(modalPlay.defenseFront),
    coverage: mapCoverage(modalPlay.defensiveCoverage),
    blitz: mapBlitz(modalPlay.blitz),
    scenarioNotes: modalPlay.notes,
  };
};

/**
 * Validate modal play data before transformation
 */
export const validateModalPlay = (play: ModalPlay): string[] => {
  const errors: string[] = [];

  if (!play.playName || !play.playName.trim()) {
    errors.push("Play name is required");
  }

  if (play.playName && play.playName.length > 200) {
    errors.push("Play name must be less than 200 characters");
  }

  // If playId is provided, it must be a valid UUID format
  if (
    play.playId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      play.playId
    )
  ) {
    errors.push("Invalid play ID format");
  }

  return errors;
};

/**
 * Batch validate all plays in a script
 */
export const validateAllPlays = (
  plays: ModalPlay[]
): Record<number, string[]> => {
  const errors: Record<number, string[]> = {};

  plays.forEach((play, index) => {
    const playErrors = validateModalPlay(play);
    if (playErrors.length > 0) {
      errors[index] = playErrors;
    }
  });

  return errors;
};
