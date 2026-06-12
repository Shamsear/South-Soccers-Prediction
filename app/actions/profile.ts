/**
 * Profile Server Actions
 * 
 * Requirements:
 * - 27 (Avatar Upload and Profile Management)
 * - 27.2-27.5 (Avatar upload requirements)
 * - 27.6 (Update username)
 * 
 * Server actions for profile-related operations.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

interface UpdateProfileResult {
  success?: boolean
  error?: string
}

/**
 * Update user profile (username and email notifications)
 */
export async function updateProfile(
  username: string,
  emailNotificationsEnabled: boolean
): Promise<UpdateProfileResult> {
  try {
    const supabase = await createServerClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    // Validate username
    if (!username || username.trim().length < 3 || username.trim().length > 20) {
      return { error: 'Username must be between 3 and 20 characters' }
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username.trim())) {
      return { error: 'Username can only contain letters, numbers, and underscores' }
    }

    // Check username uniqueness
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .neq('id', user.id)
      .maybeSingle()

    if (existingUser) {
      return { error: 'Username is already taken' }
    }

    // Update profile (RLS policies enforce user can only update own profile)
    const { error: updateError } = await (supabase
      .from('profiles') as any)
      .update({
        username: username.trim(),
        email_notifications_enabled: emailNotificationsEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { error: 'Failed to update profile' }
    }

    // Revalidate paths
    revalidatePath('/profile')
    revalidatePath('/leaderboard')

    return { success: true }

  } catch (error) {
    console.error('Unexpected error in updateProfile:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

/**
 * Upload avatar to ImageKit
 */
export async function uploadAvatar(formData: FormData): Promise<UpdateProfileResult> {
  try {
    const supabase = await createServerClient()
    const serviceSupabase = createServiceRoleClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    const file = formData.get('avatar') as File
    
    if (!file || file.size === 0) {
      return { error: 'No file selected' }
    }

    // Validate file type (JPEG, PNG, GIF, WebP)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { error: 'File must be JPEG, PNG, GIF, or WebP' }
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return { error: 'File size must be less than 2MB' }
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${user.id}-${timestamp}-${randomString}.${fileExt}`

    // Upload to ImageKit
    const { uploadToImageKit } = await import('@/lib/imagekit')
    const uploadResult = await uploadToImageKit(base64, fileName, 'avatars')

    if (!uploadResult.success) {
      console.error('ImageKit upload error:', uploadResult.error)
      return { error: 'Failed to upload avatar' }
    }

    // Update profile with avatar URL
    const { error: updateError } = await (serviceSupabase
      .from('profiles') as any)
      .update({
        avatar_url: uploadResult.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { error: 'Failed to update profile with avatar' }
    }

    // Revalidate paths
    revalidatePath('/profile')
    revalidatePath('/leaderboard')

    return { success: true }

  } catch (error) {
    console.error('Unexpected error in uploadAvatar:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}
