# Avatar Upload Timeout Fixes

## Problem Summary
Users were experiencing timeout errors and ECONNRESET exceptions when registering, even when not uploading an avatar. The errors showed:
- `AbortError: signal is aborted without reason`
- `Upload timed out`
- `ECONNRESET` errors
- Timeout occurring at 10 seconds

## Root Causes Identified

1. **Aggressive Timeout**: 10-second timeout was too short for image uploads, especially for larger files or slower connections
2. **Missing ImageKit Configuration**: ImageKit SDK was initialized with only the private key, missing public key and URL endpoint
3. **Incorrect API Method**: Using `imagekit.files.upload()` instead of `imagekit.upload()` (SDK v7.x change)
4. **No File Size Check**: Avatar upload attempted even when avatarFile was null or empty
5. **Timeout Not Cleared on Error**: If fetch threw an error, timeout wasn't cleared, causing uncaught exceptions

## Fixes Applied

### 1. Extended Timeout (register-form.tsx)
```typescript
// Changed from 10s to 30s to accommodate larger images
const uploadTimeout = setTimeout(() => uploadController.abort(), 30000)
```

### 2. File Existence Check (register-form.tsx)
```typescript
// Only attempt upload if user selected a file with content
if (avatarFile && avatarFile.size > 0) {
  // ... upload logic
}
```

### 3. Better Error Handling (register-form.tsx)
```typescript
try {
  const uploadResponse = await fetch('/api/upload-avatar', {
    // ... fetch config
  })
  clearTimeout(uploadTimeout)
  // ... response handling
} catch (fetchError) {
  clearTimeout(uploadTimeout) // Ensure timeout is cleared even on error
  throw fetchError
}
```

### 4. Fixed ImageKit Configuration (lib/imagekit.ts)
```typescript
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
})
```

### 5. Updated API Methods (lib/imagekit.ts)
```typescript
// Changed from imagekit.files.upload() to imagekit.upload()
const result = await imagekit.upload({
  file: fileData,
  fileName,
  folder,
  useUniqueFileName: true,
})

// Changed from imagekit.files.delete() to imagekit.deleteFile()
await imagekit.deleteFile(fileId)
```

### 6. Added Configuration Validation (lib/imagekit.ts)
```typescript
// Validate ImageKit configuration before attempting upload
if (!process.env.IMAGEKIT_PRIVATE_KEY || 
    !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  return {
    success: false,
    error: 'ImageKit configuration missing',
  }
}
```

### 7. Enhanced Logging (lib/imagekit.ts & route.ts)
Added console logs at key points:
- Before upload attempt
- After successful upload
- On configuration errors
- On upload failures

## Environment Variables Required
Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxx
```

## Existing Protections
The following safeguards were already in place:
- File type validation (JPEG, PNG, GIF, WebP only)
- File size validation (max 2MB)
- Registration continues even if avatar upload fails
- Error messages shown to user without blocking registration

## Testing Recommendations

1. **Test Registration Without Avatar**: Verify no timeout errors occur
2. **Test Registration With Small Avatar (<500KB)**: Should upload quickly
3. **Test Registration With Large Avatar (1.5-2MB)**: Should complete within 30s
4. **Test With Slow Connection**: Verify 30s timeout is sufficient
5. **Test ImageKit Configuration**: Check server logs for configuration errors
6. **Test Failed Upload**: Verify registration completes successfully even if upload fails

## Files Modified

1. `app/register/register-form.tsx` - Fixed timeout, error handling, file size check
2. `lib/imagekit.ts` - Fixed SDK initialization, API methods, added validation
3. `app/api/upload-avatar/route.ts` - Enhanced logging and error messages

## Expected Behavior After Fixes

- ✅ Registration works without avatar upload
- ✅ Avatar uploads complete within 30 seconds for images up to 2MB
- ✅ Timeout is properly cleared on both success and error
- ✅ Configuration errors are logged clearly
- ✅ Upload failures don't block registration
- ✅ No uncaught exceptions or ECONNRESET errors
- ✅ Better error messages for users and developers
