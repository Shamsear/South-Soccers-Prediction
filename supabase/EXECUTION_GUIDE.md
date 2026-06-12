# Migration Execution Guide

## Task 2.1: Create profiles table with RLS policies

### Prerequisites

- ✅ Supabase project created and configured
- ✅ Environment variables set up in `.env.local`
- ✅ Supabase dashboard access

### Step-by-Step Instructions

#### Step 1: Access Supabase SQL Editor

1. Open your browser
2. Navigate to: **https://supabase.com/dashboard/project/wdnjbeeuvttjafdcwdgu/sql**
3. You should see the SQL Editor interface

#### Step 2: Execute the Migration

1. **Open the migration file**: `supabase/migrations/001_create_profiles_table.sql`
2. **Copy the entire contents** of the file (Ctrl+A, Ctrl+C)
3. **Paste into the Supabase SQL Editor**
4. **Click "Run"** button (or press Ctrl+Enter)
5. **Wait for execution** - should complete in 1-2 seconds
6. **Check for success** - you should see a success message at the bottom

#### Step 3: Verify the Migration

1. **Option A: Use the verification script**
   - Open `supabase/migrations/001_verify.sql`
   - Copy the contents
   - Paste into SQL Editor
   - Click "Run"
   - Review the output to ensure all components were created

2. **Option B: Manual verification in dashboard**
   - Click on "Table Editor" in the left sidebar
   - You should see the `profiles` table listed
   - Click on the table to view its structure
   - Verify columns: `id`, `username`, `avatar_url`, `total_points`, `correct_predictions`, `role`, `email_notifications_enabled`, `created_at`, `updated_at`

#### Step 4: Test the Trigger (Optional)

To verify the automatic profile creation trigger works:

```sql
-- This will create a test user and automatically create a profile
-- Note: You may need appropriate permissions for this test

-- Check if trigger is active
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND trigger_name = 'on_auth_user_created';
```

**Better test**: Register a new user via your app's authentication flow and verify a profile is automatically created.

### Expected Results

After successful execution, you should have:

1. ✅ **Table**: `public.profiles` with 9 columns
2. ✅ **RLS Policies**:
   - "Users can view all profiles" (SELECT for authenticated users)
   - "Users can update own profile" (UPDATE with auth.uid() check)
3. ✅ **Indexes**:
   - `idx_profiles_username` (for username lookups)
   - `idx_profiles_total_points` (DESC for leaderboard ranking)
4. ✅ **Trigger**: `on_auth_user_created` on `auth.users` table
5. ✅ **Function**: `handle_new_user()` for automatic profile creation

### Troubleshooting

#### Error: "relation auth.users does not exist"

**Solution**: Ensure you're using Supabase Auth. The `auth.users` table is automatically created by Supabase.

#### Error: "permission denied"

**Solution**: Ensure you're logged in as the project owner or have appropriate database permissions.

#### Error: "table profiles already exists"

**Solution**: The migration has already been run. You can:
- Skip this step if the table structure is correct
- Drop and recreate if you need to update the schema:
  ```sql
  DROP TABLE IF EXISTS public.profiles CASCADE;
  ```
  Then run the migration again.

#### Trigger not working

**Check**: Verify the trigger is attached to the correct table:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

If missing, the trigger creation may have failed. Re-run the trigger section of the migration.

### Rollback (If Needed)

If something goes wrong and you need to undo the migration:

```sql
-- Remove trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove table (WARNING: Deletes all data)
DROP TABLE IF EXISTS public.profiles CASCADE;
```

### Next Steps

After successfully completing this migration:

1. ✅ Mark Task 2.1 as complete
2. ➡️ Proceed to Task 2.2: Create matches table
3. 🔄 Update `types/database.ts` with generated types (can be done after all schema migrations)

### Generate TypeScript Types (After all schema is complete)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login
supabase login

# Generate types
supabase gen types typescript --project-id wdnjbeeuvttjafdcwdgu > types/database.ts
```

Or use the Supabase Dashboard:
- **Project Settings** → **API** → **Generate Types**

---

**Migration**: 001_create_profiles_table.sql  
**Task**: 2.1  
**Requirements**: 1.2, 17, 27  
**Status**: Ready for execution ⏳
