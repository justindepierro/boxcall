-- Data Migration for Role System
-- Generated: 2025-09-29T01:01:28.128Z
-- Purpose: Migrate existing role data to new app_role system


-- Migrate justindepierro@gmail.com
UPDATE profiles 
SET 
  app_role = 'admin',
  is_admin = true,
  subscription_tier = 'premium'
WHERE id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';
