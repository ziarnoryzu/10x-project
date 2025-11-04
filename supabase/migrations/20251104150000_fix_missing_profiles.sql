-- =====================================================
-- Migration: Fix Missing Profiles Function
-- Created: 2025-11-04 15:00:00 UTC
-- Description: Creates a helper function to fix users without profiles
-- 
-- Use Case:
--   - When a profile is manually deleted from database
--   - When migration or data issues cause orphaned auth.users
--   - For manual repair operations
--
-- Usage: SELECT public.fix_missing_profiles();
-- =====================================================

-- =====================================================
-- Function: fix_missing_profiles
-- Purpose: Creates missing profiles for users in auth.users
-- Returns: Number of profiles created
-- =====================================================
CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profiles_created INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Find all users without profiles
  FOR user_record IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Create profile for user
    INSERT INTO public.profiles (id, name, preferences)
    VALUES (
      user_record.id,
      COALESCE(user_record.raw_user_meta_data->>'name', user_record.email),
      '{}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;
    
    profiles_created := profiles_created + 1;
  END LOOP;
  
  RETURN profiles_created;
END;
$$;

COMMENT ON FUNCTION public.fix_missing_profiles IS 
  'Repairs database by creating missing profiles for users in auth.users. Returns count of profiles created.';

-- =====================================================
-- Example Usage:
-- 
-- Check for users without profiles:
-- SELECT au.email, au.id 
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON au.id = p.id
-- WHERE p.id IS NULL;
-- 
-- Fix missing profiles:
-- SELECT public.fix_missing_profiles();
-- 
-- Verify fix:
-- SELECT au.email, p.name, p.id IS NOT NULL as has_profile
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON au.id = p.id;
-- =====================================================

