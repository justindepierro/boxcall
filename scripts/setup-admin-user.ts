#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupAdminUser() {
  console.log("🔧 Setting up admin user: justindepierro@gmail.com");

  try {
    // Check if user exists
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("❌ Failed to list users:", listError);
      return;
    }

    const existingUser = users.users.find(
      (u) => u.email === "justindepierro@gmail.com"
    );

    if (existingUser) {
      console.log("✅ User exists, updating password and role...");

      // Update password
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: "MiniCooper2010!",
        }
      );

      if (passwordError) {
        console.error("❌ Failed to update password:", passwordError);
      } else {
        console.log("✅ Password updated successfully");
      }

      // Update profile role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", existingUser.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("❌ Failed to get profile:", profileError);
      } else if (profile) {
        if (profile.role !== "admin") {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ role: "admin" })
            .eq("id", existingUser.id);

          if (updateError) {
            console.error("❌ Failed to update role:", updateError);
          } else {
            console.log("✅ Role updated to admin");
          }
        } else {
          console.log("✅ User already has admin role");
        }
      } else {
        // Create profile if it doesn't exist
        const { error: createError } = await supabase.from("profiles").insert({
          id: existingUser.id,
          email: "justindepierro@gmail.com",
          full_name: "Justin DePierro",
          display_name: "Justin DePierro",
          role: "admin",
        });

        if (createError) {
          console.error("❌ Failed to create profile:", createError);
        } else {
          console.log("✅ Profile created with admin role");
        }
      }
    } else {
      console.log("📝 User does not exist, creating new admin user...");

      // Create new user
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: "justindepierro@gmail.com",
          password: "MiniCooper2010!",
          email_confirm: true,
          user_metadata: { role: "admin" },
        });

      if (createError) {
        console.error("❌ Failed to create user:", createError);
        return;
      }

      if (newUser.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: newUser.user.id,
          email: "justindepierro@gmail.com",
          full_name: "Justin DePierro",
          display_name: "Justin DePierro",
          role: "admin",
        });

        if (profileError) {
          console.error("❌ Failed to create profile:", profileError);
        } else {
          console.log("✅ Admin user created successfully");
        }
      }
    }

    console.log("🎉 Admin user setup complete!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

setupAdminUser();
