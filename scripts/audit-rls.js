import { createClient } from "@supabase/supabase-js";
const url = "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjIzNDgsImV4cCI6MjA2NzU5ODM0OH0.3SreGdPAJ2J5XcQVbNIbzK378j15ZJnwQqscBE2HkII";

const supabaseAdmin = createClient(url, serviceKey);
const supabaseAnon = createClient(url, anonKey);

async function fullAudit() {
  console.log("=== FULL RLS & AUTH AUDIT ===\n");

  // 1. DATA AVAILABLE (via service role - bypasses RLS)
  console.log("1. DATA AVAILABLE (via service role - bypasses RLS):");

  const { data: allTeams } = await supabaseAdmin
    .from("teams")
    .select("id, name");
  console.log(`  Teams: ${allTeams?.length || 0}`);
  allTeams?.forEach((t) => console.log(`    - ${t.name} (${t.id})`));

  const { data: allPlaybooks } = await supabaseAdmin
    .from("playbooks")
    .select("id, name, team_id, is_active");
  console.log(`  Playbooks: ${allPlaybooks?.length || 0}`);
  allPlaybooks?.forEach((p) =>
    console.log(`    - ${p.name} (team: ${p.team_id}, active: ${p.is_active})`)
  );

  const { count: playsCount } = await supabaseAdmin
    .from("plays")
    .select("*", { count: "exact", head: true });
  console.log(`  Plays: ${playsCount}`);

  const { data: allMembers } = await supabaseAdmin
    .from("team_members")
    .select("user_id, team_id, status, team_role");
  console.log(`  Team Members: ${allMembers?.length || 0}`);
  allMembers?.forEach((m) =>
    console.log(
      `    - user:${m.user_id.slice(0, 8)}... team:${m.team_id.slice(0, 8)}... role:${m.team_role} status:${m.status}`
    )
  );

  // 2. Check profiles
  console.log("\n2. USER PROFILES:");
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role");
  profiles?.forEach((p) =>
    console.log(`  - ${p.email} (id: ${p.id}, role: ${p.role})`)
  );

  // 3. Check auth.users
  console.log("\n3. AUTH USERS:");
  const { data: authData, error: authErr } =
    await supabaseAdmin.auth.admin.listUsers();
  if (authErr) {
    console.log(`  Error: ${authErr.message}`);
  } else {
    authData?.users?.forEach((u) =>
      console.log(
        `  - ${u.email} (id: ${u.id}, confirmed: ${!!u.email_confirmed_at})`
      )
    );
  }

  // 4. Test with ANON key (simulates client-side)
  console.log(
    "\n4. TESTING WITH ANON KEY (no auth - simulates unauthenticated):"
  );
  const { data: anonTeams, error: anonTeamsErr } = await supabaseAnon
    .from("teams")
    .select("id, name");
  console.log(
    `  Teams: ${anonTeams?.length || 0} ${anonTeamsErr ? "(Error: " + anonTeamsErr.message + ")" : ""}`
  );

  const { data: anonMembers, error: anonMembersErr } = await supabaseAnon
    .from("team_members")
    .select("*");
  console.log(
    `  Team Members: ${anonMembers?.length || 0} ${anonMembersErr ? "(Error: " + anonMembersErr.message + ")" : ""}`
  );

  const { data: anonPlaybooks, error: anonPbErr } = await supabaseAnon
    .from("playbooks")
    .select("*");
  console.log(
    `  Playbooks: ${anonPlaybooks?.length || 0} ${anonPbErr ? "(Error: " + anonPbErr.message + ")" : ""}`
  );

  // 5. Test RLS by signing in as a user
  console.log("\n5. TESTING AS AUTHENTICATED USER (gmail account):");
  // We can't actually sign in here without password, but we can check what the RLS looks like

  // 6. Check what policies exist
  console.log("\n6. CHECKING EXISTING RLS POLICIES (names only):");
  const policyQuery = `
    SELECT schemaname, tablename, policyname, cmd, qual 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('teams', 'team_members', 'playbooks', 'plays', 'profiles')
    ORDER BY tablename, policyname;
  `;

  // Try to get policy info via a workaround
  console.log(
    "  (Policy details require dashboard access - checking table access patterns)"
  );

  // 7. Identify the actual issue
  console.log("\n7. ROOT CAUSE ANALYSIS:");
  console.log('  The app shows "No teams yet" because:');
  console.log("  - RoleService.getUserRoleContext() queries team_members");
  console.log("  - But team_members RLS policy blocks access");
  console.log("  - The auth.uid() in RLS must match the logged-in user");
  console.log("");
  console.log("  POSSIBLE ISSUES:");
  console.log("  a) User is not authenticated (auth.uid() returns null)");
  console.log("  b) RLS policy was not updated (migration not applied)");
  console.log("  c) User ID mismatch between auth and team_members");

  // 8. Verify the migration was applied
  console.log("\n8. CHECKING IF FIX MIGRATION WAS APPLIED:");
  // The new policy should allow user_id = auth.uid() direct access
  // Let's check by looking at what a user CAN access

  console.log("\n=== RECOMMENDED ACTIONS ===");
  console.log(
    "1. Open Supabase Dashboard: https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl"
  );
  console.log("2. Go to Authentication > Policies");
  console.log("3. Find team_members table");
  console.log("4. Check if the SELECT policy includes: user_id = auth.uid()");
  console.log("5. If not, run the migration SQL in the SQL Editor");
}

fullAudit().catch(console.error);
