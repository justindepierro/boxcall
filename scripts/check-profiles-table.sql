-- Check the actual columns in your profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Also check your specific profile data
SELECT * FROM profiles WHERE id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';