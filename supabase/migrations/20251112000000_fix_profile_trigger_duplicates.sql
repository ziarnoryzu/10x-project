-- =====================================================
-- Migration: Fix Profile Trigger to Handle Duplicates
-- Created: 2025-11-12 00:00:00 UTC
-- Description: Updates handle_new_user() to safely handle duplicate profile insertions
-- 
-- Changes:
--   - Adds ON CONFLICT clause to prevent errors when profile already exists
--   - Ensures idempotent behavior for the trigger
-- =====================================================

-- =====================================================
-- Function: handle_new_user (Updated)
-- Purpose: Automatically create a profile when a new user registers
-- Change: Added ON CONFLICT DO NOTHING to prevent duplicate key errors
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create a profile for the new user
  -- Uses raw_user_meta_data to get the name from registration form
  -- ON CONFLICT clause prevents errors if profile already exists
  INSERT INTO public.profiles (id, name, preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    '{}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 
  'Trigger function to automatically create a profile entry when a new user registers. Uses SECURITY DEFINER to bypass RLS. Handles duplicates gracefully with ON CONFLICT.';

-- =====================================================
-- Migration Complete
-- 
-- What changed:
-- - Added ON CONFLICT (id) DO NOTHING to prevent primary key violations
-- - Trigger will now silently skip profile creation if one already exists
-- - This makes the trigger idempotent and safe to run multiple times
--
-- Testing:
-- 1. Try registering a new user
-- 2. Check that profile is created: SELECT * FROM profiles WHERE id = '<user_id>';
-- 3. If profile already exists, no error should occur
-- =====================================================
