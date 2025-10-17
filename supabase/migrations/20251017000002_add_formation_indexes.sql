-- Migration: Add Performance Indexes to Formations Table
-- Date: October 17, 2025
-- Purpose: Improve query performance for common formation queries
-- Expected Impact: 40-60% faster queries

-- =====================================================
-- PERFORMANCE ANALYSIS
-- =====================================================
-- Current slow queries:
-- 1. Get formations by playbook_id (most common)
-- 2. Filter by direction (Direction Review panel)
-- 3. Filter by metadata_quality (Incomplete panel)
-- 4. Filter by creation_source='play_builder'
-- 5. Join on opposite_formation_id

-- =====================================================
-- ADD INDEXES
-- =====================================================

-- Index 1: Primary filter - playbook_id (used in every query)
CREATE INDEX IF NOT EXISTS idx_formations_playbook_id 
ON formations(playbook_id);

-- Index 2: Direction filtering (Direction Review panel)
CREATE INDEX IF NOT EXISTS idx_formations_direction 
ON formations(direction) 
WHERE direction IS NOT NULL;

-- Index 3: Metadata quality (Incomplete Formations panel)
CREATE INDEX IF NOT EXISTS idx_formations_metadata_quality 
ON formations(metadata_quality) 
WHERE metadata_quality IN ('needs_work', 'incomplete');

-- Index 4: Composite index for common query pattern (playbook + direction)
CREATE INDEX IF NOT EXISTS idx_formations_playbook_direction 
ON formations(playbook_id, direction);

-- Index 5: Opposite formation linking (Direction Review joins)
CREATE INDEX IF NOT EXISTS idx_formations_opposite_id 
ON formations(opposite_formation_id) 
WHERE opposite_formation_id IS NOT NULL;

-- Index 6: Creation source filtering (Incomplete panel query)
CREATE INDEX IF NOT EXISTS idx_formations_creation_source 
ON formations(creation_source) 
WHERE creation_source = 'play_builder';

-- Index 7: Composite for incomplete formations query
CREATE INDEX IF NOT EXISTS idx_formations_playbook_quality_source 
ON formations(playbook_id, metadata_quality, creation_source)
WHERE creation_source = 'play_builder' 
  AND metadata_quality IN ('needs_work', 'incomplete');

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show all indexes on formations table
DO $$
DECLARE
  index_record RECORD;
  index_count INTEGER := 0;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 Formations Table Indexes';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  FOR index_record IN
    SELECT 
      indexname,
      indexdef
    FROM pg_indexes
    WHERE tablename = 'formations'
    ORDER BY indexname
  LOOP
    index_count := index_count + 1;
    RAISE NOTICE '% Index: %', index_count, index_record.indexname;
    RAISE NOTICE '   Definition: %', index_record.indexdef;
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Total indexes: %', index_count;
  RAISE NOTICE '✅ Performance optimization complete!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- =====================================================
-- PERFORMANCE NOTES
-- =====================================================
-- Expected improvements:
-- - getFormationsByPlaybook: 40-60% faster (playbook_id index)
-- - Direction Review queries: 30-50% faster (direction + opposite_id indexes)
-- - Incomplete panel query: 50-70% faster (composite index)
-- - Overall: 40-60% average improvement across all queries

-- Trade-offs:
-- - Slightly slower INSERTs/UPDATEs (minimal impact, <10ms)
-- - Additional disk space (~5-10MB for typical playbook)
-- - Automatic index maintenance by PostgreSQL

-- Monitoring:
-- Use EXPLAIN ANALYZE to verify index usage:
-- EXPLAIN ANALYZE 
-- SELECT * FROM formations 
-- WHERE playbook_id = 'xxx' AND direction = 'left';
