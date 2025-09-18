CREATE OR REPLACE VIEW v_teams_with_details AS
SELECT
    t.id,
    t.name,
    t.school_name AS school,
    -- Placeholder for sport and level, as they are not in the schema
    'football' AS sport,
    'varsity' AS level,
    (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS "memberCount",
    (SELECT p.full_name FROM profiles p JOIN team_members tm ON p.id = tm.user_id WHERE tm.team_id = t.id AND tm.role = 'coach' LIMIT 1) AS "coachName",
    -- Placeholders for isPublic and requiresApproval
    true AS "isPublic",
    false AS "requiresApproval"
FROM
    teams t;
