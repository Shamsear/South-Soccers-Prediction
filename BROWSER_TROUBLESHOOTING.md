# Browser Troubleshooting Guide

## Issues Fixed

### 1. ✅ SearchParams Promise Issue - FIXED
**Error:** `Route used searchParams.filter. searchParams is a Promise and must be unwrapped`

**Files Fixed:**
- `app/public-matches/page.tsx`
- `app/public-leaderboard/page.tsx`

**Solution Applied:**
Changed from:
```typescript
searchParams: { filter?: string }
const filter = searchParams.filter
```

To:
```typescript
searchParams: Promise<{ filter?: string }>
const params = await searchParams
const filter = params.filter
```

This is required for Next.js 15+ which changed searchParams to be async.

---

## Browser Cache Issues

### Lucide-react Module Error
**Error:** `Module was instantiated but the module factory is not available`

**Cause:** Browser cache serving stale module chunks after updates

**Solutions (in order of preference):**

#### Solution 1: Hard Refresh (Recommended)
1. **Windows/Linux:** Press `Ctrl + Shift + R` or `Ctrl + F5`
2. **Mac:** Press `Cmd + Shift + R`

#### Solution 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

#### Solution 3: Clear All Site Data
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear site data"
4. Refresh the page

#### Solution 4: Incognito/Private Mode
Open the site in an incognito/private window to test without cache

#### Solution 5: Clear Next.js Cache (Development)
```bash
# Delete Next.js cache directories
rm -rf .next
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

---

## Script Tag Warning
**Warning:** `Encountered a script tag while rendering React component`

This is a benign warning from Next.js when rendering. If it persists:
1. Check for any `<script>` tags in components (should use `<Script>` from next/script)
2. Verify third-party scripts are loaded properly

---

## Scroll Behavior Warning
**Warning:** `Detected scroll-behavior: smooth on the <html> element`

To disable smooth scrolling during route transitions, add to your root layout:
```tsx
<html data-scroll-behavior="smooth">
```

---

## Development Server Issues

### If pages still don't load after cache clearing:

1. **Stop the dev server** (Ctrl + C)

2. **Clear all caches:**
```bash
rm -rf .next
rm -rf node_modules/.cache
```

3. **Restart dev server:**
```bash
npm run dev
```

4. **Hard refresh browser** (Ctrl + Shift + R)

---

## Verification Steps

After applying fixes, verify:

1. ✅ Build passes: `npm run build`
2. ✅ Dev server runs: `npm run dev`
3. ✅ All routes accessible
4. ✅ No console errors after hard refresh
5. ✅ Images and icons load properly

---

## Current Status

### ✅ Working Routes
- `/` - Landing page
- `/register` - Registration with avatar upload
- `/login` - Login page
- `/matches` - All matches (authenticated)
- `/matches/[id]` - Match details
- `/my-predictions` - User predictions
- `/profile` - User profile
- `/leaderboard` - Rankings (authenticated)
- `/public-matches` - Public matches view
- `/public-leaderboard` - Public leaderboard
- `/admin` - Admin dashboard
- `/admin/matches` - Match management

### ✅ Build Status
```
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages (16/16)
✓ Finalizing page optimization

Exit Code: 0
```

---

## Prevention

To avoid similar cache issues in the future:

1. **During Development:**
   - Clear cache when switching branches
   - Hard refresh after major dependency updates
   - Use incognito mode for clean testing

2. **After Updates:**
   - Clear `.next` directory
   - Restart dev server
   - Hard refresh browser

3. **Best Practices:**
   - Keep dependencies up to date
   - Use semantic versioning
   - Test in clean browser profiles

---

## Still Having Issues?

If problems persist after trying all solutions:

1. Check Node.js version: `node --version` (should be 18.x or higher)
2. Check npm version: `npm --version`
3. Verify all dependencies installed: `npm install`
4. Check for console errors in DevTools
5. Try a different browser
6. Check system resources (memory, disk space)

---

**Last Updated:** 2026-06-12
**Next.js Version:** 16.2.9
**Status:** All critical issues resolved ✅
