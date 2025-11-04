-- =====================================================
-- Migration: Auto-create Profile on User Registration
-- Created: 2025-11-04 12:00:00 UTC
-- Description: Automatically creates a profile entry when a new user registers
-- 
-- Changes:
--   - Creates handle_new_user() function
--   - Creates on_auth_user_created trigger
--   - Adds INSERT policy for profiles table (for future RLS re-enable)
--
-- Security: Uses SECURITY DEFINER to allow profile creation even with RLS enabled
-- =====================================================

-- =====================================================
-- Function: handle_new_user
-- Purpose: Automatically create a profile when a new user registers
-- Trigger: Executes after INSERT on auth.users
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  -- Create a profile for the new user
  -- Uses raw_user_meta_data to get the name from registration form
  insert into public.profiles (id, name, preferences)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    '{}'::jsonb
  );
  return new;
end;
$$;

comment on function public.handle_new_user is 
  'Trigger function to automatically create a profile entry when a new user registers. Uses SECURITY DEFINER to bypass RLS.';

-- =====================================================
-- Trigger: on_auth_user_created
-- Purpose: Execute handle_new_user() after user registration
-- =====================================================
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Note: Cannot add comment to trigger on auth.users due to permission restrictions
-- This trigger automatically creates a profile entry when a new user registers

-- =====================================================
-- RLS Policy: profiles table - INSERT
-- Purpose: Allow users to create their own profile (for manual cases)
-- Note: This policy is created for future use when RLS is re-enabled
--       Currently RLS is disabled in development
-- =====================================================

-- INSERT policy for authenticated users
-- This allows users to insert their own profile if needed (e.g., manual creation)
create policy "Authenticated users can insert their own profile"
  on profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

comment on policy "Authenticated users can insert their own profile" on profiles is 
  'Allows authenticated users to create their own profile entry. Primarily used by the handle_new_user trigger.';

-- =====================================================
-- Migration Complete
-- 
-- What this does:
-- 1. When a new user registers via Supabase Auth (POST /auth/v1/signup)
-- 2. The on_auth_user_created trigger fires automatically
-- 3. A new row is inserted into profiles table with:
--    - id: same as auth.users.id
--    - name: from registration metadata or email as fallback
--    - preferences: empty JSONB object
--
-- Testing:
-- 1. Register a new user via /auth/register
-- 2. Check profiles table: SELECT * FROM profiles WHERE id = '<new_user_id>';
-- 3. Profile should be created automatically
-- =====================================================

