/**
 * Playbook Interface Validation
 * Tests for database integration and functionality
 */

import { debug, warn } from "./logger";

export const validatePlaybookData = (plays: unknown[]) => {
  const isDev = import.meta.env.DEV;
  const results = {
    dataLoaded: false,
    playCount: 0,
    hasValidStructure: false,
    hasFormations: false,
    hasPlayTypes: false,
    validationPassed: false,
    issues: [] as string[],
  };

  // Test 1: Data Loading
  if (!plays || !Array.isArray(plays)) {
    results.issues.push("Plays data is not an array or is null");
    return results;
  }

  results.dataLoaded = true;
  results.playCount = plays.length;

  if (plays.length === 0) {
    results.issues.push("No plays loaded from database");
    return results;
  }

  // Test 2: Data Structure Validation
  const firstPlay = plays[0] as Record<string, unknown>;
  const requiredFields = ["id", "play_name", "formation", "p_type"];
  const missingFields = requiredFields.filter((field) => !firstPlay[field]);

  if (missingFields.length === 0) {
    results.hasValidStructure = true;
  } else {
    results.issues.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Test 3: Formation Variety
  const formations = new Set(
    plays.map((p) => (p as Record<string, unknown>).formation)
  );
  if (formations.size > 1) {
    results.hasFormations = true;
  } else {
    results.issues.push("Insufficient formation variety for filtering tests");
  }

  // Test 4: Play Type Variety (relaxed for development)
  const playTypes = new Set(
    plays.map((p) => (p as Record<string, unknown>).p_type)
  );
  // Allow single play type in development mode, but still check for variety in production
  if (playTypes.size > (isDev ? 0 : 1)) {
    results.hasPlayTypes = true;
  } else {
    results.issues.push(
      isDev
        ? "Play type variety check relaxed for development"
        : "Insufficient play type variety for filtering tests"
    );
  }

  // Overall Validation (relaxed for development)
  results.validationPassed =
    results.dataLoaded &&
    results.hasValidStructure &&
    results.hasFormations &&
    (isDev
      ? results.hasPlayTypes || results.playCount >= 1
      : results.hasPlayTypes) &&
    results.playCount >= (isDev ? 1 : 3); // Minimum viable dataset (relaxed for dev)

  return results;
};

export const logValidationResults = (
  results: ReturnType<typeof validatePlaybookData>
) => {
  debug("🏈 Playbook Interface Validation");
  debug("📊 Data Loading:", results.dataLoaded ? "✅" : "❌");
  debug("📈 Play Count:", results.playCount);
  debug("🏗️ Structure Valid:", results.hasValidStructure ? "✅" : "❌");
  debug("🏟️ Formation Variety:", results.hasFormations ? "✅" : "❌");
  debug("⚡ Play Type Variety:", results.hasPlayTypes ? "✅" : "❌");
  debug(
    "🎯 Overall Status:",
    results.validationPassed ? "✅ PASSED" : "❌ FAILED"
  );

  if (results.issues.length > 0) {
    debug("⚠️ Issues Found");
    results.issues.forEach((issue) => warn(issue));
    // end group
  }

  // end group
  return results.validationPassed;
};
