-- Migration: Create profiles table with RLS policies
-- Task: 2.1
-- Description: Creates profiles table with one-to-one relationship to auth.users,
--              RLS policies for secure access, indexes for performance,
--              and trigger for automatic profile creation on user signup

-- ============================================================================
-- TABLE: profiles
-- ============================================================================
-- Stores user profile information with one-to-one relationship to auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  correct_predictions INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS to enforce authorization at the database level

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
-- Requirement: 17 (Database Row Level Security)
-- Allows authenticated users to SELECT any profile (needed for leaderboard)
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can update own profile
-- Requirement: 17 (Database Row Level Security)
-- Allows authenticated users to UPDATE only their own profile row
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance optimization for common query patterns

-- Index on username for lookup and uniqueness enforcement
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Index on total_points for leaderboard queries (DESC for ranking)
CREATE INDEX idx_profiles_total_points ON public.profiles(total_points DESC);

-- ============================================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================================
-- Requirement: 1.2 (Profile creation on registration)
-- Automatically creates a profile record when a new user registers
-- Fixed: Added conflict handling to prevent race conditions

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_attempt INTEGER := 0;
  v_max_attempts INTEGER := 10;
BEGIN
  -- Extract username from metadata or generate default
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    'user_' || substring(NEW.id::text, 1, 8)
  );
  
  -- Handle username conflicts with retry logic
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id, 
        username, 
        avatar_url,
        full_name,
        phone_number
      )
      VALUES (
        NEW.id,
        v_username,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone_number'
      );
      
      -- Success - exit loop
      EXIT;
      
    EXCEPTION
      WHEN unique_violation THEN
        -- Username conflict - append attempt number and retry
        v_attempt := v_attempt + 1;
        
        IF v_attempt >= v_max_attempts THEN
          -- Max retries exceeded - use UUID-based username
          v_username := 'user_' || replace(NEW.id::text, '-', '');
          
          -- Final attempt with guaranteed unique username
          INSERT INTO public.profiles (
            id, 
            username, 
            avatar_url,
            full_name,
            phone_number
          )
          VALUES (
            NEW.id,
            v_username,
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'phone_number'
          )
          ON CONFLICT (id) DO NOTHING; -- Prevent duplicate profile
          
          EXIT;
        END IF;
        
        -- Append attempt number to username
        v_username := COALESCE(
          NEW.raw_user_meta_data->>'username', 
          'user_' || substring(NEW.id::text, 1, 8)
        ) || '_' || v_attempt::text;
    END;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger executes AFTER INSERT on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- COMMENTS
-- ============================================================================
-- Add table and column documentation for maintainability

COMMENT ON TABLE public.profiles IS 'User profile information with one-to-one relationship to auth.users. Stores username, avatar, points, and role.';
COMMENT ON COLUMN public.profiles.id IS 'Primary key, foreign key to auth.users(id). One-to-one relationship.';
COMMENT ON COLUMN public.profiles.username IS 'Unique username for display. Auto-generated if not provided during signup.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image stored in Supabase Storage.';
COMMENT ON COLUMN public.profiles.total_points IS 'Total prediction points earned by user. Updated after match scoring.';
COMMENT ON COLUMN public.profiles.correct_predictions IS 'Count of exact scoreline predictions (3-point predictions). Updated after match scoring.';
COMMENT ON COLUMN public.profiles.role IS 'User role: "user" (default) or "admin". Admin role grants access to scoring operations.';
COMMENT ON COLUMN public.profiles.email_notifications_enabled IS 'Whether user has opted in to email notifications.';
