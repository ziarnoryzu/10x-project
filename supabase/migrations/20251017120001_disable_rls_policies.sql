-- =====================================================
-- Migration: Disable RLS Policies
-- Created: 2025-10-17 12:00:01 UTC
-- Description: Drops all RLS policies created in the initial schema
-- 
-- Tables Affected:
--   - profiles: Drops all RLS policies
--   - notes: Drops all RLS policies
--   - travel_plans: Drops all RLS policies
--
-- IMPORTANT: This migration removes all access control policies.
-- RLS is still enabled on the tables, but no policies exist,
-- which means authenticated users will have NO access to the data
-- until new policies are created.
-- =====================================================

-- =====================================================
-- Drop RLS Policies: profiles table
-- WARNING: This removes access control for the profiles table
-- =====================================================

drop policy if exists "Authenticated users can view their own profile" on profiles;
drop policy if exists "Authenticated users can update their own profile" on profiles;

-- =====================================================
-- Drop RLS Policies: notes table
-- WARNING: This removes access control for the notes table
-- =====================================================

drop policy if exists "Authenticated users can view their own notes" on notes;
drop policy if exists "Authenticated users can create their own notes" on notes;
drop policy if exists "Authenticated users can update their own notes" on notes;
drop policy if exists "Authenticated users can delete their own notes" on notes;

-- =====================================================
-- Drop RLS Policies: travel_plans table
-- WARNING: This removes access control for the travel_plans table
-- =====================================================

drop policy if exists "Authenticated users can view plans of their own notes" on travel_plans;
drop policy if exists "Authenticated users can create plans for their own notes" on travel_plans;
drop policy if exists "Authenticated users can update plans of their own notes" on travel_plans;
drop policy if exists "Authenticated users can delete plans of their own notes" on travel_plans;

-- =====================================================
-- Disable Row Level Security (RLS) on all tables
-- WARNING: This is for DEVELOPMENT purposes only
-- NEVER disable RLS in production environments
-- =====================================================

-- Disable RLS on profiles table
-- WARNING: This allows unrestricted access to all profile data
alter table profiles disable row level security;

-- Disable RLS on notes table
-- WARNING: This allows unrestricted access to all notes
alter table notes disable row level security;

-- Disable RLS on travel_plans table
-- WARNING: This allows unrestricted access to all travel plans
alter table travel_plans disable row level security;

-- =====================================================
-- SECURITY WARNING
-- 
-- All tables now have NO access control:
-- - Authenticated users can access ALL data
-- - Anonymous users can access ALL data
-- - Any user can read, create, update, and delete ANY row
-- 
-- This configuration should ONLY be used in development.
-- Before deploying to production, create a new migration to:
-- 1. Enable RLS on all tables
-- 2. Create appropriate security policies
-- =====================================================

