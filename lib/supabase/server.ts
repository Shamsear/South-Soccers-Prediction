/**
 * Supabase Clients for Server Components and Server Actions
 * 
 * This module provides server-side Supabase clients for different contexts:
 * - Server Components: Use createServerClient()
 * - Server Actions: Use createServerClient()
 * - Admin operations: Use createServiceRoleClient()
 * 
 * These clients run on the server and have access to cookies for authentication.
 */

import { createServerClient as createSSRClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for Server Components and Server Actions.
 * Uses cookies for authentication and respects Row Level Security (RLS) policies.
 * 
 * Usage in Server Components:
 * ```tsx
 * import { createServerClient } from '@/lib/supabase/server'
 * 
 * export default async function MyPage() {
 *   const supabase = await createServerClient()
 *   const { data } = await supabase.from('matches').select()
 *   // ...
 * }
 * ```
 * 
 * Usage in Server Actions:
 * ```tsx
 * 'use server'
 * 
 * import { createServerClient } from '@/lib/supabase/server'
 * 
 * export async function myAction() {
 *   const supabase = await createServerClient()
 *   // ...
 * }
 * ```
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 30, // Persist sessions for 30 days
      },
    }
  )
}

/**
 * Creates a Supabase client with service role privileges.
 * BYPASSES Row Level Security (RLS) policies - use with caution!
 * 
 * Only use this for:
 * - Admin operations that need to bypass RLS
 * - Bulk data operations (match sync)
 * - User profile initialization
 * 
 * Usage:
 * ```tsx
 * import { createServiceRoleClient } from '@/lib/supabase/server'
 * 
 * export async function adminAction() {
 *   const supabase = createServiceRoleClient()
 *   // Verify user is admin first!
 *   // Then perform privileged operations...
 * }
 * ```
 */
export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Creates an anonymous Supabase client for public pages.
 * Does not use authentication - suitable for public data access.
 * Still respects Row Level Security (RLS) policies.
 * 
 * Use this for:
 * - Public pages that don't require authentication
 * - Pages that should work even with expired JWT tokens
 * - Landing pages, public leaderboards, public match lists, etc.
 * 
 * Usage:
 * ```tsx
 * import { createPublicClient } from '@/lib/supabase/server'
 * 
 * export default async function PublicPage() {
 *   const supabase = createPublicClient()
 *   const { data } = await supabase.from('matches').select()
 *   // ...
 * }
 * ```
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
