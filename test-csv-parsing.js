/**
 * CSV Parsing Test Suite - Real Coach Scenarios
 *
 * Tests the CSV service with realistic data that coaches might upload
 */

// Test CSV data that coaches might actually upload
const testCases = [
  {
    name: "Standard Football CSV",
    csvData: `Formation,Play Name,Type,Personnel,Notes
I-Formation,Power,Run,21,Basic power running play
Shotgun,Slant,Pass,11,Quick slant route
Pistol,RPO Stick,RPO,11,Read option with stick route`,
  },
  {
    name: "Coach with different column names",
    csvData: `Formation,Play,Category,Package,Description
Gun,4 Verts,Pass,11,Four vertical routes
I-Form,Dive,Run,21,Fullback dive
Wing-T,Sweep,Run,22,Wing sweep to strong side`,
  },
  {
    name: "CSV with spaces and variations",
    csvData: `Formation Name, Play Name , Play Type, Personnel Group, Comments
"Spread", "Bubble Screen", "Pass", "10", "Quick bubble to slot receiver"
"I Formation", "Inside Zone", "Run", "21", "Zone running concept"
"Empty", "Smash", "Pass", "01", "High-low concept"`,
  },
  {
    name: "Mixed case and punctuation",
    csvData: `formation,playName,play_type,personnel,notes
gun spread,4-verts,PASS,11,four vertical routes
i-formation,Power-O,RUN,21,power blocking scheme
pistol,rpo-bubble,RPO,11,bubble screen RPO`,
  },
  {
    name: "Minimal required fields only",
    csvData: `Formation,Play Name,Type
Gun,Slant,Pass
I-Form,Dive,Run
Pistol,Read,RPO`,
  },
  {
    name: "Missing required fields (should show errors)",
    csvData: `Formation,Play Name
Gun,Slant
I-Form,
Pistol,Read Option`,
  },
  {
    name: "Extra fields that should be preserved",
    csvData: `Formation,Play Name,Type,Personnel,One Word,Protection,Direction,Notes
Gun,4 Verts,Pass,11,VERTS,5-Man,Right,Four vertical routes
I-Form,Power,Run,21,POWER,6-Man,Left,Power running play with FB lead`,
  },
  {
    name: "Real coach export (complex)",
    csvData: `Formation,Play Name,Type,Personnel,Audible,Protection,Preferred Down,Distance,Notes
"Gun Spread","Stick Concept","Pass","11","STICK","5-Man Pro","1st","10-15","High percentage completion"
"I-Formation","Power O","Run","21","POWER","6-Man","2nd","3-7","Between the tackles power"
"Pistol","RPO Slant","RPO","11","SLANT","5-Man","1st","8-12","Read linebacker for slant or hand-off"
"Empty","Four Verts","Pass","01","VERTS","Max Pro","3rd","8+","Vertical stretch of coverage"`,
  },
];

// Import the CSV service (simulated for this test)
console.log("🧪 CSV Parsing Intelligence Test Suite");
console.log("=====================================\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log("CSV Data:");
  console.log(testCase.csvData);
  console.log("\n");

  // We'll manually parse this to show what the service should handle
  const lines = testCase.csvData.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  console.log("Detected Headers:", headers);

  // Show what column mapping should detect
  const mappingTests = {
    formation: ["formation", "formation name"],
    play_name: ["play name", "play", "playname"],
    p_type: ["type", "play type", "category", "play_type"],
    personnel: ["personnel", "package", "personnel group"],
    one_word_play: ["audible", "one word"],
    protection: ["protection"],
    notes: ["notes", "comments", "description"],
    pref_down: ["preferred down"],
    pref_dis: ["distance"],
  };

  const detectedMapping = {};
  headers.forEach((header) => {
    const cleanHeader = header.toLowerCase().trim();
    for (const [field, variants] of Object.entries(mappingTests)) {
      if (
        variants.some(
          (variant) =>
            cleanHeader === variant ||
            cleanHeader.includes(variant.replace(" ", "_")) ||
            cleanHeader.includes(variant.replace(" ", ""))
        )
      ) {
        detectedMapping[header] = field;
        break;
      }
    }
  });

  console.log("Expected Column Mapping:", detectedMapping);

  // Parse data rows
  const dataRows = lines.slice(1).map((line, rowIndex) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const rowData = {};
    const errors = [];

    headers.forEach((header, colIndex) => {
      const mappedField = detectedMapping[header] || header.toLowerCase();
      rowData[mappedField] = values[colIndex] || "";
    });

    // Check required fields
    const required = ["formation", "play_name", "p_type"];
    required.forEach((field) => {
      const mappedField =
        detectedMapping[headers.find((h) => detectedMapping[h] === field)];
      if (!rowData[field] && !rowData[mappedField]) {
        errors.push(`Missing ${field}`);
      }
    });

    return {
      rowNumber: rowIndex + 2,
      data: rowData,
      errors,
      isValid: errors.length === 0,
    };
  });

  console.log("Parsed Rows:");
  dataRows.forEach((row) => {
    console.log(
      `  Row ${row.rowNumber}: ${row.isValid ? "✅" : "❌"} ${JSON.stringify(row.data)}`
    );
    if (row.errors.length > 0) {
      console.log(`    Errors: ${row.errors.join(", ")}`);
    }
  });

  console.log(
    `\nSummary: ${dataRows.filter((r) => r.isValid).length}/${dataRows.length} valid rows`
  );
  console.log("─".repeat(60) + "\n");
});

console.log("🎯 Key Issues to Watch For:");
console.log("1. Column name variations (spaces, underscores, case)");
console.log("2. Missing required fields");
console.log("3. Quoted values with commas");
console.log("4. Empty cells");
console.log("5. Extra fields that should be preserved");
console.log("6. Play type normalization");
