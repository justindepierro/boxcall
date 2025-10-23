-- ============================================================================
-- ROLLBACK PERSONNEL SYSTEM MIGRATION
-- ============================================================================
-- Date: October 11, 2025
-- Purpose: Rollback personnel system changes
-- Use: Only if migration 20251011000000_add_personnel_system.sql needs to be undone
-- ============================================================================

-- ===========================================
-- 1. DROP TRIGGERS
-- ===========================================

DROP TRIGGER IF EXISTS personnel_configurations_updated_at ON personnel_configurations;
DROP FUNCTION IF EXISTS update_personnel_configurations_updated_at();
-- ===========================================
-- 2. DROP HELPER FUNCTIONS
-- ===========================================

DROP FUNCTION IF EXISTS get_personnel_configuration_by_name(UUID, TEXT);
DROP FUNCTION IF EXISTS get_personnel_players(UUID);
-- ===========================================
-- 3. DROP TABLES (CASCADE to drop dependent policies)
-- ===========================================

DROP TABLE IF EXISTS personnel_players CASCADE;
DROP TABLE IF EXISTS personnel_configurations CASCADE;
-- ===========================================
-- 4. RESET PLAYS.PERSONNEL COLUMN
-- ===========================================

-- Optional: Reset plays.personnel to NULL
-- (Uncomment if you want to clear the column)
-- UPDATE plays SET personnel = NULL WHERE personnel = '11 Personnel';

-- ===========================================
-- ROLLBACK COMPLETE
-- ===========================================

-- Note: This does NOT restore plays.personnel values that existed before migration.
-- If plays had existing personnel values, they were updated to '11 Personnel'.
-- Manual data restoration required if previous values need to be recovered.;
