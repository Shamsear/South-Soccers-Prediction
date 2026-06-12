/**
 * Avatar Upload API Route
 * 
 * Handles avatar uploads to ImageKit CDN.
 */

import { NextResponse } from 'next/server'
import { uploadToImageKit } from '@/lib/imagekit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('Upload API route called')
    
    const body = await request.json()
    const { file, fileName } = body

    console.log('Received upload request:', { fileName, hasFile: !!file })

    if (!file || !fileName) {
      console.error('Missing file or fileName')
      return NextResponse.json(
        { success: false, error: 'File and fileName are required' },
        { status: 400 }
      )
    }

    // Validate file is base64
    if (!file.startsWith('data:image/')) {
      console.error('Invalid file format')
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

    console.log('Uploading avatar:', { originalFileName: fileName, uniqueFileName })

    // Upload to ImageKit
    const result = await uploadToImageKit(
      base64Data,
      uniqueFileName,
      'avatars'
    )

    if (!result.success) {
      console.error('ImageKit upload failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    console.log('Avatar upload successful:', result.url)

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
