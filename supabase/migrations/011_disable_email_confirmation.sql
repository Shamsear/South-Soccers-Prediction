-- Disable email confirmation requirement
-- This allows users to register and login immediately without confirming their email
-- Useful for internal competitions or when email confirmation is not required

-- IMPORTANT: You MUST disable email confirmation in Supabase Dashboard:
-- 1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/providers
-- 2. Click on "Email" provider
-- 3. Find "Enable email confirmations" toggle
-- 4. Turn it OFF (disable it)
-- 5. Click "Save" button
-- 
-- This setting is at the project level and cannot be changed via SQL migration.
-- Without this change, users will face:
-- - Email rate limit errors during registration
-- - Cannot register multiple users in quick succession
-- - "Rate limit exceeded" errors

-- Additional recommended settings in Supabase Dashboard:
-- Authentication → Settings → Auth settings:
-- - Disable "Enable email confirmations" 
-- - Optionally increase "Rate Limits" for signups if needed

-- For reference, the setting affects:
-- 1. New user registrations (users can login immediately)
-- 2. Email change requests (changes apply immediately)
-- 3. Eliminates email sending rate limits

-- Verify email confirmation is not required by checking auth.users
-- Users should have email_confirmed_at populated automatically on signup
