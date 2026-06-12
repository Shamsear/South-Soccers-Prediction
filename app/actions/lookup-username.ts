'use server'

import { createServerClient } from '@/lib/supabase/server'

/**
 * Look up username by phone number
 */
export async function lookupUsernameByPhone(phoneNumber: string) {
  try {
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      return {
        success: false,
        error: 'Please enter a valid phone number',
      }
    }

    const supabase = await createServerClient()

    // Query profiles table for matching phone number
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('phone_number', phoneNumber.trim())
      .single()

    if (error || !profile) {
      return {
        success: false,
        error: 'No account found with this phone number',
      }
    }

    return {
      success: true,
      username: profile.username,
      fullName: profile.full_name,
    }
  } catch (error) {
    console.error('Username lookup error:', error)
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    }
  }
}
