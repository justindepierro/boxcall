import { supabase } from "../lib/supabase";

// Comprehensive database discovery - finds ALL tables automatically
export async function discoverAllTables() {
  try {
    console.log(
      "[Search/Investigate] Discovering ALL tables in your database..."
    );

    // Get all table names from information_schema
    const { data: tableList, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_type", "BASE TABLE");

    if (tableError) {
      console.log(
        "[Warning] Could not access information_schema, trying manual discovery..."
      );
      return await manualTableDiscovery();
    }

    const allTables = [];

    console.log(
      `[Statistics/Chart] Found ${tableList?.length || 0} tables in your database`
    );

    // For each table, get structure and sample data
    for (const tableInfo of tableList || []) {
      const tableName = tableInfo.table_name;

      try {
        // Get sample data to understand structure
        const { data: sampleData, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (!error) {
          const columns = sampleData?.[0] ? Object.keys(sampleData[0]) : [];

          allTables.push({
            name: tableName,
            columns: columns,
            sample: sampleData?.[0] || null,
            hasData: sampleData && sampleData.length > 0,
          });

          console.log(
            `[Success/Complete] ${tableName}: [${columns.join(", ")}]`
          );
        } else {
          console.log(`[Warning] ${tableName}: Access restricted`);
        }
      } catch {
        console.log(`[Error/Failed] ${tableName}: Not accessible`);
      }
    }

    console.log("[Target] COMPLETE TABLE DISCOVERY:", allTables);
    return allTables;
  } catch (error) {
    console.error("Error in comprehensive discovery:", error);
    return await manualTableDiscovery();
  }
}

// Fallback manual discovery with expanded table list
async function manualTableDiscovery() {
  console.log("� Running manual table discovery...");

  // Expanded list of possible table names
  const possibleTables = [
    // Core tables
    "profiles",
    "users",
    "teams",
    "players",
    "coaches",
    "staff",
    // Game/Competition tables
    "games",
    "matches",
    "seasons",
    "schedule",
    "scores",
    "results",
    // Football-specific tables
    "plays",
    "formations",
    "playbooks",
    "routes",
    "positions",
    "depth_chart",
    // Stats and analytics
    "stats",
    "player_stats",
    "team_stats",
    "game_stats",
    "performance",
    // Practice and training
    "practices",
    "drills",
    "training",
    "attendance",
    "injuries",
    // Administrative
    "team_members",
    "permissions",
    "roles",
    "invitations",
    "notifications",
    // Media and content
    "videos",
    "photos",
    "documents",
    "notes",
    "reports",
    // Settings and config
    "settings",
    "configurations",
    "preferences",
  ];

  const existingTables = [];

  for (const tableName of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);

      if (!error) {
        const columns = data?.[0] ? Object.keys(data[0]) : [];
        existingTables.push({
          name: tableName,
          columns: columns,
          sample: data?.[0] || null,
          hasData: data && data.length > 0,
        });

        console.log(`[Success/Complete] ${tableName}: [${columns.join(", ")}]`);
      }
    } catch {
      // Table doesn't exist
    }
  }

  console.log(
    `[Target] MANUAL DISCOVERY FOUND ${existingTables.length} TABLES:`,
    existingTables
  );
  return existingTables;
}

// Table interface
interface TableInfo {
  name: string;
  [key: string]: unknown;
}

// Generate TypeScript types from discovered tables
export async function generateTypesFromTables(tables: TableInfo[]) {
  console.log("🔧 Generating TypeScript types for your tables...");

  let typesContent = `// Auto-generated types from your Supabase database
// Generated on ${new Date().toISOString()}

export interface Database {
  public: {
    Tables: {
`;

  for (const table of tables) {
    if (table.sample && Object.keys(table.sample).length > 0) {
      typesContent += `      ${table.name}: {
        Row: {
`;

      // Generate types based on sample data
      for (const [key, value] of Object.entries(table.sample)) {
        const type = inferTypeFromValue(value);
        typesContent += `          ${key}: ${type};\n`;
      }

      typesContent += `        };
        Insert: {
`;

      for (const [key, value] of Object.entries(table.sample)) {
        const type = inferTypeFromValue(value);
        const optional =
          key === "id" ||
          key.includes("created_at") ||
          key.includes("updated_at")
            ? "?"
            : "";
        typesContent += `          ${key}${optional}: ${type};\n`;
      }

      typesContent += `        };
        Update: {
`;

      for (const [key, value] of Object.entries(table.sample)) {
        const type = inferTypeFromValue(value);
        typesContent += `          ${key}?: ${type};\n`;
      }

      typesContent += `        };
      };
`;
    }
  }

  typesContent += `    };
  };
}

// Helper types
`;

  for (const table of tables) {
    if (table.sample) {
      const typeName = table.name.charAt(0).toUpperCase() + table.name.slice(1);
      typesContent += `export type ${typeName} = Database['public']['Tables']['${table.name}']['Row'];\n`;
    }
  }

  console.log("📄 Generated TypeScript types:", typesContent);
  return typesContent;
}

function inferTypeFromValue(value: unknown): string {
  if (value === null || value === undefined) return "string | null";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") {
    if (
      value.match(/^\d{4}-\d{2}-\d{2}/) ||
      (value.includes("T") && value.includes("Z"))
    ) {
      return "string"; // timestamp
    }
    return "string";
  }
  if (Array.isArray(value)) return "any[]";
  if (typeof value === "object") return "any";
  return "any";
}

// Quick check for common football tables
export async function checkFootballTables() {
  const footballTables = [
    "profiles",
    "teams",
    "players",
    "coaches",
    "games",
    "plays",
    "formations",
    "playbooks",
    "stats",
    "team_members",
    "positions",
  ];

  const existingTables = [];

  console.log("[Football] Checking for football-specific tables...");

  for (const tableName of footballTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);

      if (!error) {
        const sampleRow = data?.[0];
        existingTables.push({
          name: tableName,
          columns: sampleRow ? Object.keys(sampleRow) : [],
          sample: sampleRow,
          rowCount: data?.length || 0,
        });

        console.log(
          `[Success/Complete] ${tableName}:`,
          sampleRow ? Object.keys(sampleRow).join(", ") : "Empty table"
        );
      }
    } catch {
      // Table doesn't exist or no access
    }
  }

  console.log("🗃️ Your existing football tables:", existingTables);
  return existingTables;
}
