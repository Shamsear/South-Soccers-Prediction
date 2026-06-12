# Create Admin User "shamsear"

There are two ways to create the admin user. Choose the one that works best for you:

---

## ✅ Method 1: Via Supabase Dashboard (Easiest)

### Step 1: Create the User
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wdnjbeeuvttjafdcwdgu
2. Click **Authentication** in the left sidebar
3. Click **Users** tab
4. Click **"Add User"** button (or **"Invite"**)
5. Fill in the form:
   - **Email:** `shamsear@example.com` (or your preferred email)
   - **Password:** (choose a strong password)
   - Click **"Create User"** or **"Send Invite"**
6. **Copy the User ID (UUID)** that appears in the users list

### Step 2: Make the User an Admin
1. In the Supabase Dashboard, click **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Paste this SQL (replace `YOUR_USER_UUID_HERE` with the actual UUID from step 1):

```sql
-- Promote user to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_UUID_HERE';

-- Verify it worked
SELECT 
  p.username,
  u.email,
  p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';
```

4. Click **"Run"**
5. You should see the admin user in the results

### Step 3: Log In
1. Go to `http://localhost:3000/login`
2. Log in with the email and password you set
3. You now have admin access!

---

## ✅ Method 2: Register via App (Alternative)

### Step 1: Register
1. Go to `http://localhost:3000/register`
2. Fill in the registration form:
   - **Username:** `shamsear`
   - **Full Name:** (your choice)
   - **Email:** `shamsear@example.com` (or your preferred email)
   - **Phone:** (optional)
   - **Password:** (choose a strong password)
3. Click **Register**

### Step 2: Promote to Admin
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wdnjbeeuvttjafdcwdgu
2. Click **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Paste this SQL:

```sql
-- Promote user to admin by username
UPDATE public.profiles 
SET role = 'admin' 
WHERE username = 'shamsear';

-- Verify it worked
SELECT 
  p.username,
  u.email,
  p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';
```

5. Click **"Run"**
6. You should see the admin user in the results

### Step 3: Log In
1. Go to `http://localhost:3000/login`
2. Log in with the email and password you registered with
3. You now have admin access!

---

## 🔍 Verify Admin Access

After creating the admin user, verify you have admin access:

1. Log in at `http://localhost:3000/login`
2. Try to visit `http://localhost:3000/admin`
3. If you see the admin dashboard, you're all set! ✅
4. If you get redirected, the admin promotion didn't work

---

## 🐛 Troubleshooting

### "User already exists" error
If you get this error in Method 1, the user was already created. Use this SQL to find them:

```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'shamsear@example.com';
```

Then use the ID in the UPDATE statement from Method 1, Step 2.

### Can't access admin pages
Run this to check if the role was set correctly:

```sql
SELECT 
  p.id,
  p.username,
  u.email,
  p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'shamsear@example.com';
```

If `role` is `'user'` instead of `'admin'`, run the UPDATE statement again.

### Profile not created automatically
If the profile wasn't created (trigger issue), create it manually:

```sql
-- Get the user ID first
SELECT id FROM auth.users WHERE email = 'shamsear@example.com';

-- Then create the profile (replace YOUR_USER_UUID_HERE)
INSERT INTO public.profiles (id, username, role)
VALUES ('YOUR_USER_UUID_HERE', 'shamsear', 'admin');
```

---

## ⚡ Quick SQL Script (All-in-One)

If you know the user already exists, here's a quick all-in-one script:

```sql
-- Find existing user
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID by email
  SELECT id INTO user_id FROM auth.users WHERE email = 'shamsear@example.com';
  
  IF user_id IS NOT NULL THEN
    -- Update profile to admin
    UPDATE public.profiles SET role = 'admin' WHERE id = user_id;
    
    RAISE NOTICE 'User promoted to admin: %', user_id;
  ELSE
    RAISE NOTICE 'User not found with email: shamsear@example.com';
  END IF;
END $$;

-- Verify
SELECT 
  p.username,
  u.email,
  p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'shamsear@example.com';
```

---

## 📋 Next Steps After Creating Admin

Once you have admin access:

1. **Sync Matches:** Go to `http://localhost:3000/admin/matches` and click "Force Sync All Matches"
2. **View Matches:** Check `http://localhost:3000/public-matches` to see if matches loaded
3. **Manage Matches:** Use the admin dashboard to score matches as they finish

That's it! 🎉
