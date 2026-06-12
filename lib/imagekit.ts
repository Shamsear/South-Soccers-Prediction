/**
 * ImageKit Configuration and Utilities
 * 
 * Handles image uploads to ImageKit CDN for avatar storage.
 */

import ImageKit from '@imagekit/nodejs'

// Initialize ImageKit instance
const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
})

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
    // Convert Buffer or base64 to data URI format expected by ImageKit
    let fileData: string
    
    if (Buffer.isBuffer(file)) {
      // Convert Buffer to base64 string with data URI prefix
      fileData = `data:image/jpeg;base64,${file.toString('base64')}`
    } else if (file.startsWith('data:')) {
      // Already a data URI
      fileData = file
    } else {
      // Assume it's a base64 string, add data URI prefix
      fileData = `data:image/jpeg;base64,${file}`
    }

    const result = await imagekit.files.upload({
      file: fileData,
      fileName,
      folder,
      useUniqueFileName: true,
    })

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
    await imagekit.files.delete(fileId)
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
