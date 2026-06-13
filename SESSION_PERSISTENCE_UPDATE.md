# Session Persistence Update

## Changes Made

### 1. **Migrated to @supabase/ssr Package**
- Installed `@supabase/ssr` package for proper server-side session management
- Updated `lib/supabase/server.ts` to use `createServerClient` from `@supabase/ssr`
- Updated `lib/supabase/client.ts` to use `createBrowserClient` from `@supabase/ssr`
- This package properly handles cookie-based authentication with automatic refresh

### 2. **Added Middleware for Session Refresh**
- Created `middleware.ts` to automatically refresh user sessions on each request
- This prevents users from being logged out due to expired tokens
- The middleware runs on all routes except static assets

### 3. **Added "Remember Me" Checkbox**
- Added a checkbox to the login form (checked by default)
- Shows "Remember me for 30 days" text
- Enhances user experience by making session persistence explicit

### 4. **Removed Custom Cookie Logic**
- Removed manual cookie management from `auth.ts`
- Supabase SSR package now handles all cookie operations automatically
- Simplified logout action to just call `supabase.auth.signOut()`

## How It Works

### Session Management
1. **Login**: When users log in, Supabase creates a session with access and refresh tokens
2. **Cookie Storage**: The `@supabase/ssr` package automatically stores these tokens in HTTP-only cookies
3. **Auto Refresh**: The middleware intercepts requests and refreshes the session before it expires
4. **Persistent Sessions**: Sessions remain active as long as users interact with the app

### Session Duration
- **Access Token**: Valid for 1 hour (Supabase default)
- **Refresh Token**: Valid for 7-30 days (configurable in Supabase dashboard)
- **Auto Refresh**: Happens automatically through middleware before expiration

## Supabase Dashboard Configuration (Optional)

To extend session duration to 30 days:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Settings**
3. Find **JWT Expiry** settings:
   - **Access Token Expiry**: 3600 seconds (1 hour) - keep as is
   - **Refresh Token Expiry**: 2592000 seconds (30 days) - update if needed
4. Click **Save**

Current default is 604800 seconds (7 days), which is already good for most use cases.

## Benefits

✅ **No More Random Logouts**: Sessions are automatically refreshed
✅ **Better Security**: HTTP-only cookies prevent XSS attacks
✅ **Improved UX**: Users stay logged in across sessions
✅ **Industry Standard**: Uses Supabase's recommended authentication flow
✅ **Mobile Friendly**: Works seamlessly on mobile browsers
✅ **Remember Me Option**: Users have control over session persistence

## Testing

1. Login with "Remember Me" checked
2. Close the browser
3. Reopen the browser and navigate to the app
4. User should still be logged in
5. Session will remain active as long as user visits within the refresh token period

## Migration Notes

- Existing user sessions may be logged out once after deployment
- Users will need to log in again after this update
- New sessions will use the improved persistence mechanism
- No database changes required
