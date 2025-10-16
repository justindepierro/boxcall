-- Improve player invitation system with security and data integrity
-- Migration created: 2025-10-16

-- Add expiration and tracking fields
ALTER TABLE team_players 
ADD COLUMN invitation_expires_at TIMESTAMPTZ,
ADD COLUMN invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Set expiration for existing pending invitations (7 days from sent date)
UPDATE team_players
SET invitation_expires_at = invitation_sent_at + INTERVAL '7 days'
WHERE invitation_status = 'pending' 
  AND invitation_sent_at IS NOT NULL
  AND invitation_expires_at IS NULL;

-- Update status constraint to include 'expired' and 'failed'
ALTER TABLE team_players 
DROP CONSTRAINT IF EXISTS team_players_invitation_status_check;

ALTER TABLE team_players
ADD CONSTRAINT team_players_invitation_status_check 
CHECK (invitation_status IN ('not_invited', 'pending', 'accepted', 'declined', 'expired', 'failed'));

-- Create invitation attempts table for rate limiting
CREATE TABLE IF NOT EXISTS invitation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  attempted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT false
);

-- Add indexes for performance
CREATE INDEX idx_invitation_attempts_email_time ON invitation_attempts(email, attempted_at);
CREATE INDEX idx_invitation_attempts_team_time ON invitation_attempts(team_id, attempted_at);
CREATE INDEX idx_team_players_invitation_expires ON team_players(invitation_expires_at) 
  WHERE invitation_status = 'pending';

-- Enable RLS on invitation_attempts
ALTER TABLE invitation_attempts ENABLE ROW LEVEL SECURITY;

-- RLS: Team coaches can view invitation attempts for their team
CREATE POLICY "Team coaches can view invitation attempts" ON invitation_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = invitation_attempts.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- RLS: System can insert invitation attempts (service role)
CREATE POLICY "System can insert invitation attempts" ON invitation_attempts
  FOR INSERT WITH CHECK (true);

-- ========================================
-- ATOMIC INVITATION ACCEPTANCE FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION accept_player_invitation(
  p_token UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_player_record RECORD;
  v_existing_member_id UUID;
BEGIN
  -- Get player info with expiration check
  SELECT * INTO v_player_record
  FROM team_players
  WHERE invitation_token = p_token
    AND invitation_status = 'pending'
    AND (invitation_expires_at IS NULL OR invitation_expires_at > NOW());

  -- Check if invitation is valid
  IF v_player_record IS NULL THEN
    -- Check if it was expired specifically
    SELECT id INTO v_player_record FROM team_players
    WHERE invitation_token = p_token
      AND invitation_status = 'pending'
      AND invitation_expires_at <= NOW()
    LIMIT 1;
    
    IF FOUND THEN
      -- Mark as expired
      UPDATE team_players
      SET invitation_status = 'expired'
      WHERE invitation_token = p_token;
      
      RETURN jsonb_build_object(
        'success', false,
        'error', 'invitation_expired',
        'message', 'This invitation has expired'
      );
    END IF;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_token',
      'message', 'Invalid or already accepted invitation'
    );
  END IF;

  -- Check if user is already a member of this team
  SELECT id INTO v_existing_member_id
  FROM team_members
  WHERE team_id = v_player_record.team_id
    AND user_id = p_user_id;

  IF FOUND THEN
    -- Update player record but don't create duplicate membership
    UPDATE team_players
    SET user_id = p_user_id,
        invitation_status = 'accepted',
        invitation_accepted_at = NOW()
    WHERE invitation_token = p_token;
    
    RETURN jsonb_build_object(
      'success', true,
      'team_id', v_player_record.team_id,
      'player_name', v_player_record.first_name || ' ' || v_player_record.last_name,
      'already_member', true
    );
  END IF;

  -- Step 1: Update team_players with user_id
  UPDATE team_players
  SET user_id = p_user_id,
      invitation_status = 'accepted',
      invitation_accepted_at = NOW()
  WHERE invitation_token = p_token;

  -- Step 2: Create team_members record (CRITICAL!)
  INSERT INTO team_members (
    team_id,
    user_id,
    team_role,
    status,
    capabilities,
    joined_at,
    invited_by
  ) VALUES (
    v_player_record.team_id,
    p_user_id,
    'player',
    'active',
    jsonb_build_object(
      'can_manage_team', false,
      'can_manage_games', false,
      'can_manage_social', false,
      'can_manage_players', false,
      'can_view_analytics', false,
      'can_manage_playbook', false,
      'can_manage_practice', false,
      'can_manage_equipment', false
    ),
    NOW(),
    v_player_record.invited_by
  );

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_player_record.team_id,
    'player_name', v_player_record.first_name || ' ' || v_player_record.last_name,
    'already_member', false
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure
    RAISE WARNING 'Error in accept_player_invitation: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'database_error',
      'message', 'An error occurred while accepting the invitation'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION accept_player_invitation TO authenticated;

-- ========================================
-- UTILITY FUNCTION: Cleanup Expired Invitations
-- ========================================

CREATE OR REPLACE FUNCTION cleanup_expired_invitations() RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Mark expired invitations
  UPDATE team_players
  SET invitation_status = 'expired'
  WHERE invitation_status = 'pending'
    AND invitation_expires_at IS NOT NULL
    AND invitation_expires_at <= NOW();
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role only
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations TO service_role;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON COLUMN team_players.invitation_expires_at IS 'Invitation link expires after 7 days (configurable)';
COMMENT ON COLUMN team_players.invited_by IS 'User (coach) who sent the invitation';
COMMENT ON TABLE invitation_attempts IS 'Rate limiting and audit trail for invitation sends';
COMMENT ON FUNCTION accept_player_invitation IS 'Atomically accepts player invitation, creates team membership, and handles edge cases';
COMMENT ON FUNCTION cleanup_expired_invitations IS 'Batch job to mark expired invitations (run daily via cron)';
