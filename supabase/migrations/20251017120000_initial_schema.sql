-- =====================================================
-- Migration: Initial Database Schema
-- Created: 2025-10-17 12:00:00 UTC
-- Description: Creates the core tables for the travel planning application
-- 
-- Tables Created:
--   - profiles: User profile information
--   - notes: Travel notes created by users
--   - travel_plans: AI-generated travel plans based on notes
--
-- Security: Row Level Security (RLS) enabled on all tables
-- Relationships: CASCADE delete configured for data integrity
-- =====================================================

-- =====================================================
-- Table: profiles
-- Purpose: Store public user profile data
-- Relationship: One-to-one with auth.users
-- =====================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add comment to profiles table
comment on table profiles is 'User profile information including name and travel preferences';
comment on column profiles.id is 'User ID, references auth.users(id)';
comment on column profiles.name is 'Display name of the user';
comment on column profiles.preferences is 'JSON object storing user travel preferences (e.g., style, interests)';
comment on column profiles.created_at is 'Timestamp when profile was created';
comment on column profiles.updated_at is 'Timestamp when profile was last updated';

-- =====================================================
-- Table: notes
-- Purpose: Store travel notes created by users
-- Relationship: Many-to-one with auth.users
-- =====================================================
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add comment to notes table
comment on table notes is 'Travel notes created by users';
comment on column notes.id is 'Unique identifier for the note';
comment on column notes.user_id is 'Owner of the note, references auth.users(id)';
comment on column notes.title is 'Title of the travel note';
comment on column notes.content is 'Content/body of the travel note';
comment on column notes.created_at is 'Timestamp when note was created';
comment on column notes.updated_at is 'Timestamp when note was last updated';

-- =====================================================
-- Table: travel_plans
-- Purpose: Store AI-generated travel plans
-- Relationship: One-to-one with notes
-- =====================================================
create table travel_plans (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null unique references notes(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add comment to travel_plans table
comment on table travel_plans is 'AI-generated travel plans based on user notes';
comment on column travel_plans.id is 'Unique identifier for the travel plan';
comment on column travel_plans.note_id is 'Associated note, references notes(id). Each note can have at most one plan';
comment on column travel_plans.content is 'JSON object storing the generated travel plan content';
comment on column travel_plans.created_at is 'Timestamp when plan was created';
comment on column travel_plans.updated_at is 'Timestamp when plan was last updated';

-- =====================================================
-- Indexes
-- Purpose: Improve query performance
-- =====================================================

-- Index on notes.user_id to speed up queries for user's notes
create index idx_notes_user_id on notes(user_id);
comment on index idx_notes_user_id is 'Speeds up queries filtering notes by user_id';

-- Note: Indexes on primary keys and unique constraints are created automatically
-- - profiles.id (PRIMARY KEY)
-- - notes.id (PRIMARY KEY)
-- - travel_plans.id (PRIMARY KEY)
-- - travel_plans.note_id (UNIQUE)

-- =====================================================
-- Function: update_updated_at_column
-- Purpose: Automatically update updated_at timestamp on row modification
-- =====================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

comment on function update_updated_at_column is 'Trigger function to automatically set updated_at to current timestamp';

-- =====================================================
-- Triggers: Auto-update updated_at columns
-- Purpose: Ensure updated_at is always current on modifications
-- =====================================================

-- Trigger for profiles table
create trigger set_updated_at_profiles
  before update on profiles
  for each row
  execute function update_updated_at_column();

comment on trigger set_updated_at_profiles on profiles is 'Automatically updates updated_at column when profile is modified';

-- Trigger for notes table
create trigger set_updated_at_notes
  before update on notes
  for each row
  execute function update_updated_at_column();

comment on trigger set_updated_at_notes on notes is 'Automatically updates updated_at column when note is modified';

-- Trigger for travel_plans table
create trigger set_updated_at_travel_plans
  before update on travel_plans
  for each row
  execute function update_updated_at_column();

comment on trigger set_updated_at_travel_plans on travel_plans is 'Automatically updates updated_at column when travel plan is modified';

-- =====================================================
-- Row Level Security (RLS): Enable on all tables
-- Purpose: Ensure data access is controlled at the database level
-- =====================================================

alter table profiles enable row level security;
alter table notes enable row level security;
alter table travel_plans enable row level security;

-- =====================================================
-- RLS Policies: profiles table
-- Purpose: Users can only view and update their own profile
-- =====================================================

-- SELECT policy for authenticated users
create policy "Authenticated users can view their own profile"
  on profiles
  for select
  to authenticated
  using (auth.uid() = id);

comment on policy "Authenticated users can view their own profile" on profiles is 
  'Allows authenticated users to read their own profile data only';

-- UPDATE policy for authenticated users
create policy "Authenticated users can update their own profile"
  on profiles
  for update
  to authenticated
  using (auth.uid() = id);

comment on policy "Authenticated users can update their own profile" on profiles is 
  'Allows authenticated users to modify their own profile data only';

-- =====================================================
-- RLS Policies: notes table
-- Purpose: Users can manage (CRUD) their own notes only
-- =====================================================

-- SELECT policy for authenticated users
create policy "Authenticated users can view their own notes"
  on notes
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on policy "Authenticated users can view their own notes" on notes is 
  'Allows authenticated users to read only their own notes';

-- INSERT policy for authenticated users
create policy "Authenticated users can create their own notes"
  on notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on policy "Authenticated users can create their own notes" on notes is 
  'Allows authenticated users to create notes where they are the owner';

-- UPDATE policy for authenticated users
create policy "Authenticated users can update their own notes"
  on notes
  for update
  to authenticated
  using (auth.uid() = user_id);

comment on policy "Authenticated users can update their own notes" on notes is 
  'Allows authenticated users to modify only their own notes';

-- DELETE policy for authenticated users
create policy "Authenticated users can delete their own notes"
  on notes
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on policy "Authenticated users can delete their own notes" on notes is 
  'Allows authenticated users to delete only their own notes';

-- =====================================================
-- RLS Policies: travel_plans table
-- Purpose: Users can manage travel plans for their own notes
-- Rationale: Access is determined by ownership of the associated note
-- =====================================================

-- SELECT policy for authenticated users
create policy "Authenticated users can view plans of their own notes"
  on travel_plans
  for select
  to authenticated
  using (
    exists (
      select 1 
      from notes 
      where notes.id = travel_plans.note_id 
        and notes.user_id = auth.uid()
    )
  );

comment on policy "Authenticated users can view plans of their own notes" on travel_plans is 
  'Allows authenticated users to read travel plans associated with their own notes';

-- INSERT policy for authenticated users
create policy "Authenticated users can create plans for their own notes"
  on travel_plans
  for insert
  to authenticated
  with check (
    exists (
      select 1 
      from notes 
      where notes.id = travel_plans.note_id 
        and notes.user_id = auth.uid()
    )
  );

comment on policy "Authenticated users can create plans for their own notes" on travel_plans is 
  'Allows authenticated users to create travel plans for their own notes only';

-- UPDATE policy for authenticated users
create policy "Authenticated users can update plans of their own notes"
  on travel_plans
  for update
  to authenticated
  using (
    exists (
      select 1 
      from notes 
      where notes.id = travel_plans.note_id 
        and notes.user_id = auth.uid()
    )
  );

comment on policy "Authenticated users can update plans of their own notes" on travel_plans is 
  'Allows authenticated users to modify travel plans associated with their own notes';

-- DELETE policy for authenticated users
create policy "Authenticated users can delete plans of their own notes"
  on travel_plans
  for delete
  to authenticated
  using (
    exists (
      select 1 
      from notes 
      where notes.id = travel_plans.note_id 
        and notes.user_id = auth.uid()
    )
  );

comment on policy "Authenticated users can delete plans of their own notes" on travel_plans is 
  'Allows authenticated users to delete travel plans associated with their own notes';

