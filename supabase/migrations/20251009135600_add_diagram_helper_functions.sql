-- Add helper functions for diagram operations

-- Function to update diagram data and track modifications
CREATE OR REPLACE FUNCTION update_play_diagram(
  p_play_id UUID,
  p_diagram_data JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the diagram data and track the timestamp
  UPDATE plays
  SET 
    diagram_data = p_diagram_data,
    updated_at = NOW()
  WHERE id = p_play_id;
  
  -- Merge the meta.updatedAt timestamp
  UPDATE plays
  SET diagram_data = jsonb_set(
    diagram_data,
    '{meta,updatedAt}',
    to_jsonb(EXTRACT(EPOCH FROM NOW())::bigint * 1000)
  )
  WHERE id = p_play_id;
END;
$$;
-- Function to get play with diagram
CREATE OR REPLACE FUNCTION get_play_with_diagram(p_play_id UUID)
RETURNS TABLE (
  id UUID,
  play_name TEXT,
  formation TEXT,
  p_type TEXT,
  diagram_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.play_name,
    p.formation,
    p.p_type,
    p.diagram_data,
    p.created_at,
    p.updated_at
  FROM plays p
  WHERE p.id = p_play_id;
END;
$$;
-- Function to count players in a diagram
CREATE OR REPLACE FUNCTION count_diagram_players(p_diagram_data JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN jsonb_array_length(p_diagram_data -> 'players');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$;
-- Add a computed column helper (can be used in queries)
COMMENT ON FUNCTION count_diagram_players IS 'Returns the number of players in a diagram';
COMMENT ON FUNCTION update_play_diagram IS 'Updates play diagram data and tracks modification timestamp';
COMMENT ON FUNCTION get_play_with_diagram IS 'Retrieves play with diagram data';
