/**
 * ImageKit Configuration and Utilities
 * 
 * Handles image uploads to ImageKit CDN for avatar storage.
 */

import ImageKit from 'imagekit'

// Initialize ImageKit instance with error handling
let imagekit: ImageKit

try {
  imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
  })
  console.log('ImageKit initialized successfully')
} catch (error) {
  console.error('Failed to initialize ImageKit:', error)
  throw error
}

/**
 * Upload image to ImageKit
 * @param file - File buffer or base64 string
 * @param fileName - Name for the file
 * @param folder - Folder path in ImageKit (optional)
 * @returns ImageKit upload response with URL
 */
export async function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  folder: string = 'avatars'
) {
  try {
    // Validate ImageKit configuration
    if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
      console.error('ImageKit configuration missing')
      return {
        success: false,
        error: 'ImageKit configuration missing',
      }
    }

    // Convert Buffer or base64 to proper format expected by ImageKit
    let fileData: string
    
    if (Buffer.isBuffer(file)) {
      // Convert Buffer to base64 string
      fileData = file.toString('base64')
    } else if (file.startsWith('data:')) {
      // Extract base64 from data URI
      fileData = file.split(',')[1]
    } else {
      // Already a base64 string
      fileData = file
    }

    console.log('Uploading to ImageKit:', { fileName, folder })

    const result = await imagekit.upload({
      file: fileData,
      fileName,
      folder,
      useUniqueFileName: true,
    })

    console.log('ImageKit upload successful:', { url: result.url, fileId: result.fileId })

    return {
      success: true,
      url: result.url,
      fileId: result.fileId,
      thumbnailUrl: result.thumbnailUrl,
    }
  } catch (error) {
    console.error('ImageKit upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Delete image from ImageKit
 * @param fileId - ImageKit file ID
 */
export async function deleteFromImageKit(fileId: string) {
  try {
    await imagekit.deleteFile(fileId)
    return { success: true }
  } catch (error) {
    console.error('ImageKit delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

/**
 * Get authentication parameters for client-side uploads (deprecated in new SDK)
 * Keep for backward compatibility but note it's not needed with server-side uploads
 */
export function getImageKitAuthParams() {
  // This function is deprecated with the new SDK
  // Client-side uploads should go through the server API route instead
  return {}
}

export default imagekit
