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
('550e8400-e29b-41d4-a716-446655440001', 'Shotgun', 'Slants', 'Quick', 'Pass', '10', 'Quick 3-step passing game', 'demo-coach'),
('550e8400-e29b-41d4-a716-446655440001', 'Under Center', 'Play Action Boot', 'Phantom', 'Play Action', '12', 'Play action rollout for QB', 'demo-coach');
