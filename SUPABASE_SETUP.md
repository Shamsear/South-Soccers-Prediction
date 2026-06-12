# Supabase Setup Documentation

## ✅ Task 1.4 Complete

This document confirms the successful setup of Supabase integration for the South Soccers World Cup 2026 Prediction Platform.

## Configuration Summary

### Environment Variables (.env.local)

All required environment variables have been configured:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public/anonymous key (browser-safe)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only, bypasses RLS)
- ✅ `FOOTBALL_DATA_API_KEY` - Football data API key for match synchronization

### Supabase Project Details

- **Project URL**: https://wdnjbeeuvttjafdcwdgu.supabase.co
- **Region**: Configured during project creation
- **Status**: Active and connected

### Client Utilities

Two Supabase client utilities have been created and tested:

#### 1. Browser Client (`lib/supabase/client.ts`)

Used in Client Components (components with 'use client' directive):

```typescript
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()
  // Use in browser/client components
}
```

#### 2. Server Clients (`lib/supabase/server.ts`)

Two server-side clients for different use cases:

**`createServerClient()` - For Server Components and Server Actions**
- Respects Row Level Security (RLS) policies
- Uses authentication from cookies
- Safe for user-specific operations

```typescript
import { createServerClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('matches').select()
}
```

**`createServiceRoleClient()` - For Admin Operations**
- BYPASSES Row Level Security
- Use only for privileged operations
- Required for bulk data sync and system operations

```typescript
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function syncMatches() {
  const supabase = createServiceRoleClient()
  // Perform admin operations
}
```

## Testing & Verification

- ✅ Environment variables loaded correctly by Next.js
- ✅ Supabase connection verified (anonymous client)
- ✅ Service role connection verified
- ✅ Client utilities tested and working
- ✅ Next.js build successful with Turbopack
- ✅ TypeScript compilation successful

## Next Steps

### Task 2.1: Create Database Schema

Now that Supabase is configured, proceed to create the database schema:

1. **profiles table** - User profiles with RLS policies
2. **matches table** - World Cup match data
3. **predictions table** - User predictions with validation triggers
4. **leaderboard view** - Materialized view for performance

Access your Supabase SQL Editor:
- Dashboard: https://supabase.com/dashboard/project/wdnjbeeuvttjafdcwdgu
- SQL Editor: https://supabase.com/dashboard/project/wdnjbeeuvttjafdcwdgu/sql

### Database Type Generation

After creating the database schema in Task 2.x, generate TypeScript types:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Generate types
supabase gen types typescript --project-id wdnjbeeuvttjafdcwdgu > types/database.ts
```

Alternatively, use the Supabase Dashboard:
- Go to: **Project Settings** → **API** → **Generate Types**

## Security Notes

### Environment Variable Safety

- ✅ `.env.local` is in `.gitignore` - credentials will not be committed
- ⚠️ `NEXT_PUBLIC_*` variables are exposed to the browser - safe for public keys only
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the browser
- ⚠️ Only use service role client in server-side code

### Row Level Security (RLS)

The application relies on PostgreSQL Row Level Security for authorization:

- Users can only view/modify their own data
- RLS policies are enforced at the database level
- Service role client bypasses RLS - use with caution

## Troubleshooting

### If environment variables aren't loading:

1. Ensure `.env.local` is in the project root
2. Restart the Next.js dev server
3. Check for line breaks in JWT tokens (should be single line)
4. Verify no extra spaces around `=` signs

### If Supabase connection fails:

1. Verify project URL in Supabase dashboard
2. Regenerate API keys if needed (Project Settings → API)
3. Check network/firewall settings
4. Verify Supabase project is active (not paused)

### Getting new API keys:

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Project Settings** → **API**
4. Copy the keys from the "Project API keys" section

## Football Data API

The Football Data API key has been configured for match synchronization.

- **API Documentation**: https://www.football-data.org/documentation/quickstart
- **Free tier**: 10 requests per minute
- **Required endpoint**: `/competitions/WC/matches?season=2026`

## Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Next.js + Supabase Guide**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Football Data API**: https://www.football-data.org/documentation

---

**Setup completed**: Task 1.4 ✅  
**Next task**: Task 2.1 - Create profiles table with RLS policies  
**Date**: 2025
