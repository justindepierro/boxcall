/**
 * Test Enhanced CSV Parsing with New Requirements
 *
 * Tests the new lenient parsing behavior:
 * - Only play_name is required (no red flag without it)
 * - Missing formation/play_type triggers confirmation dialog
 * - Quality warning for plays with less than 5 fields
 * - User preferences integration
 */

const { CSVService } = require("../src/services/csvService");

// Test CSV with various scenarios
const testCSV = `play_name,formation,p_type,personnel,protection,notes
Power O,I-Formation,Run,21,BOB,Great short yardage play
Quick Slant,,Pass,11,6-man,Good vs press coverage
,Shotgun,Pass,11,6-man,Missing play name - should error
Four Verts,Spread,,11,6-man,Missing play type
Sweep,Wing-T,Run,,,Missing personnel and protection
OnlyName,,,,,Only has play name
Deep Post,Shotgun,Pass,11,7-man,Complete play with all fields`;

console.log("Testing Enhanced CSV Parsing...\n");

// Test 1: Parse CSV for preview
console.log("=== Test 1: Parsing CSV for Preview ===");
const parseResult = CSVService.parseCSVForPreview(testCSV);

console.log("Parse Summary:");
console.log(`- Total Rows: ${parseResult.summary.totalRows}`);
console.log(`- Valid Plays: ${parseResult.summary.validPlays}`);
console.log(`- Invalid Plays: ${parseResult.summary.invalidPlays}`);
console.log(`- Warnings: ${parseResult.summary.warnings}`);
console.log(`- Needs Confirmation: ${parseResult.summary.needsConfirmation}`);
console.log(
  `- Confirmation Message: ${parseResult.summary.confirmationMessage || "None"}`
);
console.log(
  `- Quality Warning: ${parseResult.summary.qualityWarning || "None"}`
);

console.log("\nDetailed Play Analysis:");
parseResult.previews.forEach((preview, index) => {
  console.log(`\nPlay ${index + 1} (Row ${preview.rowNumber}):`);
  console.log(`  - Valid: ${preview.isValid}`);
  console.log(`  - Play Name: "${preview.data.play_name}"`);
  console.log(`  - Formation: "${preview.data.formation}"`);
  console.log(`  - Play Type: "${preview.data.p_type}"`);

  if (preview.errors.length > 0) {
    console.log(`  - Errors: ${preview.errors.join(", ")}`);
  }

  if (preview.warnings.length > 0) {
    console.log(`  - Warnings: ${preview.warnings.join(", ")}`);
  }
});

// Test 2: Convert to plays
console.log("\n\n=== Test 2: Converting to Plays ===");
const convertResult = CSVService.convertPreviewsToPlays(
  parseResult.previews,
  "test-playbook-id",
  false // don't force import
);

console.log("Conversion Summary:");
console.log(`- Success: ${convertResult.success}`);
console.log(`- Total Rows: ${convertResult.totalRows}`);
console.log(`- Imported Plays: ${convertResult.importedPlays}`);
console.log(`- Needs Confirmation: ${convertResult.needsConfirmation}`);
console.log(
  `- Confirmation Message: ${convertResult.confirmationMessage || "None"}`
);
console.log(`- Quality Warning: ${convertResult.qualityWarning || "None"}`);

console.log("\nCreated Plays:");
convertResult.plays.forEach((play, index) => {
  console.log(`\nPlay ${index + 1}:`);
  console.log(`  - Name: "${play.play_name}"`);
  console.log(`  - Formation: "${play.formation}"`);
  console.log(`  - Type: "${play.p_type}"`);
  console.log(`  - Personnel: "${play.personnel}"`);
  console.log(`  - Protection: "${play.protection}"`);
});

if (convertResult.errors.length > 0) {
  console.log("\nErrors:");
  convertResult.errors.forEach((error) => console.log(`  - ${error}`));
}

if (convertResult.warnings.length > 0) {
  console.log("\nWarnings:");
  convertResult.warnings.forEach((warning) => console.log(`  - ${warning}`));
}

// Test 3: Force import scenario
console.log("\n\n=== Test 3: Force Import (Skip Confirmations) ===");
const forceResult = CSVService.convertPreviewsToPlays(
  parseResult.previews,
  "test-playbook-id",
  true // force import
);

console.log(
  `Force Import - Needs Confirmation: ${forceResult.needsConfirmation}`
);
console.log(`Force Import - Imported Plays: ${forceResult.importedPlays}`);

console.log("\n=== Test Complete ===");
