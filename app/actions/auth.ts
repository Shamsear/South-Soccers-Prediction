'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

/**
 * Server action for user login with username and password
 * Requirements: 1.3 (User login), 1.4 (Invalid credentials error)
 */
export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username and password are required' }
  }

  // Convert username to dummy email format (same as registration)
  const email = `${username.trim().toLowerCase()}@southsoccers.com`

  const supabase = await createServerClient()

  // Call Supabase Auth signInWithPassword using the generated email
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid username or password. Please try again.' }
  }

  if (data.session) {
    // Store the session token in cookies
    const cookieStore = await cookies()
    cookieStore.set('supabase-auth-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Revalidate paths that depend on auth state
    revalidatePath('/', 'layout')
  }

  // Redirect to /matches on successful authentication
  redirect('/matches')
}

/**
 * Server action for user logout
 * Requirements: 1.6 (User logout)
 */
export async function logoutAction() {
  const supabase = await createServerClient()
  const cookieStore = await cookies()

  // Clear the auth token cookie immediately for fast perceived logout
  cookieStore.delete('supabase-auth-token')

  // Supabase signOut can sometimes hang or take a long time.
  // We wrap it in a Promise.race with a 1 second timeout to ensure
  // the user is not left waiting. Even if it times out, the cookie is deleted.
  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Signout timeout')), 1000))
    ])
  } catch (error) {
    console.warn('Supabase signout timed out or failed, but local session cleared')
  }

  // Revalidate and redirect to landing page
  revalidatePath('/', 'layout')
  redirect('/')
}
