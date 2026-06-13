# Complete Timezone Flow Documentation

## Overview

The application uses a **store-in-UTC, display-in-local** pattern, which is the industry standard for handling timezones in web applications.

## Complete Data Flow

### 1. **API Fetch** (football-data.org)

**File**: `lib/football-api.ts`

The football-data.org API returns matches with a `utcDate` field:

```json
{
  "id": 123456,
  "utcDate": "2026-06-11T18:00:00Z",
  "status": "SCHEDULED",
  "homeTeam": { "name": "Argentina" },
  "awayTeam": { "name": "Brazil" }
}
```

**Format**: ISO 8601 with `Z` suffix (UTC timezone)
- `2026-06-11T18:00:00Z` = June 11, 2026 at 6:00 PM UTC
- The `Z` indicates **Zero UTC offset** (Zulu time)

### 2. **Parser** (Match Data Transformation)

**File**: `lib/parsers/match-parser.ts`

The parser extracts and stores the UTC date AS-IS:

```typescript
const parsedMatch: ParsedMatch = {
  // ... other fields
  kickoff_time: apiMatch.utcDate,  // Stored as-is: "2026-06-11T18:00:00Z"
}
```

**No timezone conversion happens here** - UTC is preserved.

### 3. **Database Storage** (Supabase/PostgreSQL)

**Table**: `matches`
**Column**: `kickoff_time` (type: `timestamptz`)

PostgreSQL stores timestamps in UTC internally, regardless of how they're inserted.

```sql
-- Example insert
INSERT INTO matches (kickoff_time, ...) 
VALUES ('2026-06-11T18:00:00Z', ...);

-- PostgreSQL automatically:
-- 1. Parses the ISO 8601 string
-- 2. Stores it as UTC internally
-- 3. Returns it as UTC when queried
```

### 4. **Database Retrieval** (Supabase Query)

When matches are fetched from the database:

```typescript
const { data: matches } = await supabase
  .from('matches')
  .select('*')

// matches[0].kickoff_time = "2026-06-11T18:00:00+00:00" (UTC)
```

**Note**: PostgreSQL may return with `+00:00` instead of `Z`, but both mean UTC.

### 5. **Frontend Parsing** (Browser)

**Files**: Various components

When JavaScript creates a Date object from the ISO string:

```typescript
const kickoffTime = "2026-06-11T18:00:00Z"
const date = new Date(kickoffTime)
```

**What JavaScript does automatically:**
1. Parses the ISO 8601 string
2. Recognizes `Z` or `+00:00` as UTC
3. Converts to browser's local timezone internally
4. Stores as Unix timestamp (milliseconds since 1970)

### 6. **Display Formatting** (User Interface)

**Files**: All components displaying dates

```typescript
// Convert to user's local timezone and format
date.toLocaleString(undefined, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
```

**Output examples for `2026-06-11T18:00:00Z`:**

| User Location | Timezone | Display |
|--------------|----------|---------|
| New York | EDT (UTC-4) | Wednesday, June 11, 2026, 2:00 PM |
| London | BST (UTC+1) | Wednesday, June 11, 2026, 7:00 PM |
| Tokyo | JST (UTC+9) | Thursday, June 12, 2026, 3:00 AM |
| Dubai | GST (UTC+4) | Wednesday, June 11, 2026, 10:00 PM |
| Sydney | AEST (UTC+10) | Thursday, June 12, 2026, 4:00 AM |

## Verification Points

### ✅ API Returns UTC
**Evidence**: `utcDate` field name in API response
```typescript
export interface FootballDataMatch {
  utcDate: string  // ← Explicitly UTC
  // ...
}
```

### ✅ Parser Preserves UTC
**Evidence**: Direct assignment without conversion
```typescript
kickoff_time: apiMatch.utcDate  // ← No conversion
```

### ✅ Database Stores UTC
**Evidence**: PostgreSQL `timestamptz` always stores in UTC
```sql
-- From migration files
kickoff_time TIMESTAMPTZ NOT NULL
```

### ✅ JavaScript Converts Automatically
**Evidence**: Built-in Date parsing
```typescript
new Date("2026-06-11T18:00:00Z")  // ← Automatically converts to local
```

### ✅ Display Uses Local Timezone
**Evidence**: `toLocaleString(undefined, ...)` uses device settings
```typescript
date.toLocaleString(undefined, options)  // ← undefined = use device locale/timezone
```

## Match Locking Logic

Match locking also works correctly with timezones:

```typescript
const now = new Date()                       // Current time in user's timezone
const kickoff = new Date(match.kickoff_time) // Kickoff converted to user's timezone
const isLocked = kickoff <= now              // Compare in same timezone
```

**Example:**
- Match: `2026-06-11T18:00:00Z` (6:00 PM UTC)
- User in New York (EDT): Locks at 2:00 PM local time
- User in Tokyo (JST): Locks at 3:00 AM local time (next day)

Both users are locked at the **exact same moment in time**, just displayed differently.

## Why This Approach Works

### 1. **Single Source of Truth**
- All times stored in UTC (universal reference)
- No ambiguity about "what time" a match starts
- DST changes don't affect stored data

### 2. **Automatic Conversion**
- JavaScript's `Date` object handles all timezone math
- No manual offset calculations needed
- Works on all devices and browsers

### 3. **DST Handling**
- Daylight saving time transitions handled automatically
- Browser knows the local DST rules
- No code changes needed for DST

### 4. **International Support**
- Works for users worldwide
- Each user sees their local time
- No configuration needed

## Testing the Flow

### Test 1: API Response
```bash
curl -H "X-Auth-Token: YOUR_KEY" \
  https://api.football-data.org/v4/competitions/WC/matches?season=2026
```
**Verify**: `utcDate` field ends with `Z` or `+00:00`

### Test 2: Database Storage
```sql
SELECT kickoff_time FROM matches LIMIT 1;
-- Should return: 2026-06-11 18:00:00+00
```
**Verify**: Timezone offset is `+00` (UTC)

### Test 3: Frontend Display
1. Open browser DevTools
2. Console: `new Date("2026-06-11T18:00:00Z")`
3. **Verify**: Shows time converted to your local timezone

### Test 4: Timezone Change
1. Change system timezone
2. Refresh browser
3. **Verify**: Match times update to new timezone

## Common Misconceptions

### ❌ Myth: "We need to store timezone with each match"
**Reality**: We store in UTC and convert on display. Storing timezone is redundant.

### ❌ Myth: "Users in different timezones will see wrong times"
**Reality**: JavaScript automatically converts UTC to each user's local time.

### ❌ Myth: "We need a timezone selector for users"
**Reality**: The browser already knows the user's timezone from system settings.

### ❌ Myth: "DST will break the times"
**Reality**: Browser handles DST transitions automatically.

## Troubleshooting

### Problem: Times appear wrong
**Cause**: Device timezone is incorrectly set
**Solution**: Check system timezone settings

### Problem: Times are 1 hour off
**Cause**: DST transition or timezone confusion
**Solution**: Verify the stored time has `Z` or `+00:00` suffix

### Problem: API returns times without `Z`
**Cause**: API response format changed
**Solution**: Parser should handle both `Z` and `+00:00` (already does)

## Summary

✅ **Store**: All times in UTC (universal reference)  
✅ **Transfer**: UTC preserved through all layers  
✅ **Display**: Automatic conversion to user's timezone  
✅ **Compare**: JavaScript handles timezone-aware comparisons  
✅ **Lock**: Predictions locked at correct moment for all users  

**The system is working correctly!** No timezone-related changes needed.
