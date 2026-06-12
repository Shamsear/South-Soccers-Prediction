'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

/**
 * Server action for user login with email and password
 * Requirements: 1.3 (User login), 1.4 (Invalid credentials error)
 */
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createServerClient()

  // Call Supabase Auth signInWithPassword
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    return { error: error.message || 'Invalid credentials. Please try again.' }
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

  await supabase.auth.signOut()
  
  // Clear the auth token cookie
  cookieStore.delete('supabase-auth-token')

  // Revalidate and redirect to landing page
  revalidatePath('/', 'layout')
  redirect('/')
}
