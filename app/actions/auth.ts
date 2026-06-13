'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Server action for user login with username and password
 * Requirements: 1.3 (User login), 1.4 (Invalid credentials error)
 */
export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const rememberMe = formData.get('rememberMe') === 'true'

  if (!username || !password) {
    return { error: 'Username and password are required' }
  }

  // Convert username to dummy email format (same as registration)
  const email = `${username.trim().toLowerCase()}@southsoccers.com`

  const supabase = await createServerClient()

  // Call Supabase Auth signInWithPassword using the generated email
  // The session will be automatically stored in cookies by @supabase/ssr
  // Session duration is configured in Supabase project settings (default 7 days)
  // The middleware will refresh the session automatically to keep users logged in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid username or password. Please try again.' }
  }

  let redirectUrl = '/dashboard'

  if (data.session) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.session.user.id)
      .single()
      
    if (profile && profile.role === 'admin') {
      redirectUrl = '/admin'
    }

    // Revalidate paths that depend on auth state
    revalidatePath('/', 'layout')
  }

  // Redirect based on role
  redirect(redirectUrl)
}

/**
 * Server action for user logout
 * Requirements: 1.6 (User logout)
 */
export async function logoutAction() {
  const supabase = await createServerClient()

  // Sign out using Supabase - this will clear all session cookies
  await supabase.auth.signOut()

  // Revalidate and redirect to landing page
  revalidatePath('/', 'layout')
  redirect('/')
}
