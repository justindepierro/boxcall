-- =============================================================================
-- MIGRATION 008 STEP 3: PARENT/GUARDIAN COMMUNICATION
-- Parent/Guardian profiles, communication preferences, and family relationships
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- =============================================================================
-- PARENT/GUARDIAN PROFILES - Family Contact Information
-- =============================================================================

CREATE TABLE parent_guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES player_roster(id) ON DELETE CASCADE,
  
  -- Contact Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  
  -- Relationship
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'mother', 'father', 'stepmother', 'stepfather', 'guardian', 
    'grandmother', 'grandfather', 'aunt', 'uncle', 'other'
  )),
  relationship_details TEXT, -- Additional context for 'other'
  is_primary_contact BOOLEAN DEFAULT false, -- Primary contact for emergencies
  is_emergency_contact BOOLEAN DEFAULT true,
  
  -- Address Information
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Communication Preferences
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN (
    'email', 'phone', 'text', 'app_notification'
  )),
  communication_frequency TEXT DEFAULT 'weekly' CHECK (communication_frequency IN (
    'daily', 'weekly', 'biweekly', 'monthly', 'as_needed', 'emergency_only'
  )),
  
  -- Notification Preferences
  notify_practice_changes BOOLEAN DEFAULT true,
  notify_game_updates BOOLEAN DEFAULT true,
  notify_academic_updates BOOLEAN DEFAULT true,
  notify_disciplinary_issues BOOLEAN DEFAULT true,
  notify_injury_reports BOOLEAN DEFAULT true,
  notify_achievements BOOLEAN DEFAULT true,
  
  -- Schedule and Availability
  available_for_volunteering BOOLEAN DEFAULT false,
  volunteer_interests TEXT[], -- 'equipment', 'transportation', 'fundraising', etc.
  pickup_authorized BOOLEAN DEFAULT true, -- Authorized to pick up player
  pickup_restrictions TEXT, -- Special instructions or restrictions
  
  -- Background Information
  occupation TEXT,
  employer TEXT,
  work_schedule_notes TEXT,
  previous_football_experience BOOLEAN DEFAULT false,
  coaching_experience BOOLEAN DEFAULT false,
  
  -- Special Considerations
  language_preferences TEXT[] DEFAULT '{"English"}',
  special_accommodations TEXT,
  custody_arrangements TEXT, -- Important for divorced/separated parents
  court_restrictions TEXT, -- Any legal restrictions on contact
  
  -- Verification Status
  identity_verified BOOLEAN DEFAULT false,
  background_check_date DATE,
  background_check_status TEXT CHECK (background_check_status IN (
    'pending', 'approved', 'denied', 'expired', 'not_required'
  )),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(player_id, email), -- Each parent has unique email per player
  CHECK (phone_primary ~ '^[+]?[0-9\s\-\(\)\.]+$') -- Basic phone format validation
);

-- =============================================================================
-- FAMILY COMMUNICATION LOG - Communication History
-- =============================================================================

CREATE TABLE family_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES player_roster(id) ON DELETE CASCADE,
  parent_guardian_id UUID REFERENCES parent_guardians(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Communication Details
  communication_type TEXT NOT NULL CHECK (communication_type IN (
    'email', 'phone_call', 'text_message', 'in_person', 'app_message', 
    'group_message', 'emergency_notification', 'automated_reminder'
  )),
  subject TEXT NOT NULL,
  message_content TEXT,
  
  -- Sender Information
  sent_by_user_id TEXT NOT NULL, -- Coach or admin who sent message
  sent_by_name TEXT NOT NULL,
  sent_by_role TEXT NOT NULL, -- 'coach', 'admin', 'assistant', etc.
  
  -- Communication Status
  status TEXT DEFAULT 'sent' CHECK (status IN (
    'draft', 'sent', 'delivered', 'read', 'responded', 'bounced', 'failed'
  )),
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN (
    'low', 'normal', 'high', 'urgent', 'emergency'
  )),
  
  -- Response Tracking
  response_requested BOOLEAN DEFAULT false,
  response_deadline DATE,
  response_received BOOLEAN DEFAULT false,
  response_content TEXT,
  response_received_at TIMESTAMPTZ,
  
  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'practice_update', 'game_information', 'academic_update', 'behavioral_issue',
    'injury_report', 'achievement_recognition', 'schedule_change', 'fundraising',
    'volunteering', 'administrative', 'emergency', 'general'
  )),
  tags TEXT[] DEFAULT '{}', -- Additional categorization tags
  
  -- Follow-up Actions
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,
  follow_up_completed BOOLEAN DEFAULT false,
  
  -- External References
  related_practice_id UUID, -- References practice_schedules if applicable
  related_game_id UUID, -- References future game/event tables
  related_incident_id UUID, -- References disciplinary incident tables
  
  -- Delivery Information
  delivery_method TEXT, -- How the message was actually sent
  delivery_timestamp TIMESTAMPTZ,
  delivery_confirmation TEXT, -- Delivery receipt or confirmation number
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FAMILY ENGAGEMENT TRACKING - Participation and Involvement
-- =============================================================================

CREATE TABLE family_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES player_roster(id) ON DELETE CASCADE,
  parent_guardian_id UUID REFERENCES parent_guardians(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Engagement Period
  engagement_period TEXT NOT NULL, -- 'Fall 2024', 'Spring 2025', etc.
  academic_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Attendance Tracking
  games_attended INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  practices_attended INTEGER DEFAULT 0, -- For practices they're allowed to watch
  team_meetings_attended INTEGER DEFAULT 0,
  parent_meetings_attended INTEGER DEFAULT 0,
  
  -- Volunteer Activities
  volunteer_hours INTEGER DEFAULT 0,
  volunteer_activities TEXT[] DEFAULT '{}', -- Types of volunteer work
  fundraising_participation BOOLEAN DEFAULT false,
  fundraising_amount_contributed DECIMAL(10,2) DEFAULT 0.00,
  
  -- Communication Engagement
  emails_opened INTEGER DEFAULT 0,
  emails_responded INTEGER DEFAULT 0,
  app_logins INTEGER DEFAULT 0,
  last_communication_response TIMESTAMPTZ,
  
  -- Event Participation
  team_events_attended INTEGER DEFAULT 0,
  banquets_attended INTEGER DEFAULT 0,
  awards_ceremonies_attended INTEGER DEFAULT 0,
  community_events_participated INTEGER DEFAULT 0,
  
  -- Transportation Support
  provided_transportation BOOLEAN DEFAULT false,
  carpools_organized INTEGER DEFAULT 0,
  away_games_traveled INTEGER DEFAULT 0,
  
  -- Recognition and Feedback
  coach_feedback_rating INTEGER CHECK (coach_feedback_rating BETWEEN 1 AND 5),
  coach_feedback_comments TEXT,
  parent_satisfaction_rating INTEGER CHECK (parent_satisfaction_rating BETWEEN 1 AND 5),
  parent_feedback_comments TEXT,
  
  -- Special Contributions
  special_skills_offered TEXT[], -- Photography, medical, legal, etc.
  equipment_donated TEXT[],
  facility_improvements_supported BOOLEAN DEFAULT false,
  mentoring_activities BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id, parent_guardian_id, engagement_period)
);

-- =============================================================================
-- ROW LEVEL SECURITY - FAMILY COMMUNICATION
-- =============================================================================

-- Enable RLS on family tables
ALTER TABLE parent_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_engagement ENABLE ROW LEVEL SECURITY;

-- Parent/Guardian profiles - Players and parents can read own, coaches can read/write team
CREATE POLICY "parent_guardians_player_read" ON parent_guardians
  FOR SELECT TO authenticated
  USING (
    player_id IN (
      SELECT pr.id FROM player_roster pr
      WHERE pr.user_id = auth.uid()::text
    )
  );

CREATE POLICY "parent_guardians_team_coaches_read" ON parent_guardians
  FOR SELECT TO authenticated
  USING (
    player_id IN (
      SELECT pr.id FROM player_roster pr
      JOIN team_members tm ON pr.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "parent_guardians_coaches_write" ON parent_guardians
  FOR ALL TO authenticated
  USING (
    player_id IN (
      SELECT pr.id FROM player_roster pr
      JOIN team_members tm ON pr.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('coach', 'admin')
    )
  );

-- Family communications - Team coaches can read/write, parents can read own
CREATE POLICY "family_communications_coaches_full" ON family_communications
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "family_communications_parent_read" ON family_communications
  FOR SELECT TO authenticated
  USING (
    parent_guardian_id IN (
      SELECT pg.id FROM parent_guardians pg
      JOIN player_roster pr ON pg.player_id = pr.id
      WHERE pr.user_id = auth.uid()::text
    )
  );

-- Family engagement - Team coaches can read/write, parents can read own
CREATE POLICY "family_engagement_coaches_full" ON family_engagement
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "family_engagement_parent_read" ON family_engagement
  FOR SELECT TO authenticated
  USING (
    parent_guardian_id IN (
      SELECT pg.id FROM parent_guardians pg
      JOIN player_roster pr ON pg.player_id = pr.id
      WHERE pr.user_id = auth.uid()::text
    )
  );

-- =============================================================================
-- BASIC INDEXES - FAMILY COMMUNICATION
-- =============================================================================

-- Parent/Guardian indexes
CREATE INDEX IF NOT EXISTS idx_parent_guardians_player 
  ON parent_guardians(player_id, is_primary_contact);
CREATE INDEX IF NOT EXISTS idx_parent_guardians_contact 
  ON parent_guardians(email, phone_primary);
CREATE INDEX IF NOT EXISTS idx_parent_guardians_emergency 
  ON parent_guardians(is_emergency_contact) WHERE is_emergency_contact = true;

-- Family communications indexes
CREATE INDEX IF NOT EXISTS idx_family_communications_player_date 
  ON family_communications(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_communications_parent_date 
  ON family_communications(parent_guardian_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_communications_category 
  ON family_communications(team_id, category, priority_level);
CREATE INDEX IF NOT EXISTS idx_family_communications_status 
  ON family_communications(status, response_requested) WHERE response_requested = true;

-- Family engagement indexes
CREATE INDEX IF NOT EXISTS idx_family_engagement_period 
  ON family_engagement(engagement_period, academic_year);
CREATE INDEX IF NOT EXISTS idx_family_engagement_team 
  ON family_engagement(team_id, engagement_period);

-- =============================================================================
-- STEP 3 COMPLETION STATUS
-- =============================================================================

-- Migration 008 Step 3: Parent/Guardian Communication System
-- ✅ parent_guardians table with detailed contact and preference information
-- ✅ family_communications table for communication history and tracking
-- ✅ family_engagement table for participation and involvement tracking
-- ✅ Row Level Security policies implemented
-- ✅ Basic indexes created

-- Migration 008 Complete: Enhanced Team Management System
-- ✅ Step 1: Enhanced teams structure with organizations and coaching hierarchy
-- ✅ Step 2: Player roster management with depth charts and eligibility
-- ✅ Step 3: Parent/guardian communication and engagement tracking
