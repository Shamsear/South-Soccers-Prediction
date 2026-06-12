/**
 * Avatar Upload API Route
 * 
 * Handles avatar uploads to ImageKit CDN.
 */

import { NextResponse } from 'next/server'
import { uploadToImageKit } from '@/lib/imagekit'

export async function POST(request: Request) {
  try {
    const { file, fileName } = await request.json()

    if (!file || !fileName) {
      return NextResponse.json(
        { success: false, error: 'File and fileName are required' },
        { status: 400 }
      )
    }

    // Validate file is base64
    if (!file.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format' },
        { status: 400 }
      )
    }

    // Extract base64 data
    const base64Data = file.split(',')[1]
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const ext = fileName.split('.').pop()
    const uniqueFileName = `avatar-${timestamp}-${randomString}.${ext}`

    // Upload to ImageKit
    const result = await uploadToImageKit(
      base64Data,
      uniqueFileName,
      'avatars'
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}
