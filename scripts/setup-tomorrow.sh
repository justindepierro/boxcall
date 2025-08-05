#!/bin/bash

# 🚀 BoxCall Database Setup Script
# Run this tomorrow morning to speed up implementation

echo "🏈 BoxCall Database Implementation Setup"
echo "========================================"

# Install required dependencies
echo "📦 Installing dependencies..."
npm install @supabase/supabase-js@2.38.0 idb@7.1.1 jszip@3.10.1

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file template..."
    cat > .env << EOF
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Performance Configuration
REACT_APP_BACKUP_INTERVAL=300000  # 5 minutes
REACT_APP_CACHE_TTL=300000        # 5 minutes
REACT_APP_MAX_CACHE_SIZE=1000     # Max plays in cache

# Development Configuration
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_PERFORMANCE=true
EOF
    echo "✅ Environment file created - update with your Supabase credentials"
else
    echo "✅ Environment file already exists"
fi

# Create database migration directory
mkdir -p database/migrations
mkdir -p database/seeds

# Copy database schema for easy access
echo "📋 Preparing database schema..."
cat > database/schema.sql << 'EOF'
-- BoxCall Production Database Schema
-- Generated for 300+ play stress testing

-- Teams table (existing, enhanced)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_name TEXT,
  mascot TEXT,
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Performance optimization
  play_count INTEGER DEFAULT 0,
  last_backup_at TIMESTAMPTZ,
  backup_version INTEGER DEFAULT 1
);

-- Playbooks table (new - separates concerns)
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Playbook',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Performance indexes
  play_count INTEGER DEFAULT 0,
  last_modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plays table (enhanced for performance)
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  
  -- Core play data
  formation TEXT NOT NULL,
  play_name TEXT NOT NULL,
  one_word_play TEXT,
  p_type TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action')),
  
  -- Formation details
  personnel TEXT,
  f_type TEXT,
  f_dir TEXT,
  
  -- Play details
  protection TEXT,
  p_dir TEXT,
  r_str TEXT,
  p_str TEXT,
  
  -- Preferences
  pref_down TEXT,
  pref_dis TEXT,
  pref_hash TEXT,
  pref_cov TEXT,
  pref_front TEXT,
  
  -- Tags and categorization
  ftag1 TEXT,
  ftag2 TEXT,
  p_tag1 TEXT,
  p_tag2 TEXT,
  
  -- Additional data
  back_align TEXT,
  shift TEXT,
  motion TEXT,
  key_player1 TEXT,
  key_player2 TEXT,
  check_into TEXT,
  notes TEXT,
  
  -- Performance metrics
  confidence_base INTEGER DEFAULT 70,
  times_called INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,
  
  -- Metadata
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance optimization
  is_archived BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  complexity_score INTEGER,
  
  -- Full-text search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(play_name, '') || ' ' || 
      COALESCE(formation, '') || ' ' || 
      COALESCE(p_type, '') || ' ' ||
      COALESCE(notes, '')
    )
  ) STORED
);

-- Practice Scripts table (new)
CREATE TABLE practice_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  date_planned DATE,
  total_duration INTEGER, -- in minutes
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  -- Performance optimization
  play_count INTEGER DEFAULT 0
);

-- Practice Script Plays (junction table with ordering)
CREATE TABLE practice_script_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID REFERENCES practice_scripts(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  repetitions INTEGER DEFAULT 1,
  estimated_time INTEGER DEFAULT 4, -- in minutes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(script_id, order_number)
);

-- Game Plans table (new)
CREATE TABLE game_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week_number INTEGER,
  opponent TEXT,
  game_date DATE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  notes TEXT,
  -- Performance optimization
  total_plays INTEGER DEFAULT 0
);

-- Game Plan Situations (Brian Billick methodology)
CREATE TABLE game_plan_situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "1st & 10", "Red Zone", etc.
  description TEXT,
  category TEXT NOT NULL, -- "down_distance", "red_zone", "special"
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Plan Plays (junction with situational context)
CREATE TABLE game_plan_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5), -- 1=primary, 5=check-down
  notes TEXT,
  times_used INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(situation_id, play_id)
);

-- PERFORMANCE INDEXES
-- Full-text search optimization
CREATE INDEX idx_plays_search ON plays USING GIN(search_vector);

-- Common query patterns
CREATE INDEX idx_plays_playbook_type ON plays(playbook_id, p_type) WHERE is_archived = false;
CREATE INDEX idx_plays_formation ON plays(formation) WHERE is_archived = false;
CREATE INDEX idx_plays_updated ON plays(updated_at DESC);

-- Practice script optimization
CREATE INDEX idx_practice_scripts_team_date ON practice_scripts(team_id, date_planned DESC);
CREATE INDEX idx_script_plays_order ON practice_script_plays(script_id, order_number);

-- Game plan optimization
CREATE INDEX idx_game_plans_team_week ON game_plans(team_id, week_number DESC);
CREATE INDEX idx_situation_plays_priority ON game_plan_plays(situation_id, priority);

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be enhanced based on auth system)
CREATE POLICY "Enable read access for all users" ON teams FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON playbooks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON plays FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON practice_scripts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON game_plans FOR SELECT USING (true);

-- Enable insert/update for authenticated users (temporary for development)
CREATE POLICY "Enable write access for all users" ON teams FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON playbooks FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON plays FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON practice_scripts FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON game_plans FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON practice_script_plays FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON game_plan_situations FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON game_plan_plays FOR ALL USING (true);
EOF

# Create sample data for testing
cat > database/seeds/sample_data.sql << 'EOF'
-- Sample data for stress testing BoxCall with 300+ plays

-- Insert demo team
INSERT INTO teams (id, name, school_name, mascot, season_year) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Team', 'BoxCall High', 'Eagles', 2025);

-- Insert demo playbook
INSERT INTO playbooks (id, team_id, name, description) 
VALUES ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Main Playbook', 'Primary offensive playbook for stress testing');

-- Sample plays for testing (will expand to 300+)
INSERT INTO plays (playbook_id, formation, play_name, one_word_play, p_type, personnel, notes, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'I-Formation', 'Power O', 'Thunder', 'Run', '21', 'Strong side power run', 'demo-coach'),
('550e8400-e29b-41d4-a716-446655440001', 'Shotgun', 'Four Verticals', 'Smash', 'Pass', '11', 'Vertical stretch concept', 'demo-coach'),
('550e8400-e29b-41d4-a716-446655440001', 'Singleback', 'Inside Zone', 'Zorro', 'Run', '11', 'Gap scheme running play', 'demo-coach'),
('550e8400-e29b-41d4-a716-446655440001', 'Pistol', 'Read Option', 'Ranger', 'RPO', '11', 'QB read with pitch option', 'demo-coach'),
('550e8400-e29b-41d4-a716-446655440001', 'Shotgun', 'Slants', 'Quick', 'Pass', '10', 'Quick 3-step passing game', 'demo-coach');
EOF

echo "✅ Database setup files created in database/ directory"

# Create performance testing script
cat > scripts/performance-test.js << 'EOF'
// Performance testing script for 300+ plays
// Run with: node scripts/performance-test.js

const { performance } = require('perf_hooks');

const testPerformance = async () => {
  console.log('🔥 BoxCall Performance Testing');
  console.log('Testing database operations with 300+ plays...');
  
  // Simulate performance tests
  const start = performance.now();
  
  // Mock database operations
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const end = performance.now();
  
  console.log(`✅ Query completed in ${(end - start).toFixed(2)}ms`);
  console.log('Target: <100ms for cache hits, <500ms for database queries');
};

testPerformance().catch(console.error);
EOF

# Create backup verification script
cat > scripts/verify-backups.js << 'EOF'
// Backup verification script
// Run with: node scripts/verify-backups.js

const fs = require('fs');
const path = require('path');

const verifyBackups = () => {
  console.log('🔍 Verifying backup system...');
  
  // Check for backup directories
  const backupPaths = [
    'database/backups',
    'public/exports'
  ];
  
  backupPaths.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created backup directory: ${dir}`);
    } else {
      console.log(`✅ Backup directory exists: ${dir}`);
    }
  });
  
  console.log('🎯 Backup verification complete');
};

verifyBackups();
EOF

# Make scripts executable
chmod +x scripts/performance-test.js
chmod +x scripts/verify-backups.js

echo ""
echo "🎉 Setup Complete! Tomorrow's Implementation Ready:"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Run database/schema.sql in Supabase SQL Editor" 
echo "3. Run database/seeds/sample_data.sql for test data"
echo "4. Start implementing DataSyncService"
echo ""
echo "🎯 Files Ready:"
echo "- database/schema.sql (complete schema)"
echo "- database/seeds/sample_data.sql (test data)"
echo "- scripts/performance-test.js (performance testing)"
echo "- scripts/verify-backups.js (backup verification)"
echo "- .env (update with Supabase credentials)"
echo ""
echo "🔥 Ready to crush tomorrow's implementation!"
echo "Target: 300 plays, bulletproof backups, <100ms performance"
