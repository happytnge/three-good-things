-- ⚠️ CRITICAL: This migration makes all existing entries and profiles PUBLIC
-- This is an irreversible change from private journaling to public social network
-- All existing data will be visible to all authenticated users

-- Update Profiles RLS: Allow all authenticated users to view all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- INSERT/UPDATE policies remain unchanged (users can only modify their own profile)

-- Update Entries RLS: Allow all authenticated users to view all entries
DROP POLICY IF EXISTS "Users can view own entries" ON entries;

CREATE POLICY "Anyone can view entries"
  ON entries FOR SELECT TO authenticated
  USING (true);

-- INSERT/UPDATE/DELETE policies remain unchanged (users can only modify their own entries)

-- Add comments
COMMENT ON POLICY "Anyone can view profiles" ON profiles IS 'All authenticated users can view all profiles for social features';
COMMENT ON POLICY "Anyone can view entries" ON entries IS 'All authenticated users can view all entries for public timeline';
