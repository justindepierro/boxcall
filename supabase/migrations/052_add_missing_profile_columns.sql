-- Add missing columns to profiles table to match schema.sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS jersey_number INTEGER,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS height_inches INTEGER,
ADD COLUMN IF NOT EXISTS weight_lbs INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "social": true}',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing profiles to have proper role
UPDATE profiles SET role = 'admin' WHERE id = '06f06a5e-92d2-41a7-8022-d1253449a502';
UPDATE profiles SET role = 'player' WHERE role IS NULL;
