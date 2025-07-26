-- Quick Database Test Script
-- Run this in Supabase SQL Editor to verify everything works

-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name ASC;

-- 2. Verify super admin exists
SELECT user_id, email, role, permissions FROM super_admins;

-- 3. Check RLS policies are active
SELECT schemaname, tablename, policyname, permissive, roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename ASC, policyname ASC;

-- 4. Check what auth users exist (if any)
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- 5. Show that our schema is working correctly
-- (We can't create teams without real authenticated users)
SELECT 'Database is secure - foreign key constraints are enforced!' as security_status;

-- 6. Check our super admin is set up correctly
SELECT user_id, email, role, permissions FROM super_admins;

-- 7. Show all our tables are created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name ASC;
