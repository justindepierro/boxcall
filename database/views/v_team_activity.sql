CREATE OR REPLACE VIEW public.v_team_activity AS
SELECT
    a.id,
    a.team_id,
    'announcement' AS type,
    a.title,
    a.content AS description,
    a.created_at AS timestamp,
    'megaphone' AS icon,
    CASE a.priority
        WHEN 'high' THEN 'red'
        WHEN 'medium' THEN 'yellow'
        ELSE 'blue'
    END AS color
FROM
    team_announcements a
UNION ALL
SELECT
    ach.id,
    ach.team_id,
    'achievement' AS type,
    ach.title,
    ach.description,
    ach.created_at AS timestamp,
    'award' AS icon,
    'yellow' AS color
FROM
    achievements ach
UNION ALL
SELECT
    e.id,
    e.team_id,
    'event' AS type,
    e.title,
    e.description,
    e.start_time AS timestamp,
    'calendar' AS icon,
    'purple' AS color
FROM
    events e;