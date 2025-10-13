-- ============================================================================
-- ADD BADGE CUSTOMIZATION TO PERSONNEL CONFIGURATIONS
-- ============================================================================
-- Date: January 13, 2025
-- Purpose: Add badge_customization column to support custom badge styling
--          for personnel configurations
-- ============================================================================

ALTER TABLE personnel_configurations
ADD COLUMN badge_customization JSONB;

-- Add comment explaining the schema
COMMENT ON COLUMN personnel_configurations.badge_customization IS 
'Custom badge styling. Schema: { style: "solid"|"border"|"gradient"|"shiny", colorPresetId: string, fontFamily?: string }';
