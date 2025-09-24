#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAchievementTables() {
  try {
    console.log("🚀 Creating achievement tables...");

    // Create achievement_definitions table
    console.log("📋 Creating achievement_definitions table...");
    const { error: defError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS achievement_definitions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          icon TEXT NOT NULL DEFAULT 'trophy',
          category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('gameplay', 'social', 'teamwork', 'leadership', 'milestone', 'special')),
          trigger_type TEXT NOT NULL CHECK (trigger_type IN ('action_count', 'streak', 'milestone', 'special')),
          trigger_target TEXT NOT NULL,
          trigger_count INTEGER,
          points INTEGER NOT NULL DEFAULT 10,
          rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (defError) {
      console.log('❌ Failed to create achievement_definitions:', defError.message);
    } else {
      console.log('✅ Created achievement_definitions table');
    }

    // Create achievement_progress table
    console.log("📊 Creating achievement_progress table...");
    const { error: progError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS achievement_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
          achievement_id UUID REFERENCES achievement_definitions(id) ON DELETE CASCADE,
          current_count INTEGER NOT NULL DEFAULT 0,
          is_completed BOOLEAN DEFAULT false,
          completed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(player_id, achievement_id)
        );
      `
    });

    if (progError) {
      console.log('❌ Failed to create achievement_progress:', progError.message);
    } else {
      console.log('✅ Created achievement_progress table');
    }

    // Enable RLS
    console.log("🔒 Enabling RLS...");
    await supabase.rpc('exec', { query: 'ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;' });
    await supabase.rpc('exec', { query: 'ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;' });

    // Insert default achievements
    console.log("🏆 Inserting default achievements...");
    const { error: insertError } = await supabase.rpc('exec', {
      query: `
        INSERT INTO achievement_definitions (name, description, icon, category, trigger_type, trigger_target, trigger_count, points, rarity) VALUES
        ('First Play', 'Create your first play in BoxCall', 'football', 'gameplay', 'action_count', 'play_created', 1, 10, 'common'),
        ('Playbook Builder', 'Create 10 plays for your team', 'book', 'gameplay', 'action_count', 'play_created', 10, 25, 'uncommon'),
        ('Master Strategist', 'Create 50 plays for your team', 'crown', 'gameplay', 'action_count', 'play_created', 50, 100, 'rare'),
        ('Team Communicator', 'Send your first team post', 'message-circle', 'social', 'action_count', 'post_sent', 1, 10, 'common'),
        ('Social Butterfly', 'Send 25 team posts', 'users', 'social', 'action_count', 'post_sent', 25, 50, 'uncommon'),
        ('Team Captain', 'Send 100 team posts', 'star', 'social', 'action_count', 'post_sent', 100, 150, 'epic'),
        ('Roster Ready', 'Add your first player to the roster', 'user-plus', 'teamwork', 'action_count', 'player_added', 1, 15, 'common'),
        ('Team Builder', 'Add 10 players to your roster', 'users', 'teamwork', 'action_count', 'player_added', 10, 40, 'uncommon'),
        ('Squad Leader', 'Add 25 players to your roster', 'shield', 'teamwork', 'action_count', 'player_added', 25, 75, 'rare'),
        ('First Victory', 'Win your first game', 'trophy', 'leadership', 'action_count', 'game_won', 1, 50, 'uncommon'),
        ('Undefeated', 'Win 5 games in a row', 'zap', 'leadership', 'streak', 'game_won_streak', 5, 200, 'epic'),
        ('Champion', 'Win 10 games', 'crown', 'leadership', 'action_count', 'game_won', 10, 300, 'legendary'),
        ('Century Club', 'Reach 100 total achievement points', 'target', 'milestone', 'special', 'points_milestone', 100, 100, 'rare'),
        ('Achievement Hunter', 'Earn 25 different achievements', 'award', 'milestone', 'special', 'achievements_earned', 25, 250, 'epic'),
        ('BoxCall Legend', 'Earn 50 different achievements', 'gem', 'milestone', 'special', 'achievements_earned', 50, 500, 'legendary');
      `
    });

    if (insertError) {
      console.log('❌ Failed to insert default achievements:', insertError.message);
    } else {
      console.log('✅ Inserted default achievements');
    }

    console.log("🎯 Achievement system setup complete!");

  } catch (error: any) {
    console.error('❌ Error creating tables:', error.message);
  }
}

createAchievementTables();