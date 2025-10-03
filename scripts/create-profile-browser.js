/**
 * Browser Console Profile Creation Script
 *
 * HOW TO USE:
 * 1. Make sure you're logged in to BoxCall (in your browser)
 * 2. Open browser console (Cmd+Option+J on Mac, F12 on Windows)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Refresh the page
 *
 * This will create a profile for your currently logged-in user.
 */

(async function createMyProfile() {
  console.log("🔧 Creating your profile...\n");

  // Get Supabase client from window (already initialized by your app)
  const { supabase } = window;

  if (!supabase) {
    console.error("❌ Supabase client not found. Are you on the BoxCall site?");
    return;
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("❌ Not logged in. Please sign in first.");
    return;
  }

  console.log(`👤 Current User: ${user.email}`);
  console.log(`   User ID: ${user.id}\n`);

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (existingProfile) {
    console.log("✅ Profile already exists!");
    console.log("   Full Name:", existingProfile.full_name || "(not set)");
    console.log("   Role:", existingProfile.role || "(not set)");
    console.log("\n💡 Go to Settings → Profile to update your info");
    return;
  }

  // Create profile
  console.log("📝 Creating profile record...");

  const { data: newProfile, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      full_name: "Coach", // You can change this in settings
      role: "coach",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating profile:", error);
    console.log(
      "\n💡 This might be a permissions issue with your database policies."
    );
    return;
  }

  console.log("✅ Profile created successfully!");
  console.log("   Full Name:", newProfile.full_name);
  console.log("   Role:", newProfile.role);
  console.log("\n🎉 Refresh the page to see your data!");
  console.log("💡 Go to Settings → Profile to customize your profile");
})();
