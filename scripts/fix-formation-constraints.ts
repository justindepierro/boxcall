/**
 * Fix Formation Constraints
 *
 * Drops old formation constraints that are preventing new formations from being created
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables");
  console.error("Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixConstraints() {
  console.log("🔧 Fixing Formation Constraints\n");
  console.log("=".repeat(70));

  const sql = `
    -- Drop old constraint that requires variants to have base_formation_id
    ALTER TABLE formations
    DROP CONSTRAINT IF EXISTS formations_variants_have_parent CASCADE;

    -- Drop old constraint about base formations
    ALTER TABLE formations
    DROP CONSTRAINT IF EXISTS formations_base_has_no_parent CASCADE;

    -- Drop old unique index for variants per base
    DROP INDEX IF EXISTS idx_formations_unique_variant CASCADE;

    -- Drop old unique index for base formation names
    DROP INDEX IF EXISTS idx_formations_unique_base_name CASCADE;

    SELECT '✅ Constraints dropped successfully' as result;
  `;

  try {
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      console.error("❌ Error:", error);

      // Try alternative approach - direct query
      console.log("\n Trying direct SQL execution...");
      const { error: directError } = await supabase
        .from("formations")
        .select("id")
        .limit(1);

      if (directError) {
        console.error("❌ Cannot access database:", directError);
      } else {
        console.log("✅ Database accessible, but exec_sql RPC not available");
        console.log("\n📝 Manual Fix Required:");
        console.log("   Run this SQL in your Supabase SQL Editor:\n");
        console.log(sql);
      }
    } else {
      console.log("✅ Success!", data);
    }
  } catch (err) {
    console.error("❌ Exception:", err);
    console.log("\n📝 Manual Fix Required:");
    console.log("   Go to your Supabase dashboard → SQL Editor");
    console.log("   Run this SQL:\n");
    console.log(sql);
  }

  console.log("\n" + "=".repeat(70));
}

fixConstraints()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
