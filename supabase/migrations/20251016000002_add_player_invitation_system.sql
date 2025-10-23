-- Add player invitation system to team_players table
-- Migration created: 2025-10-16

-- Add invitation tracking fields to team_players
ALTER TABLE team_players 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN invitation_token UUID DEFAULT uuid_generate_v4(),
ADD COLUMN invitation_status TEXT DEFAULT 'not_invited' CHECK (invitation_status IN ('not_invited', 'pending', 'accepted', 'declined')),
ADD COLUMN invitation_sent_at TIMESTAMPTZ,
ADD COLUMN invitation_accepted_at TIMESTAMPTZ;
-- Add indexes for invitation queries
CREATE INDEX idx_team_players_invitation_token ON team_players(invitation_token);
CREATE INDEX idx_team_players_user_id ON team_players(user_id);
CREATE INDEX idx_team_players_invitation_status ON team_players(invitation_status);
-- Add comments for documentation
COMMENT ON COLUMN team_players.user_id IS 'Link to auth.users when player accepts invitation';
COMMENT ON COLUMN team_players.invitation_token IS 'Unique token for invitation link';
COMMENT ON COLUMN team_players.invitation_status IS 'Tracks invitation lifecycle: not_invited, pending, accepted, declined';
COMMENT ON COLUMN team_players.invitation_sent_at IS 'Timestamp when invitation was sent';
COMMENT ON COLUMN team_players.invitation_accepted_at IS 'Timestamp when invitation was accepted';
