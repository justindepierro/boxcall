-- Temporary disable RLS for data loading
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks DISABLE ROW LEVEL SECURITY; 
ALTER TABLE plays DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS temporarily disabled for data loading! 🎉' as status;
