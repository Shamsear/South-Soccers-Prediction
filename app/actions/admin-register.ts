'use server'

/**
 * Admin Registration Action (Bypasses Rate Limits)
 * 
 * Uses Supabase Admin API to create users, which bypasses email rate limits.
 * This should only be used temporarily until email confirmation is properly disabled.
 */

import { createClient } from '@supabase/supabase-js'

export async function adminRegisterUser(formData: {
  username: string
  password: string
  fullName: string
  phoneNumber?: string
  avatarUrl?: string
}) {
  try {
    // Create admin client using service role key (bypasses rate limits)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Generate dummy email from username
    const email = `${formData.username.trim().toLowerCase()}@southsoccers.com`

    // Create user with admin API (no rate limit)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: formData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: formData.username.trim(),
        full_name: formData.fullName.trim(),
        phone_number: formData.phoneNumber || null,
        avatar_url: formData.avatarUrl || null,
      },
    })

    if (error) {
      console.error('Admin registration error:', error)
      
      // Check for duplicate
      if (error.message.includes('already') || error.message.includes('duplicate')) {
        return {
          success: false,
          error: 'This username is already taken. Please choose another one.',
        }
      }
      
      return {
        success: false,
        error: error.message || 'Registration failed',
      }
    }

    console.log('User created successfully via admin API:', data.user?.id)

    return {
      success: true,
      userId: data.user?.id,
    }
  } catch (error) {
    console.error('Unexpected error in admin registration:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
