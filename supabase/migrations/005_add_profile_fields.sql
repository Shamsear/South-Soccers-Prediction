-- Migration: Add full_name and phone_number to profiles table
-- Description: Extends profiles table to include user's full name and phone number
--              Updates trigger to handle new fields during registration

-- ============================================================================
-- ALTER TABLE: Add new columns to profiles
-- ============================================================================

-- Add full_name column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add phone_number column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- ============================================================================
-- UPDATE TRIGGER FUNCTION: Handle new fields during user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, phone_number, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.profiles.full_name IS 'User full name/display name collected during registration.';
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number collected during registration (optional).';
