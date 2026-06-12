# Database Migration Instructions for Profile Fields

## New Fields Added
This migration adds the following fields to user profiles:
- `full_name` - User's full name (TEXT, nullable)
- `phone_number` - User's phone number (TEXT, nullable)

These fields are now collected during registration and can be viewed throughout the app.

## How to Run the Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following migrations in order:
   - `005_add_profile_fields.sql`
   - `006_update_leaderboard_view.sql`

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

## Verification

After running the migrations, verify the changes:

```sql
-- Check profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('full_name', 'phone_number');

-- Check leaderboard view structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leaderboard' 
AND column_name = 'full_name';

-- Test data retrieval
SELECT id, username, full_name, phone_number, avatar_url 
FROM profiles 
LIMIT 5;
```

## What Changed

### 1. Database Schema (`profiles` table)
- Added `full_name TEXT` column
- Added `phone_number TEXT` column
- Updated `handle_new_user()` trigger to populate these fields from user metadata

### 2. Leaderboard View
- Updated materialized view to include `full_name`
- Recreated indexes
- Refreshed the view with new data

### 3. Application Code
- **Registration Form**: Now collects full name, phone number, and profile photo
- **Avatar Upload**: Users can upload profile photos during registration
- **Profile Display**: Full name shown in profile pages
- **Leaderboard**: Can display full name alongside username
- **Type Definitions**: Updated `types/database.ts` with new fields

## Impact on Existing Data

### Existing Users
- Existing users will have `NULL` values for `full_name` and `phone_number`
- They can update these fields in their profile settings
- Avatar URL remains unchanged for existing users

### New Users
- Will provide full name, optional phone, and optional avatar during registration
- All fields stored in user metadata and synced to profiles table via trigger

## Rollback Instructions

If you need to rollback these changes:

```sql
-- Remove columns from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS phone_number;

-- Recreate original leaderboard view (without full_name)
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard;

CREATE MATERIALIZED VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.avatar_url,
  p.total_points,
  p.correct_predictions,
  COUNT(pred.id) AS scored_count,
  RANK() OVER (
    ORDER BY p.total_points DESC, 
             p.correct_predictions DESC, 
             p.username ASC
  ) AS rank
FROM public.profiles p
LEFT JOIN public.predictions pred 
  ON p.id = pred.user_id 
  AND pred.scored_at IS NOT NULL
GROUP BY p.id, p.username, p.avatar_url, p.total_points, p.correct_predictions
ORDER BY rank;

CREATE UNIQUE INDEX idx_leaderboard_id ON public.leaderboard(id);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);
REFRESH MATERIALIZED VIEW public.leaderboard;

-- Revert trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Checklist

After migration, test the following:

- [ ] New user registration with all fields
- [ ] New user registration without optional fields (photo, phone)
- [ ] Avatar upload during registration
- [ ] Profile page displays new fields
- [ ] Leaderboard queries work correctly
- [ ] Existing users can still login
- [ ] Existing users can update their profiles

## Support

If you encounter any issues:
1. Check the Supabase logs for migration errors
2. Verify all migrations ran successfully
3. Check that the trigger function updated correctly
4. Test with a new user registration
