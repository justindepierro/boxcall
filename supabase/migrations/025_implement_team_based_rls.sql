-- Migration: 025 - Security Fix
-- Purpose: Prevent data exposure
-- Date: September 23, 2025

-- Secure profiles access
CREATE POLICY "profiles_secure" ON profiles FOR ALL USING (id = auth.uid()::text);

-- Secure team posts access  
CREATE POLICY "team_posts_secure" ON team_posts FOR ALL USING (author_id = auth.uid()::text);
