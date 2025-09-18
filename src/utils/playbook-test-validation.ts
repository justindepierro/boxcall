/**
 * Playbook Interface Validation
 * Tests for database integration and functionality
 */

export const validatePlaybookData = (plays: unknown[]) => {
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

  // Test 4: Play Type Variety
  const playTypes = new Set(
    plays.map((p) => (p as Record<string, unknown>).p_type)
  );
  if (playTypes.size > 1) {
    results.hasPlayTypes = true;
  } else {
    results.issues.push("Insufficient play type variety for filtering tests");
  }

  // Overall Validation
  results.validationPassed =
    results.dataLoaded &&
    results.hasValidStructure &&
    results.hasFormations &&
    results.hasPlayTypes &&
    results.playCount >= 3; // Minimum viable dataset

  return results;
};

export const logValidationResults = (
  results: ReturnType<typeof validatePlaybookData>
) => {
// console.info("🏈 Playbook Interface Validation");
// console.info("📊 Data Loading:", results.dataLoaded ? "✅" : "❌");
// console.info("📈 Play Count:", results.playCount);
// console.info("🏗️ Structure Valid:", results.hasValidStructure ? "✅" : "❌");
// console.info("🏟️ Formation Variety:", results.hasFormations ? "✅" : "❌");
// console.info("⚡ Play Type Variety:", results.hasPlayTypes ? "✅" : "❌");
// console.info(
    "🎯 Overall Status:",
    results.validationPassed ? "✅ PASSED" : "❌ FAILED"
  );

  if (results.issues.length > 0) {
// console.info("⚠️ Issues Found");
    results.issues.forEach((issue) => console.warn(issue));
    // end group
  }

  // end group
  return results.validationPassed;
};
