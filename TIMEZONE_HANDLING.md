# Timezone Handling Documentation

## Overview

All match times and dates in the application are automatically converted to the user's device timezone. This ensures users see match kickoff times in their local time, regardless of where they are in the world.

## How It Works

### 1. **Storage Format**
- All match times are stored in the database as ISO 8601 strings (e.g., `2026-06-11T18:00:00Z`)
- The `Z` suffix indicates UTC timezone
- This is the standard format returned by the FIFA API

### 2. **Automatic Conversion**
When dates are displayed:
```typescript
const date = new Date(match.kickoff_time) // Parses UTC time
date.toLocaleString(undefined, options)   // Converts to user's timezone
```

Using `undefined` as the locale parameter tells JavaScript to:
- Use the browser's locale settings (language and region)
- Use the device's timezone automatically
- Format dates according to user's preferences

### 3. **Updated Components**

The following components now use device timezone:

#### Match Display Components:
- `components/match-fixture-card.tsx` - Match cards on matches page
- `components/match-with-predictions-card.tsx` - Match cards with predictions
- `components/matches-filter.tsx` - Date filtering
- `components/bulk-prediction-modal.tsx` - Bulk prediction interface
- `components/import-predictions-form.tsx` - Admin import form

#### Match Detail Pages:
- `app/matches/[id]/page.tsx` - Authenticated match detail
- `app/public-matches/[id]/page.tsx` - Public match detail

#### Admin Pages:
- `app/admin/matches/page.tsx` - Match management
- `app/admin/users/[id]/page.tsx` - User profile dates

#### Dashboard:
- `app/dashboard/page.tsx` - Next matches section

### 4. **Lock Time Calculations**

Match locking (preventing predictions after kickoff) also respects timezones:

```typescript
const now = new Date()                          // Current time in user's timezone
const kickoff = new Date(match.kickoff_time)    // Kickoff in user's timezone
const isLocked = kickoff <= now                 // Compare in same timezone
```

This ensures:
- Users can predict until kickoff in their local time
- Predictions are locked at the correct moment regardless of user location

## Examples

### Scenario 1: User in New York (EST/EDT)
- Match stored as: `2026-06-11T18:00:00Z` (6:00 PM UTC)
- User sees: `June 11, 2026, 2:00 PM` (EST)

### Scenario 2: User in Tokyo (JST)
- Match stored as: `2026-06-11T18:00:00Z` (6:00 PM UTC)
- User sees: `June 12, 2026, 3:00 AM` (JST, next day)

### Scenario 3: User in London (GMT/BST)
- Match stored as: `2026-06-11T18:00:00Z` (6:00 PM UTC)
- User sees: `June 11, 2026, 7:00 PM` (BST, during summer)

## Date Format Options

### Full Date Format (Match Detail Pages)
```typescript
{
  weekday: 'long',      // "Wednesday"
  year: 'numeric',      // "2026"
  month: 'long',        // "June"
  day: 'numeric',       // "11"
  hour: '2-digit',      // "18"
  minute: '2-digit',    // "00"
}
```
Output: `Wednesday, June 11, 2026, 6:00 PM`

### Compact Date Format (Match Cards)
```typescript
{
  weekday: 'short',     // "Wed"
  month: 'short',       // "Jun"
  day: 'numeric',       // "11"
}
```
Output: `Wed, Jun 11`

### Time Only (Match Cards)
```typescript
{
  hour: '2-digit',      // "18"
  minute: '2-digit',    // "00"
  hour12: false,        // 24-hour format
}
```
Output: `18:00`

## Testing Timezone Conversion

### Method 1: Change Browser Timezone (Chrome/Edge)
1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
3. Type "timezone"
4. Select "Sensors: Show Sensors"
5. Change "Location" to different timezone
6. Refresh the page

### Method 2: Change System Timezone
1. Change your computer's timezone settings
2. Refresh the browser
3. Match times should reflect new timezone

### Method 3: Test with Multiple Devices
- Check on devices in different timezones
- Verify times are correct for each location

## Benefits

✅ **Automatic**: No manual timezone selection needed
✅ **Accurate**: Uses device's actual timezone
✅ **Universal**: Works for users worldwide
✅ **Consistent**: Same logic across all components
✅ **Lock Safety**: Predictions lock at correct time for each user
✅ **Mobile Friendly**: Works on mobile devices automatically

## Technical Notes

- JavaScript's `Date` object handles all timezone conversions
- No external libraries needed (uses built-in `Intl.DateTimeFormat`)
- Timezone data is always up-to-date (managed by browser/OS)
- Daylight saving time is handled automatically
- Works offline (timezone data is local)

## Troubleshooting

**Problem**: Times appear incorrect
- **Solution**: Check device timezone settings
- **Cause**: Device timezone may be set incorrectly

**Problem**: Times showing in unexpected format
- **Solution**: This is normal - format follows browser locale
- **Example**: US users see 12-hour format, EU users see 24-hour format

**Problem**: Match locks too early/late
- **Solution**: Verify match `kickoff_time` is stored as UTC in database
- **Cause**: Time may be stored with wrong timezone offset
